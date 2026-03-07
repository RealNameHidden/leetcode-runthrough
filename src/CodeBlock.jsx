import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function CodeBlock({ children, language = 'java' }) {
  return (
    <SyntaxHighlighter
      language={language}
      style={atomDark}
      customStyle={{
        borderRadius: '0.5rem',
        fontSize: '0.75rem',
        lineHeight: '1.75',
        margin: 0,
        padding: '1rem',
      }}
      showLineNumbers={false}
      wrapLongLines={false}
    >
      {children.trim()}
    </SyntaxHighlighter>
  )
}
