import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { BlockIdExtension } from '../extensions/block-id';
import { domainToTiptap, tiptapToDomain } from '../mappers/tiptap-mapper';
import { PieceContent } from '../../../domain/types/';
import { Button } from '@/ui/components/ui/button';
import { Bold, Italic, Underline as UnderlineIcon } from 'lucide-react';
import { useTranslation } from '@/ui/hooks/use-translation';
import { toast } from 'sonner';

interface TiptapEditorProps {
  initialContent: PieceContent;
  onUpdate: (content: PieceContent) => void;
}

export function TiptapEditor({ initialContent, onUpdate }: TiptapEditorProps) {
  const { t } = useTranslation();
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

  const handleRefineClick = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    toast.info(`${t('refine')}: "${selectedText}"`);
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 150 }}
        className="flex items-center gap-0.5 p-1 bg-white/90 border border-[#dadce0] rounded-lg shadow-md backdrop-blur-md"
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

      <div className="flex gap-2 p-2 border rounded-md bg-muted/50">
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-accent' : ''}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-accent' : ''}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-accent' : ''}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="border rounded-md p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
