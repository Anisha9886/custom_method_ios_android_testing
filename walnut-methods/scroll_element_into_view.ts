import type { WalnutWebContext } from './walnut';

/** @walnut_method
 * name: Scroll Element Into View
 * description: Scroll the linked element into view on the web page
 * actionType: custom_scroll_element
 * context: web
 * needsLocator: true
 * category: Navigation
 */
export async function scrollElementIntoView(ctx: WalnutWebContext) {
  if (!ctx.locator) {
    throw new Error('No linked element is available to scroll');
  }

  await ctx.locator.scrollIntoViewIfNeeded();
}
