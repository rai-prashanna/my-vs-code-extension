import React, { useEffect, useRef, useId } from 'react';
import mermaid from 'mermaid';

interface MermaidChartProps {
  chart: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
});

const MermaidChart: React.FC<MermaidChartProps> = ({ chart }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const uniqueId = useId(); // ensures uniqueness across renders

  useEffect(() => {
    const renderMermaid = async () => {
      if (chartRef.current) {
        try {
          const { svg } = await mermaid.render(`mermaid-${uniqueId}`, chart);
          chartRef.current.innerHTML = svg;
        } catch (error: any) {
          chartRef.current.innerHTML = `<pre style="color: red;">${error.message}</pre>`;
        }
      }
    };

    renderMermaid();
  }, [chart, uniqueId]); // include uniqueId in deps to avoid stale closures

  return <div ref={chartRef} />;
};

export default MermaidChart;
