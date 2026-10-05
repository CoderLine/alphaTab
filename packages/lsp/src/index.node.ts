export * from '@coderline/alphatab-language-server/index';
import { startNodeLanguageServer } from '@coderline/alphatab-language-server/server/node';
export { startNodeLanguageServer };

if (import.meta.main) {
    startNodeLanguageServer();
}
