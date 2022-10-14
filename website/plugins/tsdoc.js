const fs = require("fs/promises");
const ts = require("typescript");
const path = require("path");

/**
 *
 * @param {string} name
 * @param {ts.Symbol} symbol
 * @param {ts.Declaration} declaration
 * @param {ts.TypeChecker} checker
 * @param {string} outputDir
 */
async function handleDeclaration(
  name,
  symbol,
  declaration,
  checker,
  outputDir
) {
  if (ts.isClassDeclaration(declaration)) {
    console.log(`Found class: ${name} (${outputDir})`);
  } else if (ts.isInterfaceDeclaration(declaration)) {
    console.log(`Found interface: ${name} (${outputDir})`);
  } else if (ts.isEnumDeclaration(declaration)) {
    console.log(`Found enum: ${name} (${outputDir})`);
  } else if (ts.isTypeAliasDeclaration(declaration)) {
    let typeAlias = checker.getSymbolAtLocation(declaration.name);
    if(typeAlias.valueDeclaration) {
        await handleDeclaration(declaration.type.name.text, typeAlias, typeAlias.valueDeclaration, checker, outputDir);   
    }
  } else {
    console.log(
      `Found unknown: ${name} (${outputDir}) - ${
        ts.SyntaxKind[declaration.kind]
      }`
    );
  }
}

/**
 * @param {string} name
 * @param {ts.Symbol} symbol
 * @param {ts.TypeChecker} checker
 * @param {string} outputDir
 */
async function handleExport(name, symbol, checker, outputDir) {
  if ((symbol.flags & ts.SymbolFlags.Alias) !== 0) {
    symbol = checker.getAliasedSymbol(symbol);
  }

  if ((symbol.flags & ts.SymbolFlags.ValueModule) !== 0) {
    console.log(`Found module: ${name} (${outputDir})`);
    for (const [name, subSymbol] of symbol.exports) {
      const subDir = path.join(outputDir, name);
      await handleExport(name, subSymbol, checker, subDir);
    }
  } else {
    const declaration = symbol.declarations.at(0);
    await handleDeclaration(name, symbol, declaration, checker, outputDir);
  }
}

/**
 * @param {ts.Statement} stmt
 * @param {ts.TypeChecker} checker
 * @param {string} outputDir
 */
async function handleStatement(stmt, checker, outputDir) {
  if (ts.isExportDeclaration(stmt)) {
    if (ts.isNamedExports(stmt.exportClause)) {
      for (const exportSpecifier of stmt.exportClause.elements) {
        await handleExport(exportSpecifier, checker, outputDir);
      }
    }
  }
}

module.exports = async function tsdocPlugin(context, options) {
  return {
    name: "tsdoc",
    async loadContent() {
      const outputDir = options.out;
      await fs.rm(outputDir, { recursive: true, force: true });

      const input = options.in;

      const program = ts.createProgram([input], {});
      const checker = program.getTypeChecker();
      const sourceFile = program.getSourceFile(input);

      const sourceFileSymbol = checker.getSymbolAtLocation(sourceFile);
      for (const [name, symbol] of sourceFileSymbol.exports) {
        handleExport(name, symbol, checker, outputDir);
      }
    },
  };
};
