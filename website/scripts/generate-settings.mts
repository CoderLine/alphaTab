import path from "path";
import fs from "fs";
import ts from "typescript";
import {
  disableWarningsOnMissingDocs,
  enableWarningsOnMissingDocs,
  getCategory,
  getJsDocTagText,
  getSummary,
  isJsonOnParent,
  isTargetWeb,
  ReferencePage,
  ReferenceTableData,
  repositoryRoot,
  writeCommonImports,
  writePropertyDetails,
  writeReferenceTable,
} from "./generate-common.mjs";
import { GenerateContext } from "./typeschema.mjs";
import { openFileStream } from "./util.mjs";

export async function generateSettings(context: GenerateContext) {
  enableWarningsOnMissingDocs();
  try {
    const allProps = context.settings.members.filter((m) => {
      const isStatic =
        ts.canHaveModifiers(m) &&
        m.modifiers?.some((mod) => mod.kind == ts.SyntaxKind.StaticKeyword);

      return ts.isPropertyDeclaration(m) && !isStatic;
    }) as ts.PropertyDeclaration[];


    const categories = new ReferenceTableData();
    for (const m of allProps) {
      const basePathRelative = path.join(
        "docs",
        "reference",
        "settings",
        m.name.getText().toLowerCase()
      );

      const basePath = path.join(
        repositoryRoot,
        basePathRelative
      );

      const subSettingType =
        context.checker.getTypeAtLocation(m).symbol.valueDeclaration;
      if (subSettingType && ts.isClassDeclaration(subSettingType)) {
        for (const member of subSettingType.members) {
          const isSubSettingPropStatic =
            ts.canHaveModifiers(member) &&
            member.modifiers?.some(
              (mod) => mod.kind == ts.SyntaxKind.StaticKeyword
            );

          if (ts.isPropertyDeclaration(member) && !isSubSettingPropStatic) {
            const settingFileName = member.name.getText().toLowerCase() + ".mdx";
            const settingFile = path.join(
              basePath,
              settingFileName
            );

            await fs.promises.mkdir(basePath, { recursive: true });

            await using fileStream = await openFileStream(settingFile);
            await fileStream.write("---\n");

            const page: ReferencePage = {
              title: `${m.name.getText()}.${member.name.getText()}`,
              description: getSummary(context, member, false),
              javaScriptOnly: isTargetWeb(context, member),
              url: '/' + path.join(basePathRelative, settingFileName).replaceAll('\\', '/').replaceAll('.mdx', '')
            };

            const category = getCategory(context, member, "");
            categories.addPage(category, page);

            await fileStream.write(
              `title: ${page.title}\n`
            );

            await fileStream.write(`sidebar_label: ${member.name.getText()}\n`);
            await fileStream.write(`sidebar_custom_props:\n`);

            if (page.javaScriptOnly) {
              await fileStream.write(`  javaScriptOnly: true\n`);
            }

            if (isJsonOnParent(context, m)) {
              await fileStream.write(`  jsOnParent: true\n`);
            }

            await fileStream.write(
              `  category: ${category}\n`
            );

            const since = getJsDocTagText(context, member, "since");
            await fileStream.write(`  since: ${since}\n`);

            await fileStream.write("---\n");

            fileStream.suspend = context.emptyFiles;
            await writeCommonImports(fileStream, ['PropertyDescription']);

            if (since) {
              await fileStream.write(`<SinceBadge since=${JSON.stringify(since)} />\n`);
            }

            await fileStream.write(`<PropertyDescription showJson={true} />\n`);

            await writePropertyDetails(context, fileStream, subSettingType, member);
          }
        }
      }
    }

    await writeReferenceTable(path.join(
      repositoryRoot,
      "docs",
      "reference",
      "_settingsTable.mdx"
    ), 'Property', categories);

  } finally {
    disableWarningsOnMissingDocs();
  }
}
