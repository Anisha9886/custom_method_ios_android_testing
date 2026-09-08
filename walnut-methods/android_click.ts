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

  const visible = await ctx.isVisible();
  if (!visible) {
    throw new Error(
      'android_click FAILED: the linked element is not visible on screen.\n'
      + '  object: ' + ctx.objectDescription + '\n'
      + 'Ensure the element is on screen before clicking.',
    );
  }

  await ctx.click();

  ctx.log('android_click: clicked "' + ctx.objectDescription + '"');
}
