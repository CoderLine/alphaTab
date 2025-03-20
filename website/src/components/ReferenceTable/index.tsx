import React, { useEffect, useState } from "react";
import { Page } from "@site/src/page";
import { buildNames } from "@site/src/names";
import { CodeBadge } from "../CodeBadge";
import {
  PropSidebarItem,
  PropSidebarItemCategory,
} from "@docusaurus/plugin-content-docs";
import { useDocById } from "@docusaurus/plugin-content-docs/client";

function buildPropertyUrl(property: Page) {
  let url = "";
  if (property.prop("todo", false)) {
    url = "#todo";
  } else {
    url = property.prop("link", "");
  }
  return url;
}

type ReferenceRowProps = { property: Page; showJson: boolean };

const ReferenceRow: React.FC<ReferenceRowProps> = ({ property, showJson }) => {
  const { mainName, javaScriptOnly } =
    buildNames(property);
    
  return (
    <tr>
      <td>
        <a href={buildPropertyUrl(property)}>
          <CodeBadge name={mainName} type={javaScriptOnly ? 'js' : 'all' }  />
        </a>
      </td>
      <td>{property.prop("description", "")}</td>
    </tr>
  );
};

type ReferenceCategoryProps = {
  name: string;
  pages: Page[];
  showJson: boolean;
};

const ReferenceCategory: React.FC<ReferenceCategoryProps> = ({
  name,
  pages,
  showJson,
}) => {
  const rows = pages
    .sort((a, b) => {
      const ao = a.prop("order", 1000);
      const bo = b.prop("order", 1000);

      if (ao < bo) return -1;
      if (ao > bo) return 1;

      const at = a.prop("title", "");
      const bt = b.prop("title", "");

      if (at < bt) return -1;
      if (at > bt) return 1;

      return 0;
    })
    .map((p, i) => (
      <ReferenceRow key={p.prop("id", i)} property={p} showJson={showJson} />
    ));
  return (
    <>
      <tr>
        <th colSpan={4}>{name}</th>
      </tr>
      {rows}
    </>
  );
};

function collectPages(target: PropSidebarItem[], items: PropSidebarItem[]) {
  for (const item of items) {
    if (item.type === "category") {
      collectPages(target, item.items);
    } else if (item.type === "link") {
      target.push(item);
    }
  }
}

export interface ReferenceTableProps {
  currentSidebarCategory: PropSidebarItemCategory;
  type: string;
  showJson: boolean;
}

export const ReferenceTable: React.FC<ReferenceTableProps> = ({
  currentSidebarCategory,
  type,
  showJson,
}: ReferenceTableProps) => {
  const allPages: PropSidebarItem[] = [];
  collectPages(allPages, currentSidebarCategory.items);
  const existingKeys = new Map<string, Page[]>();
  const pages: { key: string; items: Page[] }[] = [];
  for (const page of allPages) {
    if(page.type === "link"  && page.docId?.startsWith('_') === true) {
      continue;
    }

    const category = (page.customProps?.category as string) ?? "";
    let items = existingKeys.get(category);
    if (!items) {
      items = [];
      existingKeys.set(category, items);
      pages.push({ key: category, items: items });
    }

    const doc = page.type === "link" ? useDocById(page.docId) : undefined;
    items.push(new Page(page, doc));
  }
  pages.sort((a, b) => {
    return a.key.localeCompare(b.key);
  });

  const categories = pages.map((p) => (
    <ReferenceCategory
      key={p.key}
      name={p.key}
      pages={p.items}
      showJson={showJson}
    />
  ));

  return (
    <table className="table table-striped table-condensed reference-table">
      <thead>
        <tr>
          <th>{type}</th>
          <th>Summary</th>
        </tr>
      </thead>
      <tbody>{categories}</tbody>
    </table>
  );
};
