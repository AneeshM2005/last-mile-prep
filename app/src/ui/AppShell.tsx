/**
 * AppShell.tsx – Responsive application shell.
 * design.md 4, 6.
 * Contains skip-link, desktop sidebar, mobile top/bottom bars, global notice banners, and main content.
 */
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarNav } from './SidebarNav';
import { TopBar } from './TopBar';
import { BottomBar } from './BottomBar';
import { Banner } from './Banner';
import { useAppContext } from '../app/providers';
import { useStore } from '../data/store';

export function AppShell(): React.ReactElement {
  const { storageAvailable } = useAppContext();
  const { wasReset, data, dismissBanner } = useStore();
  const dismissed = data.ui.dismissedBanners || [];

  return (
    <div className="min-h-screen bg-[var(--lm-bg)] flex flex-col lg:flex-row text-[var(--lm-ink)] font-sans antialiased selection:bg-[var(--lm-accent-soft)]">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Desktop Sidebar */}
      <SidebarNav />

      {/* Mobile Top Bar */}
      <TopBar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        {/* Global Notice Banners */}
        <div className="px-4 lg:px-8 pt-4 flex flex-col gap-2 max-w-[1120px] w-full mx-auto">
          {!storageAvailable && !dismissed.includes('storage-unavailable') && (
            <Banner
              id="storage-unavailable"
              type="storage"
              message="Progress cannot be saved in this browser mode."
              onDismiss={() => dismissBanner('storage-unavailable')}
            />
          )}

          {wasReset && !dismissed.includes('store-reset') && (
            <Banner
              id="store-reset"
              type="notice"
              message="Previous session data was reset due to a data version update."
              onDismiss={() => dismissBanner('store-reset')}
            />
          )}
        </div>

        {/* Page View Slot */}
        <main id="main-content" tabIndex={-1} className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1120px] w-full mx-auto outline-none">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Bar */}
      <BottomBar />
    </div>
  );
}
