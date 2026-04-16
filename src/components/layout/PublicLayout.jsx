import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { LayoutDashboard, LogOut, Menu, Settings, User, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { ROLES, roleLandingMap } from "@/utils/constants";
import {
  getCompanyDisplayName,
  getCompanyLogoUrl,
  getUserInitials,
} from "@/utils/companyProfile";
import ThemeToggle from "@/components/common/ThemeToggle";

const PublicLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { user, token, logout } = useAuthStore();
  const companyName = getCompanyDisplayName(user);
  const companyLogoUrl = getCompanyLogoUrl(user);
  const dashboardPath = getDashboardPath(user?.role);
  const profilePath = getProfilePath(user?.role);
  const settingsPath = getSettingsPath(user?.role);
  const isAuthed = Boolean(token && user);
  const initials = (user?.name || "IN")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const onLogout = () => {
    setProfileOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-grid-soft bg-slate-50/70">
      <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-card/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            className="inline-flex items-center transition-all duration-200 hover:scale-[0.99] hover:opacity-80"
            to="/"
          >
            <img
              src="/logo.png?v=2"
              alt="Interno logo"
              className="h-12 w-auto object-contain"
            />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <HeaderLink label="Home" to="/" />
            <HeaderLink label="About" to="/about" />
            <HeaderLink label="Contact" to="/contact" />
            {isAuthed && dashboardPath ? (
              <HeaderLink label="Dashboard" to={dashboardPath} />
            ) : null}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            {!isAuthed ? (
              <>
                <NavLink
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  to="/login"
                >
                  Login
                </NavLink>
                <NavLink
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90"
                  to="/register"
                >
                  Register
                </NavLink>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  className="relative rounded-full transition-all duration-200 hover:ring-2 hover:ring-primary/50"
                  onClick={() => setProfileOpen((value) => !value)}
                  type="button"
                  aria-label="Open profile menu"
                >
                  <span className="relative block">
                    {user?.role === "company" && companyLogoUrl ? (
                      <img
                        src={companyLogoUrl}
                        alt={companyName}
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-border"
                      />
                    ) : user?.profileImage || user?.avatar || user?.image ? (
                      <img
                        src={user.profileImage || user.avatar || user.image}
                        alt={user?.name || "User"}
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-border"
                      />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#3f7d45] to-[#2f6534] text-sm font-semibold text-white">
                        {user?.role === "company"
                          ? getUserInitials(companyName)
                          : initials}
                      </span>
                    )}
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
                  </span>
                </button>

                <div
                  className={`absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-border bg-card/95 p-1.5 shadow-xl backdrop-blur-md transition-all duration-200 ${
                    profileOpen
                      ? "visible translate-y-0 opacity-100"
                      : "invisible -translate-y-1 opacity-0"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5">
                    {user?.role === "company" && companyLogoUrl ? (
                      <img
                        src={companyLogoUrl}
                        alt={companyName}
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-border"
                      />
                    ) : user?.profileImage || user?.avatar || user?.image ? (
                      <img
                        src={user.profileImage || user.avatar || user.image}
                        alt={user?.name || "User"}
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-border"
                      />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#3f7d45] to-[#2f6534] text-sm font-semibold text-white">
                        {user?.role === "company"
                          ? getUserInitials(companyName)
                          : initials}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {user?.role === "company"
                          ? companyName
                          : user?.name || "User"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user?.email || "No email"}
                      </p>
                    </div>
                  </div>

                  <div className="my-1 h-px bg-border/70" />

                  <button
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                    onClick={() => navigate(profilePath)}
                    type="button"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </button>
                  <button
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                    onClick={() => navigate(settingsPath)}
                    type="button"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  <button
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                    onClick={() => navigate(dashboardPath)}
                    type="button"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </button>

                  <div className="my-1 h-px bg-border/70" />

                  <button
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={onLogout}
                    type="button"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            className="rounded-lg p-1 text-foreground transition-all duration-200 hover:bg-muted md:hidden"
            onClick={() => setMenuOpen((value) => !value)}
            type="button"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        <div
          className={`overflow-hidden border-t border-border/40 bg-card/95 transition-all duration-300 md:hidden ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <nav className="mx-auto flex max-w-7xl flex-col py-1 text-sm font-medium text-foreground">
            <div className="flex justify-end px-6 py-3 md:hidden">
              <ThemeToggle />
            </div>
            <MobileLink label="Home" setMenuOpen={setMenuOpen} to="/" />
            <MobileLink label="About" setMenuOpen={setMenuOpen} to="/about" />
            <MobileLink
              label="Contact"
              setMenuOpen={setMenuOpen}
              to="/contact"
            />
            {isAuthed && dashboardPath ? (
              <MobileLink
                label="Dashboard"
                setMenuOpen={setMenuOpen}
                to={dashboardPath}
              />
            ) : (
              <MobileLink label="Login" setMenuOpen={setMenuOpen} to="/login" />
            )}
            {!isAuthed ? (
              <NavLink
                className="mx-6 my-2 rounded-xl bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90"
                onClick={() => setMenuOpen(false)}
                to="/register"
              >
                Register
              </NavLink>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-8 pt-28">
        <Outlet />
      </main>

      <footer className="mt-10 border-t border-border/70 bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-6 pt-12 md:grid-cols-4">
          <div>
            <img
              src="/logo.png?v=2"
              alt="Interno logo"
              className="h-10 w-auto object-contain"
            />
            <p className="mt-3 text-sm text-muted-foreground">
              The internship platform built for students and future-ready teams.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Platform</p>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <Link
                className="block transition-colors hover:text-zinc-700"
                to="/"
              >
                Home
              </Link>
              <Link
                className="block transition-colors hover:text-zinc-700"
                to="/about"
              >
                About
              </Link>
              {/* <Link
                className="block transition-colors hover:text-zinc-700"
                to="/contact"
              >
                Contact
              </Link> */}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Company</p>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <Link
                className="block transition-colors hover:text-zinc-700"
                to="/register"
              >
                Post Internship
              </Link>
              <Link
                className="block transition-colors hover:text-zinc-700"
                to="/login"
              >
                Dashboard
              </Link>
              <Link
                className="block transition-colors hover:text-zinc-700"
                to="/register"
              >
                Get Started
              </Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Connect</p>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <a
                className="block transition-colors hover:text-zinc-700"
                href="#!"
                onClick={(e) => e.preventDefault()}
              >
                LinkedIn
              </a>
              <a
                className="block transition-colors hover:text-zinc-700"
                href="#!"
                onClick={(e) => e.preventDefault()}
              >
                Instagram
              </a>
              <a
                className="block transition-colors hover:text-zinc-700"
                href="#!"
                onClick={(e) => e.preventDefault()}
              >
                X / Twitter
              </a>
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-border/70 px-4 py-5 text-sm text-muted-foreground">
          <p>� {new Date().getFullYear()} Interno. All rights reserved.</p>
          <p>Made with love for students</p>
        </div>
      </footer>
    </div>
  );
};

const getDashboardPath = (role) => {
  if (!role) return "/";
  return roleLandingMap[role] || "/";
};

const getProfilePath = (role) => {
  if (role === ROLES.TRAINEE) return "/trainee/profile";
  if (role === ROLES.COMPANY) return "/company/settings";
  if (role === ROLES.SUPERADMIN) return "/superadmin/settings";
  return getDashboardPath(role);
};

const getSettingsPath = (role) => {
  if (role === ROLES.COMPANY) return "/company/settings";
  if (role === ROLES.SUPERADMIN) return "/superadmin/settings";
  if (role === ROLES.TRAINEE) return "/trainee/profile";
  return getDashboardPath(role);
};

const HeaderLink = ({ to, label }) => (
  <NavLink
    className={({ isActive }) =>
      `relative rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
        isActive
          ? "font-semibold text-foreground"
          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
      }`
    }
    to={to}
  >
    {({ isActive }) => (
      <span className="relative inline-flex items-center">
        {label}
        {isActive ? (
          <span className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
        ) : null}
      </span>
    )}
  </NavLink>
);

const MobileLink = ({ to, label, setMenuOpen }) => (
  <NavLink
    className={({ isActive }) =>
      `mx-2 rounded-none border-b border-border/40 px-6 py-3 transition-all duration-200 ${isActive ? "bg-muted/50 font-semibold text-foreground" : "text-foreground hover:bg-muted/40"}`
    }
    onClick={() => setMenuOpen(false)}
    to={to}
  >
    {label}
  </NavLink>
);

export default PublicLayout;
