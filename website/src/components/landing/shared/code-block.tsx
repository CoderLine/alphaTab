import React from 'react';
import clsx from 'clsx';
import { IconCopy } from './icons';
import styles from './code-block.module.scss';

interface CodeBlockProps {
  code: string;
  fileName?: string;
  showHeader?: boolean;
  showCopy?: boolean;
  className?: string;
  ariaLabel?: string;
}

type Token = { t: string; c: keyof TokenColors };

interface TokenColors {
  plain: true;
  comment: true;
  string: true;
  kw: true;
  num: true;
  cls: true;
  fn: true;
  punc: true;
}

const TOKEN_RE =
  /(\/\/[^\n]*)|('(?:\\'|[^'])*'|"(?:\\"|[^"])*"|`(?:\\`|[^`])*`)|\b(import|from|const|let|var|function|return|new|await|async|export|default|if|else|true|false|null)\b|\b(\d+(?:\.\d+)?)\b|\b([A-Z][A-Za-z0-9_]*)\b|\b([a-z_][a-zA-Z0-9_]*)(?=\()|([{}()[\]<>=+\-*/;:,.])/g;

function tokenize(src: string): Token[] {
  const out: Token[] = [];
  let last = 0;
  for (const m of src.matchAll(TOKEN_RE)) {
    if (m.index > last) { out.push({ t: src.slice(last, m.index), c: 'plain' }); }
    if (m[1]) { out.push({ t: m[1], c: 'comment' }); }
    else if (m[2]) { out.push({ t: m[2], c: 'string' }); }
    else if (m[3]) { out.push({ t: m[3], c: 'kw' }); }
    else if (m[4]) { out.push({ t: m[4], c: 'num' }); }
    else if (m[5]) { out.push({ t: m[5], c: 'cls' }); }
    else if (m[6]) { out.push({ t: m[6], c: 'fn' }); }
    else if (m[7]) { out.push({ t: m[7], c: 'punc' }); }
    last = m.index + m[0].length;
  }
  if (last < src.length) { out.push({ t: src.slice(last), c: 'plain' }); }
  return out;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  fileName,
  showHeader = true,
  showCopy = true,
  className,
  ariaLabel,
}) => {
  const tokens = React.useMemo(() => tokenize(code), [code]);

  return (
    <div className={clsx(styles.block, className)}>
      {showHeader && (
        <div className={styles.header}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
          {fileName && <span className={styles.filename}>{fileName}</span>}
          <span className={styles.spacer} />
          {showCopy && <IconCopy size={12} aria-hidden="true" />}
        </div>
      )}
      <pre className={styles.code} aria-label={ariaLabel}>
        {tokens.map((tok, i) => (
          <span key={i} className={styles[`tok-${tok.c}`]}>
            {tok.t}
          </span>
        ))}
      </pre>
    </div>
  );
};
