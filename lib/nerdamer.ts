import nerdamer from "nerdamer";
import "nerdamer/Algebra.js";
import "nerdamer/Calculus.js";
import "nerdamer/Solve.js";

/**
 * Single entry point for the CAS so the add-ons are guaranteed to be
 * registered exactly once, in both the browser bundle and Vitest.
 *
 * Note: in nerdamer, `log` IS the natural logarithm. The checker rewrites
 * user-typed `ln(` to `log(` before parsing.
 */
export default nerdamer;
