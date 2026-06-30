'use client';

import React, { useState, useRef } from 'react';
import { mockRevenueData, formatFCFA } from '../lib/data';

interface InteractiveChartProps {
  currency?: string;
}

export default function InteractiveChart({ currency = 'GNF' }: InteractiveChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const width = 600;
  const height = 180;
  const paddingLeft = 70;
  const paddingRight = 20;
  const paddingTop = 15;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const isGNF = currency === 'GNF';
  const isUSD = currency === 'USD';

  // Scaling logic based on currency
  const scaleFactor = isUSD ? 10000 : isGNF ? 1 : 10;
  const maxValue = isUSD ? 8000 : isGNF ? 80000000 : 8000000;

  // Y-axis grid values
  const yGridValues = isUSD 
    ? [0, 2000, 4000, 6000, 8000]
    : isGNF 
      ? [0, 20000000, 40000000, 60000000, 80000000]
      : [0, 2000000, 4000000, 6000000, 8000000];

  // Calculate coordinates
  const points = mockRevenueData.map((d, i) => {
    const x = paddingLeft + i * (chartWidth / (mockRevenueData.length - 1));
    const scaledInvoiced = d.invoiced / scaleFactor;
    const scaledPaid = d.paid / scaleFactor;
    const yInvoiced = height - paddingBottom - (scaledInvoiced / maxValue) * chartHeight;
    const yPaid = height - paddingBottom - (scaledPaid / maxValue) * chartHeight;
    return { x, yInvoiced, yPaid, scaledInvoiced, scaledPaid, ...d };
  });

  // SVG Path generation
  const buildPath = (type: 'invoiced' | 'paid') => {
    return points.map((p, i) => {
      const y = type === 'invoiced' ? p.yInvoiced : p.yPaid;
      return `${i === 0 ? 'M' : 'L'} ${p.x} ${y}`;
    }).join(' ');
  };

  const buildAreaPath = (type: 'invoiced' | 'paid') => {
    const linePath = buildPath(type);
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const baseY = height - paddingBottom;
    return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    
    // Scale coordinate to SVG viewBox
    const viewBoxX = (clientX / rect.width) * width;
    
    // Find closest point
    const step = chartWidth / (mockRevenueData.length - 1);
    const approxIndex = (viewBoxX - paddingLeft) / step;
    const closestIndex = Math.min(
      mockRevenueData.length - 1,
      Math.max(0, Math.round(approxIndex))
    );
    
    setHoveredIndex(closestIndex);
    
    // Calculate tooltip position (translate SVG viewBox coord to screen relative to parent)
    const activePoint = points[closestIndex];
    const screenX = (activePoint.x / width) * rect.width;
    const screenY = (Math.min(activePoint.yInvoiced, activePoint.yPaid) / height) * rect.height;
    
    setTooltipPos({ x: screenX, y: screenY - 10 });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl flex flex-col relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200">
            Flux de Facturation & Encaissements
          </h3>
          <p className="text-xs text-slate-450 dark:text-zinc-500 font-medium mt-0.5">
            Évolution comparative du facturé vs encaissé (6 derniers mois)
          </p>
        </div>
        
        {/* Legends */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 block" />
            <span className="text-slate-650 dark:text-zinc-400">Facturé</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 block" />
            <span className="text-slate-650 dark:text-zinc-400">Encaissé</span>
          </div>
        </div>
      </div>

      {/* Chart Wrapper */}
      <div className="relative flex-1 min-h-[160px]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible select-none cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Definitions for gradients */}
          <defs>
            <linearGradient id="grad-invoiced" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="grad-paid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {yGridValues.map((val) => {
            const y = height - paddingBottom - (val / maxValue) * chartHeight;
            return (
              <g key={val} className="opacity-40 dark:opacity-20">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fontWeight="bold"
                  className="fill-slate-400 dark:fill-zinc-550 font-sans"
                >
                  {val === 0 ? '0' : val >= 1000000 ? `${val / 1000000}M` : val}
                </text>
              </g>
            );
          })}

          {/* X Axis Labels */}
          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={height - paddingBottom + 20}
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              className="fill-slate-400 dark:fill-zinc-500 font-sans"
            >
              {p.month}
            </text>
          ))}

          {/* Areas */}
          <path d={buildAreaPath('invoiced')} fill="url(#grad-invoiced)" />
          <path d={buildAreaPath('paid')} fill="url(#grad-paid)" />

          {/* Lines */}
          <path
            d={buildPath('invoiced')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={buildPath('paid')}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Guides and Circles */}
          {hoveredIndex !== null && (
            <g>
              {/* Vertical helper line */}
              <line
                x1={points[hoveredIndex].x}
                y1={paddingTop}
                x2={points[hoveredIndex].x}
                y2={height - paddingBottom}
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="2 2"
                className="opacity-70 dark:opacity-40"
              />
              
              {/* Invoiced Highlight Circle */}
              <circle
                cx={points[hoveredIndex].x}
                cy={points[hoveredIndex].yInvoiced}
                r="6"
                fill="#ffffff"
                stroke="#3b82f6"
                strokeWidth="3"
              />
              {/* Paid Highlight Circle */}
              <circle
                cx={points[hoveredIndex].x}
                cy={points[hoveredIndex].yPaid}
                r="6"
                fill="#ffffff"
                stroke="#10b981"
                strokeWidth="3"
              />
            </g>
          )}
        </svg>

        {/* Dynamic HTML Tooltip */}
        {hoveredIndex !== null && (
          <div
            className="absolute z-35 bg-slate-950/95 text-white dark:bg-zinc-900/98 border border-zinc-850 dark:border-zinc-800 rounded-xl p-3 shadow-md text-[11px] pointer-events-none -translate-x-1/2 -translate-y-full flex flex-col gap-1 transition-all duration-75 min-w-[150px]"
            style={{ left: tooltipPos.x, top: tooltipPos.y }}
          >
            <div className="font-bold text-slate-350 dark:text-zinc-400 border-b border-zinc-800 pb-1 mb-1">
              Mois : {mockRevenueData[hoveredIndex].month} 2026
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-400 font-semibold">Facturé :</span>
              <span className="font-bold">{formatFCFA(points[hoveredIndex].scaledInvoiced, currency)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-400 font-semibold">Encaissé :</span>
              <span className="font-bold">{formatFCFA(points[hoveredIndex].scaledPaid, currency)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
