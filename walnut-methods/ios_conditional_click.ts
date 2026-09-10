import type { WalnutIosContext } from './walnut';

/** @walnut_method
 * name: iOS Conditional Click
 * description: Click the linked element on the iOS device if it is present within 10 seconds
 * actionType: custom_ios_conditional_click
 * context: ios
 * needsLocator: true
 * category: iOS Device
 */
export async function iosConditionalClick(ctx: WalnutIosContext) {
  // ctx.locator — the linked object's resolved XPath, because needsLocator is true.
  //
  // Strategy:
  //   1. Wait up to 10 seconds for the element to appear using ctx.waitFor().
  //   2. If the element becomes visible within that window → tap and pass.
  //   3. If it never appears → log a clear message and pass gracefully (no throw),
  //      because the element being absent is a valid, expected state for optional UI.

  try {
    await ctx.waitFor(ctx.locator, 10000);
  } catch {
    // Element did not appear within 10 seconds
    ctx.log(
      'ios_conditional_click: element is not present so click not performed.\n'
      + '  locator: ' + ctx.locator,
    );
    return; // Soft-pass — element absent is acceptable
  }

  await ctx.tap(ctx.locator);
  ctx.log('ios_conditional_click: element found and tapped "' + ctx.locator + '"');
}
