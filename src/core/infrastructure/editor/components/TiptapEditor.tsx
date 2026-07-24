import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import { useState, useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { BlockIdExtension } from '../extensions/block-id';
import { domainToTiptap, tiptapToDomain } from '../mappers/tiptap-mapper';
import { PieceContent } from '../../../domain/types/';
import { Button } from '@/ui/components/ui/button';
import { Bold, Italic, Underline as UnderlineIcon } from 'lucide-react';
import { useMediaQuery } from '@/ui/hooks/use-media-query';
import 'tippy.js/dist/tippy.css';

interface TiptapEditorProps {
  initialContent: PieceContent;
  onUpdate: (content: PieceContent) => void;
}

export function TiptapEditor({ initialContent, onUpdate }: TiptapEditorProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const originalKind = initialContent.kind === 'song' ? 'text' : initialContent.kind;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ strike: false }),
      Underline,
      BlockIdExtension,
    ],
    content: domainToTiptap(initialContent),
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const newDomainContent = tiptapToDomain(json, originalKind);
      onUpdate(newDomainContent);
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert focus:outline-none min-h-[200px]',
      },
    },
  });

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showMobileToolbar, setShowMobileToolbar] = useState(false);

  const hasSelection = editor ? (editor.isEditable && !editor.state.selection.empty) : false;

  useEffect(() => {
    if (hasSelection) {
      setShowMobileToolbar(true);
    } else {
      const timer = setTimeout(() => {
        setShowMobileToolbar(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasSelection]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const handleResize = () => {
      const vv = window.visualViewport;
      if (vv) {
        const offset = window.innerHeight - vv.height;
        setKeyboardHeight(Math.max(0, offset));
      }
    };

    window.visualViewport.addEventListener('resize', handleResize);
    window.visualViewport.addEventListener('scroll', handleResize);
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);


  const getMenuButtonProps = (action: () => void) => {
    return {
      onPointerDown: (e: React.PointerEvent) => {
        e.preventDefault();
      },
      onMouseDown: (e: React.MouseEvent) => {
        e.preventDefault();
      },
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        action();
      }
    };
  };

  if (!editor) {
    return null;
  }


  return (
    <div className="flex flex-col gap-2">
      <BubbleMenu
        editor={editor}
        shouldShow={({ editor }) => isDesktop && editor.isEditable && !editor.state.selection.empty}
        tippyOptions={{ duration: 150 }}
        className="editor-bubble-menu flex items-center gap-0.5 p-1 bg-white/90 border border-[#dadce0] rounded-lg shadow-md backdrop-blur-md z-50"
      >
        <Button
          variant="ghost"
          size="sm"
          type="button"
          {...getMenuButtonProps(() => editor.chain().focus().toggleBold().run())}
          className={`h-8 w-8 p-0 cursor-pointer hover:bg-muted ${editor.isActive('bold') ? 'bg-muted text-primary' : 'text-[#5f6368]'}`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          {...getMenuButtonProps(() => editor.chain().focus().toggleItalic().run())}
          className={`h-8 w-8 p-0 cursor-pointer hover:bg-muted ${editor.isActive('italic') ? 'bg-muted text-primary' : 'text-[#5f6368]'}`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          {...getMenuButtonProps(() => editor.chain().focus().toggleUnderline().run())}
          className={`h-8 w-8 p-0 cursor-pointer hover:bg-muted ${editor.isActive('underline') ? 'bg-muted text-primary' : 'text-[#5f6368]'}`}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
      </BubbleMenu>

      <div className="border-0 md:border md:rounded-md p-2 md:p-4">
        <EditorContent editor={editor} />
      </div>

      {showMobileToolbar && !isDesktop && (
        <div
          className="editor-bubble-menu fixed left-4 right-4 z-50 flex items-center justify-around p-2 bg-white/95 border border-[#dadce0] rounded-xl shadow-lg backdrop-blur-md select-none animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{ bottom: `${keyboardHeight + 16}px` }}
        >
          <Button
            variant="ghost"
            size="sm"
            type="button"
            {...getMenuButtonProps(() => editor.chain().focus().toggleBold().run())}
            className={`h-9 px-3 flex items-center justify-center gap-1.5 cursor-pointer rounded-lg hover:bg-muted ${editor.isActive('bold') ? 'bg-muted text-primary' : 'text-[#5f6368]'}`}
            title="Bold"
          >
            <Bold className="h-4.5 w-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            {...getMenuButtonProps(() => editor.chain().focus().toggleItalic().run())}
            className={`h-9 px-3 flex items-center justify-center gap-1.5 cursor-pointer rounded-lg hover:bg-muted ${editor.isActive('italic') ? 'bg-muted text-primary' : 'text-[#5f6368]'}`}
            title="Italic"
          >
            <Italic className="h-4.5 w-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            {...getMenuButtonProps(() => editor.chain().focus().toggleUnderline().run())}
            className={`h-9 px-3 flex items-center justify-center gap-1.5 cursor-pointer rounded-lg hover:bg-muted ${editor.isActive('underline') ? 'bg-muted text-primary' : 'text-[#5f6368]'}`}
            title="Underline"
          >
            <UnderlineIcon className="h-4.5 w-4.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
