import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { BlockIdExtension } from '../extensions/block-id';
import { domainToTiptap, tiptapToDomain } from '../mappers/tiptap-mapper';
import { PieceContent } from '../../../domain/types/';
import { Button } from '@/ui/components/ui/button';
import { Bold, Italic, Underline as UnderlineIcon } from 'lucide-react';

interface TiptapEditorProps {
  initialContent: PieceContent;
  onUpdate: (content: PieceContent) => void;
}

export function TiptapEditor({ initialContent, onUpdate }: TiptapEditorProps) {
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

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 p-2 border rounded-md bg-muted/50">
        <Button
          variant="outline"
          size="icon"
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
