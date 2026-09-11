import React from 'react';
import { Home, Tv, Film, Heart, ListVideo, Settings } from 'lucide-react';
import { useApp, NavigationPage } from '../../context/AppContext';

export const BottomNav: React.FC = () => {
  const { currentPage, setCurrentPage } = useApp();

  const items: { id: NavigationPage; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'live', label: 'Live TV', icon: Tv },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'playlists', label: 'Playlists', icon: ListVideo },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      id="streamglass-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 py-2 bg-[#0a0c14]/90 backdrop-blur-2xl border-t border-white/[0.08] shadow-[0_-10px_30px_rgba(0,0,0,0.8)] pb-safe"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-sky-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-all ${
                  isActive ? 'bg-sky-400/20 shadow-[0_0_12px_rgba(56,189,248,0.3)]' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
