import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Assert Date In Month
 * description: Assert that date ${value} falls within month ${month} (YYYY-MM or month name) to catch dropped calendar navigation
 * actionType: custom_assert_date_in_month
 * type: shared
 * needsLocator: false
 * category: iOS Assertions
 */
export async function assertDateInMonth(ctx: WalnutContext) {
  // Catches: dropped calendar navigation — a far-future date silently lands in the
  // current month because the swipe-to-next-month steps were not replayed correctly.
  //
  // ctx.args[0] = resolved value of ${value}  — a date string, e.g. "2025-08-15" or "15 Aug 2025"
  // ctx.args[1] = resolved value of ${month}  — expected month, e.g. "2025-08" or "August" or "Aug"

  const rawDate  = String(ctx.args[0] ?? '').replace(/\p{Cf}/gu, '').trim();
  const rawMonth = String(ctx.args[1] ?? '').replace(/\p{Cf}/gu, '').trim();

  ctx.log('assert_date_in_month: date=' + JSON.stringify(rawDate) + ' expected month=' + JSON.stringify(rawMonth));

  if (!rawDate) throw new Error('assert_date_in_month FAILED: date value is empty');
  if (!rawMonth) throw new Error('assert_date_in_month FAILED: month value is empty');

  const parsed = new Date(rawDate);
  if (isNaN(parsed.getTime())) {
    throw new Error('assert_date_in_month FAILED: cannot parse date ' + JSON.stringify(rawDate));
  }

  const actualYear  = parsed.getUTCFullYear();
  const actualMonth = parsed.getUTCMonth(); // 0-indexed

  const MONTH_NAMES = ['january','february','march','april','may','june',
                       'july','august','september','october','november','december'];
  const MONTH_ABBR  = ['jan','feb','mar','apr','may','jun',
                       'jul','aug','sep','oct','nov','dec'];

  let expectedYear: number | null = null;
  let expectedMonth: number | null = null;  // 0-indexed

  // Try YYYY-MM format
  const isoMatch = rawMonth.match(/^(\d{4})-(\d{2})$/);
  if (isoMatch) {
    expectedYear  = parseInt(isoMatch[1], 10);
    expectedMonth = parseInt(isoMatch[2], 10) - 1;
  } else {
    // Try month name or abbreviation (ignore year if not provided)
    const lower = rawMonth.toLowerCase();
    let idx = MONTH_NAMES.indexOf(lower);
    if (idx === -1) idx = MONTH_ABBR.indexOf(lower.slice(0, 3));
    if (idx !== -1) {
      expectedMonth = idx;
    } else {
      throw new Error('assert_date_in_month FAILED: cannot parse month ' + JSON.stringify(rawMonth) +
        ' — use YYYY-MM or a full/abbreviated English month name');
    }
  }

  const monthMismatch = (expectedMonth !== null && actualMonth !== expectedMonth);
  const yearMismatch  = (expectedYear  !== null && actualYear  !== expectedYear);

  if (monthMismatch || yearMismatch) {
    const actualLabel = actualYear + '-' + String(actualMonth + 1).padStart(2, '0');
    throw new Error(
      'assert_date_in_month FAILED: date ' + rawDate + ' is in ' + actualLabel +
      ' but expected ' + rawMonth +
      ' — calendar navigation was likely dropped during replay'
    );
  }

  ctx.log('assert_date_in_month PASSED: ' + rawDate + ' is correctly in ' + rawMonth);
}
