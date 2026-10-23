import fs from 'fs';

const files = [
  'services/apartment/listApartments.ts',
  'services/apartment/getApartmentById.ts',
  'services/apartment/apartmentWrites.ts',
  'services/apartment/landingApartment.ts',
  'services/apartment/bulkUpdateApartments.ts',
];

for (const file of files) {
  let text = fs.readFileSync(file, 'utf8').replace(/\\n/g, '\n');
  if (text.includes('crypto.') && !text.includes('import crypto')) {
    text = `import crypto from 'crypto';\n${text}`;
  }
  if (!text.endsWith('\n')) text += '\n';
  fs.writeFileSync(file, text);
  console.log(file, text.trimEnd().split('\n').length);
}
