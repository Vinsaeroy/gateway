import fs from 'fs';
import { getApiDocs } from '../src/lib/swagger';

const spec = getApiDocs();
fs.writeFileSync('swagger.json', JSON.stringify(spec, null, 2));
console.log('Generated swagger.json successfully.');
