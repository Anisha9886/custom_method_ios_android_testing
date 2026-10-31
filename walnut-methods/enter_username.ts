import type { WalnutWebContext } from './walnut';

/** @walnut_method
 * name: Enter Username
 * description: Enter ${username} in the username field identified by ${selector}
 * actionType: custom_enter_username
 * context: web
 * needsLocator: false
 * category: Forms
 */
export async function enterUsername(ctx: WalnutWebContext) {
  const username = ctx.args[0];
  const selector = ctx.args[1];

  if (!username) {
    throw new Error('Missing username value');
  }
  if (!selector) {
    throw new Error('Missing username field selector');
  }

  await ctx.fill(selector, username);
}
