import type {
  PropSidebarItem,
  PropSidebarItemLink,
  PropVersionDoc,
  DocFrontMatter,
  DocMetadata
} from "@docusaurus/plugin-content-docs";

export class Page {
  constructor(
    private pageMeta: PropSidebarItem | DocMetadata,
    private doc: PropVersionDoc
  ) {}

  public prop<T>(key: string, defaultValue: T): T {
    if ("type" in this.pageMeta) {
      if (this.pageMeta.type === "link") {
        const item = this.pageMeta as PropSidebarItemLink;
        if (key === "link") {
          return item.href as any as T;
        } else if (key === "title") {
          return item.label as any as T;
        } else if (key === "description") {
          if (this.doc) {
            return this.doc.description as any as T;
          }
        }
      }

      if (this.pageMeta.customProps && key in this.pageMeta.customProps) {
        return this.pageMeta.customProps[key] as T;
      }
    }

    if ("frontMatter" in this.pageMeta && this.pageMeta.frontMatter) {
      if (
        (this.pageMeta.frontMatter as DocFrontMatter).sidebar_custom_props &&
        key in this.pageMeta.frontMatter.sidebar_custom_props
      ) {
        return this.pageMeta.frontMatter.sidebar_custom_props[key] as T;
      }
      if (key in this.pageMeta.frontMatter) {
        return this.pageMeta.frontMatter[key] as T;
      }
    }

    return defaultValue;
  }

  public props(key: string) {
    const v = this.prop(key, "") ?? "";
    return v.split(";").filter((x) => x.length > 0);
  }
}
