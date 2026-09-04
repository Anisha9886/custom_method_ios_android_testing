import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Assert Contains Any
 * description: Assert that ${value} contains at least one of the strings in ${candidates} (comma-separated list)
 * actionType: custom_assert_contains_any
 * type: shared
 * needsLocator: false
 * category: iOS Assertions
 */
export async function assertContainsAny(ctx: WalnutContext) {
  // Catches: text that legitimately varies between runs (e.g. status labels, localised strings,
  // A/B copy) where an exact equality check would flake.
  //
  // ctx.args[0] = resolved value of ${value}      — the text to search within
  // ctx.args[1] = resolved value of ${candidates} — comma-separated list of acceptable substrings
  //
  // Example step: Assert Contains Any  value: "Booking Confirmed"  candidates: "Confirmed, Booked, Success"

  // Strip invisible Unicode
  function clean(raw: unknown): string {
    return String(raw ?? '').replace(/\p{Cf}/gu, '').replace(/[\u00A0\u202F\u2009\u200A\u2007\u2008\u205F\u3000]/g, ' ').normalize('NFC');
  }

  const value      = clean(ctx.args[0]);
  const rawCandidates = clean(ctx.args[1]);

  ctx.log('assert_contains_any: value=' + JSON.stringify(value));
  ctx.log('assert_contains_any: candidates=' + JSON.stringify(rawCandidates));

  if (!rawCandidates.trim()) {
    throw new Error('assert_contains_any FAILED: candidates list is empty — provide at least one string');
  }

  const candidates = rawCandidates
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  ctx.log('assert_contains_any: parsed ' + candidates.length + ' candidate(s): ' + JSON.stringify(candidates));

  const matched = candidates.find(c => value.includes(c));

  if (!matched) {
    throw new Error(
      'assert_contains_any FAILED: ' + JSON.stringify(value) +
      ' does not contain any of ' + JSON.stringify(candidates) + '. ' +
      'Add any new legitimate variant to the candidates list rather than pinning a single exact value.'
    );
  }

  ctx.log('assert_contains_any PASSED: matched candidate ' + JSON.stringify(matched));
}
