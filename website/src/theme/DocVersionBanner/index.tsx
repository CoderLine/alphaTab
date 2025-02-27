import React from "react";
import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { ThemeClassNames } from "@docusaurus/theme-common";
import type { Props } from "@theme/DocVersionBanner";

function DocVersionBannerEnabled({
  className,
  version,
}: Props & {
  version: string;
}) {
  return (
    <div
      className={clsx(
        className,
        ThemeClassNames.docs.docVersionBanner,
        "alert alert--warning margin-bottom--md"
      )}
      role="alert"
    >
      <div>
        This is unreleased documentation for alphaTab{" "}
        <strong>{version} 🚧</strong>.
      </div>
    </div>
  );
}

export default function DocVersionBanner({ className }: Props) {
  const { siteConfig } = useDocusaurusContext();
  if (siteConfig.customFields?.isPreRelease === true) {
    return (
      <DocVersionBannerEnabled
        className={className}
        version={siteConfig.customFields!.alphaTabVersionFull as string}
      />
    );
  }
  return null;
}
