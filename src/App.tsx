import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/navigation/Sidebar';
import { BottomNav } from './components/navigation/BottomNav';
import { TopBar } from './components/navigation/TopBar';
import { VideoPlayer } from './components/player/VideoPlayer';
import { MovieDetailsModal } from './components/movies/MovieDetailsModal';
import { AddMovieModal } from './components/movies/AddMovieModal';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';

import { HomePage } from './pages/Home/HomePage';
import { LiveTVPage } from './pages/LiveTV/LiveTVPage';
import { MoviesPage } from './pages/Movies/MoviesPage';
import { FavoritesPage } from './pages/Favorites/FavoritesPage';
import { PlaylistsPage } from './pages/Playlists/PlaylistsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';

const AppContent: React.FC = () => {
  const { currentPage, settings } = useApp();

  return (
    <div
      id="streamglass-app-root"
      className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${
        settings.theme === 'light' ? 'bg-[#f4f6fb] text-slate-900' : 'bg-[#08090d] text-slate-100'
      } ${settings.tvMode ? 'text-base font-medium' : ''}`}
    >
      {/* Desktop Frosted Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 lg:pl-72 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Navigation */}
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          {currentPage === 'home' && <HomePage />}
          {currentPage === 'live' && <LiveTVPage />}
          {currentPage === 'movies' && <MoviesPage />}
          {currentPage === 'favorites' && <FavoritesPage />}
          {currentPage === 'playlists' && <PlaylistsPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Mobile Ergonomic Bottom Dock */}
      <BottomNav />

      {/* Cinematic Video Player (Modal and PiP) */}
      <VideoPlayer />

      {/* Movie Details Modal Drawer */}
      <MovieDetailsModal />

      {/* Add Movie Custom Modal */}
      <AddMovieModal />

      {/* Global Command / Search Spotlight */}
      <GlobalSearchModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
