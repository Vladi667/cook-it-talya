declare module "nerdamer" {
  interface NerdamerExpression {
    toString(): string;
    text(format?: "decimals" | "fractions"): string;
    evaluate(): NerdamerExpression;
    expand(): NerdamerExpression;
    simplify?(): NerdamerExpression;
    add(x: string | NerdamerExpression): NerdamerExpression;
    subtract(x: string | NerdamerExpression): NerdamerExpression;
    multiply(x: string | NerdamerExpression): NerdamerExpression;
    divide(x: string | NerdamerExpression): NerdamerExpression;
    variables(): string[];
    buildFunction(args?: string[]): (...values: number[]) => number;
    symbol: unknown;
  }

  interface Nerdamer {
    (
      expression: string,
      subs?: Record<string, string | number>,
      options?: string | string[],
    ): NerdamerExpression;
    diff(expression: string, variable: string, n?: number): NerdamerExpression;
    integrate(expression: string, variable: string): NerdamerExpression;
    solve(expression: string, variable: string): NerdamerExpression;
    set(setting: string, value?: unknown): void;
    getCore(): unknown;
  }

  const nerdamer: Nerdamer;
  export default nerdamer;
}

declare module "nerdamer/Algebra.js";
declare module "nerdamer/Calculus.js";
declare module "nerdamer/Solve.js";
declare module "nerdamer/Extra.js";
