import { startWebWorkerLanguageServer } from '@coderline/alphatab-lsp/index';

console.info('Starting AlphaTab Language Server');
const workerGlobalThis = globalThis as unknown as DedicatedWorkerGlobalScope;
startWebWorkerLanguageServer(workerGlobalThis, workerGlobalThis);
console.info('Started AlphaTab Language Server');
