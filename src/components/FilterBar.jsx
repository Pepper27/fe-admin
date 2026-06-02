import React from 'react';
import { FaFilter } from 'react-icons/fa6';

// Minimal, schema-driven FilterBar for admin pages.
// Supports: text, select, date-range, custom render via field.render

export default function FilterBar({
  fields = [],
  values = {},
  onChange = () => {},
  onReset = () => {},
  className = '',
}) {
  return (
    // No outer border/bg so parent container can provide the card border; keeps internal separators
    <div className={`w-full flex items-center gap-2 ${className}`}>
      <div className="py-2 px-3 flex gap-2 items-center border-r border-gray-300">
        <FaFilter className="text-[18px]" />
        <span className="font-[700] text-[14px]">Bộ lọc</span>
      </div>

      {fields.map((f) => {
        const val = values[f.name] ?? '';
        if (f.type === 'select') {
          return (
            <div key={f.name} className="py-2 px-2 border-r border-gray-300 min-w-0 max-w-[160px] flex items-center">
              <select
                value={val}
                onChange={(e) => onChange({ ...values, [f.name]: e.target.value })}
                className="font-semibold outline-none text-sm  w-[140px] bg-transparent cursor-pointer"
              >
                {(f.options || []).map((o) => (
                  <option key={o.value ?? o.id ?? o._id ?? o.label} value={String(o.value ?? o.id ?? o._id ?? '')}>
                    {o.label ?? o.name}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        if (f.type === 'date-range') {
          return (
            <div key={f.name} className="py-2 px-2 border-r border-gray-300 flex items-center min-w-0">
              <input
                type="date"
                value={val?.start || ''}
                onChange={(e) => onChange({ ...values, [f.name]: { ...(val || {}), start: e.target.value } })}
                className="font-semibold text-xs outline-none w-28"
              />
              <span className="mx-1">-</span>
              <input
                type="date"
                value={val?.end || ''}
                onChange={(e) => onChange({ ...values, [f.name]: { ...(val || {}), end: e.target.value } })}
                className="font-semibold text-xs outline-none w-28"
              />
            </div>
          );
        }

        if (f.type === 'custom' && typeof f.render === 'function') {
          return (
            <div key={f.name} className={f.className ? f.className : 'py-2 px-3 border-r border-gray-300'}>
              {f.render(values[f.name], (v) => onChange({ ...values, [f.name]: v }))}
            </div>
          );
        }

        // fallback: text
        return (
          <div key={f.name} className="py-2 px-3 border-r border-gray-300 min-w-0 max-w-[160px]">
            <input
              value={val}
              onChange={(e) => onChange({ ...values, [f.name]: e.target.value })}
              className="font-semibold text-sm outline-none w-full"
              placeholder={f.placeholder || ''}
            />
          </div>
        );
      })}

      {/* Reset control - pages can control handler via onReset */}
      <div onClick={onReset} className="py-2 pl-2 pr-3 flex gap-2 items-center text-red-600 font-semibold text-sm cursor-pointer hover:opacity-80">
        <div className="text-[16px]">🗑</div>
        <div>Xóa lọc</div>
      </div>
    </div>
  );
}
