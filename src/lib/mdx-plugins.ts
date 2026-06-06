// Tiny rehype transformer to turn invalid <link>text</link> into <a>text</a>
// (but leaves proper self-closing <link ... /> tags alone)
export function rehypeFixInvalidLinkChildren() {
  return (tree: any) => {
    const visit = (node: any) => {
      if (node && typeof node === "object") {
        if (
          node.type === "element" &&
          node.tagName === "link" &&
          Array.isArray(node.children) &&
          node.children.length > 0
        ) {
          node.tagName = "a"; // treat as normal anchor
        }
        if (Array.isArray(node.children)) node.children.forEach(visit);
      }
    };
    visit(tree);
  };
}

function isRelativeAssetUrl(value: unknown) {
  if (typeof value !== "string") return false;
  if (!value) return false;
  if (/^(?:[a-z]+:|\/|#|mailto:|tel:|data:)/i.test(value)) return false;

  const clean = value.split(/[?#]/, 1)[0];
  return /\.(?:avif|gif|jpe?g|png|svg|webp|pdf|mp4|webm)$/i.test(clean);
}

function prefixAssetUrl(basePath: string, value: string) {
  const normalizedBase = basePath.replace(/\/$/, "");
  const normalizedValue = value.replace(/^\.?\/*/, "");
  return `${normalizedBase}/${normalizedValue}`;
}

export function rehypePrefixRelativeAssetUrls(basePath: string) {
  return (tree: any) => {
    const visit = (node: any) => {
      if (!node || typeof node !== "object") return;

      if (node.type === "element" && node.properties) {
        if (
          (node.tagName === "img" || node.tagName === "source") &&
          isRelativeAssetUrl(node.properties.src)
        ) {
          node.properties.src = prefixAssetUrl(basePath, node.properties.src);
        }

        if (node.tagName === "a" && isRelativeAssetUrl(node.properties.href)) {
          node.properties.href = prefixAssetUrl(basePath, node.properties.href);
        }
      }

      if (Array.isArray(node.children)) node.children.forEach(visit);
    };

    visit(tree);
  };
}
