import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Assert Not Placeholder
 * description: Assert that ${value} is not a placeholder or stale hint text left in an input field
 * actionType: custom_assert_not_placeholder
 * context: shared
 * needsLocator: false
 * category: iOS Assertions
 */
export async function assertNotPlaceholder(ctx: WalnutContext) {
  // Catches: recorder locating an id-less input by the stale text left in it.
  // The step matches during recording but finds nothing on replay once the field is empty.
  //
  // ctx.args[0] = resolved value of ${value}
  const raw = ctx.args[0];
  const value = (raw === undefined || raw === null) ? '' : String(raw).normalize('NFC').replace(/\p{Cf}/gu, '').trim();

  ctx.log('assert_not_placeholder: checking value ' + JSON.stringify(value));

  // Common placeholder / hint-text patterns seen in iOS apps
  const PLACEHOLDER_PATTERNS = [
    /^enter\s+/i,
    /^type\s+/i,
    /^search\s+/i,
    /^select\s+/i,
    /^choose\s+/i,
    /^please\s+/i,
    /^your\s+/i,
    /^\(optional\)$/i,
    /^required$/i,
    /^e\.?g\.?\s+/i,
    /^example/i,
    /^hint/i,
    /^placeholder/i,
  ];

  if (value === '') {
    throw new Error(
      'assert_not_placeholder FAILED: value is empty — the step likely captured a field ' +
      'before it was typed into, or the locator matched a stale placeholder element'
    );
  }

  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(value)) {
      throw new Error(
        'assert_not_placeholder FAILED: value ' + JSON.stringify(value) +
        ' looks like placeholder/hint text (matched ' + pattern + '). ' +
        'The recorder may have located this field by its stale hint text.'
      );
    }
  }

  ctx.log('assert_not_placeholder PASSED: ' + JSON.stringify(value) + ' does not look like placeholder text');
}
