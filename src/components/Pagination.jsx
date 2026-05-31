import React from 'react'

// Minimal reusable pagination component matching admin list UI (select + summary)
// Props:
// - page: number (current page)
// - totalPage: number
// - total: number (total items)
// - limit: number (items per page)
// - onChange: (newPage: number) => void
// - className: optional wrapper className
export default function Pagination({ page, totalPage = 1, total = 0, limit = 10, onChange, className = '' }) {
  if (!onChange || typeof onChange !== 'function') {
    // fail safe: no-op
    onChange = () => {}
  }

  const from = total > 0 ? (page - 1) * limit + 1 : 0
  const to = Math.min(page * limit, total)

  return (
    <div className={className + ' mt-[30px] flex items-center gap-[10px] text-[14px]'}>
      {total > 0 ? (
        <>
          <span>
            Hiển thị {from} - {to} của {total}
          </span>
          <div className="bg-[white] p-[7px] rounded-[10px] border border-gray-300">
            <select
              className="outline-none border-none bg-transparent focus:ring-0"
              value={page}
              onChange={(e) => onChange(Number(e.target.value))}
              aria-label="Chọn trang"
            >
              {[...Array(Math.max(1, totalPage))].map((_, i) => (
                <option key={i} value={i + 1}>
                  Trang {i + 1}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : null}
    </div>
  )
}
