import React, { useEffect, useMemo, useCallback } from 'react'
import { createEditor, Editor, Node } from 'slate'
import { Slate, withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { pipe, TablePlugin, EditablePlugins } from '@udecode/slate-plugins'
import isHotkey from 'is-hotkey'

import theme from '@/theme'
import PostBodyStyles from '@/components/PostBodyStyles'
import Toolbar from './Toolbar'
import { useTranslation } from '@/config/i18n'
import RenderElement from './RenderElement'
import RenderLeaf from './RenderLeaf'
import {
  withLinks,
  withImages,
  toggleMark,
  options,
  MarkType,
} from './helpers'

/**
 * The Journaly Rich Text Editor
 *   Uses the Slate library to build a delightful
 *   rich text editing experience that allows users
 *   to craft & format beautiful posts themselves.
 */

type HotKey = 'mod+b' | 'mod+i' | 'mod+u'

const HOTKEYS: { [key in HotKey]: MarkType } = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
}

type JournalyEditorProps = {
  value: Node[]
  setValue: (value: Node[]) => void
  slateRef: React.RefObject<Editor>
  allowInlineImages: boolean
  disabled?: boolean
}
const plugins = [TablePlugin(options)]

const JournalyEditor = ({
  value,
  setValue,
  slateRef,
  disabled,
  allowInlineImages,
}: JournalyEditorProps) => {
  const { t } = useTranslation('common')
  const renderElement = useCallback((props) => <RenderElement {...props} />, [])
  const renderLeaf = useCallback((props) => <RenderLeaf {...props} />, [])
  const editor = useMemo(() => {
    const withPlugins = [
      withHistory,
      withLinks,
    ]

    if (allowInlineImages) {
      withPlugins.push(withImages)
    }

    return pipe(withReact(createEditor()), ...withPlugins)
  }, [])

  useEffect(() => {
    ;(slateRef as React.MutableRefObject<Editor>).current = editor
  }, [editor])

  return (
    <div className="editor-wrapper">
      <div className="editor-container">
        <Slate editor={editor} value={value} onChange={(value) => setValue(value)}>
          <Toolbar allowInlineImages={allowInlineImages} />
          <EditablePlugins
            plugins={plugins}
            renderElement={[renderElement]}
            renderLeaf={[renderLeaf]}
            placeholder={t('editor.placeholderPrompt')}
            readOnly={disabled}
            spellCheck
            onKeyDown={[
              (event: React.KeyboardEvent) => {
                Object.entries(HOTKEYS).forEach(([hotkey, mark]) => {
                  // Convert React keyboard event to native keyboard event
                  if (isHotkey(hotkey, (event as unknown) as KeyboardEvent)) {
                    event.preventDefault()
                    toggleMark(editor, mark)
                  }
                })
              },
            ]}
          />
        </Slate>
      </div>
      <PostBodyStyles parentClassName="editor-container" />
      <style jsx>{`
        .editor-container {
          padding: 0 25px 10px;
          border: 1px solid ${theme.colors.black};
          border-radius: 5px;
          background-color: ${theme.colors.white};
          opacity: ${disabled ? 0.6 : 'auto'};
        }

        .editor-container > :global([contenteditable="true"]) {
          min-height: 200px;
        }
      `}</style>
    </div>
  )
}

export default JournalyEditor
