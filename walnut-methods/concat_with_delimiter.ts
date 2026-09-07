import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Concat With Delimiter
 * description: Join $[firstName] and $[lastName] with ${delimiter} and store the result in $[fullName]
 * actionType: custom_concat_with_delimiter
 * type: shared
 * needsLocator: false
 * category: Variable
 */
export async function concatWithDelimiter(ctx: WalnutContext) {
  // ARGUMENT ORDER — and WHY each one uses the bracket style it does. The engine resolves the two
  // styles differently before this method runs, so the style IS part of the contract:
  //
  //   ctx.args[0] = "firstName" — runtime variable NAME, from $[firstName]
  //   ctx.args[1] = "lastName"  — runtime variable NAME, from $[lastName]
  //   ctx.args[2] = the DELIMITER VALUE, from ${delimiter} (local test data — already resolved)
  //   ctx.args[3] = "fullName"  — runtime variable NAME, from $[fullName] (where the result goes)
  //
  // $[...] passes the NAME so this method can getVariable/setVariable on it; ${...} passes the
  // already-resolved VALUE, which is what a delimiter should be — it is authored test data, not
  // something the app produced. Getting a style wrong here fails in the least obvious way: pass
  // ${firstName} and args[0] becomes "Anisha", getVariable("Anisha") returns undefined, and the
  // result silently concatenates two empty strings.
  //
  // Step usage:
  //   Concat $[firstName] and $[lastName] with ${delimiter} into $[fullName]

  const firstVar = ctx.args[0];
  const lastVar  = ctx.args[1];
  const delim    = ctx.args[2];
  const outVar   = ctx.args[3];

  if (!outVar) {
    throw new Error(
      'concat_with_delimiter FAILED: no output variable given. Pass four arguments: '
      + '$[firstName], $[lastName], ${delimiter}, $[fullName].'
    );
  }

  const rawFirst = ctx.getVariable(firstVar);
  const rawLast  = ctx.getVariable(lastVar);

  // FAIL rather than store a half-built value. A capture step that was dropped (or a misspelled
  // variable name) would otherwise produce "Anisha " or " Sangolli" and every later assertion on
  // $[fullName] would compare against something plausible-looking but wrong — the hardest kind of
  // failure to trace back to its cause.
  const missing: string[] = [];
  if (rawFirst === undefined || rawFirst === null) missing.push(firstVar);
  if (rawLast === undefined || rawLast === null) missing.push(lastVar);
  if (missing.length > 0) {
    throw new Error(
      'concat_with_delimiter FAILED: runtime variable(s) never set: ' + missing.join(', ') + '. '
      + 'A capture step may have been dropped, the name may be misspelled, or this step may be '
      + 'running BEFORE the step that captures it.'
    );
  }

  // Normalise both parts the same way, for the same reason strip_invisible exists: iOS wraps
  // rendered text in invisible Unicode, so a name read off the screen can carry bidi marks that
  // make the joined value compare unequal to a visually identical string.
  const clean = (v: unknown): string =>
    String(v)
      .replace(/\p{Cf}/gu, '')
      .replace(/[       　]/g, ' ')
      .normalize('NFC')
      .trim();   // trimmed HERE, unlike strip_invisible: a stray space around a name part would
                 // double up against the delimiter ("Anisha  Sangolli").

  const first = clean(rawFirst);
  const last  = clean(rawLast);

  // An ABSENT delimiter is a legitimate choice (join with nothing), so it is not an error. But an
  // absent one is easy to do by accident, so say which happened rather than leaving it to guesswork.
  const delimiter = delim === undefined || delim === null ? '' : String(delim);
  if (delimiter === '') {
    ctx.warn('concat_with_delimiter: delimiter is empty — joining with no separator');
  }

  const result = first + delimiter + last;

  ctx.log('concat_with_delimiter:');
  ctx.log('  [' + firstVar + '] = ' + JSON.stringify(first));
  ctx.log('  [' + lastVar + ']  = ' + JSON.stringify(last));
  ctx.log('  delimiter        = ' + JSON.stringify(delimiter));
  ctx.log('  -> [' + outVar + '] = ' + JSON.stringify(result));

  ctx.setVariable(outVar, result);
}
