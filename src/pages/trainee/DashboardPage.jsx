import { Bell, BriefcaseBusiness, CheckCircle2, Clock3 } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card from '@/components/common/Card';
import { internships } from '@/data/mockData';
import { useAuthStore } from '@/store/authStore';
import { calcMatchScore } from '@/utils/helpers';

const TraineeDashboardPage = () => {
  const { user } = useAuthStore();
  const skillSet = user?.skills || ['React.js', 'JavaScript', 'Git'];
  const matches = useMemo(
    () => internships.map((item) => ({ ...item, score: calcMatchScore(item.skills, skillSet) })).sort((a, b) => b.score - a.score),
    [skillSet],
  );

  return (
    <div className="space-y-6">
      <Card className="border-primary/10 bg-gradient-to-r from-primary/10 to-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Trainee home feed</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Welcome back, {user?.name || 'Trainee'}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Complete your profile and apply to the best-matched opportunities today.</p>
          </div>
          <Link className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-muted/60" to="/trainee/notifications">
            <Bell className="h-4 w-4" /> Notifications
          </Link>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={<BriefcaseBusiness className="h-4 w-4" />} label="Applications" value="06" />
        <StatTile icon={<Clock3 className="h-4 w-4" />} label="Pending reviews" value="02" />
        <StatTile icon={<CheckCircle2 className="h-4 w-4" />} label="Completed assessments" value="05" />
        <StatTile icon={<Bell className="h-4 w-4" />} label="New updates" value="04" />
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">Matched for you</h3>
          <Link className="text-sm font-semibold text-primary transition-all duration-200 hover:text-primary/80" to="/trainee/internships">See all</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {matches.slice(0, 3).map((item) => (
            <article key={item.id} className="rounded-2xl border border-border/80 p-5 transition-all duration-200 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{item.score}% match</span>
                <span className="text-xs text-muted-foreground">{item.duration}</span>
              </div>
              <h4 className="mt-3 text-base font-semibold text-slate-900">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.company}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="rounded-full border border-border bg-muted/40 px-2 py-1 text-xs text-slate-600">{skill}</span>
                ))}
              </div>
              <Link
                className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary/90"
                to={`/trainee/internships/${item.id}`}
              >
                View details
              </Link>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
};

const StatTile = ({ icon, label, value }) => (
  <Card className="border-border/80 p-5 hover:shadow-lg">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-slate-600">{icon}</span>
    </div>
    <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
  </Card>
);

export default TraineeDashboardPage;
