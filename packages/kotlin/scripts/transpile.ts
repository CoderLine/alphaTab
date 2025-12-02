import createEmit from '@coderline/alphatab-transpiler/src/kotlin/KotlinEmitter';
import transpiler from '@coderline/alphatab-transpiler/src/TranspilerBase';
import path from 'node:path';
import url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

transpiler(
    [
        {
            name: 'Kotlin',
            emit: createEmit(
                path.resolve(__dirname, '../src/android/src/main-generated/java'),
                path.resolve(__dirname, '../src/android/src/test-generated/java')
            )
        }
    ],
    true
);
