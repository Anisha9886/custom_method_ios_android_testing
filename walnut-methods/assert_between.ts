import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Assert Between
 * description: Assert that numeric ${value} is between ${min} and ${max} inclusive — catches recordings that pin exact fares
 * actionType: custom_assert_between
 * context: shared
 * needsLocator: false
 * category: iOS Assertions
 */
export async function assertBetween(ctx: WalnutContext) {
  // Catches: recordings that pinned an exact fare or price which changes between runs.
  // A range assertion stays green when the value shifts within expected bounds.
  //
  // ctx.args[0] = resolved value of ${value} — the numeric string to check
  // ctx.args[1] = resolved value of ${min}   — inclusive lower bound
  // ctx.args[2] = resolved value of ${max}   — inclusive upper bound

  // Strip invisible Unicode inline (same logic as strip_invisible method)
  function clean(raw: unknown): string {
    return String(raw ?? '').replace(/\p{Cf}/gu, '').replace(/[\u00A0\u202F\u2009\u200A\u2007\u2008\u205F\u3000]/g, ' ').normalize('NFC').trim();
  }

  function toNumber(s: string, label: string): number {
    // Remove grouping commas and currency symbols
    const cleaned = s.replace(/[^\d.\-+]/g, '');
    const n = parseFloat(cleaned);
    if (isNaN(n)) throw new Error('assert_between: cannot parse ' + label + ' ' + JSON.stringify(s) + ' as a number');
    return n;
  }

  const rawValue = clean(ctx.args[0]);
  const rawMin   = clean(ctx.args[1]);
  const rawMax   = clean(ctx.args[2]);

  ctx.log('assert_between: value=' + JSON.stringify(rawValue) + ' min=' + JSON.stringify(rawMin) + ' max=' + JSON.stringify(rawMax));

  const value = toNumber(rawValue, 'value');
  const min   = toNumber(rawMin,   'min');
  const max   = toNumber(rawMax,   'max');

  if (min > max) {
    throw new Error('assert_between: min (' + min + ') is greater than max (' + max + ') — check the step arguments');
  }

  if (value < min || value > max) {
    throw new Error(
      'assert_between FAILED: ' + value + ' is outside [' + min + ', ' + max + ']. ' +
      'If this is a fare or price, the recording may have pinned an exact value that has since changed.'
    );
  }

  ctx.log('assert_between PASSED: ' + value + ' is within [' + min + ', ' + max + ']');
}
