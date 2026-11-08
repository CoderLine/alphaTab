interface MdastNode {
  type: string;
  value?: unknown;
  children?: MdastNode[];
}

export interface VersionPlaceholderOptions {
  alphaTabVersion: string;
  alphaSkiaVersion: string;
}

const placeholderPattern = /(\\?)\{\{(alphaTabVersion|alphaSkiaVersion)\}\}/g;

/**
 * Replaces `{{alphaTabVersion}}` and `{{alphaSkiaVersion}}` in code blocks and inline code
 * with the versions the site is built for, so install snippets never go stale.
 * A leading backslash (`\{{alphaTabVersion}}`) keeps the placeholder as literal text.
 */
export default function remarkVersionPlaceholders(options: VersionPlaceholderOptions) {
  const replace = (node: MdastNode) => {
    if ((node.type === 'code' || node.type === 'inlineCode') && typeof node.value === 'string') {
      node.value = node.value.replace(
        placeholderPattern,
        (_, escaped: string, name: keyof VersionPlaceholderOptions) =>
          escaped ? `{{${name}}}` : options[name],
      );
    }
    node.children?.forEach(replace);
  };
  return (tree: MdastNode) => replace(tree);
}
