import type { WalnutIosContext } from './walnut';

/** @walnut_method
 * name: iOS Click Object
 * description: Click the linked element on the iOS device
 * actionType: custom_ios_click
 * context: ios
 * needsLocator: true
 * category: iOS Device
 */
export async function iosClick(ctx: WalnutIosContext) {
  // ctx.locator — the linked object's resolved XPath, because needsLocator is true.
  //
  // NO isVisible() PRECHECK HERE, DELIBERATELY. This method used to open with:
  //
  //     if (!(await ctx.isVisible(ctx.locator))) throw new Error('not visible');
  //
  // and it failed in 186ms against a screen that had simply not finished rendering.
  // isVisible is the BRANCH check — it asks once and never waits, because "no" is a
  // legitimate answer when you are asking whether an optional dialog appeared. Putting it
  // in front of an action discards the 90s retry ctx.tap() performs on its own, turning a
  // method that would have waited for the screen into one that gives up immediately.
  //
  // ctx.tap() retries until ACTION_TIMEOUT and, if the element truly never appears, fails
  // with WebDriverAgent's own message — more useful than a hand-written "not visible" that
  // cannot say why.

  await ctx.tap(ctx.locator);

  ctx.log('ios_click: tapped "' + ctx.locator + '"');
}
