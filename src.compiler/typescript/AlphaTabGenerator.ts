import * as ts from 'typescript';
import cloneEmit from './CloneEmitter';
import serializerEmit from './SerializerEmitter';
import transpiler from '../TranspilerBase'

transpiler(cloneEmit);
transpiler(serializerEmit);

ts.sys.exit(ts.ExitStatus.Success);