
import { BookDesign, BinderItem } from "../types";

// Helper to check if a node is a header
const isHeader = (tagName: string) => ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(tagName);

/**
 * Applies a BookDesign to a single HTML string.
 * This function parses the HTML, walks the DOM, and applies specific CSS styles/classes
 * while preserving the actual content.
 */
export const formatHtmlContent = (html: string, design: BookDesign): string => {
    if (!html) return '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;

    // We process direct children to handle paragraph flow logic
    const nodes = Array.from(body.children);
    
    // State for processing
    let isFirstParagraphAfterHeader = true; // Start true for the very first paragraph of doc

    nodes.forEach((node) => {
        const el = node as HTMLElement;
        const tagName = el.tagName;

        // --- Clean existing specific styles to ensure fresh application ---
        el.style.textIndent = '';
        el.style.marginBottom = '';
        el.style.marginTop = '';
        el.style.fontFamily = '';
        el.style.fontSize = '';
        el.style.textAlign = '';
        el.style.lineHeight = '';

        // --- Apply Headings ---
        if (isHeader(tagName)) {
            el.style.fontFamily = design.styles.fontHeading;
            el.style.fontWeight = '700';
            el.style.marginBottom = '1.5em';
            el.style.marginTop = '2em';
            el.style.lineHeight = '1.2';
            
            if (design.styles.headingUppercase) {
                el.style.textTransform = 'uppercase';
                el.style.letterSpacing = '0.05em';
            } else {
                el.style.textTransform = 'none';
                el.style.letterSpacing = 'normal';
            }

            // Reset paragraph flow logic
            isFirstParagraphAfterHeader = true;
        }

        // --- Apply Paragraphs ---
        if (tagName === 'P') {
            el.style.fontFamily = design.styles.fontBody;
            el.style.fontSize = design.styles.fontSize;
            el.style.lineHeight = '1.7'; // Comfortable reading height
            
            // Justification
            el.style.textAlign = design.styles.justify ? 'justify' : 'left';

            // Indentation vs Block Spacing
            if (design.styles.paragraphSpacing) {
                // Modern/Block style
                el.style.marginBottom = '1em';
                el.style.textIndent = '0';
            } else {
                // Classic/Indented style
                el.style.marginBottom = '0'; // No space between paragraphs
                
                if (design.styles.paragraphIndent && !isFirstParagraphAfterHeader) {
                    el.style.textIndent = '2em';
                } else {
                    el.style.textIndent = '0';
                }
            }

            // Drop Caps
            // We use a span wrapper for the first letter if needed, 
            // cleaning up old drop caps first.
            const oldDropCap = el.querySelector('.drop-cap');
            if (oldDropCap) {
                // simple unwrap logic: preserve text
                const text = oldDropCap.textContent || '';
                oldDropCap.replaceWith(document.createTextNode(text));
                el.normalize(); // merge text nodes
            }

            if (design.styles.dropCap && isFirstParagraphAfterHeader && el.textContent && el.textContent.length > 0) {
                // Create drop cap
                // Note: Direct HTML manipulation is safer than CSS pseudo-elements for contentEditable/export
                const text = el.textContent;
                const firstChar = text.charAt(0);
                const rest = text.slice(1);
                
                el.innerHTML = `<span class="drop-cap" style="float: left; font-size: 3.5em; line-height: 0.8; padding-top: 4px; padding-right: 8px; font-family: ${design.styles.fontHeading}; font-weight: bold;">${firstChar}</span>${rest}`;
            }

            isFirstParagraphAfterHeader = false;
        }
        
        // --- Lists & Blockquotes ---
        if (tagName === 'UL' || tagName === 'OL') {
             el.style.fontFamily = design.styles.fontBody;
             el.style.marginBottom = '1em';
             el.style.paddingLeft = '2em';
             isFirstParagraphAfterHeader = false;
        }
        if (tagName === 'BLOCKQUOTE') {
            el.style.fontFamily = design.styles.fontBody;
            el.style.fontStyle = 'italic';
            el.style.borderLeft = '4px solid #e5e7eb';
            el.style.paddingLeft = '1em';
            el.style.marginLeft = '1em';
            el.style.marginBottom = '1em';
            isFirstParagraphAfterHeader = false;
        }
    });

    return body.innerHTML;
};

/**
 * Recursively applies the design to a tree of BinderItems.
 */
export const applyDesignToBinder = (items: BinderItem[], design: BookDesign): BinderItem[] => {
    return items.map(item => {
        const newItem = { ...item };

        if (newItem.type === 'document' && newItem.content) {
            newItem.content = formatHtmlContent(newItem.content, design);
        }

        if (newItem.children) {
            newItem.children = applyDesignToBinder(newItem.children, design);
        }

        return newItem;
    });
};
