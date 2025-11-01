import path from "path";
import fs from "fs";
import {
  GenerateContext,
  getTypeWithNullableInfo,
  repositoryRoot,
} from "./typeschema.mjs";
import {
  collectMembers,
  getFullDescription,
  getJsDocTagText,
  getSummary,
  isEvent,
  writeCommonImports,
  writeEventDetails,
  writeMethodDetails,
  writePropertyDetails,
  TypeReferencedCodeBuilder,
} from "./generate-common.mjs";
import ts from "typescript";
import { FileStream, openFileStream } from "./util.mjs";

export async function generateTypeDocs(context: GenerateContext) {
  for (const [exportedName, exportedType] of context.flatExports) {
    const parts = exportedName.split(".");
    if (parts[0] === "alphaTab") {
      parts.shift();
    }

    const basePath = path.join(
      repositoryRoot,
      "docs",
      "reference",
      "types",
      ...parts.map((p) => p.toLowerCase())
    );

    const filePath = path.join(basePath, "index.mdx");

    await fs.promises.mkdir(basePath, { recursive: true });

    await using fileStream = await openFileStream(filePath);
    await fileStream.write("---\n");
    await fileStream.write(`sidebar_label: ${exportedType.name!.getText()}\n`);
    await fileStream.write(`title: ${exportedName}\n`);
    await fileStream.write("---\n");

    if(context.emptyFiles){
      fileStream.suspend = true;
    }

    await writeCommonImports(fileStream);

    await fileStream.write(
      `\n<DynHeading as="h3" inlined={props.inlined}>Description</DynHeading>\n\n`
    );
    await fileStream.write(`${getFullDescription(context, exportedType)}\n\n`);

    if (
      ts.isClassDeclaration(exportedType) ||
      ts.isInterfaceDeclaration(exportedType) ||
      ts.isTypeAliasDeclaration(exportedType)
    ) {
      let definition = new TypeReferencedCodeBuilder(context);
      if (exportedType.modifiers) {
        for (const m of exportedType.modifiers) {
          switch (m.kind) {
            case ts.SyntaxKind.AbstractKeyword:
              definition.whitespace(" ");
              definition.keyword("abstract");
              break;
          }
        }
      }

      definition.whitespace(" ");
      if (ts.isClassDeclaration(exportedType)) {
        definition.keyword("class");
      } else if (ts.isInterfaceDeclaration(exportedType)) {
        definition.keyword("interface");
      } else if (ts.isTypeAliasDeclaration(exportedType)) {
        definition.keyword("type");
      }
      definition.whitespace(" ");
      definition.identifier(exportedType.name!.getText());

      if (
        exportedType.typeParameters &&
        exportedType.typeParameters.length > 0
      ) {
        definition.token("<");

        for (let i = 0; i < exportedType.typeParameters.length; i++) {
          if (i > 0) {
            definition.token(",");
            definition.whitespace(" ");
          }

          definition.identifier(exportedType.typeParameters[i].name.getText());
        }

        definition.token(">");
      }

      if (ts.isTypeAliasDeclaration(exportedType)) {
        definition.whitespace(" ");
        definition.token("=");
        definition.whitespace(" ");
        definition.type(
          getTypeWithNullableInfo(context, exportedType.type, true, false)
        );
      } else if (exportedType.heritageClauses) {
        for (const clause of exportedType.heritageClauses) {
          switch (clause.token) {
            case ts.SyntaxKind.ExtendsKeyword:
              definition.whitespace(" ");
              definition.keyword("extends");
              break;
            case ts.SyntaxKind.ImplementsKeyword:
              definition.whitespace(" ");
              definition.keyword("implements");
              break;
          }

          definition.whitespace(" ");

          for (const type of clause.types) {
            definition.type(
              getTypeWithNullableInfo(context, type, true, false)
            );
          }
        }
      }

      await fileStream.writeLine(definition.toMdx("js", 'block'));

      const properties: (
        | ts.PropertyDeclaration
        | ts.PropertySignature
        | ts.GetAccessorDeclaration
      )[] = [];

      const events: (
        | ts.PropertyDeclaration
        | ts.PropertySignature
        | ts.GetAccessorDeclaration
      )[] = [];

      const methods: (ts.MethodDeclaration | ts.MethodSignature)[] = [];

      const members: Map<string, ts.ClassElement | ts.TypeElement> = new Map();
      if (!ts.isTypeAliasDeclaration(exportedType)) {
        collectMembers(context, members, exportedType);

        const sortedMembers = Array.from(members.values()).sort((a, b) => {
          return a.name!.getText().localeCompare(b.name!.getText());
        });

        for (const m of sortedMembers) {
          if (isEvent(context, m)) {
            events.push(m as (typeof events)[0]);
          } else if (
            ts.isPropertyDeclaration(m) ||
            ts.isPropertySignature(m) ||
            ts.isGetAccessorDeclaration(m)
          ) {
            properties.push(m);
          } else if (ts.isMethodDeclaration(m) || ts.isMethodSignature(m)) {
            methods.push(m);
          }
        }

        await writeProperties(
          context,
          fileStream,
          basePath,
          exportedType,
          properties
        );
        await writeMethods(
          context,
          fileStream,
          basePath,
          exportedType,
          methods
        );
        await writeEvents(context, fileStream, basePath, exportedType, events);
      }
    } else if (ts.isEnumDeclaration(exportedType)) {
      await writeEnumMembers(context, fileStream, exportedType);
    }
  }
}

async function writeProperties(
  context: GenerateContext,
  fileStream: FileStream,
  basePath: string,
  parent: ts.ClassDeclaration | ts.InterfaceDeclaration,
  properties: (
    | ts.PropertyDeclaration
    | ts.PropertySignature
    | ts.GetAccessorDeclaration
  )[]
) {
  if (properties.length === 0) {
    return;
  }

  await fileStream.write(
    `\n<DynHeading as="h3" inlined={props.inlined}>Properties</DynHeading>\n\n`
  );

  await fileStream.write(
    `<table className="table table-striped table-condensed type-table">\n`
  );
  await fileStream.write(`  <tbody>\n`);

  for (const member of properties) {
    await fileStream.write(`    <tr>\n`);

    const referenceBuilder = new TypeReferencedCodeBuilder(context);
    referenceBuilder.declaration(member);
    await fileStream.write(
      `      <td>${referenceBuilder.toMdx("js", "inline")}</td>\n`
    );

    referenceBuilder.reset();
    referenceBuilder.type(
      getTypeWithNullableInfo(
        context,
        member.type,
        true,
        !!member.questionToken
      )
    );

    await fileStream.writeLine(
      `      {props.detailed && (<td>${referenceBuilder.toMdx("js", "inline")}</td>)}`
    );

    let defaultValue = getJsDocTagText(context, member, "defaultValue");
    if (!defaultValue) {
      defaultValue = "(no default)";
    }
    await fileStream.writeLine(
      `      {props.detailed && <td><code>{${JSON.stringify(defaultValue)}}</code></td>}`
    );

    let description =
      getSummary(context, member, true, true) +
      getInheritenceInfo(context, parent, member);

    await fileStream.write(`      <td>\n`);
    await fileStream.write(
      `${description
        .split("\n")
        .map((l) => `        ${l}`)
        .join("\n")}\n`
    );
    await fileStream.write(`      </td>\n`);

    await fileStream.write(`    </tr>\n`);

    await writePropertyPage(context, basePath, member);
  }
  await fileStream.write(`  </tbody>\n`);
  await fileStream.write(`</table>\n`);
}

async function writeMethods(
  context: GenerateContext,
  fileStream: FileStream,
  basePath: string,
  parent: ts.ClassDeclaration | ts.InterfaceDeclaration,
  methods: (ts.MethodDeclaration | ts.MethodSignature)[]
) {
  if (methods.length === 0) {
    return;
  }

  await fileStream.write(
    `\n<DynHeading as="h3" inlined={props.inlined}>Methods</DynHeading>\n\n`
  );

  await fileStream.write(
    `<table className="table table-striped table-condensed type-table">\n`
  );
  await fileStream.write(`  <tbody>\n`);

  for (const member of methods) {
    await fileStream.write(`    <tr>\n`);

    const parameters = member.parameters
      .map((p) => p.type!.getText())
      .join(", ");
    await fileStream.write(
      `      <td>[\`${member.name.getText()}(${parameters})\`](./${member.name
        .getText()
        .toLowerCase()}.mdx)</td>\n`
    );

    let description =
      getSummary(context, member, true, true) +
      getInheritenceInfo(context, parent, member);
    await fileStream.write(`      <td>\n`);
    await fileStream.write(
      `${description
        .split("\n")
        .map((l) => `        ${l}`)
        .join("\n")}\n`
    );
    await fileStream.write(`      </td>\n`);

    await fileStream.write(`    </tr>\n`);

    await writeMethodPage(context, basePath, member);
  }
  await fileStream.write(`  </tbody>\n`);
  await fileStream.write(`</table>\n`);
}

async function writeEvents(
  context: GenerateContext,
  fileStream: FileStream,
  basePath: string,
  parent: ts.ClassDeclaration | ts.InterfaceDeclaration,
  events: (
    | ts.PropertyDeclaration
    | ts.PropertySignature
    | ts.GetAccessorDeclaration
  )[]
) {
  if (events.length === 0) {
    return;
  }

  await fileStream.write(
    `\n<DynHeading as="h3" inlined={props.inlined}>Events</DynHeading>\n\n`
  );

  await fileStream.write(
    `<table className="table table-striped table-condensed type-table">\n`
  );
  await fileStream.write(`  <tbody>\n`);

  for (const member of events) {
    await fileStream.write(`    <tr>\n`);

    await fileStream.write(
      `      <td>[\`${member.name.getText()}\`](./${member.name
        .getText()
        .toLowerCase()}.mdx)</td>\n`
    );

    let description =
      getSummary(context, member, true, true) +
      getInheritenceInfo(context, parent, member);
    await fileStream.write(`      <td>\n`);
    await fileStream.write(
      `${description
        .split("\n")
        .map((l) => `        ${l}`)
        .join("\n")}\n`
    );
    await fileStream.write(`      </td>\n`);

    await fileStream.write(`    </tr>\n`);

    await writeEventPage(context, basePath, member);
  }
  await fileStream.write(`  </tbody>\n`);
  await fileStream.write(`</table>\n`);
}

async function writeEnumMembers(
  context: GenerateContext,
  fileStream: FileStream,
  exportedType: ts.EnumDeclaration
) {
  await fileStream.write(
    `\n<DynHeading as="h3" inlined={props.inlined}>Enum Members</DynHeading>\n\n`
  );

  await fileStream.write(
    `<table className="table table-striped table-condensed type-table">\n`
  );
  await fileStream.write(
    `  <thead><tr><th>Name</th><th>Numeric Value</th><th>Description</th></tr></thead>\n`
  );
  await fileStream.write(`  <tbody>\n`);

  for (const member of exportedType.members) {
    await fileStream.write(`    <tr>\n`);

    await fileStream.write(
      `      <td id="${member.name.getText().toLowerCase()}">\`${member.name.getText()}\`</td>\n`
    );

    const numericValue = context.checker.getConstantValue(member);
    await fileStream.write(`      <td>\`${numericValue}\`</td>\n`);

    let description = getFullDescription(context, member);
    const since = getJsDocTagText(context, member, "since");
    if (since) {
      description = `${description}\n        <SinceBadge inline={true} since="${since}" />`;
    }

    await fileStream.write(`      <td>\n`);
    await fileStream.write(
      `${description
        .split("\n")
        .map((l) => `        ${l}`)
        .join("\n")}\n`
    );
    await fileStream.write(`      </td>\n`);

    await fileStream.write(`    </tr>\n`);
  }
  await fileStream.write(`  </tbody>\n`);
  await fileStream.write(`</table>\n`);
}

async function writeFrontMatter(
  context: GenerateContext,
  fileStream: FileStream,
  memberName: string,
  member: ts.ClassElement | ts.TypeElement,
  kind: string
) {
  await fileStream.write("---\n");
  await fileStream.write(`title: ${memberName}\n`);
  await fileStream.write(`sidebar_custom_props:\n`);
  await fileStream.write(`  kind: ${kind}\n`);

  const since = getJsDocTagText(context, member, "since");
  if (since) {
    await fileStream.write(`  since: ${since}\n`);
  }

  await fileStream.write("---\n");

  if(context.emptyFiles){
    return;
  }

  await writeCommonImports(fileStream);

  if (since) {
    await fileStream.write(`<SinceBadge since=${JSON.stringify(since)} />\n`);
  }
}

async function writePropertyPage(
  context: GenerateContext,
  basePath: string,
  member:
    | ts.PropertyDeclaration
    | ts.PropertySignature
    | ts.GetAccessorDeclaration
) {
  let memberName = member.name!.getText();
  let fileName = memberName.toLowerCase();
  if (memberName === "index") {
    fileName = "index_";
  }

  const filePath = path.join(basePath, fileName + ".mdx");

  await using fileStream = await openFileStream(filePath);

  await writeFrontMatter(context, fileStream, memberName, member, "property");
  if(context.emptyFiles){
      return;
  }

  await writePropertyDetails(context, fileStream, member);
}

async function writeEventPage(
  context: GenerateContext,
  basePath: string,
  member:
    | ts.PropertyDeclaration
    | ts.PropertySignature
    | ts.GetAccessorDeclaration
) {
  const memberName = member.name!.getText();
  const filePath = path.join(basePath, memberName.toLocaleLowerCase() + ".mdx");

  await using fileStream = await openFileStream(filePath);

  await writeFrontMatter(context, fileStream, memberName, member, "event");
  if(context.emptyFiles){
      return;
  }

  await writeEventDetails(context, fileStream, member);
}

async function writeMethodPage(
  context: GenerateContext,
  basePath: string,
  member: ts.MethodDeclaration | ts.MethodSignature
) {
  const memberName = member.name!.getText();
  const filePath = path.join(basePath, memberName.toLocaleLowerCase() + ".mdx");

  await using fileStream = await openFileStream(filePath);

  await writeFrontMatter(context, fileStream, memberName, member, "method");
  if(context.emptyFiles){
      return;
  }

  await writeMethodDetails(context, fileStream, member);
}

function getInheritenceInfo(
  context: GenerateContext,
  parent: ts.ClassDeclaration | ts.InterfaceDeclaration,
  member: ts.ClassElement | ts.TypeElement
) {
  let info = "";
  // inheritence info
  if (member.parent !== parent) {
    info += " (Inherited from ";
    const builder = new TypeReferencedCodeBuilder(context);
    builder.declaration(
      member.parent as ts.ClassDeclaration | ts.InterfaceDeclaration
    );

    let name = (member.parent as ts.NamedDeclaration).name!.getText();
    if (context.nameToExportName.has(name)) {
      name = context.nameToExportName.get(name)!;
    }

    info += builder.toMdx("js", "inline");

    info += ")";
  }
  return info;
}
