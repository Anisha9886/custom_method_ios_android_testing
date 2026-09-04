import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Assert Not Empty
 * description: Assert that $[value] is set and not empty — catches a dropped type step that left a field blank
 * actionType: custom_assert_not_empty
 * context: shared
 * needsLocator: false
 * category: iOS Assertions
 */
export async function assertNotEmpty(ctx: WalnutContext) {
  // Catches: a dropped type step — the data map lists the value, but no step typed it,
  // so the field (and any variable capturing it) is empty. This fires immediately and
  // clearly rather than letting a blank field silently propagate.
  //
  // ctx.args[0] = "value" — runtime variable name from $[value]

  const varName = ctx.args[0];
  const raw = ctx.getVariable(varName);

  ctx.log('assert_not_empty: checking variable "' + varName + '"');
  ctx.log('assert_not_empty: raw value = ' + JSON.stringify(raw));

  if (raw === undefined || raw === null) {
    throw new Error(
      'assert_not_empty FAILED: variable "' + varName + '" has never been set. ' +
      'A capture step may have been dropped, or the variable name is misspelled.'
    );
  }

  // Strip invisible Unicode before checking for emptiness
  const cleaned = String(raw)
    .replace(/\p{Cf}/gu, '')
    .replace(/[\u00A0\u202F\u2009\u200A\u2007\u2008\u205F\u3000]/g, ' ')
    .normalize('NFC')
    .trim();

  if (cleaned.length === 0) {
    throw new Error(
      'assert_not_empty FAILED: variable "' + varName + '" is set but resolves to an empty string ' +
      '(raw value: ' + JSON.stringify(raw) + '). ' +
      'The capture step may have run but the type/fill step that populates the field was dropped.'
    );
  }

  ctx.log('assert_not_empty PASSED: "' + varName + '" = ' + JSON.stringify(cleaned));
}
