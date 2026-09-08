import type { WalnutAndroidContext } from './walnut';

/** @walnut_method
 * name: Android Click Object
 * description: Click the linked element on the Android device
 * actionType: custom_android_click
 * context: android
 * needsLocator: true
 * category: Android Device
 */
export async function androidClick(ctx: WalnutAndroidContext) {
  // ctx.click() takes NO argument — the android context resolves the step's linked object
  // directly via the full locator chain (resource-id / text / content-desc / hint /
  // test-tag / xpath), racing every strategy rather than relying on a single XPath string.
  //
  // ctx.objectDescription — the linked object's name, used for diagnostics only.
  //
  // NO isVisible() PRECHECK HERE, DELIBERATELY. isVisible is the BRANCH check: it probes
  // briefly and never waits, because "no" is a legitimate answer when you are asking
  // whether an optional dialog appeared. Putting it in front of an action discards the
  // locate race ctx.click() runs on its own — the iOS twin of this method failed in 186ms
  // that way, on a screen that had simply not finished rendering.
  //
  // ctx.click() resolves through the full locator chain with the standard locate timeout,
  // and if the element truly never appears it fails naming the object and suggesting a
  // wait step — more useful than a hand-written "not visible" that cannot say why.

  await ctx.click();

  ctx.log('android_click: clicked "' + ctx.objectDescription + '"');
}
