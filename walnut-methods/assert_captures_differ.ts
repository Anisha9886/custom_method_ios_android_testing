import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Assert Captures Differ
 * description: Assert that $[a] and $[b] hold different values — catches two fields sharing one variable
 * actionType: custom_assert_captures_differ
 * context: shared
 * needsLocator: false
 * category: iOS Assertions
 */
export async function assertCapturesDiffer(ctx: WalnutContext) {
  // Catches: two distinct fields both writing to the same runtime variable name.
  // The bug is invisible when the values happen to match (e.g. both fields show "0"
  // or the same city name). This step forces them apart.
  //
  // ctx.args[0] = "a" — runtime variable name from $[a]
  // ctx.args[1] = "b" — runtime variable name from $[b]

  const varA = ctx.args[0];
  const varB = ctx.args[1];

  const rawA = ctx.getVariable(varA);
  const rawB = ctx.getVariable(varB);

  const a = rawA === undefined || rawA === null ? '' : String(rawA).replace(/\p{Cf}/gu, '').normalize('NFC');
  const b = rawB === undefined || rawB === null ? '' : String(rawB).replace(/\p{Cf}/gu, '').normalize('NFC');

  ctx.log('assert_captures_differ:');
  ctx.log('  [' + varA + '] = ' + JSON.stringify(a));
  ctx.log('  [' + varB + '] = ' + JSON.stringify(b));

  if (varA === varB) {
    throw new Error(
      'assert_captures_differ FAILED: both variable names are "' + varA + '" — ' +
      'two capture steps are writing to the same variable; the second will always overwrite the first'
    );
  }

  if (a === b) {
    throw new Error(
      'assert_captures_differ FAILED: [' + varA + '] and [' + varB + '] both equal ' +
      JSON.stringify(a) + ' — either two fields share one variable name, or both ' +
      'captured the same value (check the locators)'
    );
  }

  ctx.log('assert_captures_differ PASSED: values are distinct');
}
