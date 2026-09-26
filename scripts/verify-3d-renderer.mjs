import { execFileSync } from 'node:child_process';

const rendererPath = 'apps/web/src/features/twin/DigitalTwin3D.js';
const expectedBlobSha = '82e86d6111c77c6ea88691b14f18f2fdae1f9dfb';

const actualBlobSha = execFileSync(
  'git',
  ['hash-object', rendererPath],
  { encoding: 'utf8' }
).trim();

if (actualBlobSha !== expectedBlobSha) {
  console.error('3D renderer protection check failed.');
  console.error('Expected blob SHA:', expectedBlobSha);
  console.error('Actual blob SHA:  ', actualBlobSha);
  console.error('Do not modify DigitalTwin3D.js without an explicit parity/migration review.');
  process.exit(1);
}

console.log('3D renderer protection check passed:', rendererPath);
