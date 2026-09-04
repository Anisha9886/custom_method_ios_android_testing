import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Travel Date
 * description: Compute a date offset by ${offsetDays} days from today in format ${format} and store in $[travelDate]
 * actionType: custom_travel_date
 * context: shared
 * needsLocator: false
 * category: iOS Device
 */
export async function travelDate(ctx: WalnutContext) {
  // Catches: recordings that hardcoded the recording date — the test works once then
  // fails every subsequent day because the date is in the past.
  //
  // ctx.args[0] = resolved value of ${offsetDays} — integer days from today (0 = today, 1 = tomorrow, -1 = yesterday)
  // ctx.args[1] = resolved value of ${format}     — output format string:
  //                 "YYYY-MM-DD"      → "2025-08-20"
  //                 "DD/MM/YYYY"      → "20/08/2025"
  //                 "DD MMM YYYY"     → "20 Aug 2025"
  //                 "D MMM"           → "20 Aug"
  //                 "MMM D"           → "Aug 20"
  //                 "MM/DD/YYYY"      → "08/20/2025"
  //                 "DD-MM-YYYY"      → "20-08-2025"
  //                 "EPOCH"           → Unix timestamp ms as string
  // ctx.args[2] = "travelDate" — runtime variable name from $[travelDate]

  const offsetDays = parseInt(String(ctx.args[0] ?? '0').trim(), 10);
  const format     = String(ctx.args[1] ?? 'YYYY-MM-DD').trim();
  const outVar     = ctx.args[2];

  if (isNaN(offsetDays)) {
    throw new Error('travel_date FAILED: offsetDays ' + JSON.stringify(ctx.args[0]) + ' is not a valid integer');
  }

  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);

  const YYYY = date.getUTCFullYear();
  const MM   = String(date.getUTCMonth() + 1).padStart(2, '0');
  const DD   = String(date.getUTCDate()).padStart(2, '0');
  const D    = String(date.getUTCDate());
  const M    = date.getUTCMonth();
  const MONTH_FULL = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];
  const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun',
                      'Jul','Aug','Sep','Oct','Nov','Dec'];

  let result: string;

  switch (format.toUpperCase()) {
    case 'YYYY-MM-DD': result = YYYY + '-' + MM + '-' + DD; break;
    case 'DD/MM/YYYY': result = DD + '/' + MM + '/' + YYYY; break;
    case 'MM/DD/YYYY': result = MM + '/' + DD + '/' + YYYY; break;
    case 'DD-MM-YYYY': result = DD + '-' + MM + '-' + YYYY; break;
    case 'DD MMM YYYY': result = DD + ' ' + MONTH_ABBR[M] + ' ' + YYYY; break;
    case 'D MMM YYYY':  result = D  + ' ' + MONTH_ABBR[M] + ' ' + YYYY; break;
    case 'DD MMMM YYYY': result = DD + ' ' + MONTH_FULL[M] + ' ' + YYYY; break;
    case 'D MMM':  result = D  + ' ' + MONTH_ABBR[M]; break;
    case 'MMM D':  result = MONTH_ABBR[M] + ' ' + D; break;
    case 'MMM DD': result = MONTH_ABBR[M] + ' ' + DD; break;
    case 'EPOCH':  result = String(date.getTime()); break;
    default:
      // Generic token replacement for any other pattern
      result = format
        .replace('YYYY', String(YYYY))
        .replace('MM',   MM)
        .replace('DD',   DD)
        .replace('D',    D)
        .replace('MMMM', MONTH_FULL[M])
        .replace('MMM',  MONTH_ABBR[M]);
  }

  ctx.log('travel_date: today + ' + offsetDays + ' days → ' + result + ' (format: ' + format + ')');
  ctx.setVariable(outVar, result);
}
