import { startWebWorkerLanguageServer } from '@coderline/alphatab-language-server/server/browser';

const scope = self as unknown as Worker;
startWebWorkerLanguageServer(scope, scope);
