import React from 'react';
import { Simulator } from '../types';
import { MonitorPlayIcon, WrenchIcon } from 'lucide-react';
interface SimulatorCardProps {
  simulator: Simulator;
  isSelected?: boolean;
  onClick?: () => void;
}
export function SimulatorCard({
  simulator,
  isSelected,
  onClick
}: SimulatorCardProps) {
  const isMaintenance = simulator.status === 'maintenance';
  return (
    <button
      onClick={isMaintenance ? undefined : onClick}
      disabled={isMaintenance}
      className={`w-full text-left relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${isMaintenance ? 'border-navy-800 bg-navy-900/50 opacity-75 cursor-not-allowed' : isSelected ? 'border-gold-500 bg-navy-800 shadow-lg shadow-gold-500/10 ring-1 ring-gold-500' : 'border-navy-700 bg-navy-800 hover:border-navy-500 hover:shadow-md cursor-pointer'}`}>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div
            className={`p-3 rounded-lg ${isSelected ? 'bg-gold-500/20 text-gold-500' : 'bg-navy-900 text-slate-400 border border-navy-700'}`}>
            
            <MonitorPlayIcon className="w-6 h-6" />
          </div>
          {isMaintenance ?
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-900/50">
              <WrenchIcon className="w-3 h-3" />
              Maintenance
            </span> :

          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-900/50">
              Available
            </span>
          }
        </div>

        <h3 className="text-lg font-serif font-semibold text-white mb-1">
          {simulator.name}
        </h3>
        <p className="text-sm text-slate-400">
          TrackMan 4 Technology • 4K Projection
        </p>
      </div>

      {isSelected &&
      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
          <div className="absolute transform rotate-45 bg-gold-500 text-navy-900 font-bold text-xs py-1 right-[-35px] top-[15px] w-[120px] text-center shadow-sm">
            Selected
          </div>
        </div>
      }
    </button>);

}