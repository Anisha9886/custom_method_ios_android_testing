import type { WalnutBaseContext } from './walnut';

/** @walnut_method
 * name: Generate Random Name
 * description: Generate a random full name and store in $[randomName]
 * actionType: custom_generate_random_name
 * context: shared
 * needsLocator: false
 * category: Test Data
 */
export async function generateRandomName(ctx: WalnutBaseContext) {
  const outputVar = ctx.args[0];
  if (!outputVar) {
    throw new Error('Missing output variable — add $[randomName] to the step description');
  }

  const firstNames = [
    'Avery', 'Casey', 'Jordan', 'Morgan', 'Riley', 'Taylor', 'Cameron', 'Quinn',
    'Jamie', 'Drew', 'Alex', 'Reese', 'Skyler', 'Rowan', 'Parker', 'Emerson',
    'Harper', 'Logan', 'Sage', 'Dakota', 'Ellis', 'Finley', 'Kendall', 'Payton',
  ];
  const lastNames = [
    'Bennett', 'Carter', 'Collins', 'Brooks', 'Foster', 'Hayes', 'Perry', 'Reed',
    'Bailey', 'Morgan', 'Cooper', 'Murphy', 'Bailey', 'Rivera', 'Parker', 'Sullivan',
    'Turner', 'Ward', 'Watson', 'Young', 'Patel', 'Shah', 'Mehta', 'Rao',
  ];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const fullName = `${firstName} ${lastName}`;

  ctx.setVariable(outputVar, fullName);
  ctx.log('Generated random full name: ' + fullName);
}
