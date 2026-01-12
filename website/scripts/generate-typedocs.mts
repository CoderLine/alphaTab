import fs from "fs";
import path from "path";
import ts from "typescript";
import {
  collectMembers,
  getFullDescription,
  getJsDocTagText,
  isEvent,
  TypeReferencedCodeBuilder,
  writeCommonImports,
  writeEventDetails,
  writeMethodDetails,
  writePropertyDetails
} from "./generate-common.mjs";
import {
  GenerateContext,
  getTypeWithNullableInfo,
  repositoryRoot,
} from "./typeschema.mjs";
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

    fileStream.suspend = context.emptyFiles;
    await writeCommonImports(fileStream);

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
          exportedType,
          properties
        );
        await writeMethods(
          context,
          fileStream,
          exportedType,
          methods
        );
        await writeEvents(context, fileStream, exportedType, events);
      }
    } else if (ts.isEnumDeclaration(exportedType)) {
      await writeEnumMembers(context, fileStream, exportedType);
    }
  }
}

async function writeProperties(
  context: GenerateContext,
  fileStream: FileStream,
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
    `\n## Properties\n\n`
  );

  for (const member of properties) {
    const referenceBuilder = new TypeReferencedCodeBuilder(context);
    referenceBuilder.links = false;
    referenceBuilder.declaration(member);

    await fileStream.write(
      `\n### ${referenceBuilder.toMdx("js", "inline")}\n\n`
    );

    await writePropertyDetails(context, fileStream, parent, member, true);
  }
}

async function writeMethods(
  context: GenerateContext,
  fileStream: FileStream,
  parent: ts.ClassDeclaration | ts.InterfaceDeclaration,
  methods: (ts.MethodDeclaration | ts.MethodSignature)[]
) {
  if (methods.length === 0) {
    return;
  }

  await fileStream.write(
    `\n## Methods \n\n`
  );

  for (const member of methods) {

    const referenceBuilder = new TypeReferencedCodeBuilder(context);
    referenceBuilder.declaration(member);

    await fileStream.write(
      `\n### ${referenceBuilder.toMdx("js", "inline")}\n\n`
    );

    await writeMethodDetails(context, fileStream, parent, member, true);
  }
}

async function writeEvents(
  context: GenerateContext,
  fileStream: FileStream,
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
    `\n## Events\n\n`
  );

  for (const member of events) {

    const referenceBuilder = new TypeReferencedCodeBuilder(context);
    referenceBuilder.declaration(member);

    await fileStream.write(
      `\n### ${referenceBuilder.toMdx("js", "inline")}\n\n`
    );
    await fileStream.write(`${getFullDescription(context, member)}\n\n`);

    await writeEventDetails(context, fileStream, parent, member, true);
  }
}

async function writeEnumMembers(
  context: GenerateContext,
  fileStream: FileStream,
  exportedType: ts.EnumDeclaration
) {
  await fileStream.write(
    `\n### Enum Members\n\n`
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

  fileStream.suspend = context.emptyFiles;
  await writeCommonImports(fileStream);

  if (since) {
    await fileStream.write(`<SinceBadge since=${JSON.stringify(since)} />\n`);
  }
}
