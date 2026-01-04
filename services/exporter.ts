
export const exportToFDX = (title: string, contentHtml: string): string => {
    // Basic FDX Template Structure
    const header = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<FinalDraft DocumentType="Script" Template="No" Version="4">
  <Content>`;
    const footer = `  </Content>
</FinalDraft>`;

    // Parse HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentHtml, 'text/html');
    const nodes = doc.body.childNodes;

    let xmlContent = '';

    nodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const el = node as HTMLElement;
        let type = "Action";
        
        // Clean text content
        let text = el.innerText || '';
        text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Determine FDX Type based on CSS classes or Tags
        if (el.classList.contains('script-scene') || el.tagName === 'H3') {
            type = "Scene Heading";
            text = text.toUpperCase();
        }
        else if (el.classList.contains('script-character')) {
            type = "Character";
            text = text.toUpperCase();
        }
        else if (el.classList.contains('script-parenthetical')) {
            type = "Parenthetical";
        }
        else if (el.classList.contains('script-dialogue')) {
            type = "Dialogue";
        }
        else if (el.classList.contains('script-transition')) {
            type = "Transition";
            text = text.toUpperCase();
        }
        else if (el.tagName === 'H1' || el.tagName === 'H2') {
            // Map general headings to Action or General for now to avoid breaking flow
            type = "General"; 
        }

        xmlContent += `
    <Paragraph Type="${type}">
      <Text>${text}</Text>
    </Paragraph>`;
    });

    return header + xmlContent + footer;
};
