import type { WalnutAndroidContext } from './walnut';

/** @walnut_method
 * name: Android Action
 * description: Read the linked element's text on the Android device and store it in $[textValue]
 * actionType: custom_android_action
 * context: android
 * needsLocator: true
 * category: Android Device
 */
export async function androidAction(ctx: WalnutAndroidContext) {
  // ctx.getText() takes NO argument — this is the one real difference from the iOS twin.
  // On iOS a locator is one XPath string, so the method passes ctx.locator. On Android an
  // element is a locator CHAIN (resource-id / text / content-desc / hint / test-tag / xpath
  // ladder) raced by the resolver, so the context reads the step's linked object directly
  // and gets every strategy, not just whichever one the recorder happened to write first.
  //
  // ctx.args[0] — "textValue", the runtime variable NAME from $[textValue]

  const outputVar = ctx.args[0];
  if (!outputVar) {
    throw new Error(
      'android_action: missing output variable — add $[varName] to the step '
      + 'description, e.g. "Read the Cart Total and store it in $[cartTotal]".',
    );
  }

  const text = await ctx.getText();

  // Android pads rendered strings with invisible Unicode too (zero-width and bidi marks,
  // most often around digits and currency), which is how a later comparison of "2" against
  // "2" fails while both print identically. Strip that class before storing so every
  // downstream assertion compares what it appears to be comparing.
  const clean = String(text ?? '')
    .replace(/\p{Cf}/gu, '')
    .replace(/[       　]/g, ' ')
    .normalize('NFC')
    .trim();

  if (clean === '') {
    // The element resolved but holds no text — a real, diagnosable state. ctx.getText()
    // already falls back to content-desc, so an icon-only button would have been covered;
    // reaching here usually means the locator matched a wrapper rather than the label.
    throw new Error(
      'android_action FAILED: the element resolved but its text is empty '
      + '(content-desc was empty too). The locator may be pointing at a container rather '
      + 'than the TextView — check what it actually matches.',
    );
  }

  ctx.log('android_action: "' + clean + '" → ' + outputVar);
  ctx.setVariable(outputVar, clean);
}
