import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Assert Captures Differ
 * description: Assert that $[a] and $[b] hold different values — catches two fields sharing one variable
 * actionType: custom_assert_captures_differ
 * type: shared
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

  // DUAL MODE — accepts a runtime-variable NAME or a literal VALUE.
  //
  // The engine resolves the two placeholder styles differently before this method runs:
  //   $[name]  -> ctx.args receives the NAME  (look it up here)
  //   ${name}  -> ctx.args receives the VALUE (already resolved; use as-is)
  // Reading args[0] as a name ONLY meant a ${...} argument became getVariable("Mumbai") ->
  // undefined -> "", so two obviously different cities both compared as "" and this assert failed
  // with 'both equal ""'. Looking the name up when a variable by that name exists, and otherwise
  // treating the argument as the value itself, makes the method work with either style — which
  // matters while store_run_variable is unavailable and ${...} params are the only source.
  const varA = ctx.args[0];
  const varB = ctx.args[1];

  const lookedUpA = ctx.getVariable(varA);
  const lookedUpB = ctx.getVariable(varB);
  const rawA = lookedUpA === undefined || lookedUpA === null ? varA : lookedUpA;
  const rawB = lookedUpB === undefined || lookedUpB === null ? varB : lookedUpB;

  const a = rawA === undefined || rawA === null ? '' : String(rawA).replace(/\p{Cf}/gu, '').normalize('NFC');
  const b = rawB === undefined || rawB === null ? '' : String(rawB).replace(/\p{Cf}/gu, '').normalize('NFC');

  ctx.log('assert_captures_differ:');
  ctx.log('  [' + varA + '] = ' + JSON.stringify(a));
  ctx.log('  [' + varB + '] = ' + JSON.stringify(b));

  // Only meaningful in NAME mode: two capture steps pointed at one variable. In value mode the
  // two arguments being identical is just "the same value twice", which the a === b check below
  // reports more accurately — so this fires only when the name actually resolved to a variable.
  if (varA === varB && lookedUpA !== undefined && lookedUpA !== null) {
    throw new Error(
      'assert_captures_differ FAILED: both arguments name the same variable "' + varA + '" — ' +
      'two capture steps are writing to it; the second will always overwrite the first'
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
