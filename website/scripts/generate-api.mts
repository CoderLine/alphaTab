import path from "path";
import fs from "fs";
import { GenerateContext, repositoryRoot } from "./typeschema.mjs";
import {
  collectMembers,
  getCategory,
  getJsDocTagText,
  getSummary,
  isEvent,
  isTargetWeb,
  ReferencePage,
  ReferenceTableData,
  writeCommonImports,
  writeEventDetails,
  writeMethodDetails,
  writePropertyDetails,
  writeReferenceTable,
} from "./generate-common.mjs";
import ts from "typescript";
import { FileStream, openFileStream } from "./util.mjs";

export async function generateApiDocs(context: GenerateContext) {
  const basePath = path.join(repositoryRoot, "docs", "reference", "api");
  await fs.promises.mkdir(basePath, { recursive: true });

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
  collectMembers(context, members, context.flatExports.get(
    "alphaTab.AlphaTabApiBase"
  ) as ts.ClassDeclaration, false);
  collectMembers(context, members, context.flatExports.get(
    "alphaTab.AlphaTabApi"
  ) as ts.ClassDeclaration, false);

  const categories = new ReferenceTableData();


  for (const m of Array.from(members.values())) {
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

  await writeProperties(context, basePath, properties, categories);
  await writeMethods(context, basePath, methods, categories);
  await writeEvents(context, basePath, events, categories);

  await writeReferenceTable(
    path.join(repositoryRoot,
      "docs",
      "reference",
      "_apiTable.mdx"
    ),
    'Name',
    categories
  )
}

async function writeProperties(
  context: GenerateContext,
  basePath: string,
  properties: (
    | ts.PropertyDeclaration
    | ts.PropertySignature
    | ts.GetAccessorDeclaration
  )[],
  referenceTable: ReferenceTableData
) {
  for (const member of properties) {
    await writePropertyPage(context, basePath, member, referenceTable);
  }
}

async function writeMethods(
  context: GenerateContext,
  basePath: string,
  methods: (ts.MethodDeclaration | ts.MethodSignature)[],
  referenceTable: ReferenceTableData
) {
  for (const member of methods) {
    await writeMethodPage(context, basePath, member, referenceTable);
  }
}

async function writeEvents(
  context: GenerateContext,
  basePath: string,
  events: (
    | ts.PropertyDeclaration
    | ts.PropertySignature
    | ts.GetAccessorDeclaration
  )[],
  referenceTable: ReferenceTableData
) {
  for (const member of events) {
    await writeEventPage(context, basePath, member, referenceTable);
  }
}

async function writeFrontMatter(
  context: GenerateContext,
  fileStream: FileStream,
  memberName: string,
  member: ts.ClassElement | ts.TypeElement,
  kind: string,
  referenceTable: ReferenceTableData,
  additionalDependencies: string[] = []
) {
  const page: ReferencePage = {
    title: memberName,
    description: getSummary(context, member, false),
    javaScriptOnly: isTargetWeb(context, member),
    url: '/' + path.relative(
      repositoryRoot,
      fileStream.path
    ).replaceAll('\\', '/').replaceAll('.mdx', '')
  };
  const category = getCategory(context, member, " - Core");
  referenceTable.addPage(category, page);

  await fileStream.write("---\n");
  await fileStream.write(`title: ${page.title}\n`);
  await fileStream.write(`sidebar_custom_props:\n`);
  await fileStream.write(`  kind: ${kind}\n`);

  if (page.javaScriptOnly) {
    await fileStream.write(`  javaScriptOnly: true\n`);
  }

  await fileStream.write(
    `  category: ${category}\n`
  );

  const since = getJsDocTagText(context, member, "since");
  if (since) {
    await fileStream.write(`  since: ${since}\n`);
  }

  await fileStream.write("---\n");

  fileStream.suspend = context.emptyFiles;

  await writeCommonImports(fileStream, additionalDependencies);

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
    | ts.GetAccessorDeclaration,
  referenceTable: ReferenceTableData
) {
  let memberName = member.name!.getText();
  let fileName = memberName.toLowerCase();
  if (memberName === "index") {
    fileName = "index_";
  }

  const filePath = path.join(basePath, fileName + ".mdx");

  await using fileStream = await openFileStream(filePath);

  await writeFrontMatter(context, fileStream, memberName, member, "property",
    referenceTable,
    ['PropertyDescription']
  );

  await fileStream.write("<PropertyDescription />\n");

  await writePropertyDetails(context, fileStream, member);
}

async function writeEventPage(
  context: GenerateContext,
  basePath: string,
  member:
    | ts.PropertyDeclaration
    | ts.PropertySignature
    | ts.GetAccessorDeclaration,
  referenceTable: ReferenceTableData
) {
  const memberName = member.name!.getText();
  const filePath = path.join(basePath, memberName.toLocaleLowerCase() + ".mdx");

  await using fileStream = await openFileStream(filePath);

  await writeFrontMatter(context, fileStream, memberName, member, "event", referenceTable);
  await writeEventDetails(context, fileStream, member);
}

async function writeMethodPage(
  context: GenerateContext,
  basePath: string,
  member: ts.MethodDeclaration | ts.MethodSignature,
  referenceTable: ReferenceTableData
) {
  const memberName = member.name!.getText();
  const filePath = path.join(basePath, memberName.toLocaleLowerCase() + ".mdx");

  await using fileStream = await openFileStream(filePath);

  await writeFrontMatter(context, fileStream, memberName, member, "method", referenceTable);

  await writeMethodDetails(context, fileStream, member);
}
