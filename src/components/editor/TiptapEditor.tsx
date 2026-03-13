'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import { useRef } from 'react';

// ─── 툴바 버튼 ───────────────────────────────────────────────────────────────

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // 에디터 포커스 유지
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`min-w-[28px] h-7 px-1.5 rounded text-sm font-medium transition-colors select-none
        ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}
        disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-gray-300 mx-1 self-center" />;
}

// ─── 툴바 ─────────────────────────────────────────────────────────────────────

interface ToolbarProps {
  editor: Editor;
  onImageClick: () => void;
}

function Toolbar({ editor, onImageClick }: ToolbarProps) {
  function setLink() {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt('링크 URL을 입력하세요:');
    if (url) editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50 rounded-t-md">
      {/* 실행취소 / 다시실행 */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="실행취소 (Ctrl+Z)"
      >
        ↩
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="다시실행 (Ctrl+Y)"
      >
        ↪
      </ToolbarButton>

      <Divider />

      {/* 제목 */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="제목 1"
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="제목 2"
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="제목 3"
      >
        H3
      </ToolbarButton>

      <Divider />

      {/* 텍스트 서식 */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="굵게 (Ctrl+B)"
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="기울임 (Ctrl+I)"
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="밑줄 (Ctrl+U)"
      >
        <span className="underline">U</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="취소선"
      >
        <span className="line-through">S</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        title="인라인 코드"
      >
        {'<>'}
      </ToolbarButton>

      <Divider />

      {/* 목록 */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="글머리 기호 목록"
      >
        •≡
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="번호 매기기 목록"
      >
        1≡
      </ToolbarButton>

      <Divider />

      {/* 블록 요소 */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="인용구"
      >
        ❝
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        title="코드 블록"
      >
        {'{ }'}
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="구분선"
      >
        ─
      </ToolbarButton>

      <Divider />

      {/* 링크 / 이미지 */}
      <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} title="링크 삽입">
        🔗
      </ToolbarButton>
      <ToolbarButton onClick={onImageClick} title="이미지 삽입 (파일 선택)">
        🖼
      </ToolbarButton>
    </div>
  );
}

// ─── 이미지 업로드 ─────────────────────────────────────────────────────────────

async function uploadImageFile(file: File, slug: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('slug', slug || 'temp');
  const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
  const data = await res.json();
  return data.url as string;
}

// ─── 메인 에디터 ───────────────────────────────────────────────────────────────

interface TiptapEditorProps {
  defaultValue?: string;
  onChange?: (markdown: string) => void;
  className?: string;
  slug?: string;
}

export default function TiptapEditor({
  defaultValue = '',
  onChange,
  className,
  slug = '',
}: TiptapEditorProps) {
  const slugRef = useRef(slug);
  slugRef.current = slug;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: '문서 내용을 입력하세요...' }),
      Markdown.configure({ html: false, transformPastedText: true, transformCopiedText: true }),
    ],
    content: defaultValue,
    editorProps: {
      // 이미지 붙여넣기 처리
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items ?? []);
        const imageItem = items.find((item) => item.type.startsWith('image/'));
        if (!imageItem) return false;

        const file = imageItem.getAsFile();
        if (!file) return false;

        uploadImageFile(file, slugRef.current).then((url) => {
          const { state } = view;
          const imageNode = state.schema.nodes.image?.create({ src: url });
          if (imageNode) {
            view.dispatch(state.tr.replaceSelectionWith(imageNode));
          }
        });
        return true; // 기본 붙여넣기 동작 차단
      },
    },
    onUpdate({ editor: e }) {
      // tiptap-markdown이 storage.markdown을 동적으로 추가
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange?.((e.storage as any).markdown.getMarkdown());
    },
  });

  function handleImageButtonClick() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !editor) return;
      const url = await uploadImageFile(file, slugRef.current);
      editor.chain().focus().setImage({ src: url }).run();
    };
    input.click();
  }

  if (!editor) return null;

  return (
    <div className={`border border-gray-300 rounded-md overflow-hidden ${className ?? ''}`}>
      <Toolbar editor={editor} onImageClick={handleImageButtonClick} />
      <EditorContent editor={editor} className="tiptap-editor min-h-[400px] p-4" />
    </div>
  );
}
