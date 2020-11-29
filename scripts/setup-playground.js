const fs = require('fs-extra');

const src = `${__dirname}/../playground-template`
const dest = `${__dirname}/../playground`
fs.copySync(src, dest, { overwrite: false });