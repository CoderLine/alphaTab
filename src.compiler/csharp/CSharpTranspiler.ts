import emit from './CSharpEmitter';
import transpiler from '../TranspilerBase'

transpiler([{
    name: 'C#',
    emit: emit
}], true);