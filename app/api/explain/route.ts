import { NextResponse } from "next/server";

/**
 * Optional "why was my answer wrong" explainer — the ONLY LLM call in the app.
 *
 * It is deliberately downstream of everything that must be correct: the
 * question, the closed-form solution and the verdict are all computed
 * symbolically before this route is ever called. The model is handed the
 * correct solution and asked only to diagnose the student's slip.
 *
 * Without ANTHROPIC_API_KEY the route reports 503 and the UI hides the feature.
 */

export const runtime = "edge";

interface Body {
  lang: "en" | "he";
  statement: string;
  steps: string[];
  fields: { prompt: string; expected: string; given: string }[];
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "unconfigured" }, { status: 503 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const wrong = body.fields.filter((f) => f.given.trim().length > 0);
  if (wrong.length === 0) {
    return NextResponse.json({ text: "" });
  }

  const prompt = [
    `A student is practising Israeli 5-unit Bagrut mathematics.`,
    ``,
    `Question: ${body.statement}`,
    ``,
    `The correct solution, step by step:`,
    ...body.steps.map((s, i) => `${i + 1}. ${s}`),
    ``,
    `What the student answered:`,
    ...wrong.map(
      (f) => `- ${f.prompt}: they wrote "${f.given}", the correct answer is "${f.expected}".`,
    ),
    ``,
    `In at most three sentences, name the specific mistake they most likely made`,
    `and what to do differently. Do not restate the whole solution. Use $...$ for`,
    `inline math. Answer in ${body.lang === "he" ? "Hebrew" : "English"}.`,
  ].join("\n");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "upstream" }, { status: 502 });
    }

    const data = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text =
      data.content
        ?.filter((c) => c.type === "text")
        .map((c) => c.text ?? "")
        .join("\n")
        .trim() ?? "";

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }
}
