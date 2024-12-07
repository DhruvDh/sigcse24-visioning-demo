import { useEffect, useRef, useState } from 'react'
import { parseMarkdown } from '../../lib/utils/markdown'
import { clsx } from 'clsx'

interface MarkdownContainerProps {
  content: string
  isStreaming?: boolean
  className?: string
  variant?: 'default' | 'message'
}

export function MarkdownContainer({
  content,
  isStreaming = false,
  className,
  variant = 'default'
}: MarkdownContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [html, setHtml] = useState('')
  const processedContentRef = useRef<string>('')
  const lastContentRef = useRef<string>('')

  useEffect(() => {
    // Only process content if it has changed or if streaming is complete
    if (content !== lastContentRef.current || (!isStreaming && processedContentRef.current === '')) {
      lastContentRef.current = content
      processedContentRef.current = String.raw`${content}`
      
      const parsedHtml = parseMarkdown(processedContentRef.current)
      setHtml(parsedHtml)
    }

    if (isStreaming && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [content, isStreaming])

  return (
    <div
      ref={containerRef}
      className={clsx(
        'prose max-w-none',
        // Only apply default styling if not in message variant
        variant === 'default' && [
          'p-8 rounded-2xl',
          'bg-gradient-to-br from-gray-50 to-white',
          'shadow-sm',
        ],
        // Base typography
        'prose-headings:font-serif',
        'prose-p:font-sans',
        'prose-pre:font-mono',
        'prose-code:font-mono',
        // Size adjustments
        'prose-h1:text-4xl prose-h1:leading-tight',
        'prose-h2:text-3xl prose-h2:leading-tight',
        'prose-h3:text-2xl prose-h3:leading-tight',
        'prose-p:text-lg prose-p:leading-relaxed',
        'prose-pre:text-base',
        'prose-code:text-base',
        // Code block styling
        'prose-pre:bg-white/80 prose-pre:border prose-pre:border-slate-200',
        'prose-pre:rounded-lg prose-pre:shadow-sm',
        // Inline code styling
        'prose-code:bg-white/80 prose-code:px-1.5 prose-code:py-0.5',
        'prose-code:rounded-md prose-code:border prose-code:border-slate-200',
        // Math expressions
        '[&_.math]:font-serif [&_.math]:text-lg',
        '[&_.math-display]:my-6 [&_.math-display]:overflow-x-auto',
        '[&_.math-display]:text-center [&_.math-display]:px-4',
        '[&_.katex]:!text-slate-800',
        '[&_.katex-display]:shadow-sm [&_.katex-display]:py-4',
        '[&_.katex-display]:bg-white/50 [&_.katex-display]:rounded-lg',
        // Link styling
        'prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline',
        // Table styling
        'prose-table:border prose-table:border-slate-200',
        'prose-th:bg-white/80 prose-th:border prose-th:border-slate-200',
        'prose-td:border prose-td:border-slate-200',
        // Blockquote styling
        'prose-blockquote:border-slate-400 prose-blockquote:bg-white/50',
        'prose-blockquote:rounded-r-lg prose-blockquote:py-1',
        // Custom spacing
        '[&>:first-child]:mt-0 [&>:last-child]:mb-0',
        // Streaming indicator
        isStreaming && 'relative',
        // User provided classes
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

// Optional streaming cursor component
export function StreamingCursor() {
  return (
    <span 
      className="inline-block w-2 h-4 ml-1 align-middle bg-slate-400 animate-pulse"
      aria-hidden="true"
    />
  )
}

// Example usage with streaming:
export function StreamingMarkdown({ 
  content, 
  isComplete 
}: { 
  content: string
  isComplete: boolean 
}) {
  return (
    <div className="relative">
      <MarkdownContainer 
        content={content} 
        isStreaming={!isComplete}
      />
      {!isComplete && <StreamingCursor />}
    </div>
  )
} 