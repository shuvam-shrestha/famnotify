"use client";

import Link from 'next/link';
import { Home, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export function SiteHeader() {
  const { isAuthenticated, logout, isLoading } = useAuth();
  const pathname = usePathname();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary hover:text-accent transition-colors">
          Family Hub
        </Link>
        <nav className="flex items-center gap-2">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <>
                  {pathname !== '/dashboard' && (
                    <Button variant="ghost" asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                pathname !== '/login' && (
                  <Button variant="ghost" asChild>
                    <Link href="/login">
                      <LogIn className="mr-2 h-4 w-4" />
                      Family Login
                    </Link>
                  </Button>
                )
              )}
               {pathname !== '/' && (
                  <Button variant="ghost" asChild>
                    <Link href="/">
                      <Home className="mr-2 h-4 w-4" />
                      Visitor Page
                    </Link>
                  </Button>
                )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
