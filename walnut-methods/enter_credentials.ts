/** @walnut_method
 * name: Enter Username and Password
 * description: Enter ${username} in the Username field and ${password} in the Password field
 * actionType: custom_enter_credentials
 * context: web
 * needsLocator: false
 * category: Forms
 */
import type { WalnutWebContext } from './walnut';

export async function enterCredentials(ctx: WalnutWebContext) {
  const username = ctx.args[0];
  const password = ctx.args[1];

  if (!username) {
    throw new Error('Missing username value');
  }
  if (!password) {
    throw new Error('Missing password value');
  }

  await ctx.fill('input[name="username"]', username);
  await ctx.fill('input[name="password"]', password);
}
