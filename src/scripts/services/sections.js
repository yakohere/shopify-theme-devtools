class SectionHighlighter {
  constructor() {
    this.overlay = null;
    this.currentSection = null;
  }

  init() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'tdt-section-overlay';
    Object.assign(this.overlay.style, {
      position: 'fixed',
      pointerEvents: 'none',
      border: '2px solid #3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      zIndex: '2147483646',
      display: 'none',
      transition: 'all 0.2s ease'
    });
    document.body.appendChild(this.overlay);
  }

  findSections() {
    const sections = [];
    
    const shopifySections = Array.from(document.querySelectorAll('[id^="shopify-section-"]'));
    shopifySections.forEach(el => {
      const id = el.id.replace('shopify-section-', '');
      const type = el.dataset.sectionType || el.className.match(/section-(\w+)/)?.[1] || 'unknown';
      const blocks = Array.from(el.querySelectorAll('[data-block-id], [id*="block"]'));
      
      sections.push({
        id,
        type,
        element: el,
        blockCount: blocks.length,
        rect: el.getBoundingClientRect()
      });
    });

    const dataSections = Array.from(document.querySelectorAll('[data-section-id]'));
    dataSections.forEach(el => {
      const id = el.dataset.sectionId;
      if (!sections.find(s => s.id === id)) {
        const type = el.dataset.sectionType || 'unknown';
        const blocks = Array.from(el.querySelectorAll('[data-block-id]'));
        
        sections.push({
          id,
          type,
          element: el,
          blockCount: blocks.length,
          rect: el.getBoundingClientRect()
        });
      }
    });

    return sections;
  }

  highlight(sectionId) {
    const sections = this.findSections();
    const section = sections.find(s => s.id === sectionId);
    
    if (!section || !section.element) {
      this.hide();
      return;
    }

    const rect = section.element.getBoundingClientRect();
    
    Object.assign(this.overlay.style, {
      display: 'block',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`
    });

    this.currentSection = sectionId;

    section.element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  }

  hide() {
    if (this.overlay) {
      this.overlay.style.display = 'none';
    }
    this.currentSection = null;
  }

  destroy() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}

export const sectionHighlighter = new SectionHighlighter();
