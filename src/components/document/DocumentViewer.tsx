'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DocumentViewerProps {
  content: string;
  title: string;
}

export default function DocumentViewer({ content }: DocumentViewerProps) {
  return (
    <article className="prose prose-gray max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-6">{children}</h3>
          ),
          p: ({ children }) => <p className="text-gray-700 leading-7 mb-4">{children}</p>,
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono leading-6"
                {...props}
              >
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full border-collapse border border-gray-200">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-200 bg-gray-50 px-4 py-2 text-left text-sm font-semibold text-gray-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-200 px-4 py-2 text-sm text-gray-700">{children}</td>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700">{children}</ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-400 bg-blue-50 px-4 py-3 my-4 text-gray-700 rounded-r-md">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-600 hover:text-blue-800 underline"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
