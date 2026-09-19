/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

import { lazy, memo, Children, Suspense } from 'react';
import { AppJSPath, createFileMap } from './createFileMap';
import './sandpack.css';

const SandpackRoot = lazy(() => import('./SandpackRoot'));

const SandpackGlimmer = ({ code }: { code: string }) => (
  <div className="sandpack sandpack--playground" style={{ height: '100vh' }}>
    <div className="sp-wrapper" style={{ height: '100%' }}>
      <div className="shadow-lg dark:shadow-lg-dark rounded-lg" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="bg-wash h-10 dark:bg-card-dark flex justify-between items-center relative z-10 border-b border-border dark:border-border-dark rounded-t-lg">
          <div className="px-4 lg:px-6">
            <div className="sp-tabs">App.js</div>
          </div>
          <div className="px-3 flex items-center justify-end grow text-right"></div>
        </div>
        <div className="sp-layout flex flex-1" style={{ minHeight: 0 }}>
          <div className="sp-stack sp-editor flex-1" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="sp-code-editor flex-1" style={{ overflow: 'auto' }}>
              <div className="sp-cm sp-pristine h-full">
                <div className="cm-editor h-full">
                  <div className="h-full">
                    <div className="cm-gutters ps-9 sticky min-h-[192px]">
                      <div className="cm-gutter cm-lineNumbers whitespace-pre sp-pre-placeholder">
                        {code}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="sp-stack w-[400px]" style={{
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div className="bg-card dark:bg-wash-dark flex-1" style={{
              overflow: 'auto',
              position: 'relative'
            }}>
              {/* Preview content */}
            </div>
          </div>
        </div>
        {code.split('\n').length > 16 && (
          <div className="flex h-[45px] text-base justify-between dark:border-card-dark bg-wash dark:bg-card-dark items-center z-10 rounded-t-none p-1 w-full border-b-1"></div>
        )}
      </div>
    </div>
  </div>
);

export default memo(function SandpackWrapper(props: any): any {
  const codeSnippet = createFileMap(Children.toArray(props.children));

  // To set the active file in the fallback we have to find the active file first.
  // If there are no active files we fallback to App.js as default.
  let activeCodeSnippet = Object.keys(codeSnippet).filter(
    (fileName) =>
      codeSnippet[fileName]?.active === true &&
      codeSnippet[fileName]?.hidden === false
  );
  let activeCode;
  if (!activeCodeSnippet.length) {
    activeCode = codeSnippet[AppJSPath].code;
  } else {
    activeCode = codeSnippet[activeCodeSnippet[0]].code;
  }

  return (
    <Suspense fallback={<SandpackGlimmer code={activeCode} />}>
      <SandpackRoot {...props} />
    </Suspense>
  );
});
