import { TimeSlot } from '../api';
import { ClockIcon, UsersIcon } from 'lucide-react';

interface TimeSlotCardProps {
  slot: TimeSlot;
  isSelected?: boolean;
  onClick?: () => void;
}

export function TimeSlotCard({ slot, isSelected, onClick }: TimeSlotCardProps) {
  const isFull = !slot.isAvailable;
  const spotsLeft = slot.spotsAvailable ?? (isFull ? 0 : 4);

  if (isFull) {
    return (
      <div className="w-full p-4 rounded-xl border-2 border-navy-800 bg-navy-900/50 opacity-60 flex flex-col items-center justify-center gap-2 cursor-not-allowed">
        <ClockIcon className="w-5 h-5 text-slate-600" />
        <span className="text-sm font-medium text-slate-500">{slot.label}</span>
        <div className="flex items-center gap-1.5">
          <UsersIcon className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Full</span>
        </div>
        <span className="text-xs text-slate-700">0 of {slot.spotsTotal ?? 4} spots left</span>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
        isSelected
          ? 'border-gold-500 bg-navy-800 text-white shadow-lg shadow-gold-500/10 scale-[1.02]'
          : 'border-navy-700 bg-navy-800 text-slate-300 hover:border-navy-500 hover:shadow-md'
      }`}
    >
      <ClockIcon className={`w-5 h-5 ${isSelected ? 'text-gold-500' : 'text-slate-400'}`} />
      <span className="text-sm font-medium">{slot.label}</span>
      <div className="flex items-center gap-1.5">
        <UsersIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-gold-400' : 'text-green-400'}`} />
        <span className={`text-xs font-semibold uppercase tracking-wider ${isSelected ? 'text-gold-500' : 'text-green-400'}`}>
          {spotsLeft} of {slot.spotsTotal ?? 4} spots left
        </span>
      </div>
    </button>
  );
}
