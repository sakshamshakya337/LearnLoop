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

    // Clear previous render
    ref.current.innerHTML = "";

    const renderChart = async () => {
      try {
        // Pre-processing: Strip common LLM markdown artifacts without touching syntax
        let cleanChart = chart
          .replace(/```mermaid/g, '')
          .replace(/```/g, '')
          .trim();

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, cleanChart);
        
        if (ref.current) {
          ref.current.innerHTML = svg;
          const svgElement = ref.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.maxWidth = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.display = 'block';
            svgElement.style.margin = '0 auto';
          }
        }
      } catch (err) {
        console.error("Mermaid render error:", err);
        if (ref.current) {
          ref.current.innerHTML = `
            <div style="color: #ff6b6b; padding: 30px; text-align: center; border: 1px dashed rgba(255,107,107,0.3); border-radius: 20px; background: rgba(255,107,107,0.03); width: 100%;">
              <p style="font-weight: 800; margin-bottom: 8px; font-size: 16px;">Diagram Render Error</p>
              <p style="font-size: 12px; opacity: 0.7; margin-bottom: 20px; max-width: 400px; margin-left: auto; margin-right: auto;">
                The AI generated code that Mermaid couldn't parse. This usually happens with complex special characters.
              </p>
              
              <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 12px; margin-bottom: 20px; text-align: left; overflow-x: auto;">
                <code style="font-size: 11px; color: #aaa; white-space: pre;">${chart}</code>
              </div>

              <button onclick="navigator.clipboard.writeText(\`${chart.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`); this.innerText='Copied!';" 
                style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;">
                Copy Code for Debugging
              </button>
            </div>`;
        }
      }
    };

    renderChart();
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
