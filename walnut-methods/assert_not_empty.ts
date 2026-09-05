import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Assert Not Empty
 * description: Assert that $[value] is set and not empty — catches a dropped type step that left a field blank
 * actionType: custom_assert_not_empty
 * type: shared
 * needsLocator: false
 * category: iOS Assertions
 */
export async function assertNotEmpty(ctx: WalnutContext) {
  // Catches: a dropped type step — the data map lists the value, but no step typed it,
  // so the field (and any variable capturing it) is empty. This fires immediately and
  // clearly rather than letting a blank field silently propagate.
  //
  // ctx.args[0] = "value" — runtime variable name from $[value]

  // DUAL MODE — accepts a runtime-variable NAME or a literal VALUE. Same reasoning as
  // assert_captures_differ: $[name] passes the NAME, ${name} passes the already-resolved VALUE, and
  // reading args[0] as a name only made every ${...} argument look "never set".
  const arg = ctx.args[0];
  const lookedUp = ctx.getVariable(arg);
  const usedVariable = lookedUp !== undefined && lookedUp !== null;
  const raw = usedVariable ? lookedUp : arg;

  ctx.log('assert_not_empty: ' + (usedVariable ? 'variable "' + arg + '"' : 'literal value'));
  ctx.log('assert_not_empty: raw value = ' + JSON.stringify(raw));

  if (raw === undefined || raw === null) {
    throw new Error(
      'assert_not_empty FAILED: "' + arg + '" is neither a set runtime variable nor a value. ' +
      'A capture step may have been dropped, or the name is misspelled.'
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
      'assert_not_empty FAILED: ' + (usedVariable ? 'variable "' + arg + '"' : 'the value given') +
      ' resolves to an empty string (raw value: ' + JSON.stringify(raw) + '). ' +
      'The capture step may have run but the type/fill step that populates the field was dropped.'
    );
  }

  ctx.log('assert_not_empty PASSED: "' + arg + '" = ' + JSON.stringify(cleaned));
}
