import { useState } from 'react';
import { MenuIcon, UserIcon, XIcon, LogOutIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavigationBarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  visibleTabIds: string[];
}

const ALL_NAV_ITEMS = [
  { id: 'booking',     label: 'Book a Bay' },
  { id: 'myBookings',  label: 'My Bookings' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'stats',       label: 'Stats' },
  { id: 'membership',  label: 'Membership' },
  { id: 'admin',       label: 'Admin' },
];

export function NavigationBar({
  currentView,
  onNavigate,
  onLogout,
  visibleTabIds,
}: NavigationBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const visibleSet = new Set(visibleTabIds);
  const navItems = ALL_NAV_ITEMS.filter(item => visibleSet.has(item.id));

  const handleNav = (id: string) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  };
  return (
    <nav className="bg-navy-900 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <button
              onClick={() => handleNav('booking')}
              className="flex-shrink-0 flex items-center gap-3 group">

              <img
                src="/logo.png"
                alt="The Admiralty Club"
                className="h-10 w-auto group-hover:scale-105 transition-transform" />

              <span className="font-serif text-2xl tracking-wide text-white group-hover:text-gold-500 transition-colors hidden sm:block">
                The Admiralty Club
              </span>
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) =>
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`text-sm font-medium transition-colors hover:text-gold-500 ${currentView === item.id ? 'text-gold-500 border-b-2 border-gold-500 pb-1' : 'text-slate-300'}`}>

                {item.label}
              </button>
            )}

            {/* Profile Dropdown */}
            <div className="relative ml-4 md:ml-6">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`p-2 rounded-full transition-colors ${currentView === 'profile' || isProfileMenuOpen ? 'bg-gold-500 text-navy-900' : 'bg-navy-800 text-gold-500 hover:bg-navy-700'}`}>

                <UserIcon className="h-5 w-5" aria-hidden="true" />
              </button>

              <AnimatePresence>
                {isProfileMenuOpen &&
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                      scale: 0.95
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1
                    }}
                    exit={{
                      opacity: 0,
                      y: 10,
                      scale: 0.95
                    }}
                    transition={{
                      duration: 0.15
                    }}
                    className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 overflow-hidden">

                    <button
                      onClick={() => handleNav('profile')}
                      className="w-full text-left px-4 py-3 text-sm text-navy-900 hover:bg-slate-50 flex items-center gap-2 font-medium">

                      <UserIcon className="w-4 h-4 text-slate-400" />
                      My Profile
                    </button>
                    <div className="border-t border-slate-100"></div>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">

                      <LogOutIcon className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                }
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-4">
            <button
              onClick={() => handleNav('profile')}
              className={`p-2 rounded-full ${currentView === 'profile' ? 'bg-gold-500 text-navy-900' : 'text-gold-500 bg-navy-800'}`}>

              <UserIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white hover:bg-navy-800 focus:outline-none">

              {isMobileMenuOpen ?
                <XIcon className="block h-6 w-6" aria-hidden="true" /> :

                <MenuIcon className="block h-6 w-6" aria-hidden="true" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen &&
          <motion.div
            initial={{
              opacity: 0,
              height: 0
            }}
            animate={{
              opacity: 1,
              height: 'auto'
            }}
            exit={{
              opacity: 0,
              height: 0
            }}
            className="md:hidden bg-navy-800 border-t border-navy-700 overflow-hidden">

            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) =>
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`block w-full text-left px-3 py-4 rounded-md text-base font-medium ${currentView === item.id ? 'bg-navy-900 text-gold-500' : 'text-slate-300 hover:bg-navy-700 hover:text-white'}`}>

                  {item.label}
                </button>
              )}
              <div className="border-t border-navy-700 my-2"></div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                className="block w-full text-left px-3 py-4 rounded-md text-base font-medium text-red-400 hover:bg-navy-700 hover:text-red-300 flex items-center gap-2">

                <LogOutIcon className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </nav>);

}
