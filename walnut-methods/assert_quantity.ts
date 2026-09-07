import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Assert Quantity
 * description: Assert the quantity shown in $[shown] equals ${expected} — catches a picker that never registered
 * actionType: custom_assert_quantity
 * type: shared
 * needsLocator: false
 * category: Cart Assertions
 */
export async function assertQuantity(ctx: WalnutContext) {
  // ctx.args[0] = $[shown]    — runtime variable NAME holding the quantity read off the screen
  //                             (also accepts a ${literal} — see DUAL MODE below)
  // ctx.args[1] = ${expected} — the quantity the test intended, from local test data
  //
  // WHY THIS EXISTS. A quantity picker is the single most reliably-broken thing in these flows, and
  // it breaks SILENTLY — the item lands in the cart, so every later step passes while the count is
  // wrong:
  //   - Zomato: quantity 2 needs FOUR taps across TWO dialogs; a recording that captured three of
  //     them adds one dish and reports success.
  //   - BookMyShow: the seat-quantity picker is frequently never set at all.
  //   - AbhiBus: a locator-less drag step loses the ticket count entirely on replay.
  // A built-in verify on the quantity label can only compare exact text, which fails the moment the
  // app renders "2" as "2 items" or "x2".

  const rawArg   = ctx.args[0];
  const expected = ctx.args[1];

  // DUAL MODE — a $[name] resolves via getVariable; anything else is treated as the value itself.
  // Kept because store_run_variable is not always available in the picker, so a test may only have
  // ${...} test data to assert on. An empty-string lookup counts as "not a variable" so a captured-
  // but-blank value still falls through to the empty check below rather than silently passing.
  const lookedUp = ctx.getVariable(rawArg);
  const usedVariable = lookedUp !== undefined && lookedUp !== null && String(lookedUp) !== '';
  const rawShown = usedVariable ? lookedUp : rawArg;

  // iOS pads rendered numbers with invisible Unicode (bidi marks around digits), which is how a
  // comparison of "2" against "2" can fail while printing identically. Strip that class first.
  const clean = (v: unknown): string =>
    String(v ?? '')
      .replace(/\p{Cf}/gu, '')
      .replace(/[       　]/g, ' ')
      .normalize('NFC')
      .trim();

  /**
   * Pull the quantity out of whatever the app rendered.
   *
   * Deliberately tolerant of the wrappers these apps actually use — "2", "Qty: 2", "2 items",
   * "x2", "(2)" — because the assertion is about the NUMBER, and pinning the surrounding words
   * turns a passing test into a failing one the next time a label is reworded.
   *
   * Takes the FIRST integer in the string. That is right for every wrapper above; it would be wrong
   * for a label mixing two numbers ("2 of 5 seats"), which is why the parsed value is logged — so a
   * surprising result is visible rather than silently asserted.
   */
  const parseQty = (s: string): number | null => {
    const m = s.replace(/,/g, '').match(/-?\d+/);
    return m ? parseInt(m[0], 10) : null;
  };

  const shownText = clean(rawShown);
  const expectedText = clean(expected);

  ctx.log('assert_quantity:');
  ctx.log('  shown    = ' + JSON.stringify(shownText) + (usedVariable ? ' (from variable "' + rawArg + '")' : ' (literal)'));
  ctx.log('  expected = ' + JSON.stringify(expectedText));

  if (shownText === '') {
    throw new Error(
      'assert_quantity FAILED: the shown quantity is empty. '
      + (usedVariable
        ? 'Variable "' + rawArg + '" resolved to an empty string — the capture step ran but read nothing.'
        : 'No value was passed. A capture step may have been dropped, or the variable name is misspelled.')
    );
  }

  const shownQty = parseQty(shownText);
  const expectedQty = parseQty(expectedText);

  if (expectedQty === null) {
    throw new Error(
      'assert_quantity FAILED: expected value ' + JSON.stringify(expectedText) + ' contains no number. '
      + 'Pass the intended count, e.g. 2.'
    );
  }
  if (shownQty === null) {
    throw new Error(
      'assert_quantity FAILED: could not read a number out of ' + JSON.stringify(shownText) + '. '
      + 'The locator may be pointing at the wrong element — check what it actually captured.'
    );
  }

  if (shownQty !== expectedQty) {
    throw new Error(
      'assert_quantity FAILED: expected ' + expectedQty + ' but the app shows ' + shownQty
      + ' (raw: ' + JSON.stringify(shownText) + '). '
      + (shownQty < expectedQty
        ? 'The picker registered fewer taps than the test intended — a common recorder miss when the '
          + 'increment needs several taps or crosses a dialog.'
        : 'The app has MORE than intended — a repeated add step, or a cart left dirty by an earlier run.')
    );
  }

  ctx.log('assert_quantity PASSED: ' + shownQty);
}
