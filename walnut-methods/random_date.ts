import type { WalnutWebContext } from './walnut';

/** @walnut_method
 * name: Generate Random Date
 * description: Generate a random date from one year before today through one year after today and store in $[randomDate]
 * actionType: custom_generate_random_date
 * context: web
 * needsLocator: false
 * category: Test Data
 */
export async function generateRandomDate(ctx: WalnutWebContext) {
  const outputVar = ctx.args[0];
  if (!outputVar) {
    throw new Error('Missing output variable — add $[randomDate] to the step description');
  }

  const today = new Date();
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const end = new Date(start);

  // Clamp leap-day dates to the last valid day of the destination month.
  const shiftYear = (date: Date, years: number): Date => {
    const year = date.getUTCFullYear() + years;
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return new Date(Date.UTC(year, month, Math.min(day, lastDay)));
  };

  const firstDay = shiftYear(start, -1).getTime();
  const lastDay = shiftYear(end, 1).getTime();
  const daysInRange = Math.floor((lastDay - firstDay) / 86_400_000) + 1;
  const randomDay = firstDay + Math.floor(Math.random() * daysInRange) * 86_400_000;
  const date = new Date(randomDay);
  const formattedDate = date.getUTCFullYear() + '-' +
    String(date.getUTCMonth() + 1).padStart(2, '0') + '-' +
    String(date.getUTCDate()).padStart(2, '0');

  ctx.setVariable(outputVar, formattedDate);
  ctx.log('Generated random date: ' + formattedDate);
}
