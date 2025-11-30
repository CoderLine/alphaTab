import { startWebWorkerLanguageServer } from '@coderline/alphatab-language-server/index';

const workerGlobalThis = globalThis as unknown as DedicatedWorkerGlobalScope;
startWebWorkerLanguageServer(workerGlobalThis, workerGlobalThis);
