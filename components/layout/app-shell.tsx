"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Menu,
  Send,
  Settings,
  Users,
  X,
} from "lucide-react";
import type { Role } from "@prisma/client";
import { cn, initials } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logoutAction } from "@/lib/actions/auth";

type ShellUser = {
  name: string;
  email: string;
  role: Role;
  departmentName: string | null;
};

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
};

type AppShellProps = {
  user: ShellUser;
  dispatchCount: number;
  children: React.ReactNode;
};

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4",
          active ? "text-primary" : "text-slate-400 group-hover:text-slate-600",
        )}
      />
      <span className="flex-1">{item.label}</span>
      {item.badge ? (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

function SidebarContent({
  user,
  dispatchCount,
  onNavigate,
}: {
  user: ShellUser;
  dispatchCount: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const workspaceItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/samples", label: "Samples", icon: ClipboardList },
    {
      href: "/dispatch",
      label: "Dispatch",
      icon: Send,
      badge: dispatchCount || undefined,
    },
  ];

  const accountItems: NavItem[] = [
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const adminItems: NavItem[] =
    user.role === "ADMIN"
      ? [{ href: "/users", label: "Users", icon: Users }]
      : [];

  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  const group = (label: string, items: NavItem[]) =>
    items.length > 0 ? (
      <div className="space-y-1">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        {items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isActive(item.href)}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    ) : null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <FlaskConical className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-base font-semibold tracking-tight">LabFlow</p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Laboratory Workflow
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {group("Workspace", workspaceItems)}
        {group("Administration", adminItems)}
        {group("Account", accountItems)}
      </nav>

      <div className="border-t p-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {ROLE_LABELS[user.role]}
              </p>
            </div>
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-slate-900"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sign out</span>
              </Button>
            </form>
          </div>
          {user.departmentName ? (
            <p className="mt-2 truncate text-[11px] text-muted-foreground">
              {user.departmentName}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function AppShell({ user, dispatchCount, children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-white lg:flex lg:flex-col">
        <SidebarContent user={user} dispatchCount={dispatchCount} />
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b bg-white/95 px-4 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <FlaskConical className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold">LabFlow</span>
            </Link>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/45"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white shadow-xl">
            <div className="absolute right-3 top-3 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarContent
              user={user}
              dispatchCount={dispatchCount}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
