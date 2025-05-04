import ts from 'typescript';
import cloneEmit from './CloneEmitter';
import { GENERATED_FILE_HEADER } from './EmitterBase';
import serializerEmit from './SerializerEmitter';
import transpiler from '../TranspilerBase';
import fs from 'node:fs';
import jsonDeclarationEmit from './JsonDeclarationEmitter';
import { execSync } from 'node:child_process';

transpiler(
    [
        {
            name: 'Clone',
            emit: cloneEmit
        },
        {
            name: 'Serializer',
            emit: serializerEmit
        },
        {
            name: 'JSON Declarations',
            emit: jsonDeclarationEmit
        }
    ],
    false
);

// Write version file
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const { version } = packageJson;
const fileHandle = fs.openSync('src/generated/VersionInfo.ts', 'w');
const commit = execSync('git rev-parse HEAD').toString().trim();

fs.writeSync(
    fileHandle,
    `\
${GENERATED_FILE_HEADER}


export class VersionInfo {
    public static readonly version: string = '${version}';
    public static readonly date: string = '${new Date().toISOString()}';
    public static readonly commit: string = '${commit}';

    public static print(print: (message:string) => void) {
        print(\`alphaTab \${VersionInfo.version}\`);
        print(\`commit: \${VersionInfo.commit}\`);
        print(\`build date: \${VersionInfo.date}\`);
    }
}
`
);
ts.sys.exit(ts.ExitStatus.Success);
