import type { WalnutAndroidContext } from './walnut';

/** @walnut_method
 * name: Android Tap Element
 * description: Tap the linked element on the Android screen
 * actionType: custom_android_tap
 * context: android
 * needsLocator: true
 * category: Android Device
 */
export async function androidTap(ctx: WalnutAndroidContext) {
  // Acts on the step's linked object — no selector needed
  await ctx.tap();
  ctx.log('Tapped element: ' + ctx.objectDescription);
}
