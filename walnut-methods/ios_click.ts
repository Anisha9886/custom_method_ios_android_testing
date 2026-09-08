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
  // ctx.tap() takes the resolved XPath — the iOS context exposes the step's linked object
  // XPath via ctx.locator when the method declares needsLocator: true.
  //
  // ctx.locator — the linked object's resolved XPath, used for both visibility check and tap.

  const visible = await ctx.isVisible(ctx.locator);
  if (!visible) {
    throw new Error(
      'ios_click FAILED: the linked element is not visible on screen.\n'
      + '  locator: ' + ctx.locator + '\n'
      + 'Ensure the element is on screen before clicking.',
    );
  }

  await ctx.tap(ctx.locator);

  ctx.log('ios_click: tapped "' + ctx.locator + '"');
}
