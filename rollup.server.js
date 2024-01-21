const express = require('express')
const opener = require('opener');
const fs = require('fs');
const path = require('path');

let app = null;
module.exports = function (options) {
    if (app) {
        app.close();
    }

    app = express();

    const exposedFolders = [
        'dist',
        'src',
        'font',
        'img',
        'playground',
        'playground-template',
        'test-data'
    ];

    for (const exposedFolder of exposedFolders) {
        app.use('/' + exposedFolder, express.static(exposedFolder));
    }

    app.get('/test-results', async (req, res) => {
        try {
            const response = [];

            async function crawl(d, name) {
                console.log('Crawling ', d);
                const dir = await fs.promises.opendir(d);
                try {
                    while (true) {
                        const entry = await dir.read();
                        if (!entry) {
                            break;
                        } else if (entry.isDirectory() && entry.name !== '.' && entry.name !== '..') {
                            await crawl(path.join(d, entry.name), name + '/' + entry.name)
                        } else if (entry.isFile()) {
                            if (entry.name.endsWith('.new.png')) {
                                response.push({
                                    originalFile: name + '/' + entry.name.replace('.new.png', '.png'),
                                    newFile: name + '/' + entry.name,
                                    diffFile: name + '/' + entry.name.replace('.new.png', '.diff.png')
                                });
                            }
                        }
                    }
                }
                finally {
                    await dir.close();
                }
            }

            const testDataPath = path.join(__dirname, 'test-data');
            console.log('will crawl: ', testDataPath)
            await crawl(testDataPath, 'test-data');

            res.json(response);
        }
        catch (e) {
            res.json({
                message: e.message,
                stack: e.stack
            });
        }
    })

    app.listen(options.port, () => {
        console.log('Server listening on port ' + options.port);
    });

    let first = true
    return {
        name: 'server',
        generateBundle() {
            if (first) {
                first = false
                opener(`http://localhost:${options.port}` + options.openPage)
            }
        }
    };
}