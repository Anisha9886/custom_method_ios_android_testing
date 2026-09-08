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

  await ctx.click();

  ctx.log('android_click: element clicked');
}
