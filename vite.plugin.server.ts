import fs from 'fs';
import path from 'path';
import url from 'url';
import { acceptOne } from './scripts/accept-new-reference-files.common';
import { Connect, Plugin } from 'vite';
import { ServerResponse } from 'http';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

function removeLeadingSlash(str: string): string {
    return str[0] === '/' ? str.slice(1) : str;
}

function readBody(req: Connect.IncomingMessage, length: number): Promise<string> {
    return new Promise((resolve, reject) => {
        let chunks: string = '';
        let received = 0;
        req.on('data', (chunk: Buffer) => {
            chunks += chunk.toString('utf-8');
            received += chunk.length;
            if (received >= length) {
                resolve(chunks);
            }
        });
        req.on('end', () => {
            resolve(chunks);
        });
        req.on('error', () => {
            reject();
        });
    });
}

export default function server(): Plugin {
    return {
        name: 'at-test-data-server',
        configureServer(server) {
            const testDataPath = path.join(__dirname, 'test-data');

            server.middlewares.use('/test-results', (req, res, next) => {
                try {
                    const response: any = [];

                    function crawl(d: string, name: string) {
                        const dir = fs.opendirSync(d);
                        try {
                            while (true) {
                                const entry = dir.readSync();
                                if (!entry) {
                                    break;
                                } else if (entry.isDirectory() && entry.name !== '.' && entry.name !== '..') {
                                    crawl(path.join(d, entry.name), name + '/' + entry.name);
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
                            dir.close();
                        }
                    }

                    crawl(testDataPath, 'test-data');

                    const json = Buffer.from(JSON.stringify(response), 'utf-8');

                    res.writeHead(200, 'OK', {
                        'content-type': 'application/json',
                        'content-length': json.length
                    });
                    res.write(json);
                    res.end();
                } catch (e) {
                    const json = Buffer.from(
                        JSON.stringify({
                            message: (e as Error).message,
                            stack: (e as Error).stack
                        }),
                        'utf-8'
                    );
                    res.writeHead(500, 'Internal Server Error', {
                        'content-type': 'application/json',
                        'content-length': json.length
                    });
                    res.write(json);
                    res.end();
                }
            });

            async function handleAsync(req: Connect.IncomingMessage, res: ServerResponse) {
                if (req.method !== 'POST') {
                    res.writeHead(405, 'Method not allowed');
                    console.log('Wrong HTTP Method');
                    return;
                }

                if (!req.headers['content-length']) {
                    res.writeHead(411, 'Length Required');
                    console.log('Missing Length');
                    return;
                }

                const bodyLength = parseInt(req.headers['content-length']!);
                if (bodyLength > 10_000 || !isFinite(bodyLength)) {
                    res.writeHead(413, 'Content Too Large');
                    console.log('Too long');
                    return;
                }

                const bodyText = await readBody(req, bodyLength);
                const body = JSON.parse(bodyText);

                // basic validation that nothing bad happens
                if (typeof body.originalFile !== 'string') {
                    res.writeHead(400, 'Bad Request');
                    console.log('invalid json');
                    return;
                }

                let relativePath = removeLeadingSlash(body.newFile);
                if (relativePath.startsWith('test-data/')) {
                    relativePath = relativePath.substring('test-data/'.length);
                }

                const newFile = path.normalize(path.resolve(testDataPath, relativePath));

                if (!newFile.startsWith(testDataPath)) {
                    res.writeHead(400, 'Bad Request');
                    console.log('invalid path', newFile, testDataPath);
                    res.end();
                    return;
                }

                await acceptOne(newFile);
                const json = Buffer.from(
                    JSON.stringify({
                        message: 'Accepted'
                    }),
                    'utf-8'
                );
                res.writeHead(200, 'OK', {
                    'content-type': 'application/json',
                    'content-length': json.length
                });
                res.write(json);
            }

            server.middlewares.use('/accept-test-result', (req, res, next) => {
                handleAsync(req, res)
                    .then(() => {
                        res.end();
                    })
                    .catch(e => {
                        const json = Buffer.from(
                            JSON.stringify({
                                message: (e as Error).message,
                                stack: (e as Error).stack
                            }),
                            'utf-8'
                        );
                        res.writeHead(500, 'Internal Server Error', {
                            'content-type': 'application/json',
                            'content-length': json.length
                        });
                        res.write(json);
                        res.end();
                    });
            });
        }
    };
}
