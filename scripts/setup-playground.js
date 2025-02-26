import fs from 'fs-extra';
import url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const src = `${__dirname}/../playground-template`
const dest = `${__dirname}/../playground`
fs.copySync(src, dest, { overwrite: false });