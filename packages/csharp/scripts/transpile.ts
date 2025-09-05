import path from 'node:path';
import url from 'node:url';
import createEmit from '@coderline/alphatab-transpiler/src/csharp/CSharpEmitter';
import transpiler from '@coderline/alphatab-transpiler/src/TranspilerBase';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

transpiler(
    [
        {
            name: 'C#',
            emit: createEmit(
                path.resolve(__dirname, '../src/AlphaTab/Generated'),
                path.resolve(__dirname, '../src/AlphaTab.Test/Generated')
            )
        }
    ],
    true
);
