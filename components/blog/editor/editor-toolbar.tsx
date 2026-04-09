import { Editor } from "@tiptap/react"
import {
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare, Quote, Image as ImageIcon, Link2, 
  Minus, Table as TableIcon, AlignLeft, AlignCenter, AlignRight,
  Undo, Redo, Highlighter
} from "lucide-react"

export function EditorToolbar({ editor, onUploadImage }: { editor: Editor; onUploadImage: (file: File) => void }) {
  if (!editor) return null

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)
    if (url === null) return
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run()
  }

  const Btn = ({ icon: Icon, onClick, active, title }: any) => (
    <button 
      onClick={onClick} 
      type="button"
      title={title}
      className={`w-8 h-8 rounded shrink-0 flex justify-center items-center transition-colors ${
        active ? "bg-primary text-white" : "text-muted-foreground hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  )

  return (
    <div className="h-14 border-b border-white/5 bg-background/95 flex items-center gap-1 px-4 overflow-x-auto scroller-hide shrink-0 z-10 sticky top-0">
      <div className="flex items-center gap-1 border-r border-white/5 pr-2 mr-1">
        <Btn icon={Undo} onClick={() => editor.chain().focus().undo().run()} title="Undo" />
        <Btn icon={Redo} onClick={() => editor.chain().focus().redo().run()} title="Redo" />
      </div>

      <div className="flex items-center gap-1 border-r border-white/5 pr-2 mr-1">
        <Btn icon={Heading1} active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1" />
        <Btn icon={Heading2} active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2" />
        <Btn icon={Heading3} active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3" />
      </div>

      <div className="flex items-center gap-1 border-r border-white/5 pr-2 mr-1">
        <Btn icon={Bold} active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold" />
        <Btn icon={Italic} active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic" />
        <Btn icon={Strikethrough} active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough" />
        <Btn icon={Highlighter} active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Highlight" />
      </div>

      <div className="flex items-center gap-1 border-r border-white/5 pr-2 mr-1">
        <Btn icon={List} active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List" />
        <Btn icon={ListOrdered} active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered List" />
        <Btn icon={CheckSquare} active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} title="Task List" />
      </div>

      <div className="flex items-center gap-1 border-r border-white/5 pr-2 mr-1">
        <Btn icon={AlignLeft} active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Align Left" />
        <Btn icon={AlignCenter} active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Align Center" />
        <Btn icon={AlignRight} active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Align Right" />
      </div>

      <div className="flex items-center gap-1">
        <Btn icon={Quote} active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote" />
        <Btn icon={Code} active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code Block" />
        <Btn icon={Link2} active={editor.isActive('link')} onClick={setLink} title="Link" />
        <Btn icon={TableIcon} active={editor.isActive('table')} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Table" />
        <Btn icon={Minus} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider" />
        <div className="px-2">
          <input type="file" id="tiptap-img-upload" className="hidden" accept="image/*" onChange={e => {
            if (e.target.files?.[0]) onUploadImage(e.target.files[0])
            e.target.value = "" // reset
          }} />
          <label htmlFor="tiptap-img-upload" className="w-8 h-8 flex justify-center items-center rounded hover:bg-white/10 text-primary cursor-pointer transition-colors" title="Upload Image">
            <ImageIcon className="w-4 h-4" />
          </label>
        </div>
      </div>
    </div>
  )
}
