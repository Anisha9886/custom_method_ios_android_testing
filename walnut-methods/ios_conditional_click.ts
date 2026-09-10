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
  //   Poll ctx.isVisible() every 500 ms for up to 10 seconds (20 attempts).
  //   isVisible() is a single non-blocking probe — it returns true/false immediately
  //   and never retries on its own, which makes it safe to use inside a timed loop.
  //   If the element is found → tap and pass.
  //   If all 20 attempts fail → log and pass gracefully (element absent is valid state).

  const POLL_INTERVAL_MS = 500;
  const MAX_ATTEMPTS = 20; // 20 × 500 ms = 10 seconds

  let visible = false;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    visible = await ctx.isVisible(ctx.locator);
    if (visible) break;
    ctx.log('ios_conditional_click: waiting for element, attempt ' + attempt + '/' + MAX_ATTEMPTS);
    await new Promise<void>((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  if (!visible) {
    ctx.log(
      'ios_conditional_click: element is not present so click not performed.\n'
      + '  locator: ' + ctx.locator,
    );
    return; // Soft-pass — element absent is acceptable
  }

  await ctx.tap(ctx.locator);
  ctx.log('ios_conditional_click: element found and tapped "' + ctx.locator + '"');
}
