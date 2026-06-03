"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

const MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"]
const DAYS = ["Pt","Sa","Ça","Pe","Cu","Ct","Pz"]

interface Props {
  value: string
  onChange: (val: string) => void
  className?: string
  inputClassName?: string
  inputStyle?: React.CSSProperties
  small?: boolean
}

export function BirthDatePicker({ value, onChange, className = "", inputClassName = "", inputStyle, small = false }: Props) {
  const today = new Date()
  const maxYear = today.getFullYear() - 18
  const minYear = 1920

  const parseValue = () => {
    if (value && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [y, m] = value.split("-").map(Number)
      return { year: y, month: m - 1 }
    }
    return { year: maxYear - 10, month: 0 }
  }

  const [open, setOpen] = useState(false)
  const [{ year, month }, setNav] = useState(parseValue)
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close on outside click (desktop only)
  useEffect(() => {
    if (!open || small) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open, small])

  // Recalculate dropdown position on scroll/resize (desktop only)
  useEffect(() => {
    if (!open || small) return
    const update = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect()
        setDropdownPos({ top: rect.bottom + 4, left: rect.left })
      }
    }
    update()
    window.addEventListener("scroll", update, true)
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update, true)
      window.removeEventListener("resize", update)
    }
  }, [open, small])

  const handleOpen = () => {
    if (!small && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setDropdownPos({ top: rect.bottom + 4, left: rect.left })
    }
    setOpen(v => !v)
  }

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i)

  const firstDay = new Date(year, month, 1).getDay()
  const startOffset = (firstDay + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const selectedDate = value && value.match(/^\d{4}-\d{2}-\d{2}$/) ? value : null
  const selectedParts = selectedDate ? selectedDate.split("-").map(Number) : null

  const isSelected = (d: number) =>
    selectedParts && selectedParts[0] === year && selectedParts[1] === month + 1 && selectedParts[2] === d

  const selectDay = (d: number) => {
    const mm = String(month + 1).padStart(2, "0")
    const dd = String(d).padStart(2, "0")
    onChange(`${year}-${mm}-${dd}`)
    setOpen(false)
  }

  const prevMonth = () => {
    if (month === 0) setNav({ year: year - 1, month: 11 })
    else setNav({ year, month: month - 1 })
  }
  const nextMonth = () => {
    if (month === 11) setNav({ year: year + 1, month: 0 })
    else setNav({ year, month: month + 1 })
  }

  const displayValue = selectedDate
    ? (() => { const [y, m, d] = selectedDate.split("-"); return `${d}/${m}/${y}` })()
    : ""

  // Shared calendar content
  const CalendarBody = () => (
    <>
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-100 gap-3">
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <button type="button" onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={month}
              onChange={e => setNav(n => ({ ...n, month: Number(e.target.value) }))}
              className="appearance-none pr-5 pl-1 py-0.5 text-base font-bold text-gray-900 bg-transparent cursor-pointer focus:outline-none"
            >
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <ChevronRight className="h-3 w-3 text-gray-500 absolute right-0 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={year}
              onChange={e => setNav(n => ({ ...n, year: Number(e.target.value) }))}
              className="appearance-none pr-5 pl-1 py-0.5 text-base font-bold text-gray-900 bg-transparent cursor-pointer focus:outline-none"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronRight className="h-3 w-3 text-gray-500 absolute right-0 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-4 pt-3 pb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-sm text-gray-400 font-medium">{d}</div>
        ))}
      </div>
      <div className="h-px bg-gray-100 mx-4" />

      {/* Day cells */}
      <div className="grid grid-cols-7 px-4 pt-2 pb-4 gap-y-0.5">
        {cells.map((d, i) => (
          <div key={i} className="flex items-center justify-center">
            {d ? (
              <button
                type="button"
                onClick={() => selectDay(d)}
                className={`w-9 h-8 text-sm rounded-full transition-colors ${
                  isSelected(d)
                    ? "bg-[#3a7a96] text-white font-semibold"
                    : "text-gray-800 hover:bg-gray-100"
                }`}
              >
                {d}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </>
  )

  return (
    <div className={`relative ${className}`} ref={ref}>
      {/* Input trigger */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={displayValue}
          placeholder="14/04/2008"
          onClick={handleOpen}
          onMouseDown={(e) => e.preventDefault()}
          className={`cursor-pointer select-none ${inputClassName}`}
          style={inputStyle}
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="20"
          className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${small ? "left-3" : "left-4"}`}
          fill="#9ca3af"
        >
          <path d="M15.7 3.4h-.5v-.6c0-1.2-1-2.1-2.1-2.1S11 1.6 11 2.8v.6H7v-.6C7 1.6 6 .7 4.9.7s-2.1 1-2.1 2.1v.6h-.5C1 3.4 0 4.4 0 5.7v11.5c0 1.3 1 2.3 2.3 2.3h13.4c1.3 0 2.3-1 2.3-2.3V5.7c0-1.3-1-2.3-2.3-2.3zm-3.2-.6c0-.3.3-.6.6-.6s.6.3.6.6v3c0 .3-.3.6-.6.6s-.6-.3-.6-.6v-3zm-8.2 0c0-.3.3-.6.6-.6s.6.3.6.6v3c0 .3-.3.6-.6.6s-.6-.2-.6-.6v-3zm12.2 14.4c0 .4-.4.8-.8.8H2.3c-.4 0-.8-.4-.8-.8V7.9h15v9.3z"/>
        </svg>
      </div>

      {/* MOBILE: true fullscreen white modal */}
      {small && open && (
        <div
          className="fixed inset-0 z-50 bg-white flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile-specific nav: < left | month dropdown | year dropdown | > right */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <button type="button" onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded">
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>
            <div className="flex items-center gap-4">
              <div className="relative">
                <select
                  value={month}
                  onChange={e => setNav(n => ({ ...n, month: Number(e.target.value) }))}
                  className="appearance-none pr-6 pl-1 py-0.5 text-xl font-bold text-gray-900 bg-transparent cursor-pointer focus:outline-none"
                >
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <ChevronRight className="h-4 w-4 text-gray-500 absolute right-0 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={year}
                  onChange={e => setNav(n => ({ ...n, year: Number(e.target.value) }))}
                  className="appearance-none pr-6 pl-1 py-0.5 text-xl font-bold text-gray-900 bg-transparent cursor-pointer focus:outline-none"
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronRight className="h-4 w-4 text-gray-500 absolute right-0 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
              </div>
            </div>
            <button type="button" onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded">
              <ChevronRight className="h-6 w-6 text-gray-700" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 px-4 pt-4 pb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-base text-gray-400 font-medium">{d}</div>
            ))}
          </div>
          <div className="h-px bg-gray-100 mx-4" />

          {/* Day cells */}
          <div className="grid grid-cols-7 px-4 pt-2 pb-4 gap-y-1">
            {cells.map((d, i) => (
              <div key={i} className="flex items-center justify-center">
                {d ? (
                  <button
                    type="button"
                    onClick={() => selectDay(d)}
                    className={`w-12 h-11 text-xl transition-colors rounded ${
                      isSelected(d)
                        ? "bg-[#3a7a96] text-white font-semibold rounded-lg"
                        : "text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    {d}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DESKTOP: fixed dropdown */}
      {!small && open && dropdownPos && (
        <div
          className="bg-white border border-gray-200 shadow-lg"
          style={{
            position: "fixed",
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: "340px",
            borderRadius: "4px",
            zIndex: 9999,
          }}
        >
          <CalendarBody />
        </div>
      )}
    </div>
  )
}
