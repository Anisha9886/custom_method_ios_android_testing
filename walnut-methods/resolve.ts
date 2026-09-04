import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Resolve Placeholder
 * description: Expand ${text} through the Walnut placeholder engine and log the result
 * actionType: custom_resolve
 * type: shared
 * needsLocator: false
 * category: Smoke
 */
export async function resolve(ctx: WalnutContext) {
  // ctx.args[0] = the already-resolved value of ${text}
  // The Walnut engine resolves ${...} before calling the method, so ctx.args[0]
  // IS the expanded value — logging it shows exactly what a token becomes at runtime.
  const input = ctx.args[0];

  ctx.log('RESOLVE — input token after expansion:');
  ctx.log('  raw value    : ' + JSON.stringify(input));
  ctx.log('  typeof       : ' + typeof input);
  ctx.log('  length       : ' + (input != null ? String(input).length : 'N/A'));

  // Also run through replacePlaceholders in case nested {{variable}} refs remain.
  if (typeof input === 'string') {
    const expanded = ctx.replacePlaceholders(input);
    if (expanded !== input) {
      ctx.log('  after replacePlaceholders: ' + JSON.stringify(expanded));
    } else {
      ctx.log('  replacePlaceholders: no further expansion');
    }
  }
}
