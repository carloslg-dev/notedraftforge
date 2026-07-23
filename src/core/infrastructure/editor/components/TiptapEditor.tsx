import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import { useState } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { BlockIdExtension } from '../extensions/block-id';
import { domainToTiptap, tiptapToDomain } from '../mappers/tiptap-mapper';
import { PieceContent } from '../../../domain/types/';
import { Button } from '@/ui/components/ui/button';
import { Bold, Italic, Underline as UnderlineIcon } from 'lucide-react';
import { useTranslation } from '@/ui/hooks/use-translation';
import { RefineSelectionModal } from '@/ui/features/work-view/components/RefineSelectionModal';
import { useMediaQuery } from '@/ui/hooks/use-media-query';
import 'tippy.js/dist/tippy.css';

interface TiptapEditorProps {
  initialContent: PieceContent;
  onUpdate: (content: PieceContent) => void;
}

export function TiptapEditor({ initialContent, onUpdate }: TiptapEditorProps) {
  const { t } = useTranslation();
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

  const [isRefineOpen, setIsRefineOpen] = useState(false);
  const [refineText, setRefineText] = useState('');
  const [refineStart, setRefineStart] = useState(0);
  const [refineEnd, setRefineEnd] = useState(0);

  const handleRefineClick = () => {
    if (!editor) return;
    const { $from, $to } = editor.state.selection;
    const blockText = $from.parent.textContent;
    setRefineText(blockText);
    setRefineStart($from.parentOffset);
    setRefineEnd($to.parentOffset);
    setIsRefineOpen(true);
  };

  const handleRefineConfirm = (newStart: number, newEnd: number) => {
    if (!editor) return;
    const { $from } = editor.state.selection;
    const blockStartPos = $from.start();
    editor.commands.setTextSelection({
      from: blockStartPos + newStart,
      to: blockStartPos + newEnd,
    });
    editor.commands.focus();
  };

  if (!editor) {
    return null;
  }

  const hasSelection = editor.isEditable && !editor.state.selection.empty && !isRefineOpen;

  return (
    <div className="flex flex-col gap-2">
      <BubbleMenu
        editor={editor}
        shouldShow={({ editor }) => isDesktop && editor.isEditable && !editor.state.selection.empty && !isRefineOpen}
        tippyOptions={{ duration: 150 }}
        className="editor-bubble-menu flex items-center gap-0.5 p-1 bg-white/90 border border-[#dadce0] rounded-lg shadow-md backdrop-blur-md z-50"
      >
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 w-8 p-0 cursor-pointer hover:bg-muted ${editor.isActive('bold') ? 'bg-muted text-primary' : 'text-[#5f6368]'}`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 w-8 p-0 cursor-pointer hover:bg-muted ${editor.isActive('italic') ? 'bg-muted text-primary' : 'text-[#5f6368]'}`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`h-8 w-8 p-0 cursor-pointer hover:bg-muted ${editor.isActive('underline') ? 'bg-muted text-primary' : 'text-[#5f6368]'}`}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <div className="h-4 w-[1px] bg-[#dadce0] mx-1" />
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleRefineClick}
          className="h-8 px-2.5 py-0 text-[11px] font-semibold tracking-tight text-[#1a73e8] hover:bg-[#e8f0fe] cursor-pointer"
        >
          {t('refine')}
        </Button>
      </BubbleMenu>

      <div className="border-0 md:border md:rounded-md p-2 md:p-4">
        <EditorContent editor={editor} />
      </div>

      {hasSelection && !isDesktop && (
        <div className="editor-bubble-menu fixed bottom-4 left-4 right-4 z-50 flex items-center justify-around p-2 bg-white/95 border border-[#dadce0] rounded-xl shadow-lg backdrop-blur-md select-none animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-9 px-3 flex items-center justify-center gap-1.5 cursor-pointer rounded-lg hover:bg-muted ${editor.isActive('bold') ? 'bg-muted text-primary' : 'text-[#5f6368]'}`}
            title="Bold"
          >
            <Bold className="h-4.5 w-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`h-9 px-3 flex items-center justify-center gap-1.5 cursor-pointer rounded-lg hover:bg-muted ${editor.isActive('italic') ? 'bg-muted text-primary' : 'text-[#5f6368]'}`}
            title="Italic"
          >
            <Italic className="h-4.5 w-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`h-9 px-3 flex items-center justify-center gap-1.5 cursor-pointer rounded-lg hover:bg-muted ${editor.isActive('underline') ? 'bg-muted text-primary' : 'text-[#5f6368]'}`}
            title="Underline"
          >
            <UnderlineIcon className="h-4.5 w-4.5" />
          </Button>
          <div className="h-5 w-[1px] bg-[#dadce0]" />
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleRefineClick}
            className="h-9 px-4 text-[11px] font-semibold tracking-tight text-[#1a73e8] hover:bg-[#e8f0fe] cursor-pointer rounded-lg"
          >
            {t('refine')}
          </Button>
        </div>
      )}

      <RefineSelectionModal
        isOpen={isRefineOpen}
        onClose={() => setIsRefineOpen(false)}
        text={refineText}
        selectionStart={refineStart}
        selectionEnd={refineEnd}
        onConfirm={handleRefineConfirm}
      />
    </div>
  );
}
