"use client"

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import CharacterCount from '@tiptap/extension-character-count'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import { TaskList, TaskItem } from '@tiptap/extension-list'
import DOMPurify from 'isomorphic-dompurify'

import { useEffect, useCallback } from 'react'
import { EditorToolbar } from './editor-toolbar'

interface Props {
  content: string
  onChange: (html: string) => void
  onUploadImage: (file: File) => Promise<string | null>
}

export function TiptapEditor({ content, onChange, onUploadImage }: Props) {
  
  // Clean initialization context to avoid hydration mismatch
  const sanitizedContent = typeof window !== 'undefined' ? DOMPurify.sanitize(content) : content

  const handleUploadInsert = useCallback(async (file: File, view: any, coords?: { x: number, y: number }) => {
    const url = await onUploadImage(file)
    if (!url) return
    const { schema } = view.state
    const node = schema.nodes.image.create({ src: url })
    const tr = view.state.tr
    if (coords) {
      const pos = view.posAtCoords(coords)
      if (pos) {
        tr.insert(pos.pos, node)
      } else {
        tr.replaceSelectionWith(node)
      }
    } else {
      tr.replaceSelectionWith(node)
    }
    view.dispatch(tr)
  }, [onUploadImage])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      Typography,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      CharacterCount.configure({ limit: 50000 }),
      Image.configure({ inline: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer nofollow' } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: 'Press / for commands, or Start writing...' })
    ],
    content: sanitizedContent,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[500px]',
      },
      handlePaste: (view, event) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files.length > 0) {
          event.preventDefault()
          handleUploadInsert(event.clipboardData.files[0], view)
          return true
        }
        return false
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          event.preventDefault()
          handleUploadInsert(event.dataTransfer.files[0], view, { x: event.clientX, y: event.clientY })
          return true
        }
        return false
      }
    },
    onUpdate: ({ editor }) => {
      // Return clean HTML back to parent. We sanitize on receive in parent, but tiptap deals with AST safely.
      onChange(editor.getHTML())
    }
  })

  // Synchronize content exclusively upon active external replacement (like initial load)
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content && !editor.isFocused) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) return null

  return (
    <div className="flex flex-col w-full h-full bg-background border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
      <EditorToolbar editor={editor} onUploadImage={(file) => handleUploadInsert(file, editor.view)} />

      <div className="flex-1 overflow-y-auto px-8 py-10 scroller-hide bg-[#060b18]/40">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
