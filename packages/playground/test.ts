import { startWebWorkerLanguageServer } from '@coderline/alphatab-lsp';

export function test() {
    const type: string = 'test';
    console.log(type);
    debugger;
    console.info('Starting AlphaTab Language Server');
    const workerGlobalThis = globalThis as unknown as DedicatedWorkerGlobalScope;
    startWebWorkerLanguageServer(workerGlobalThis, workerGlobalThis);
    console.info('Started AlphaTab Language Server');
}
