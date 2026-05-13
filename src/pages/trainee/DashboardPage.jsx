import { Bell, BriefcaseBusiness, CheckCircle2, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "@/components/common/Card";
import { useAuthStore } from "@/store/authStore";

const TraineeDashboardPage = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <Card className="border-primary/10 bg-gradient-to-r from-primary/10 to-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Trainee home feed
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Welcome back, {user?.name || "Trainee"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete your profile and apply to the best-matched opportunities
              today.
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-muted/60"
            to="/trainee/notifications"
          >
            <Bell className="h-4 w-4" /> Notifications
          </Link>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">
            Helpful instructions
          </h3>
        </div>
        <div className="prose max-w-none text-sm text-muted-foreground">
          <h4 className="text-base font-semibold">How to use your dashboard</h4>
          <ul className="list-disc ml-4">
            <li>
              Review the counts above: Applications, Pending reviews, Completed
              assessments, and New updates.
            </li>
            <li>
              When you are accepted for a position, you'll be notified here and
              the application status will update.
            </li>
            <li>
              Upload your CV and required files from your profile page. Use PDF
              for best compatibility.
            </li>
            <li>
              Assessments: after finishing a test, results appear under
              "Completed assessments".
            </li>
            <li>
              Keep backups of your files. Employers may request additional
              documents via messages.
            </li>
            <li>
              Browse internships in the internships section and apply to
              opportunities that match your skills.
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

const StatTile = ({ icon, label, value }) => (
  <Card className="border-border/80 p-5 hover:shadow-lg">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-slate-600">
        {icon}
      </span>
    </div>
    <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
      {value}
    </p>
  </Card>
);

export default TraineeDashboardPage;
