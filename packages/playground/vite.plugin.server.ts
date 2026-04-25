import fs from 'node:fs';
import type { ServerResponse } from 'node:http';
import path from 'node:path';
import url from 'node:url';
import serveStatic from 'serve-static';
import type { Connect, Logger, Plugin } from 'vite';
import { acceptOne } from '../alphatab/scripts/accept-new-reference-files.common';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

interface TestResultEntry {
    originalFile: string;
    newFile: string;
    diffFile: string;
}

function removeLeadingSlash(s: string): string {
    return s[0] === '/' ? s.slice(1) : s;
}

function readBody(req: Connect.IncomingMessage, length: number): Promise<string> {
    return new Promise((resolve, reject) => {
        let chunks = '';
        let received = 0;
        req.on('data', (chunk: Buffer) => {
            chunks += chunk.toString('utf-8');
            received += chunk.length;
            if (received >= length) {
                resolve(chunks);
            }
        });
        req.on('end', () => resolve(chunks));
        req.on('error', () => reject());
    });
}

function writeJson(res: ServerResponse, status: number, statusMessage: string, body: unknown): void {
    const json = Buffer.from(JSON.stringify(body), 'utf-8');
    res.writeHead(status, statusMessage, {
        'content-type': 'application/json',
        'content-length': json.length
    });
    res.write(json);
    res.end();
}

function writeError(res: ServerResponse, status: number, statusMessage: string, e?: Error): void {
    writeJson(res, status, statusMessage, e ? { message: e.message, stack: e.stack } : { message: statusMessage });
}

function crawlNewReferenceFiles(testDataPath: string): TestResultEntry[] {
    const out: TestResultEntry[] = [];
    function visit(dir: string, name: string): void {
        const handle = fs.opendirSync(dir);
        try {
            while (true) {
                const entry = handle.readSync();
                if (!entry) {
                    break;
                }
                if (entry.isDirectory() && entry.name !== '.' && entry.name !== '..') {
                    visit(path.join(dir, entry.name), `${name}/${entry.name}`);
                } else if (entry.isFile() && entry.name.endsWith('.new.png')) {
                    out.push({
                        originalFile: `${name}/${entry.name.replace('.new.png', '.png')}`,
                        newFile: `${name}/${entry.name}`,
                        diffFile: `${name}/${entry.name.replace('.new.png', '.diff.png')}`
                    });
                }
            }
        } finally {
            handle.close();
        }
    }
    visit(testDataPath, 'test-data');
    return out;
}

export default function server(): Plugin {
    return {
        name: 'at-test-data-server',
        configureServer(devServer) {
            const testDataPath = path.join(__dirname, '..', 'alphatab', 'test-data');
            const log: Logger = devServer.config.logger;

            devServer.middlewares.use('/font', serveStatic(path.join(__dirname, '..', 'alphatab', 'font')));
            devServer.middlewares.use('/test-data', serveStatic(testDataPath));

            devServer.middlewares.use('/test-results/list', (_req, res) => {
                try {
                    writeJson(res, 200, 'OK', crawlNewReferenceFiles(testDataPath));
                } catch (e) {
                    writeError(res, 500, 'Internal Server Error', e as Error);
                }
            });

            devServer.middlewares.use('/test-results/accept', (req, res) => {
                handleAccept(req, res, testDataPath, log).catch(e => {
                    writeError(res, 500, 'Internal Server Error', e as Error);
                });
            });
        }
    };
}

async function handleAccept(
    req: Connect.IncomingMessage,
    res: ServerResponse,
    testDataPath: string,
    log: Logger
): Promise<void> {
    if (req.method !== 'POST') {
        log.warn('[playground] /test-results/accept: wrong HTTP method');
        writeError(res, 405, 'Method not allowed');
        return;
    }
    if (!req.headers['content-length']) {
        log.warn('[playground] /test-results/accept: missing content-length');
        writeError(res, 411, 'Length Required');
        return;
    }
    const bodyLength = Number.parseInt(req.headers['content-length']!, 10);
    if (!Number.isFinite(bodyLength) || bodyLength > 10_000) {
        log.warn(`[playground] /test-results/accept: invalid content-length ${req.headers['content-length']}`);
        writeError(res, 413, 'Content Too Large');
        return;
    }

    const bodyText = await readBody(req, bodyLength);
    let body: { newFile?: string; originalFile?: string };
    try {
        body = JSON.parse(bodyText);
    } catch {
        log.warn('[playground] /test-results/accept: invalid JSON body');
        writeError(res, 400, 'Bad Request');
        return;
    }

    if (typeof body.originalFile !== 'string' || typeof body.newFile !== 'string') {
        log.warn('[playground] /test-results/accept: body missing originalFile/newFile');
        writeError(res, 400, 'Bad Request');
        return;
    }

    let relativePath = removeLeadingSlash(body.newFile);
    if (relativePath.startsWith('test-data/')) {
        relativePath = relativePath.substring('test-data/'.length);
    }
    const newFile = path.normalize(path.resolve(testDataPath, relativePath));
    if (!newFile.startsWith(testDataPath)) {
        log.warn(`[playground] /test-results/accept: rejected out-of-tree path ${newFile}`);
        writeError(res, 400, 'Bad Request');
        return;
    }

    await acceptOne(newFile);
    writeJson(res, 200, 'OK', { message: 'Accepted' });
}
