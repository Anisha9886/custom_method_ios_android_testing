import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Assert Matches Regex
 * description: Assert that ${value} matches regex pattern ${pattern} — use instead of exact assertions on volatile text
 * actionType: custom_assert_matches
 * context: shared
 * needsLocator: false
 * category: iOS Assertions
 */
export async function assertMatches(ctx: WalnutContext) {
  // Catches: over-pinned assertions on volatile text (prices, dates, IDs, OTPs).
  // A regex lets the test stay green when the exact value changes between runs
  // while still asserting the format is correct.
  //
  // ctx.args[0] = resolved value of ${value}   — the text to test
  // ctx.args[1] = resolved value of ${pattern} — a JS regex pattern string (no surrounding slashes)
  //
  // Examples:
  //   pattern "^\d{4}$"              → 4-digit OTP
  //   pattern "^\d{1,2}:\d{2}\s?[APap][Mm]$" → time like "9:45 AM"
  //   pattern "₹[\d,]+"              → Indian rupee price
  //   pattern "\d{1,2}\s\w+\s\d{4}"  → date like "15 Aug 2025"

  // Strip invisible Unicode
  const rawValue   = String(ctx.args[0] ?? '').replace(/\p{Cf}/gu, '').replace(/[\u00A0\u202F\u2009\u200A\u2007\u2008\u205F\u3000]/g, ' ').normalize('NFC');
  const rawPattern = String(ctx.args[1] ?? '').trim();

  ctx.log('assert_matches: value=' + JSON.stringify(rawValue) + ' pattern=' + JSON.stringify(rawPattern));

  if (!rawPattern) {
    throw new Error('assert_matches FAILED: pattern is empty — provide a non-empty regex string');
  }

  let regex: RegExp;
  try {
    regex = new RegExp(rawPattern, 'u');
  } catch (e) {
    throw new Error('assert_matches FAILED: invalid regex pattern ' + JSON.stringify(rawPattern) + ' — ' + String(e));
  }

  if (!regex.test(rawValue)) {
    throw new Error(
      'assert_matches FAILED: ' + JSON.stringify(rawValue) + ' does not match /' + rawPattern + '/. ' +
      'If the text is volatile (prices, dates, IDs), make the pattern more permissive rather than using an exact assertion.'
    );
  }

  ctx.log('assert_matches PASSED: value matches /' + rawPattern + '/');
}
