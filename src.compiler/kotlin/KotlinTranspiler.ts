import emit from './KotlinEmitter';
import transpiler from '../TranspilerBase';

transpiler(
    [
        {
            name: 'Kotlin',
            emit: emit
        }
    ],
    true
);
