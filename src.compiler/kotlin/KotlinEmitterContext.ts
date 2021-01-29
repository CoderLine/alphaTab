import * as cs from '../csharp/CSharpAst';
import * as ts from 'typescript';
import CSharpEmitterContext from "../csharp/CSharpEmitterContext";

export default class KotlinEmitterContext extends CSharpEmitterContext {
    public constructor(program: ts.Program) {
        super(program);
        this.noPascalCase = true;
    }

    protected isClassElementOverride(classType: ts.InterfaceType, classElement: ts.ClassElement) {
        if (this.hasAnyBaseTypeClassMember(classType, classElement.name!.getText(), true)) {
            return true;
        }

        if (ts.isClassDeclaration(classType.symbol.valueDeclaration) &&
            classType.symbol.valueDeclaration.heritageClauses) {
            const implementsClause = classType.symbol.valueDeclaration.heritageClauses
                ?.find(c => c.token === ts.SyntaxKind.ImplementsKeyword);

            if (implementsClause) {
                for (const typeSyntax of implementsClause.types) {
                    const type = this.typeChecker.getTypeFromTypeNode(typeSyntax);
                    if (type.isClassOrInterface()) {
                        if (this.hasClassMember(type, classElement.name!.getText())) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }
}