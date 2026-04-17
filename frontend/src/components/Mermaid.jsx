import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark", // Tailored for LearnLoop's dark aesthetics
  securityLevel: 'loose',
  fontFamily: 'Sora, sans-serif',
});

export default function Mermaid({ chart }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!chart || !ref.current) return;

    // Clear previous render to avoid duplicate SVGs
    ref.current.innerHTML = "";

    try {
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      mermaid.render(id, chart).then(({ svg }) => {
        if (ref.current) {
          ref.current.innerHTML = svg;
          
          // Apply some custom styling to the SVG for a premium feel
          const svgElement = ref.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.maxWidth = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.display = 'block';
            svgElement.style.margin = '0 auto';
          }
        }
      });
    } catch (err) {
      console.error("Mermaid render error:", err);
      ref.current.innerHTML = `<div style="color: #ff6b6b; padding: 20px; text-align: center; border: 1px dashed rgba(255,107,107,0.3); border-radius: 12px;">
        <p style="font-weight: 700;">Diagram Render Error</p>
        <p style="font-size: 12px; opacity: 0.7;">The generated diagram code has a syntax issue.</p>
      </div>`;
    }
  }, [chart]);

  return (
    <div 
      ref={ref} 
      style={{ 
        width: '100%', 
        overflowX: 'auto', 
        padding: '20px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.05)',
        minHeight: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }} 
    />
  );
}
