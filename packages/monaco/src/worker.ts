import { startWebWorkerLanguageServer } from '@coderline/alphatab-language-server/server/browser';

const workerGlobalThis = globalThis as unknown as DedicatedWorkerGlobalScope;
startWebWorkerLanguageServer(workerGlobalThis, workerGlobalThis);
