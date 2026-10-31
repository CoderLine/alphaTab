import ts from "typescript";
import path from "node:path";
import url from "url";

export const repositoryRoot = path.resolve(
  url.fileURLToPath(new URL(".", import.meta.url)),
  ".."
);

export type GenerateContext = {
  emptyFiles: boolean;
  checker: ts.TypeChecker;
  settings: ts.ClassDeclaration;
  dts: string;
  nameToExportName: Map<string, string>;
  flatExports: Map<string, ts.DeclarationStatement>;
};

export type TypeWithNullableInfo = {
  readonly symbol: ts.Symbol | undefined;
  readonly isNullable: boolean;
  readonly isOptional: boolean;
  readonly isUnionType: boolean;
  readonly isPrimitiveType: boolean;
  readonly isEnumType: boolean;
  readonly isOwnType: boolean;
  readonly isTypedArray: boolean;
  readonly ownTypeAsString: string;
  readonly fullString: string;
  readonly isArray: boolean;
  readonly isTypeLiteral: boolean;
  readonly isFunctionType: boolean;
  readonly arrayItemType?: TypeWithNullableInfo;
  readonly typeArguments?: readonly TypeWithNullableInfo[];
  readonly unionTypes?: readonly TypeWithNullableInfo[];
};

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export function findModule(type: ts.Type) {
  const symbol = type.getSymbol() ?? type.aliasSymbol;

  if (symbol && symbol.declarations) {
    for (const decl of symbol.declarations) {
      const file = decl.getSourceFile();
      if (file) {
        const relative = path.relative(
          repositoryRoot,
          path.resolve(file.fileName)
        );
        return relative;
      }
    }

    return "./" + symbol.name;
  }

  return "";
}

export function getTypeWithNullableInfo(
  context: GenerateContext,
  node: ts.TypeNode | ts.ExpressionWithTypeArguments | undefined,
  allowUnion: boolean,
  isOptionalFromDeclaration: boolean
): TypeWithNullableInfo {
  if (!node) {
    return {
      isNullable: false,
      isOptional: isOptionalFromDeclaration,
      isUnionType: false,
      isPrimitiveType: false,
      isEnumType: false,
      isTypedArray: false,
      isOwnType: false,
      fullString: "unknown",
      ownTypeAsString: "unknown",
      isArray: false,
      symbol: context.checker.getUnknownType().getSymbol(),
      isTypeLiteral: false,
      isFunctionType: false,
    };
  }

  let typeInfo: Writeable<TypeWithNullableInfo> = {
    isNullable: false,
    isOptional: isOptionalFromDeclaration,
    isUnionType: false,
    isPrimitiveType: false,
    isEnumType: false,
    isTypedArray: false,
    isOwnType: false,
    fullString: node.getText(),
    ownTypeAsString: "",
    isArray: false,
    symbol: null!,
    isTypeLiteral: false,
    isFunctionType: false,
  };
  let mainTypeNode: ts.TypeNode | undefined;

  const fillBaseInfoFrom = (typeNode: ts.TypeNode) => {
    const type = context.checker.getTypeFromTypeNode(typeNode);
    typeInfo.symbol = type.getSymbol() ?? type.aliasSymbol;
    typeInfo.ownTypeAsString = typeNode.getText();

    const modulePath = findModule(type);
    typeInfo.isOwnType =
      !!modulePath && path.basename(modulePath) === path.basename(context.dts);

    typeInfo.isTypeLiteral = ts.isTypeLiteralNode(typeNode);
    typeInfo.isFunctionType = ts.isFunctionTypeNode(typeNode);

    if (ts.isTypeReferenceNode(typeNode) && typeNode.typeArguments) {
      typeInfo.typeArguments = typeNode.typeArguments.map((p) =>
        getTypeWithNullableInfo(context, p, allowUnion, false)
      );

      // cut off generics on name
      const genericsStart = typeInfo.ownTypeAsString.indexOf("<");
      if (genericsStart >= 0) {
        typeInfo.ownTypeAsString = typeInfo.ownTypeAsString
          .substring(0, genericsStart)
          .trim();
      }
    }

    if (isEnumType(type)) {
      typeInfo.isEnumType = true;
    } else if (isPrimitiveType(type)) {
      typeInfo.isPrimitiveType = true;
    } else if (context.checker.isArrayType(type)) {
      typeInfo.isArray = true;

      if (typeInfo.typeArguments) {
        typeInfo.arrayItemType = typeInfo.typeArguments[0];
      } else if (ts.isArrayTypeNode(typeNode)) {
        typeInfo.arrayItemType = getTypeWithNullableInfo(
          context,
          typeNode.elementType,
          allowUnion,
          false
        );
      }
    } else if (typeInfo.symbol) {
      switch (typeInfo.symbol.name) {
        case "Uint8Array":
        case "Uint16Array":
        case "Uint32Array":
        case "Int8Array":
        case "Int16Array":
        case "Int32Array":
        case "Float32Array":
        case "Float64Array":
          typeInfo.isTypedArray = true;
          typeInfo.arrayItemType = {
            fullString: "number",
            isArray: false,
            isEnumType: false,
            isNullable: false,
            isOptional: false,
            isOwnType: false,
            isPrimitiveType: false,
            isTypedArray: true,
            isUnionType: false,
            ownTypeAsString: "number",
            symbol: context.checker.getNumberType().getSymbol(),
            isTypeLiteral: false,
            isFunctionType: false,
          };
          break;
      }
    }
  };

  if (ts.isUnionTypeNode(node)) {
    for (const t of node.types) {
      if (t.kind === ts.SyntaxKind.NullKeyword) {
        typeInfo.isNullable = true;
      } else if (
        ts.isLiteralTypeNode(t) &&
        t.literal.kind === ts.SyntaxKind.NullKeyword
      ) {
        typeInfo.isNullable = true;
      } else if (t.kind === ts.SyntaxKind.UndefinedKeyword) {
        typeInfo.isOptional = true;
      } else if (
        ts.isLiteralTypeNode(t) &&
        t.literal.kind === ts.SyntaxKind.UndefinedKeyword
      ) {
        typeInfo.isOptional = true;
      } else if (!mainTypeNode) {
        mainTypeNode = t;
      } else if (allowUnion) {
        if (!typeInfo.unionTypes) {
          typeInfo.unionTypes = [
            getTypeWithNullableInfo(context, mainTypeNode!, false, false),
          ];
        }

        typeInfo.isUnionType = true;

        (typeInfo.unionTypes as TypeWithNullableInfo[]).push(
          getTypeWithNullableInfo(context, t, false, false)
        );
      } else {
        throw new Error(
          "Multi union types on not supported at this location: " +
            node.getSourceFile().fileName +
            ":" +
            node.getText()
        );
      }
    }

    if (!typeInfo.unionTypes && mainTypeNode) {
      fillBaseInfoFrom(mainTypeNode);
    }
  } else if (ts.isExpressionWithTypeArguments(node)) {
    const type = context.checker.getTypeAtLocation(node);
    typeInfo.symbol = type.getSymbol();
    typeInfo.ownTypeAsString = node.expression.getText();
    const modulePath = findModule(type);
    typeInfo.isOwnType =
      !!modulePath && path.basename(modulePath) === path.basename(context.dts);

    if (node.typeArguments) {
      typeInfo.typeArguments = node.typeArguments.map((p) =>
        getTypeWithNullableInfo(context, p, allowUnion, false)
      );

      // cut off generics on name
      const genericsStart = typeInfo.ownTypeAsString.indexOf("<");
      if (genericsStart >= 0) {
        typeInfo.ownTypeAsString = typeInfo.ownTypeAsString
          .substring(0, genericsStart)
          .trim();
      }
    }
  } else {
    fillBaseInfoFrom(node);
  }

  return typeInfo;
}

function isEnumType(type: ts.Type) {
  // if for some reason this returns true...
  if (hasFlag(type, ts.TypeFlags.Enum)) return true;
  // it's not an enum type if it's an enum literal type
  if (hasFlag(type, ts.TypeFlags.EnumLiteral)) return true;
  // get the symbol and check if its value declaration is an enum declaration
  const symbol = type.getSymbol();
  if (!symbol) return false;
  const { valueDeclaration } = symbol;

  return (
    valueDeclaration && valueDeclaration.kind === ts.SyntaxKind.EnumDeclaration
  );
}

function hasFlag(type: ts.Type, flag: ts.TypeFlags): boolean {
  return (type.flags & flag) === flag;
}

function isPrimitiveType(type: ts.Type | null) {
  if (!type) {
    return false;
  }

  if (hasFlag(type, ts.TypeFlags.Number)) {
    return true;
  }
  if (hasFlag(type, ts.TypeFlags.String)) {
    return true;
  }
  if (hasFlag(type, ts.TypeFlags.Boolean)) {
    return true;
  }
  if (hasFlag(type, ts.TypeFlags.BigInt)) {
    return true;
  }
  if (hasFlag(type, ts.TypeFlags.Unknown)) {
    return true;
  }

  return false;
}

function isNumberType(type: ts.Type | null) {
  if (!type) {
    return false;
  }

  if (hasFlag(type, ts.TypeFlags.Number)) {
    return true;
  }

  return false;
}

export function valueOrFirstDeclarationInDts(
  context: GenerateContext,
  s: ts.Symbol,
  errorNode: ts.Node
): ts.Declaration;
export function valueOrFirstDeclarationInDts(
  context: GenerateContext,
  s: ts.Symbol
): ts.Declaration | undefined;
export function valueOrFirstDeclarationInDts(
  context: GenerateContext,
  s: ts.Symbol | undefined,
  errorNode?: ts.Node
) {
  if (!s) {
    return undefined;
  }

  if (s.valueDeclaration) {
    return s.valueDeclaration;
  }

  const d = s.declarations?.find(
    (d) =>
      path.basename(d.getSourceFile().fileName) == path.basename(context.dts)
  );
  if (d) {
    return d;
  }

  if (errorNode) {
    throw new Error(
      "Could not resolve declarataion of symbol " +
        s.name +
        " at " +
        errorNode.getSourceFile().fileName +
        ":" +
        errorNode.getSourceFile().getLineAndCharacterOfPosition(errorNode.pos)
    );
  }

  return undefined;
}
