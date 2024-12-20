import { micromark } from "micromark";
import { math, mathHtml } from "micromark-extension-math";
import { gfm, gfmHtml } from "micromark-extension-gfm";

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
  const transformedContent = transformLatexDelimiters(content);
  const rawContent = transformedContent;

  return micromark(rawContent, {
    extensions: [
      gfm(),
      math({ singleDollarTextMath: true }),
    ],
    htmlExtensions: [
      gfmHtml(),
      mathHtml({
        throwOnError: false,
        output: "mathml",
        trust: true,
      }),
    ],
  });
}
