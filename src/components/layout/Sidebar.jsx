import { NavLink } from "react-router-dom";
import {
  Bookmark,
  Calendar,
  FileText,
  Folder,
  Grid3X3,
  Home,
  MessageSquare,
  Settings,
  UserRound,
  Users,
  BriefcaseBusiness,
} from "lucide-react";
import {
  getCompanyDisplayName,
  getCompanyLogoUrl,
  getUserInitials,
} from "@/utils/companyProfile";

const navBase =
  "group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200";
const navState = (isActive) =>
  isActive
    ? "bg-primary/12 text-primary shadow-sm"
    : "text-muted-foreground hover:bg-muted hover:text-foreground";

const Sidebar = ({ links, role, onNavigate, onLogout, user }) => (
  <aside className="sticky top-0 flex h-screen w-72 flex-col border-r border-border/80 bg-gradient-to-b from-card to-surface px-4 py-5">
    <div className="mb-7 flex items-center gap-2 border-b border-border/70 pb-4">
      <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-card shadow-sm">
        <img
          src="/logo.png?v=2"
          alt="Interno logo"
          className="h-full w-full object-contain"
        />
      </span>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {role === "company" ? getCompanyDisplayName(user) : "Interno"}
        </h2>
        <p className="text-xs text-muted-foreground">
          {role === "trainee"
            ? "Trainee Portal"
            : role === "company"
              ? "Company Portal"
              : role || "Portal"}
        </p>
      </div>
    </div>

    {role === "trainee" ? (
      <TraineeMenu onNavigate={onNavigate} user={user} />
    ) : role === "company" ? (
      <CompanyMenu onNavigate={onNavigate} user={user} />
    ) : role === "admin" ? (
      <SuperAdminMenu onLogout={onLogout} onNavigate={onNavigate} user={user} />
    ) : (
      <nav className="space-y-1.5">
        {links.length ? (
          links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onNavigate}
              className={({ isActive }) => `${navBase} ${navState(isActive)}`}
            >
              <span className="flex items-center gap-2.5">
                {link.icon ? <link.icon className="h-4 w-4 shrink-0" /> : null}
                {link.label}
              </span>
            </NavLink>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/40 px-3 py-4 text-xs text-muted-foreground">
            No menu items available for this role.
          </div>
        )}
      </nav>
    )}
  </aside>
);

const traineeLinks = [
  { to: "/trainee", label: "Home", icon: Home, end: true },
  { to: "/trainee/applications", label: "My Applications", icon: FileText },
  { to: "/trainee/profile", label: "Profile", icon: UserRound },
  { to: "/trainee/internships", label: "Internships", icon: Bookmark },
  {
    to: "/trainee/notifications",
    label: "Messages",
    icon: MessageSquare,
    badge: 2,
  },
];

const TraineeMenu = ({ onNavigate, user }) => (
  <>
    <nav className="space-y-1.5">
      {traineeLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          onClick={onNavigate}
          className={({ isActive }) => `${navBase} ${navState(isActive)}`}
        >
          <span className="flex items-center gap-2.5">
            <link.icon className="h-4 w-4 shrink-0" />
            {link.label}
          </span>
          {link.badge ? (
            <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
              {link.badge}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>

    <UserMeta role="trainee" roleLabel="View Profile" user={user} />
  </>
);

const companyLinks = [
  { to: "/company", label: "Dashboard", icon: Home, end: true },
  { to: "/company/internships", label: "Internships", icon: Folder },
  { to: "/company/applicants", label: "Applicants", icon: Users },
  { to: "/company/messages", label: "Messages", icon: MessageSquare, badge: 3 },
  { to: "/company/interviews", label: "Interviews", icon: Calendar },
];

const CompanyMenu = ({ onNavigate, user }) => (
  <>
    <nav className="space-y-1.5">
      {companyLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          onClick={onNavigate}
          className={({ isActive }) => `${navBase} ${navState(isActive)}`}
        >
          <span className="flex items-center gap-2.5">
            <link.icon className="h-4 w-4 shrink-0" />
            {link.label}
          </span>
          {link.badge ? (
            <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
              {link.badge}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>

    <div className="mt-auto space-y-2">
      <NavLink
        className={({ isActive }) => `${navBase} ${navState(isActive)}`}
        onClick={onNavigate}
        to="/company/settings"
      >
        <span className="flex items-center gap-2.5">
          <Settings className="h-4 w-4" />
          Settings
        </span>
      </NavLink>
      <UserMeta role="company" roleLabel="Company Portal" user={user} />
    </div>
  </>
);

const superAdminLinks = [
  { to: "/superadmin", label: "Dashboard", icon: Grid3X3, end: true },
  { to: "/superadmin/requests", label: "Requests", icon: FileText, badge: 12 },
  {
    to: "/superadmin/contact-messages",
    label: "Contact Messages",
    icon: MessageSquare,
  },
  { to: "/superadmin/companies", label: "Companies", icon: Folder },
  { to: "/superadmin/trainees", label: "Trainees", icon: Users },
  {
    to: "/superadmin/internships",
    label: "Internships",
    icon: BriefcaseBusiness,
  },
];

const SuperAdminMenu = ({ onNavigate, onLogout, user }) => (
  <>
    <nav className="space-y-1.5">
      {superAdminLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          onClick={onNavigate}
          className={({ isActive }) => `${navBase} ${navState(isActive)}`}
        >
          <span className="flex items-center gap-2.5">
            <link.icon className="h-4 w-4 shrink-0" />
            {link.label}
          </span>
          {link.badge ? (
            <span className="rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
              {link.badge}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>

    <div className="mt-auto space-y-2">
      <NavLink
        className={({ isActive }) => `${navBase} ${navState(isActive)}`}
        onClick={onNavigate}
        to="/superadmin/settings"
      >
        <span className="flex items-center gap-2.5">
          <Settings className="h-4 w-4" />
          Settings
        </span>
      </NavLink>
      <button
        className="w-full rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary/90"
        onClick={onLogout}
        type="button"
      >
        Log Out
      </button>
      <UserMeta role="admin" roleLabel="Super Admin" user={user} />
    </div>
  </>
);

const UserMeta = ({ user, role, roleLabel }) => (
  <div className="mt-auto rounded-2xl border border-border bg-card p-3 shadow-sm">
    <div className="mb-2 flex items-center gap-3">
      {getCompanyLogoUrl(user) ? (
        <img
          alt={getCompanyDisplayName(user)}
          className="h-10 w-10 rounded-xl object-cover ring-1 ring-border"
          src={getCompanyLogoUrl(user)}
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-xs font-semibold text-primary">
          {getUserInitials(getCompanyDisplayName(user))}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {role === "company"
            ? getCompanyDisplayName(user)
            : user?.name || "User"}
        </p>
        {role === "company" ? (
          <p className="truncate text-xs text-muted-foreground">
            {user?.email || "No email"}
          </p>
        ) : null}
      </div>
    </div>
    <p className="text-xs text-muted-foreground">{roleLabel}</p>
  </div>
);

export default Sidebar;
