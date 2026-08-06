import React, { useState, useRef } from 'react';
import { Icons } from '../Icons';

export interface DonutItem {
  name: string;
  value: number;
  color: string;
  icon: string;
}

interface DonutChartProps {
  title: string;
  badgeText?: string;
  totalLabel: string;
  totalAmount: number;
  items: DonutItem[];
  currencySymbol: string;
  emptyMessage?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  title,
  badgeText,
  totalLabel,
  totalAmount,
  items,
  currencySymbol,
  emptyMessage = "Sin registros en este período"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    name: string;
    value: number;
    percentage: string;
    icon: string;
    color: string;
  } | null>(null);

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const updateTooltipPos = (e: React.MouseEvent, sliceData: typeof tooltip) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTooltip(sliceData ? { ...sliceData, x, y } : null);
  };

  if (totalAmount === 0 || items.length === 0) {
    return (
      <div className="glass-card p-6 rounded-3xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Icons.PieChart className="text-cyan-600 dark:text-cyan-400" />
            {title}
          </h2>
          {badgeText && (
            <span className="text-xs font-bold bg-cyan-100/80 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 px-3 py-1 rounded-full">
              {badgeText}
            </span>
          )}
        </div>
        <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-slate-500 text-xs font-semibold">
          <Icons.PieChart className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
          <span>{emptyMessage}</span>
        </div>
      </div>
    );
  }

  let cumulativeAngle = 0;
  const slices = items.map((item) => {
    const percentage = totalAmount > 0 ? item.value / totalAmount : 0;
    const angle = percentage * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;

    const x1 = 50 + 40 * Math.cos((Math.PI * (startAngle - 90)) / 180);
    const y1 = 50 + 40 * Math.sin((Math.PI * (startAngle - 90)) / 180);
    const x2 = 50 + 40 * Math.cos((Math.PI * (cumulativeAngle - 90)) / 180);
    const y2 = 50 + 40 * Math.sin((Math.PI * (cumulativeAngle - 90)) / 180);

    const largeArcFlag = angle > 180 ? 1 : 0;
    const pathData =
      angle >= 359.9
        ? `M 50,10 A 40,40 0 1,1 49.99,10 Z`
        : `M ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`;

    return {
      ...item,
      percentage: (percentage * 100).toFixed(1),
      pathData
    };
  });

  return (
    <div ref={containerRef} className="glass-card p-6 rounded-3xl shadow-xs space-y-4 relative overflow-visible">
      {/* Title Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Icons.PieChart className="text-cyan-600 dark:text-cyan-400" />
          {title}
        </h2>
        {badgeText && (
          <span className="text-xs font-bold bg-cyan-100/80 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 px-3 py-1 rounded-full">
            {badgeText}
          </span>
        )}
      </div>

      {/* Donut Chart & Legend */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative w-48 h-48 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {slices.map((slice, i) => {
              const isHovered = hoveredIdx === i;
              return (
                <path
                  key={i}
                  d={slice.pathData}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={isHovered ? "17" : "14"}
                  className="transition-all duration-200 cursor-pointer stroke-linecap-round opacity-90 hover:opacity-100"
                  onMouseEnter={(e) => {
                    setHoveredIdx(i);
                    updateTooltipPos(e, {
                      x: 0,
                      y: 0,
                      name: slice.name,
                      value: slice.value,
                      percentage: slice.percentage,
                      icon: slice.icon,
                      color: slice.color
                    });
                  }}
                  onMouseMove={(e) => {
                    updateTooltipPos(e, tooltip || {
                      x: 0,
                      y: 0,
                      name: slice.name,
                      value: slice.value,
                      percentage: slice.percentage,
                      icon: slice.icon,
                      color: slice.color
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredIdx(null);
                    setTooltip(null);
                  }}
                />
              );
            })}
          </svg>
          <div className="absolute flex flex-col items-center text-center pointer-events-none">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {totalLabel}
            </span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white">
              {currencySymbol}
              {totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Breakdown Legend List */}
        <div className="flex-1 w-full space-y-2 max-h-56 overflow-y-auto pr-1">
          {slices.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`flex items-center justify-between text-xs p-2.5 rounded-2xl border transition shadow-2xs cursor-pointer ${
                  isHovered
                    ? 'bg-cyan-50 dark:bg-slate-700/80 border-cyan-300 dark:border-cyan-700'
                    : 'bg-slate-50/80 dark:bg-slate-800/70 border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">
                    {item.icon} {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <span>
                    {currencySymbol}
                    {item.value.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-cyan-800 dark:text-cyan-300 bg-cyan-100/80 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full font-bold">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Relative Mouse Tooltip (Fixes backdrop-filter containing block offset) */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none bg-slate-900/95 dark:bg-slate-950/95 text-white text-xs px-3.5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md border border-slate-700 flex flex-col gap-0.5 transform -translate-x-1/2 -translate-y-full -mt-2 animate-in fade-in zoom-in-95 duration-100"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="flex items-center gap-2 font-extrabold text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tooltip.color }} />
            <span>{tooltip.icon} {tooltip.name}</span>
          </div>
          <div className="flex items-center justify-between gap-4 font-black text-cyan-300 text-sm">
            <span>{currencySymbol}{tooltip.value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] bg-cyan-900/60 px-2 py-0.5 rounded-full text-cyan-200 font-extrabold">
              {tooltip.percentage}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
