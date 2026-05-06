import { useState } from 'react';
import { mockLocations } from '../../data/mockData';
import {
  LayoutDashboardIcon,
  MonitorPlayIcon,
  CalendarIcon,
  TrophyIcon,
  UsersIcon,
  MapPinIcon,
  ClipboardListIcon,
  FlagIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { mockScores } from '../../data/mockData';

import { DashboardTab } from './components/Dashboard';
import { SimulatorsTab } from './components/SimulatorsTab';
import { LocationsTab } from './components/LocationsTab';
import { ReservationsTab } from './components/ReservationsTab';
import { MembersTab } from './components/MembersTab';
import { LeaderboardTab } from './components/LeaderboardTab';
import { ScoresTab } from './components/ScoresTab';
import { Score, Location } from '../../api';
import { CoursesTab } from './components/CoursesTab';

const ADMIN_TAB_STORAGE_KEY = 'admiralty.admin.activeTab';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
  { id: 'simulators', label: 'Simulators', icon: MonitorPlayIcon },
  { id: 'locations', label: 'Locations', icon: MapPinIcon },
  { id: 'courses', label: 'Courses', icon: FlagIcon },
  { id: 'reservations', label: 'Reservations', icon: CalendarIcon },
  { id: 'members', label: 'Members', icon: UsersIcon },
  { id: 'leaderboard', label: 'Leaderboard', icon: TrophyIcon },
  { id: 'scores', label: 'Scores', icon: ClipboardListIcon },
];

export function AdminPage() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(ADMIN_TAB_STORAGE_KEY) || 'dashboard';
  });
  const [scores, setScores] = useState<Score[]>(mockScores);
  const [locations] = useState<Location[]>(mockLocations);

  const setAndPersistActiveTab = (tabId: string) => {
    setActiveTab(tabId);
    localStorage.setItem(ADMIN_TAB_STORAGE_KEY, tabId);
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-navy-900/95 text-slate-300 md:min-h-[calc(100vh-80px)] border-t border-r border-navy-800 shrink-0 backdrop-blur-md">
        <div className="p-4 md:p-6">
          <h2 className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-4">
            Administration
          </h2>
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setAndPersistActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-navy-800 text-gold-500 shadow-inner'
                    : 'hover:bg-navy-800 hover:text-white'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-gold-500' : 'text-slate-500'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h1>
            <p className="text-slate-400">Manage your club's operations and members.</p>
          </div>

          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'locations' && <LocationsTab />}
          {activeTab === 'courses' && <CoursesTab />}
          {activeTab === 'simulators' && <SimulatorsTab />}
          {activeTab === 'reservations' && <ReservationsTab />}
          {activeTab === 'members' && <MembersTab />}
          {activeTab === 'leaderboard' && <LeaderboardTab />}
          {activeTab === 'scores' && <ScoresTab />}
        </motion.div>
      </div>
    </div>
  );
}