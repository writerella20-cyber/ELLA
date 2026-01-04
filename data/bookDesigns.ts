
import { BookDesign } from "../types";

export const BOOK_DESIGNS: BookDesign[] = [
    {
        id: 'classic-novel',
        name: 'Classic Novel',
        description: 'Traditional formatting with serifs, indented paragraphs, and no spacing between paragraphs. Perfect for fiction.',
        previewColor: '#fdf6e3',
        styles: {
            fontBody: "'Georgia', serif",
            fontHeading: "'Playfair Display', serif",
            paragraphIndent: true,
            paragraphSpacing: false,
            dropCap: true,
            justify: true,
            headingUppercase: true,
            fontSize: "1.125rem" // 18px
        }
    },
    {
        id: 'modern-clean',
        name: 'Modern Clean',
        description: 'Contemporary sans-serif look with block paragraphs. Ideal for non-fiction, memoirs, or tech thrillers.',
        previewColor: '#ffffff',
        styles: {
            fontBody: "'Inter', sans-serif",
            fontHeading: "'Inter', sans-serif",
            paragraphIndent: false,
            paragraphSpacing: true,
            dropCap: false,
            justify: false,
            headingUppercase: false,
            fontSize: "1rem" // 16px
        }
    },
    {
        id: 'literary-serif',
        name: 'Literary',
        description: 'Elegant and airy. Uses distinct serifs with generous line height.',
        previewColor: '#fafafa',
        styles: {
            fontBody: "'Times New Roman', serif",
            fontHeading: "'Georgia', serif",
            paragraphIndent: true,
            paragraphSpacing: false,
            dropCap: false,
            justify: true,
            headingUppercase: false,
            fontSize: "1.25rem" // 20px
        }
    },
    {
        id: 'typewriter-draft',
        name: 'The Draft',
        description: 'Monospaced aesthetic resembling a raw manuscript or screenplay.',
        previewColor: '#f3f4f6',
        styles: {
            fontBody: "'Courier Prime', monospace",
            fontHeading: "'Courier Prime', monospace",
            paragraphIndent: false,
            paragraphSpacing: true,
            dropCap: false,
            justify: false,
            headingUppercase: true,
            fontSize: "1rem"
        }
    }
];
