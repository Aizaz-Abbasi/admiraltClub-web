import React from 'react';
import { TimeSlot } from '../types';
import { ClockIcon } from 'lucide-react';
interface TimeSlotCardProps {
  slot: TimeSlot;
  isSelected?: boolean;
  onClick?: () => void;
}
export function TimeSlotCard({ slot, isSelected, onClick }: TimeSlotCardProps) {
  if (!slot.isAvailable) {
    return (
      <div className="w-full p-4 rounded-xl border-2 border-navy-800 bg-navy-900/50 opacity-60 flex flex-col items-center justify-center gap-2 cursor-not-allowed">
        <ClockIcon className="w-5 h-5 text-slate-600" />
        <span className="text-sm font-medium text-slate-500">{slot.label}</span>
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
          Booked
        </span>
      </div>);

  }
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${isSelected ? 'border-gold-500 bg-navy-800 text-white shadow-lg shadow-gold-500/10 scale-[1.02]' : 'border-navy-700 bg-navy-800 text-slate-300 hover:border-navy-500 hover:shadow-md'}`}>
      
      <ClockIcon
        className={`w-5 h-5 ${isSelected ? 'text-gold-500' : 'text-slate-400'}`} />
      
      <span className="text-sm font-medium">{slot.label}</span>
      <span
        className={`text-xs font-semibold uppercase tracking-wider ${isSelected ? 'text-gold-500' : 'text-green-400'}`}>
        
        Available
      </span>
    </button>);

}