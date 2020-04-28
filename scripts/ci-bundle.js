const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

var output = fs.createWriteStream(path.join(__dirname, '..', 'JavaScript.zip'));
var archive = archiver('zip');
archive.on('warning', err => {
    if (err.code === 'ENOENT') {
        console.warn(err);
    } else {
        throw err;
    }
});
archive.on('error', err => {
    throw err;
});
archive.pipe(output);

archive.file(path.join(__dirname, '..', 'dist', 'alphaTab.js'), { name: 'alphaTab.js' });
archive.file(path.join(__dirname, '..', 'dist', 'alphaTab.min.js'), { name: 'alphaTab.min.js' });
archive.glob('Bravura.*', {
    cwd: path.join(__dirname, '..', 'dist', 'font')
}, { prefix: 'font/' });
archive.glob('*.txt', {
    cwd: path.join(__dirname, '..', 'dist', 'font')
}, { prefix: 'font/' });
archive.directory(path.join(__dirname, '..', 'dist', 'soundfont'), 'soundfont');

archive.finalize();
