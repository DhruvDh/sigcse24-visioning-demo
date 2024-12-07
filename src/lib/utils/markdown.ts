import { micromark } from "micromark";
import { math, mathHtml } from "micromark-extension-math";

// Helper function to transform LaTeX delimiters
function transformLatexDelimiters(content: string): string {
  return content
    // Replace display math delimiters
    .replace(/\\\[\s*/g, '$$')
    .replace(/\s*\\\]/g, '$$')
    // Replace inline math delimiters
    .replace(/\\\(\s*/g, '$')
    .replace(/\s*\\\)/g, '$');
}

export function parseMarkdown(content: string): string {
  // Transform LaTeX delimiters first
  const transformedContent = transformLatexDelimiters(content);
  // Then ensure content is treated as a raw string
  const rawContent = String.raw`${transformedContent}`;

  return micromark(rawContent, {
    extensions: [
      math({
        singleDollarTextMath: true,
      }),
    ],
    htmlExtensions: [
      mathHtml({
        throwOnError: false,
        output: "mathml",
        trust: true,
      }),
    ],
  });
}
