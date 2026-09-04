import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Dump Variables
 * description: Log every runtime variable currently captured — use as a diagnostic step
 * actionType: custom_dump_variables
 * context: shared
 * needsLocator: false
 * category: Smoke
 */
export async function dumpVariables(ctx: WalnutContext) {
  // variableContext holds all runtime variables set by ctx.setVariable() across steps.
  // Logging the whole map lets you see exactly what has been captured up to this point.
  const vars = ctx.variableContext as Record<string, unknown>;
  const keys = Object.keys(vars);

  ctx.log('DUMP VARIABLES — ' + keys.length + ' variable(s) captured:');

  if (keys.length === 0) {
    ctx.warn('  (no variables set yet — run this step after steps that capture values)');
    return;
  }

  keys.sort().forEach((key) => {
    const raw = vars[key];
    ctx.log('  [' + key + '] = ' + JSON.stringify(raw));
  });
}
