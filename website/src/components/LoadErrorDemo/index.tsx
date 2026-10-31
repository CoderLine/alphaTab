import React, { useState } from "react";
import * as alphaTab from "@coderline/alphatab";
import CodeBlock from "@theme/CodeBlock";
import {
  AlphaTabHost,
  AlphaTabProvider,
  useAlphaTabApi,
  useAlphaTabEvent,
} from "@coderline/alphatab-react";
import { useSiteAlphaTabSettings } from "@site/src/alphatab-settings";
import styles from "./styles.module.scss";

export interface LoadErrorDemoProps {
  showCode?: boolean;
}

interface ErrorRecord {
  className: string;
  message: string;
  typeName: string;
}

const VALID_URL = "/files/features/Chords.gp5";
const WRONG_URL = "/files/does-not-exist.gp";
const WRONG_FORMAT_URL = "/files/sonivox_musescore.sf2";
const BAD_TEX = '\\title unterminated :garbage';

function classifyErrorType(err: unknown): string {
  const type = (err as { type?: unknown } | null)?.type;
  if (typeof type !== "number") {
    return "unknown";
  }
  const name =
    alphaTab.AlphaTabErrorType[type as alphaTab.AlphaTabErrorType];
  return typeof name === "string" ? name : String(type);
}

function classifyError(err: unknown): ErrorRecord {
  const asError = err as {
    constructor?: { name?: string };
    message?: string;
  } | null;
  return {
    className: asError?.constructor?.name ?? "Error",
    message: asError?.message ?? String(err),
    typeName: classifyErrorType(err),
  };
}

interface InnerProps {
  record: ErrorRecord | null;
  setRecord: (r: ErrorRecord | null) => void;
  success: string | null;
  setSuccess: (s: string | null) => void;
}

const Inner: React.FC<InnerProps> = ({
  record,
  setRecord,
  success,
  setSuccess,
}) => {
  const api = useAlphaTabApi();

  useAlphaTabEvent(
    "error",
    (err: Error) => {
      setSuccess(null);
      setRecord(classifyError(err));
    },
  );

  useAlphaTabEvent("scoreLoaded", (score) => {
    setRecord(null);
    setSuccess(`Loaded "${score.title || "(untitled)"}"`);
  });

  const safeCall = (fn: () => void) => {
    try {
      fn();
    } catch (err) {
      setSuccess(null);
      setRecord(classifyError(err));
    }
  };

  const loadValid = () => safeCall(() => api?.load(VALID_URL));
  const loadWrongUrl = () => safeCall(() => api?.load(WRONG_URL));
  const loadWrongFormat = () => safeCall(() => api?.load(WRONG_FORMAT_URL));
  const loadBadTex = () => safeCall(() => api?.tex(BAD_TEX));

  return (
    <>
      <div className={styles.buttons}>
        <button
          type="button"
          className="button button--sm button--primary"
          onClick={loadValid}
          disabled={!api}
        >
          Load valid file
        </button>
        <button
          type="button"
          className="button button--sm button--secondary"
          onClick={loadWrongUrl}
          disabled={!api}
        >
          Try wrong URL
        </button>
        <button
          type="button"
          className="button button--sm button--secondary"
          onClick={loadWrongFormat}
          disabled={!api}
        >
          Try wrong file type
        </button>
        <button
          type="button"
          className="button button--sm button--secondary"
          onClick={loadBadTex}
          disabled={!api}
        >
          Try malformed alphaTex
        </button>
      </div>
      <div
        className={`${styles.status} ${
          record ? styles.statusError : success ? styles.statusOk : ""
        }`}
      >
        {record ? (
          <div className={styles.statusGrid}>
            <div>
              <span className={styles.statusLabel}>Last error</span>
              <span className={styles.statusValue}>{record.className}</span>
            </div>
            <div>
              <span className={styles.statusLabel}>Message</span>
              <span className={styles.statusValue}>{record.message}</span>
            </div>
            <div>
              <span className={styles.statusLabel}>Type</span>
              <span className={styles.statusValue}>{record.typeName}</span>
            </div>
          </div>
        ) : success ? (
          <span>{success}</span>
        ) : (
          <span className={styles.placeholder}>
            Trigger a button — the <code>error</code> event populates this
            strip.
          </span>
        )}
      </div>
      <AlphaTabHost />
    </>
  );
};

export const LoadErrorDemo: React.FC<LoadErrorDemoProps> = ({
  showCode = true,
}) => {
  const [record, setRecord] = useState<ErrorRecord | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const site = useSiteAlphaTabSettings({ player: true });

  const code = `api.error.on((error) => {
  if (error instanceof alphaTab.importer.UnsupportedFormatError) {
    // wrong file type
  } else if (error instanceof alphaTab.FormatError) {
    // malformed content (bad alphaTex, corrupted GP archive)
  } else if (error instanceof alphaTab.FileLoadError) {
    // network / HTTP failure — inspect error.xhr.status
  } else {
    // render or generic API error
  }
});`;

  return (
    <div className={styles.demo}>
      <AlphaTabProvider
        file={VALID_URL}
        configureSettings={site.configureSettings}
        settings={site.settings}
      >
        <Inner
          record={record}
          setRecord={setRecord}
          success={success}
          setSuccess={setSuccess}
        />
      </AlphaTabProvider>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
