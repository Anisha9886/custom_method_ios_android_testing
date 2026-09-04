import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Ping
 * description: Ping the pipeline to confirm custom methods are reachable
 * actionType: custom_ping
 * context: shared
 * needsLocator: false
 * category: Smoke
 */
export async function ping(ctx: WalnutContext) {
  // If this method executes at all, the pipeline is wired correctly.
  // Nothing else in the suite matters until this passes.
  ctx.log('PING — custom method runtime is reachable');
  ctx.log('testBaseUrl: ' + ctx.testBaseUrl);
  ctx.log('platform: ' + ctx.platform);
}
