"use client";

interface MapLegendProps {
  title: string;
  items: {
    color: string;
    label: string;
    range?: string;
  }[];
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function MapLegend({ title, items, position = 'bottom-left' }: MapLegendProps) {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div className={`absolute ${positionClasses[position]} z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-xs`}>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className="w-8 h-4 rounded border border-gray-300 flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-700 truncate">{item.label}</div>
              {item.range && (
                <div className="text-xs text-gray-500">{item.range}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
