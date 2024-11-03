import express from 'express';
import opener from 'opener';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import url from 'url';
import { acceptOne } from './scripts/accept-new-reference-files.common'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export interface ServerOptions {
    port: number;
    openPage: string;
}

let app: express.Express;
export default function server(options: ServerOptions) {
    if (app) {
        (app as any).close();
    }

    app = express();

    app.use(cors());
    app.use(express.json());

    const exposedFolders = ['dist', 'src', 'font', 'img', 'playground', 'playground-template', 'test-data'];

    for (const exposedFolder of exposedFolders) {
        app.use('/' + exposedFolder, express.static(exposedFolder));
    }

    app.get('/test-results', async (req, res) => {
        try {
            const response: any = [];

            async function crawl(d: string, name: string) {
                // console.log('Crawling ', d);
                const dir = await fs.promises.opendir(d);
                try {
                    while (true) {
                        const entry = await dir.read();
                        if (!entry) {
                            break;
                        } else if (entry.isDirectory() && entry.name !== '.' && entry.name !== '..') {
                            await crawl(path.join(d, entry.name), name + '/' + entry.name);
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
                } finally {
                    await dir.close();
                }
            }

            const testDataPath = path.join(__dirname, 'test-data');
            // console.log('will crawl: ', testDataPath);
            await crawl(testDataPath, 'test-data');

            res.json(response);
        } catch (e) {
            res.json({
                message: (e as Error).message,
                stack: (e as Error).stack
            });
        }
    });

    app.post('/accept-test-result', async (req, res) => {
        try {
            const body = req.body;
            // basic validation that nothing bad happens
            if(typeof body.originalFile !== 'string'){
                res.sendStatus(400);
                return;
            }
            const newFile = path.normalize(path.resolve(path.join(__dirname, body.newFile)));
            const testDataPath = path.normalize(path.resolve(path.join(__dirname, 'test-data')));
            
            if(!newFile.startsWith(testDataPath)){
                res.sendStatus(400);
                return;
            }

            await acceptOne(newFile);
            res.json({
                message: 'Accepted'
            });
        } catch (e) {
            res.json({
                message: (e as Error).message,
                stack: (e as Error).stack
            });
        }
    });

    app.listen(options.port, () => {
        console.log('Server listening on port ' + options.port);
    });

    let first = true;
    return {
        name: 'server',
        generateBundle() {
            if (first) {
                first = false;
                opener(`http://localhost:${options.port}` + options.openPage);
            }
        }
    };
}
