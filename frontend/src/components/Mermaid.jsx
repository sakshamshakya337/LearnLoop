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

    const renderChart = async (code) => {
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, code);
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
        throw err;
      }
    };

    const attemptRender = async () => {
      try {
        await renderChart(chart);
      } catch (err) {
        console.warn("First Mermaid render failed, attempting auto-repair...", err);
        
        // Basic Auto-Repair: Try to wrap unquoted labels [...] and (...) in quotes
        // This targets the specific issue identified: ID[Label with (sh) / chars] -> ID["Label with (sh) / chars"]
        const repairedChart = chart.replace(/(\w+)\s*(\[|\()([^"\]\)]+)(\]|(\)))/g, (match, id, open, content, close) => {
          return `${id}${open}"${content.trim()}"${close}`;
        });

        if (repairedChart !== chart) {
          try {
            await renderChart(repairedChart);
            console.log("Mermaid auto-repair successful.");
            return;
          } catch (repairErr) {
            console.error("Mermaid repair also failed:", repairErr);
          }
        }

        if (ref.current) {
          ref.current.innerHTML = `
            <div style="color: #ff6b6b; padding: 30px; text-align: center; border: 1px dashed rgba(255,107,107,0.3); border-radius: 20px; background: rgba(255,107,107,0.03);">
              <p style="font-weight: 800; margin-bottom: 8px; font-size: 16px;">Diagram Syntax Error</p>
              <p style="font-size: 13px; opacity: 0.8; margin-bottom: 20px;">The AI-generated diagram code contains a syntax violation.</p>
              <button onclick="navigator.clipboard.writeText(\`${chart.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`); this.innerText='Copied!';" 
                style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 8px 16px; borderRadius: 8px; cursor: pointer; font-size: 12px; font-weight: 600;">
                Copy Raw Code
              </button>
            </div>`;
        }
      }
    };

    attemptRender();
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
