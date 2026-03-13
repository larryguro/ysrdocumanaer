'use client';

import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import '@milkdown/theme-nord/style.css';

interface MilkdownEditorInnerProps {
  defaultValue?: string;
  onChange?: (markdown: string) => void;
}

function MilkdownEditorInner({ defaultValue = '', onChange }: MilkdownEditorInnerProps) {
  useEditor((root) =>
    Editor.make()
      .config(nord)
      .config((ctx) => {
        ctx.set(rootCtx, root);
        if (defaultValue) {
          ctx.set(defaultValueCtx, defaultValue);
        }
        ctx.get(listenerCtx).markdownUpdated((_ctx, markdown) => {
          onChange?.(markdown);
        });
      })
      .use(commonmark)
      .use(gfm)
      .use(listener)
  );

  return <Milkdown />;
}

interface MilkdownEditorProps {
  defaultValue?: string;
  onChange?: (markdown: string) => void;
  className?: string;
}

export default function MilkdownEditor({ defaultValue, onChange, className }: MilkdownEditorProps) {
  return (
    <MilkdownProvider>
      <div
        className={`milkdown-wrapper border border-gray-300 rounded-md min-h-[400px] p-4 ${className ?? ''}`}
      >
        <MilkdownEditorInner defaultValue={defaultValue} onChange={onChange} />
      </div>
    </MilkdownProvider>
  );
}
