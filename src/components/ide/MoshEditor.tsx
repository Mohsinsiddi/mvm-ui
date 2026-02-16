import { useRef, useEffect } from 'react'
import Editor, { OnMount, BeforeMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'

interface MoshEditorProps {
  value: string
  onChange: (value: string) => void
  onCursorChange?: (line: number, column: number) => void
}

// Register Mosh language before Monaco mounts
const handleBeforeMount: BeforeMount = (monaco) => {
  // Register Mosh language
  monaco.languages.register({ id: 'mosh' })

  // Monarch tokenizer for syntax highlighting
  monaco.languages.setMonarchTokensProvider('mosh', {
    keywords: [
      'forge', 'fn', 'let', 'map', 'guard', 'signal', 'vault', 'seal', 'pub', 'mut',
      'if', 'else', 'return', 'transfer',
      // Backwards compat
      'contract', 'function', 'mapping', 'require', 'emit', 'view', 'write', 'payable', 'onlyOwner', 'returns',
    ],
    typeKeywords: [
      'u256', 'u128', 'u64', 'u32', 'u16', 'u8',
      'uint256', 'uint128', 'uint64', 'uint8', 'int256',
      'string', 'address', 'bool',
    ],
    constants: ['true', 'false'],
    operators: [
      '+=', '-=', '*=', '/=', '%=', '=>', '->', '==', '!=', '>=', '<=', '>', '<', '=', '+', '-', '*', '/', '%',
    ],

    symbols: /[=><!~?:&|+\-*\/\^%]+/,

    tokenizer: {
      root: [
        // Special values
        [/msg\.sender|msg\.value/, 'variable.special'],
        [/block\.height|block\.timestamp/, 'variable.special'],
        [/mosh\.balance|mosh\.height|mosh\.time/, 'variable.special'],
        [/contract\.owner|contract\.address/, 'variable.special'],

        // Identifiers and keywords
        [/[a-zA-Z_]\w*/, {
          cases: {
            '@keywords': 'keyword',
            '@typeKeywords': 'type',
            '@constants': 'constant',
            '@default': 'identifier',
          },
        }],

        // Whitespace
        { include: '@whitespace' },

        // Delimiters
        [/[{}()\[\]]/, '@brackets'],
        [/[;,.]/, 'delimiter'],

        // Operators
        [/@symbols/, {
          cases: {
            '@operators': 'operator',
            '@default': '',
          },
        }],

        // Numbers
        [/\d+/, 'number'],

        // Strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/"/, 'string', '@string_double'],
        [/'([^'\\]|\\.)*$/, 'string.invalid'],
        [/'/, 'string', '@string_single'],
      ],

      whitespace: [
        [/[ \t\r\n]+/, 'white'],
        [/\/\/.*$/, 'comment'],
        [/\/\*/, 'comment', '@comment'],
      ],

      comment: [
        [/[^\/*]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/[\/*]/, 'comment'],
      ],

      string_double: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, 'string', '@pop'],
      ],

      string_single: [
        [/[^\\']+/, 'string'],
        [/\\./, 'string.escape'],
        [/'/, 'string', '@pop'],
      ],
    },
  })

  // Custom theme: mosh-dark
  monaco.editor.defineTheme('mosh-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '7B2CBF', fontStyle: 'bold' },
      { token: 'type', foreground: '00FF88' },
      { token: 'constant', foreground: 'E040FB' },
      { token: 'variable.special', foreground: '9D4EDD', fontStyle: 'italic' },
      { token: 'string', foreground: 'FFB800' },
      { token: 'string.escape', foreground: 'E040FB' },
      { token: 'number', foreground: 'FF3366' },
      { token: 'comment', foreground: '505070', fontStyle: 'italic' },
      { token: 'operator', foreground: '00F0FF' },
      { token: 'delimiter', foreground: '9090B0' },
      { token: 'identifier', foreground: 'E0E0FF' },
      { token: '@brackets', foreground: '9090B0' },
    ],
    colors: {
      'editor.background': '#0d1117',
      'editor.foreground': '#E0E0FF',
      'editor.lineHighlightBackground': '#150734',
      'editor.selectionBackground': '#7B2CBF40',
      'editorCursor.foreground': '#00F0FF',
      'editorLineNumber.foreground': '#505070',
      'editorLineNumber.activeForeground': '#9D4EDD',
      'editor.selectionHighlightBackground': '#7B2CBF20',
      'editorIndentGuide.background': '#1A0A45',
      'editorIndentGuide.activeBackground': '#7B2CBF40',
      'editorWidget.background': '#0D0221',
      'editorSuggestWidget.background': '#150734',
      'editorSuggestWidget.border': '#7B2CBF40',
      'editorSuggestWidget.selectedBackground': '#7B2CBF30',
      'list.hoverBackground': '#1A0A45',
    },
  })

  // Autocomplete provider
  monaco.languages.registerCompletionItemProvider('mosh', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      }

      const suggestions = [
        // Contract structure
        { label: 'forge', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'forge ${1:Name} {\n\t$0\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Define a Mosh contract', range },
        { label: 'fn', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'fn ${1:name}(${2}) ${3:mut} {\n\t$0\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Define a function', range },
        { label: 'let', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'let ${1:name}: ${2:u256} = ${3:0};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Declare a state variable', range },
        { label: 'map', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'map ${1:name}: ${2:address} => ${3:u256};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Declare a mapping', range },

        // Unique keywords
        { label: 'guard', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'guard(${1:condition}, "${2:error message}");', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Guard against invalid state', range },
        { label: 'signal', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'signal ${1:EventName}(${2:args});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Signal an event to the chain', range },
        { label: 'transfer', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'transfer(${1:to}, ${2:amount});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Transfer tokens from contract', range },

        // Modifiers
        { label: 'mut', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'mut', detail: 'State-mutating function', range },
        { label: 'pub', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'pub', detail: 'Read-only/view function', range },
        { label: 'vault', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'vault', detail: 'Function can receive tokens (payable)', range },
        { label: 'seal', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'seal', detail: 'Owner-only function', range },

        // Control flow
        { label: 'if', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'if (${1:condition}) {\n\t$0\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Conditional branch', range },
        { label: 'return', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'return ${1:value};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Return value', range },

        // Types
        { label: 'u256', kind: monaco.languages.CompletionItemKind.TypeParameter, insertText: 'u256', detail: 'Unsigned 256-bit integer', range },
        { label: 'u64', kind: monaco.languages.CompletionItemKind.TypeParameter, insertText: 'u64', detail: 'Unsigned 64-bit integer', range },
        { label: 'address', kind: monaco.languages.CompletionItemKind.TypeParameter, insertText: 'address', detail: 'MVM address type', range },
        { label: 'string', kind: monaco.languages.CompletionItemKind.TypeParameter, insertText: 'string', detail: 'String type', range },
        { label: 'bool', kind: monaco.languages.CompletionItemKind.TypeParameter, insertText: 'bool', detail: 'Boolean type', range },

        // Special values
        { label: 'msg.sender', kind: monaco.languages.CompletionItemKind.Variable, insertText: 'msg.sender', detail: 'Address of the caller', range },
        { label: 'msg.value', kind: monaco.languages.CompletionItemKind.Variable, insertText: 'msg.value', detail: 'Tokens sent with call', range },
        { label: 'mosh.balance', kind: monaco.languages.CompletionItemKind.Variable, insertText: 'mosh.balance', detail: "Contract's token balance", range },
        { label: 'mosh.height', kind: monaco.languages.CompletionItemKind.Variable, insertText: 'mosh.height', detail: 'Current block height', range },
        { label: 'mosh.time', kind: monaco.languages.CompletionItemKind.Variable, insertText: 'mosh.time', detail: 'Current block timestamp', range },
        { label: 'block.height', kind: monaco.languages.CompletionItemKind.Variable, insertText: 'block.height', detail: 'Current block height', range },
        { label: 'block.timestamp', kind: monaco.languages.CompletionItemKind.Variable, insertText: 'block.timestamp', detail: 'Current block timestamp', range },
      ]

      return { suggestions }
    },
  })
}

export default function MoshEditor({ value, onChange, onCursorChange }: MoshEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor
    editor.focus()

    if (onCursorChange) {
      editor.onDidChangeCursorPosition((e) => {
        onCursorChange(e.position.lineNumber, e.position.column)
      })
    }
  }

  return (
    <Editor
      height="100%"
      defaultLanguage="mosh"
      theme="mosh-dark"
      value={value}
      onChange={(val) => onChange(val || '')}
      onMount={handleMount}
      beforeMount={handleBeforeMount}
      options={{
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontLigatures: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        renderLineHighlight: 'line',
        tabSize: 4,
        insertSpaces: true,
        automaticLayout: true,
        bracketPairColorization: { enabled: true },
        padding: { top: 16, bottom: 16 },
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
      }}
    />
  )
}
