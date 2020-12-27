import * as ts from 'typescript';
import cloneEmit from './CloneEmitter';
import serializerEmit from './SerializerEmitter';
import transpiler from '../TranspilerBase'

transpiler([{
    name: 'Clone',
    emit: cloneEmit
}, {
    name: 'Serializer',
    emit: serializerEmit
}]);

ts.sys.exit(ts.ExitStatus.Success);