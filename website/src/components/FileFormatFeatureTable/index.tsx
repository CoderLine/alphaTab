import React, { ReactElement, ReactNode } from "react";
import { SinceBadge } from "../SinceBadge";
import Details from "@theme/Details";
import { Tooltip } from "react-tooltip";
import ReactDOMServer from "react-dom/server";
import styles from "./styles.module.scss";

export enum FeatureStatus {
  Supported,
  Partial,
  NotSupported,
  Ignored,
  Unspecified,
}

const FeatureStatusDisplay: React.FC<{ status: FeatureStatus }> = ({
  status,
}) => {
  switch (status) {
    case FeatureStatus.Supported:
      return <>✅ Supported</>;
    case FeatureStatus.Partial:
      return <>⚠️ Partial</>;
    case FeatureStatus.NotSupported:
      return <>❌ Not Supported</>;
    case FeatureStatus.Ignored:
      return <span className={styles.ignored}>✅ Ignored</span>;
    case FeatureStatus.Unspecified:
      return <></>;
  }
  return <></>;
};

type FeatureStatusDefinitionFull = {
  status: FeatureStatus;
  tooltip?: string;
  since?: string;
};

export type FileFormatFeatureCellProps = {
  status?: FeatureStatusDefinitionFull;
};

export const FileFormatFeatureCell: React.FC<FileFormatFeatureCellProps> = ({
  status,
}) => {
  if (!status) {
    return <></>;
  }

  const tooltip =
    status.since || status.tooltip
      ? ReactDOMServer.renderToStaticMarkup(
          <>
            <SinceBadge since={status.since} inline={true} /> {status.tooltip}
          </>
        )
      : "";

  const classNames = ["feature-status-has-tooltip", styles.noWrap];
  if (tooltip) {
    classNames.push(styles.hasTooltip);
  }

  return (
    <>
      <span className={classNames.join(" ")} data-tooltip-html={tooltip}>
        <FeatureStatusDisplay status={status.status} />
      </span>
    </>
  );
};

function computeFeatureStatistics(node: React.ReactNode): {
  totalFeatures: number;
  supportedFeatures: number;
  totalRelevantFeatures: number;
  supportedRelevantFeatures: number;
} {
  let featureRows: ReactElement<FileFormatFeatureRowProps>[] = [];

  collectFeatureRows(featureRows, node);

  let totalFeatures = featureRows.length;
  let supportedFeatures = featureRows
    .map((f) => {
      const status = toFeatureStatusDefinitionFull(f.props.reading)?.status;
      if (status == undefined) {
        return 1;
      }
      switch (status) {
        case FeatureStatus.Supported:
        case FeatureStatus.Ignored:
        case FeatureStatus.Unspecified:
          return 1;
        case FeatureStatus.Partial:
          return 0.5;
        case FeatureStatus.NotSupported:
        default:
          return 0;
      }
    })
    .reduce((p, v) => p + v, 0);

  const relevantFeatures = featureRows.filter(
    (r) =>
      toFeatureStatusDefinitionFull(r.props.model)?.status !==
        FeatureStatus.Ignored &&
      toFeatureStatusDefinitionFull(r.props.reading)?.status !==
        FeatureStatus.Ignored
  );
  let totalRelevantFeatures = relevantFeatures.length;
  let supportedRelevantFeatures = relevantFeatures.filter((f) => {
    const status = toFeatureStatusDefinitionFull(f.props.reading)?.status;
    return (
      status === undefined ||
      status == FeatureStatus.Ignored ||
      status == FeatureStatus.Supported ||
      status == FeatureStatus.Unspecified
    );
  }).length;

  return {
    totalFeatures,
    supportedFeatures,
    totalRelevantFeatures,
    supportedRelevantFeatures,
  };
}

export type FileFormatFeatureGroupProps = {
  title: string;
  children: React.ReactNode;
};
export const FileFormatFeatureGroup: React.FC<FileFormatFeatureGroupProps> = ({
  title,
  children,
}) => {
  const tooltip = ReactDOMServer.renderToStaticMarkup(
    <FileFormatFeatureStatistics node={children} />
  );

  const classNames = ["feature-status-has-tooltip", styles.noWrap];
  if (tooltip) {
    classNames.push(styles.hasTooltip);
  }

  return (
    <>
      <tr>
        <td>
          <strong className={classNames.join(" ")} data-tooltip-html={tooltip}>
            {title}
          </strong>
        </td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      {children}
    </>
  );
};

type FeatureStatusDefinition =
  | FeatureStatus
  | [FeatureStatus]
  | [FeatureStatus, string]
  | [FeatureStatus, string, string]
  | FeatureStatusDefinitionFull;

function toFeatureStatusDefinitionFull(
  definition?: FeatureStatusDefinition
): FeatureStatusDefinitionFull | undefined {
  if (typeof definition === "undefined") {
    return undefined;
  }

  if (typeof definition === "number") {
    return {
      status: definition,
    };
  }

  if (Array.isArray(definition)) {
    if (definition.length === 1) {
      return {
        status: definition[0] as number,
      };
    } else if (definition.length === 2) {
      return {
        status: definition[0] as number,
        since: definition[1] as string,
      };
    } else if (definition.length === 3) {
      return {
        status: definition[0] as number,
        since: definition[1] as string,
        tooltip: definition[2] as string,
      };
    }
  }

  if ("status" in definition) {
    return definition;
  }

  throw new Error("Invalid status definition");
}

export type FileFormatFeatureStatisticsProps = {
  node: React.ReactNode;
};

export const FileFormatFeatureStatistics: React.FC<
  FileFormatFeatureStatisticsProps
> = ({ node }) => {
  const statistics = computeFeatureStatistics(node);
  return (
    <p>
      <strong>Number of total supported features:</strong>{" "}
      {((statistics.supportedFeatures / statistics.totalFeatures) * 100) | 0}% (
      {statistics.supportedFeatures}/{statistics.totalFeatures})<br />
      <strong>Number of relevant supported features:</strong>{" "}
      {((statistics.supportedRelevantFeatures /
        statistics.totalRelevantFeatures) *
        100) |
        0}
      % ({statistics.supportedRelevantFeatures}/
      {statistics.totalRelevantFeatures})<br />
    </p>
  );
};

export type FileFormatFeatureRowProps = {
  feature: string;
  isNewFeature: boolean;

  model?: FeatureStatusDefinition;
  reading?: FeatureStatusDefinition;
  render?: FeatureStatusDefinition;
  audio?: FeatureStatusDefinition;
  tex?: FeatureStatusDefinition;
};

export const FileFormatFeatureRow: React.FC<FileFormatFeatureRowProps> = ({
  feature,
  isNewFeature,
  model,
  reading,
  render,
  audio,
  tex,
}) => {
  return (
    <tr>
      <td>{(isNewFeature ? "⭐ " : "") + feature}</td>
      <td>
        <FileFormatFeatureCell status={toFeatureStatusDefinitionFull(model)} />
      </td>
      <td>
        <FileFormatFeatureCell
          status={toFeatureStatusDefinitionFull(reading)}
        />
      </td>
      <td>
        <FileFormatFeatureCell status={toFeatureStatusDefinitionFull(render)} />
      </td>
      <td>
        <FileFormatFeatureCell status={toFeatureStatusDefinitionFull(audio)} />
      </td>
      <td>
        <FileFormatFeatureCell status={toFeatureStatusDefinitionFull(tex)} />
      </td>
    </tr>
  );
};

function collectFeatureRows(
  items: ReactElement<FileFormatFeatureRowProps>[],
  node: React.ReactNode
) {
  if (typeof node === "object") {
    // array
    if (Symbol.iterator in node!) {
      for (const c of node as Iterable<React.ReactNode>) {
        collectFeatureRows(items, c);
      }
    } else if (React.isValidElement(node)) {
      if (typeof node.props === "object") {
        if ("feature" in node.props!) {
          items.push(node as ReactElement<FileFormatFeatureRowProps>);
        } else if ("children" in node.props!) {
          collectFeatureRows(
            items,
            node.props.children as React.ReactNode
          );
        }
      }
    }
  }
}

export type FileFormatFeatureTableProps = {
  children: React.ReactNode;
};

export const FileFormatFeatureTable: React.FC<FileFormatFeatureTableProps> = ({
  children,
}) => {
  return (
    <>
      <FileFormatFeatureStatistics node={children} />
      <Details summary="Table Legend">
        <p>
          The following table describes the support of the different features of
          the input format.
        </p>
        <p>
          <strong>Columns</strong>
        </p>
        <ul>
          <li>
            Feature: The related feature. If marked with ⭐ its a new or changed
            feature compared to the previous version of this format (e.g. a
            feature added in Guitar Pro 6)
          </li>
          <li>
            Data Model: Whether alphaTab supports storing this information in
            its own data model (e.g. from other formats).
          </li>
          <li>
            Reading: Whether alphaTab can read this information from the file
            format.
          </li>
          <li>
            Rendering: Whether alphaTab can display the information in the music
            sheet when rendered (display might differ from reference software).
          </li>
          <li>
            Audio: Whether alphaTab can generate audio information for this
            feature.
          </li>
          <li>
            alphaTex: Whether this feature is supported when describing music
            notation with alphaTex.
          </li>
        </ul>
        <p>
          <strong>Values</strong>
        </p>
        <ul>
          <li>
            <FeatureStatusDisplay status={FeatureStatus.Supported} /> - The
            feature is fully supported by alphaTab.
          </li>
          <li>
            <FeatureStatusDisplay status={FeatureStatus.Partial} /> - The
            feature is partially supported by alphaTab, hover the item to see
            more details.
          </li>
          <li>
            <FeatureStatusDisplay status={FeatureStatus.NotSupported} /> - The
            feature is not supported by alphaTab.
          </li>
          <li>
            <FeatureStatusDisplay status={FeatureStatus.Ignored} /> - The
            feature is ignored from the input format because it is considered
            not relevant for display or playback. This is opinionated based on
            the feature set in alphaTab, open a feature request if you need it.
          </li>
        </ul>
      </Details>
      <Tooltip anchorSelect=".feature-status-has-tooltip" />
      <table
        className={"table table-striped table-condensed " + styles.featureTable}
      >
        <thead>
          <tr>
            <th>Feature</th>
            <th>Data Model</th>
            <th>Reading</th>
            <th>Rendering</th>
            <th>Audio</th>
            <th>alphaTex</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </>
  );
};
