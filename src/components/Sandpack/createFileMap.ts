/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

import type { SandpackFile } from '@codesandbox/sandpack-react/unstyled';

export const AppJSPath = `/src/App.js`;
export const StylesCSSPath = `/src/styles.css`;
export const SUPPORTED_FILES = [AppJSPath, StylesCSSPath];

export const createFileMap = (codeSnippets: any) => {
  return codeSnippets.reduce(
    (result: Record<string, SandpackFile>, codeSnippet: React.ReactElement) => {
      if (
        (codeSnippet.type as any).mdxName !== 'pre' &&
        codeSnippet.type !== 'pre'
      ) {
        return result;
      }

      //@ts-ignore
      const { props } = codeSnippet.props.children;
      let filePath;
      let fileHidden = false;
      let fileActive = false;

      if (props.className === 'language-html') {
        filePath = '/index.html';
        fileActive = true;

        result['/package.json'] = {
          code: JSON.stringify({
            name: "static-html",
            main: "/index.html",
            dependencies: {}
          }),
          hidden: true
        };
      } else if (props.meta) {
        const [name, ...params] = props.meta.split(' ');
        filePath = '/' + name;
        if (params.includes('hidden')) {
          fileHidden = true;
        }
        if (params.includes('active')) {
          fileActive = true;
        }
      } else {
        if (props.className === 'language-js') {
          filePath = AppJSPath;
        } else if (props.className === 'language-css') {
          filePath = StylesCSSPath;
        } else {
          throw new Error(
            `Code block is missing a filename: ${props.children}`
          );
        }
      }

      if (result[filePath]) {
        throw new Error(
          `File ${filePath} was defined multiple times. Each file snippet should have a unique path name`
        );
      }

      result[filePath] = {
        code: (props.children || '') as string,
        hidden: fileHidden,
        active: fileActive,
      };

      return result;
    },
    {}
  );
};
