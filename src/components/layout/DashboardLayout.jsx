import { useMemo, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Button from "@/components/common/Button";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useAuthStore } from "@/store/authStore";
import {
  getCompanyDisplayName,
  getCompanyLogoUrl,
  getUserInitials,
} from "@/utils/companyProfile";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Menu,
  LogOut,
  Search,
  Settings,
  CalendarDays,
  UserRound,
  Users,
} from "lucide-react";

const linksByRole = {
  admin: [
    { to: "/superadmin", label: "Dashboard", end: true, icon: LayoutDashboard },
    { to: "/superadmin/requests", label: "Requests", icon: Bell },
    { to: "/superadmin/companies", label: "Manage Companies", icon: Building2 },
    { to: "/superadmin/trainees", label: "Manage Trainees", icon: Users },
    {
      to: "/superadmin/internships",
      label: "Internships",
      icon: BriefcaseBusiness,
    },
    {
      to: "/superadmin/assessments",
      label: "Assessments",
      icon: ClipboardCheck,
    },
    {
      to: "/superadmin/reports",
      label: "Reports & Analytics",
      icon: BarChart3,
    },
    { to: "/superadmin/settings", label: "Settings", icon: Settings },
  ],
  company: [
    { to: "/company", label: "Dashboard", end: true, icon: LayoutDashboard },
    {
      to: "/company/internships",
      label: "My Internships",
      icon: BriefcaseBusiness,
    },
    { to: "/company/applicants", label: "Applicants", icon: FileText },
    { to: "/company/messages", label: "Messages", icon: Bell },
    { to: "/company/interviews", label: "Interviews", icon: Users },
    { to: "/company/settings", label: "Profile Settings", icon: Settings },
  ],
  trainee: [
    { to: "/trainee", label: "Dashboard", end: true, icon: LayoutDashboard },
    {
      to: "/trainee/internships",
      label: "Browse Internships",
      icon: BriefcaseBusiness,
    },
    { to: "/trainee/applications", label: "My Applications", icon: FileText },
    { to: "/trainee/notifications", label: "Notifications", icon: Bell },
    {
      to: "/trainee/assessments",
      label: "My Assessments",
      icon: ClipboardCheck,
    },
    { to: "/trainee/progress", label: "My Progress", icon: GraduationCap },
    { to: "/trainee/profile", label: "Profile", icon: UserRound },
  ],
};

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = linksByRole[user?.role] || [];
  const currentTitle = useMemo(() => {
    const active = links.find(
      (item) =>
        location.pathname === item.to ||
        (!item.end && location.pathname.startsWith(item.to)),
    );
    return active?.label || "Dashboard";
  }, [links, location.pathname]);
  const isTrainee = user?.role === "trainee";
  const isCompany = user?.role === "company";
  const isSuperAdmin = user?.role === "admin";
  const companyName = getCompanyDisplayName(user);
  const companyLogoUrl = getCompanyLogoUrl(user);
  const displayName = isCompany ? companyName : user?.name || "User";
  const initials = useMemo(() => getUserInitials(displayName), [displayName]);

  return (
    <div className="relative flex min-h-screen bg-surface">
      <div className="hidden sm:block">
        <Sidebar
          links={links}
          onLogout={logout}
          role={user?.role}
          user={user}
        />
      </div>
      {menuOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-sm sm:hidden"
          onClick={() => setMenuOpen(false)}
          role="presentation"
        />
      ) : null}
      <div
        className={`fixed left-0 top-0 z-50 h-screen w-72 transition-transform duration-300 ease-out sm:hidden ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar
          links={links}
          onLogout={logout}
          onNavigate={() => setMenuOpen(false)}
          role={user?.role}
          user={user}
        />
      </div>
      <div className="flex-1 p-3 sm:p-4 md:p-6">
        <header className="mb-6 rounded-2xl border border-border/80 bg-card px-3 py-3 shadow-md sm:px-4 md:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <button
                className="mb-1 inline-flex rounded-full p-1 text-muted-foreground transition-all duration-200 hover:bg-muted sm:hidden"
                onClick={() => setMenuOpen(true)}
                type="button"
              >
                <Menu className="h-5 w-5" />
              </button>
              {isSuperAdmin ? (
                <p className="text-xs text-muted-foreground">
                  Home {">"} Overview
                </p>
              ) : null}
              <p className="truncate text-lg font-semibold text-foreground">
                {currentTitle}
              </p>
              {isTrainee || isCompany ? (
                <p className="truncate text-sm text-muted-foreground">
                  Welcome back,{" "}
                  {(isCompany ? companyName : user?.name)?.split(" ")[0] ||
                    "User"}
                  !
                </p>
              ) : (
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  {user?.role}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              {isTrainee || isCompany || isSuperAdmin ? (
                <>
                  <label className="relative hidden lg:block">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      className="w-72 rounded-xl border border-input bg-card py-2 pl-9 pr-3 text-sm outline-none transition-all duration-200 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                      placeholder={
                        isSuperAdmin
                          ? "Search users, logs..."
                          : isCompany
                            ? "Search candidates..."
                            : "Search internships, companies"
                      }
                      type="text"
                    />
                  </label>
                  <button
                    className="rounded-full border border-border bg-card p-2 text-muted-foreground transition-all duration-200 hover:bg-muted/60"
                    type="button"
                    aria-label="Notifications"
                  >
                    <Bell className="h-4 w-4" />
                  </button>
                  {isSuperAdmin ? (
                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-muted/60 sm:text-sm"
                      type="button"
                    >
                      <CalendarDays className="h-4 w-4" />
                      This Week
                    </button>
                  ) : null}
                  <ThemeToggle />
                </>
              ) : (
                <p className="hidden text-sm text-muted-foreground sm:block">
                  {user?.name}
                </p>
              )}
              <Button
                className="inline-flex items-center gap-2 px-3"
                onClick={logout}
                variant="ghost"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardLayout;
