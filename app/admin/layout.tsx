'use client';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { SidebarProvider, useSidebar } from '@/lib/context/SidebarContext';

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen } = useSidebar();

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
      {/* Sidebar - Hidden on mobile, shown on desktop */}
      <div className={`fixed md:relative z-50 md:z-auto h-screen transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-0 md:w-64'
      } overflow-hidden`}>
        <AdminSidebar />
      </div>

      {/* Mobile overlay when sidebar is open */}
      {isOpen && (
        <div className="fixed md:hidden inset-0 bg-black/40 z-40" />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-background text-foreground transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
}
