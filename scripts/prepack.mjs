import path from 'node:path';
import url from 'node:url';
import fs from 'node:fs';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const packageJsonPath = path.resolve(__dirname, '..', 'package.json');


let packageJsonContent = await fs.promises.readFile(packageJsonPath, 'utf-8');
packageJsonContent = packageJsonContent.replace('"type": "module"', '"type": "commonjs"');
await fs.promises.writeFile(packageJsonPath, packageJsonContent);