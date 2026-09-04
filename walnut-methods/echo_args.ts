import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Echo Args
 * description: Echo step arguments ${a} and ${b} to prove they arrive correctly
 * actionType: custom_echo_args
 * context: shared
 * needsLocator: false
 * category: Smoke
 */
export async function echoArgs(ctx: WalnutContext) {
  // ctx.args[0] = value of ${a}
  // ctx.args[1] = value of ${b}
  const a = ctx.args[0];
  const b = ctx.args[1];

  ctx.log('ECHO — args received:');
  ctx.log('  args[0] (a): ' + JSON.stringify(a));
  ctx.log('  args[1] (b): ' + JSON.stringify(b));
  ctx.log('  args.length: ' + ctx.args.length);

  if (a === undefined && b === undefined) {
    ctx.warn('Both args are undefined — step argument wiring may be broken');
  }
}
