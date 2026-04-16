import { Award, Building2, Flag, Lightbulb } from 'lucide-react';
import Card from '@/components/common/Card';

const values = [
  { title: 'Transparency', copy: 'Every stage from posting to hiring stays visible and measurable.', icon: <Flag className="h-5 w-5" /> },
  { title: 'Quality Matching', copy: 'Skill-based matching helps trainees and companies connect faster.', icon: <Lightbulb className="h-5 w-5" /> },
  { title: 'Operational Clarity', copy: 'Admins get full oversight across companies, internships, and approvals.', icon: <Building2 className="h-5 w-5" /> },
  { title: 'Career Impact', copy: 'We focus on internship outcomes that convert into real opportunities.', icon: <Award className="h-5 w-5" /> },
];

const AboutPage = () => (
  <div className="space-y-10 pb-8">
    <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-white p-8 md:p-10">
      <div className="pointer-events-none absolute inset-0 bg-grid-soft opacity-40" />
      <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">About Interno</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">A modern operating system for internships</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Interno was built to remove friction across internship programs. We bring trainee onboarding, company hiring, and admin governance into one unified workflow.
          </p>
        </div>
        <Card className="bg-muted/30">
          <p className="text-sm font-semibold text-slate-900">Our Mission</p>
          <p className="mt-2 text-sm text-muted-foreground">Give every trainee and employer a clearer path from application to internship success.</p>
        </Card>
      </div>
    </section>

    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {values.map((item) => (
        <Card className="space-y-2 transition-all duration-200 hover:shadow-lg" key={item.title}>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">{item.icon}</span>
          <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
          <p className="text-sm text-muted-foreground">{item.copy}</p>
        </Card>
      ))}
    </section>

    <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Card className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Our Story</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p><strong>2022:</strong> Interno started as a simple portal for internship posting and tracking.</p>
          <p><strong>2024:</strong> We expanded to role-based dashboards and enterprise workflows.</p>
          <p><strong>2026:</strong> AI-enabled matching and assessment insights were introduced to improve hiring speed.</p>
        </div>
      </Card>
      <Card className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Partners</h2>
        <div className="grid gap-2">
          {['BrightLabs', 'HealthNova', 'FinEdge', 'SkillPort'].map((name) => (
            <div className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm font-semibold text-slate-700" key={name}>{name}</div>
          ))}
        </div>
      </Card>
    </section>
  </div>
);

export default AboutPage;
