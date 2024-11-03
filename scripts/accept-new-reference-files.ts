import url from 'url';
import path from 'path';
import { acceptAll } from './accept-new-reference-files.common';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const testDataPath = path.join(__dirname, '..', 'test-data');
await acceptAll(testDataPath);
