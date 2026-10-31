import type { WalnutBaseContext } from './walnut';

/** @walnut_method
 * name: Generate Random Number
 * description: Generate a random six-digit integer and store in $[randomNumber]
 * actionType: custom_generate_random_number
 * context: shared
 * needsLocator: false
 * category: Test Data
 */
export async function generateRandomNumber(ctx: WalnutBaseContext) {
  const outputVar = ctx.args[0];
  if (!outputVar) {
    throw new Error('Missing output variable — add $[randomNumber] to the step description');
  }

  const number = Math.floor(Math.random() * 900_000) + 100_000;
  ctx.setVariable(outputVar, number);
  ctx.log('Generated random six-digit integer: ' + number);
}
