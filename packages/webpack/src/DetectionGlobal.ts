import type { Expression } from 'estree';
import { tapJavaScript } from './Utils';

/**
 * @internal
 */
export function configureDetectionGlobal(pluginName: string, normalModuleFactory: any) {
    const parserPlugin = (parser: any) => {
        parser.hooks.evaluateIdentifier.for('__ALPHATAB_WEBPACK__').tap(pluginName, (expr: Expression) => {
            const res = parser.evaluate('true');
            res.setRange(expr.range);
            return res;
        });
    };

    tapJavaScript(normalModuleFactory, pluginName, parserPlugin);
}
