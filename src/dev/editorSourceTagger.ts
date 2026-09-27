import type { Plugin } from 'vite';

const runtime = String.raw`
import * as ReactJSXDevRuntime from "react/jsx-dev-runtime";

const originalJsxDev = ReactJSXDevRuntime.jsxDEV;
export const Fragment = ReactJSXDevRuntime.Fragment;
const sourceKey = Symbol.for("__jsxSource__");
const sourceElementMap = new Map();
window.sourceElementMap = sourceElementMap;

const cleanFileName = (fileName) => {
  if (!fileName) return "";
  return fileName.replace(/^\\/dev-server\\//, "");
};

const getSourceKey = (source) =>
  cleanFileName(source.fileName) + ":" + source.lineNumber + ":" + source.columnNumber;

const registerElement = (node, source) => {
  const key = getSourceKey(source);
  if (!sourceElementMap.has(key)) sourceElementMap.set(key, new Set());
  sourceElementMap.get(key).add(new WeakRef(node));
};

const unregisterElement = (node, source) => {
  const refs = sourceElementMap.get(getSourceKey(source));
  if (!refs) return;
  for (const ref of refs) {
    if (ref.deref() === node) {
      refs.delete(ref);
      break;
    }
  }
  if (refs.size === 0) sourceElementMap.delete(getSourceKey(source));
};

const getTypeName = (type) => {
  if (typeof type === "string") return type;
  if (typeof type === "function") return type.displayName || type.name || "Unknown";
  if (typeof type === "object" && type !== null) {
    return type.displayName || type.render?.displayName || type.render?.name || "Unknown";
  }
  return "Unknown";
};

export function jsxDEV(type, props, key, isStatic, source, self) {
  if (!source?.fileName || type === Fragment) {
    return originalJsxDev(type, props, key, isStatic, source, self);
  }

  const sourceInfo = {
    fileName: cleanFileName(source.fileName),
    lineNumber: source.lineNumber,
    columnNumber: source.columnNumber,
    displayName: getTypeName(type),
  };
  const originalRef = props?.ref;
  const enhancedProps = {
    ...props,
    ref: (node) => {
      if (node) {
        const existingSource = node[sourceKey];
        if (existingSource && getSourceKey(existingSource) !== getSourceKey(sourceInfo)) {
          unregisterElement(node, existingSource);
        }
        if (!existingSource || getSourceKey(existingSource) !== getSourceKey(sourceInfo)) {
          node[sourceKey] = sourceInfo;
          registerElement(node, sourceInfo);
        }
      }
      if (typeof originalRef === "function") originalRef(node);
      else if (originalRef && typeof originalRef === "object") originalRef.current = node;
    },
  };

  return originalJsxDev(type, enhancedProps, key, isStatic, source, self);
}
`;

const virtualRuntimeId = '\0editor-source/jsx-dev-runtime';

export function editorSourceTagger(): Plugin {
  return {
    name: 'editor-source-tagger',
    enforce: 'pre',
    resolveId(id, importer) {
      if (id === 'react/jsx-dev-runtime' && !importer?.includes(virtualRuntimeId)) {
        return virtualRuntimeId;
      }
      return null;
    },
    load(id) {
      return id === virtualRuntimeId ? runtime : null;
    },
  };
}
