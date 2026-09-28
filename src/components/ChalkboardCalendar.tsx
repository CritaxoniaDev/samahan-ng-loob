import { useState } from 'react'

export function ChalkboardCalendar({ onSelect, selectedDate }: { onSelect: (date: Date) => void, selectedDate: Date }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()

  const isSelectedDate = (day: number) => {
    return selectedDate.getDate() === day &&
           selectedDate.getMonth() === currentMonth.getMonth() &&
           selectedDate.getFullYear() === currentMonth.getFullYear()
  }

  const isToday = (day: number) => {
    const today = new Date()
    return today.getDate() === day &&
           today.getMonth() === currentMonth.getMonth() &&
           today.getFullYear() === currentMonth.getFullYear()
  }

  return (
    <div className="bg-[#0d0d0d] p-6 rounded-xl border-2 border-white/20 shadow-2xl backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setCurrentMonth(prev => new Date(prev.setMonth(prev.getMonth() - 1)))}
          className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
        >
          ←
        </button>
        <h2 className="text-white/90 font-rock-salt text-lg">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={() => setCurrentMonth(prev => new Date(prev.setMonth(prev.getMonth() + 1)))}
          className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-white/60 text-center font-rock-salt text-sm py-2">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="h-10" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          return (
            <button
              key={day}
              onClick={() => onSelect(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
              className={`
                h-10 w-10 rounded-full flex items-center justify-center
                transition-all duration-300 relative group
                ${isSelectedDate(day) 
                  ? 'bg-white/30 text-white ring-2 ring-white/50' 
                  : 'text-white/80 hover:bg-white/20'}
                ${isToday(day) && !isSelectedDate(day) 
                  ? 'ring-1 ring-white/30' 
                  : ''}
              `}
            >
              <span className="relative z-10 font-indie-flower text-base">
                {day}
              </span>
              {isSelectedDate(day) && (
                <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse" />
              )}
              <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
