import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export function StatsCard({ title, value, icon: Icon, trend, trendUp }: StatsCardProps) {
  return (
    <div className="bg-navy-800 rounded-xl border border-navy-700 p-6 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl font-serif font-bold text-white">{value}</h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-navy-900 flex items-center justify-center text-gold-500 border border-navy-700">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={`font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
            {trend}
          </span>
          <span className="text-slate-500 ml-2">vs last month</span>
        </div>
      )}
    </div>
  );
}


// import React from 'react';
// import { BoxIcon } from 'lucide-react';

// interface StatsCardProps {
//   title: string;
//   value: string | number;
//   icon: BoxIcon;
//   trend?: string;
//   trendUp?: boolean;
// }
// export function StatsCard({
//   title,
//   value,
//   icon: Icon,
//   trend,
//   trendUp
// }: StatsCardProps) {
//   return (
//     <div className="bg-navy-800 rounded-xl border border-navy-700 p-6 shadow-md">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
//           <h3 className="text-2xl font-serif font-bold text-white">{value}</h3>
//         </div>
//         <div className="w-12 h-12 rounded-full bg-navy-900 flex items-center justify-center text-gold-500 border border-navy-700">
//           <Icon className="w-6 h-6" />
//         </div>
//       </div>
//       {trend &&
//         <div className="mt-4 flex items-center text-sm">
//           <span
//             className={`font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>

//             {trend}
//           </span>
//           <span className="text-slate-500 ml-2">vs last month</span>
//         </div>
//       }
//     </div>);

// }