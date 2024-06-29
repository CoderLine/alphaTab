import * as ts from 'typescript';
import cloneEmit from './CloneEmitter';
import { GENERATED_FILE_HEADER } from './EmitterBase';
import serializerEmit from './SerializerEmitter';
import transpiler from '../TranspilerBase';
import * as fs from 'fs';
import jsonDeclarationEmit from './JsonDeclarationEmitter';

transpiler([{
    name: 'Clone',
    emit: cloneEmit
}, {
    name: 'Serializer',
    emit: serializerEmit
}, {
    name: 'JSON Declarations',
    emit: jsonDeclarationEmit
}], false);

// Write version file
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const { version } = packageJson;
const fileHandle = fs.openSync('src/generated/VersionInfo.ts', 'w');
fs.writeSync(fileHandle, `\
${GENERATED_FILE_HEADER}
export class VersionInfo {
    public static readonly version: string = '${version}';
    public static readonly date: string = '${new Date().toISOString()}';
}
`);
ts.sys.exit(ts.ExitStatus.Success);
