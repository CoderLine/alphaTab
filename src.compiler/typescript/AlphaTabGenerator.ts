import * as ts from 'typescript';
import cloneEmit from './CloneEmitter';
import { GENERATED_FILE_HEADER } from './EmitterBase';
import serializerEmit from './SerializerEmitter';
import transpiler from '../TranspilerBase';
import * as fs from 'fs';

transpiler([{
    name: 'Clone',
    emit: cloneEmit
}, {
    name: 'Serializer',
    emit: serializerEmit
}], false);

// Write version file
import { version } from '../../package.json';
const fileHandle = fs.openSync('src/generated/VersionInfo.ts', 'w');
fs.writeSync(fileHandle, `\
${GENERATED_FILE_HEADER}
export class VersionInfo {
    public static readonly version: string = '${version}';
    public static readonly date: string = '${new Date().toISOString()}';
}
`);
ts.sys.exit(ts.ExitStatus.Success);
