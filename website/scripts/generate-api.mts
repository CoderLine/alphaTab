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
  writeCommonImports,
  writeEventDetails,
  writeMethodDetails,
  writePropertyDetails,
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

  await writeProperties(context, basePath, properties);
  await writeMethods(context, basePath, methods);
  await writeEvents(context, basePath, events);
}

async function writeProperties(
  context: GenerateContext,
  basePath: string,
  properties: (
    | ts.PropertyDeclaration
    | ts.PropertySignature
    | ts.GetAccessorDeclaration
  )[]
) {
  for (const member of properties) {
    await writePropertyPage(context, basePath, member);
  }
}

async function writeMethods(
  context: GenerateContext,
  basePath: string,
  methods: (ts.MethodDeclaration | ts.MethodSignature)[]
) {
  for (const member of methods) {
    await writeMethodPage(context, basePath, member);
  }
}

async function writeEvents(
  context: GenerateContext,
  basePath: string,
  events: (
    | ts.PropertyDeclaration
    | ts.PropertySignature
    | ts.GetAccessorDeclaration
  )[]
) {
  for (const member of events) {
    await writeEventPage(context, basePath, member);
  }
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
  await fileStream.write(
    `description: ${JSON.stringify(getSummary(context, member, false))}\n`
  );
  await fileStream.write(`sidebar_custom_props:\n`);
  await fileStream.write(`  kind: ${kind}\n`);

  const isWebOnly = isTargetWeb(context, member);
  if (isWebOnly) {
    await fileStream.write(`  javaScriptOnly: true\n`);
  }

  await fileStream.write(
    `  category: ${getCategory(context, member, " - Core")}\n`
  );

  const since = getJsDocTagText(context, member, "since");
  if (since) {
    await fileStream.write(`  since: ${since}\n`);
  }

  await fileStream.write("---\n");

  if(context.emptyFiles) {
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

  await fileStream.write(
    "import { PropertyDescription } from '@site/src/components/PropertyDescription';\n\n"
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
