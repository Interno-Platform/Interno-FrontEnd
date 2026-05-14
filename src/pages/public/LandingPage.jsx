import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  UserCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  companies,
  internships,
  testimonials,
  trainees,
} from "@/data/mockData";

const steps = [
  {
    title: "Create Your Profile",
    desc: "Build a standout profile with your skills, projects, and career goals.",
    icon: <UserCircle2 className="h-5 w-5" />,
  },
  {
    title: "Browse & Apply",
    desc: "Find matching internships from top companies and apply quickly.",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: "Get Hired",
    desc: "Complete assessments, ace interviews, and launch your career.",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
];

const totalApplicants = internships.reduce(
  (sum, internship) => sum + (internship.applicants || 0),
  0,
);
const activeCompanies = companies.filter(
  (company) => company.status === "Active",
).length;
const approvedInternships = internships.filter(
  (internship) => internship.status === "Approved",
).length;

const HERO_TEXT = "Launch Your Career\nwith the Right\nInternship";

const useTypingLoop = (text) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullLength = text.length;
    const currentLength = displayedText.length;

    const isTypingDone = currentLength === fullLength && !isDeleting;
    const isDeletingDone = currentLength === 0 && isDeleting;

    const delay = isTypingDone
      ? 1400
      : isDeletingDone
        ? 350
        : isDeleting
          ? 28
          : 46;

    const timer = window.setTimeout(() => {
      if (!isDeleting) {
        if (currentLength < fullLength) {
          setDisplayedText(text.slice(0, currentLength + 1));
          return;
        }

        setIsDeleting(true);
        return;
      }

      if (currentLength > 0) {
        setDisplayedText(text.slice(0, currentLength - 1));
        return;
      }

      setIsDeleting(false);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [displayedText, isDeleting, text]);

  return displayedText;
};

const LandingPage = () => {
  const heroText = useTypingLoop(HERO_TEXT);

  return (
    <div className="space-y-20 pb-12">
      <section className="home-hero-surface relative mt-4 overflow-hidden rounded-[1.6rem] border border-white/70 px-6 py-12 shadow-[0_30px_80px_rgba(15,23,42,0.12)] md:px-10 md:py-16 dark:border-border/70">
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/80 to-transparent dark:from-white/5" />
        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.03fr_0.97fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur dark:border-primary/25 dark:bg-white/5 dark:text-emerald-200">
              <Sparkles className="h-3.5 w-3.5" />
              #1 Internship Platform
            </p>

            <h1 className="mt-5 min-h-[7.5rem] max-w-xl text-5xl font-extrabold tracking-tight text-zinc-950 md:min-h-[9rem]  dark:text-foreground">
              <span className="block whitespace-pre-line leading-[1.04]">
                {heroText}
                <span className="ml-0.5 inline-block animate-pulse align-baseline text-primary dark:text-emerald-300">
                  |
                </span>
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-8 text-zinc-600 dark:text-muted-foreground">
              Discover internship opportunities from top companies. Apply, grow,
              and kickstart your professional journey.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/register">
                <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(47,101,52,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90">
                  Browse Internships
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/75 px-5 py-3 text-sm font-semibold text-zinc-800 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary dark:border-border dark:bg-card/70 dark:text-foreground"
                to="/about"
              >
                How Interno works
              </Link>
            </div>
          </div>

          <div className="relative min-h-[460px]">
            <div className="absolute inset-4 rounded-[1.4rem] border border-white/70 bg-white/42 shadow-inner backdrop-blur-sm dark:border-border dark:bg-white/5" />
            <div className="absolute left-4 top-10 w-[88%] rounded-2xl border border-zinc-100 bg-white/95 p-6 shadow-2xl backdrop-blur dark:border-border dark:bg-card/95 sm:left-8">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#3f7d45] to-[#2f6534] text-sm font-semibold text-white">
                  BL
                </span>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-foreground">
                    BrightLabs
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-muted-foreground">
                    Technology Company
                  </p>
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-foreground">
                Frontend Developer Intern
              </h3>
              <p className="mt-1 inline-flex items-center gap-1 text-sm text-zinc-400 dark:text-muted-foreground">
                <MapPin className="h-4 w-4" /> Cairo, Egypt
              </p>
              <div className="mt-3 flex gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary dark:bg-primary/15 dark:text-emerald-200">
                  Remote
                </span>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary dark:bg-primary/15 dark:text-emerald-200">
                  Full-time
                </span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-zinc-50 p-2 dark:bg-muted/40">
                <MiniStat
                  icon={<Clock3 className="h-4 w-4" />}
                  label="3 days"
                />
                <MiniStat
                  icon={<Check className="h-4 w-4" />}
                  label="Matched"
                />
                <MiniStat
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label="Verified"
                />
              </div>
              <button className="pointer-events-none mt-5 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary/90">
                Apply Now
              </button>
            </div>

            <div className="absolute right-1 top-1 rounded-2xl border border-zinc-100 bg-white/95 px-4 py-3 shadow-lg backdrop-blur dark:border-border dark:bg-card/95">
              <p className="text-sm font-medium text-zinc-900 dark:text-foreground">
                Application Sent!
              </p>
              <p className="text-xs text-zinc-400 dark:text-muted-foreground">
                Your application is under review.
              </p>
            </div>

            <div className="absolute bottom-4 left-0 rounded-2xl border border-zinc-100 bg-white/95 px-4 py-3 shadow-lg backdrop-blur dark:border-border dark:bg-card/95">
              <p className="text-sm font-medium text-zinc-900 dark:text-foreground">
                Profile 85% complete
              </p>
              <div className="mt-2 h-2 w-44 rounded-full bg-zinc-100 dark:bg-muted">
                <div className="h-full w-[85%] rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3 text-center">
        <h2 className="text-3xl font-bold text-zinc-900">How It Works</h2>
        <p className="text-base text-zinc-500">
          Simple steps to find the internship that fits your path.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="relative rounded-2xl border border-white/70 bg-white/82 p-6 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-border dark:bg-card/82"
            >
              <span className="absolute left-4 top-4 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-500">
                0{index + 1}
              </span>
              <span className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#3f7d45] to-[#2f6534] text-white">
                {step.icon}
              </span>
              <h3 className="text-lg font-semibold text-zinc-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-500">{step.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-[#244f2a] via-[#2f6534] to-[#4d8654] p-10 text-white shadow-[0_24px_60px_rgba(47,101,52,0.26)] md:p-16">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight">
                Find Your Next Star Intern
              </h2>
              <p className="mt-3 text-emerald-100">
                Post internships and connect with motivated students ready to
                contribute to your team.
              </p>
            </div>
            <Link to="/register">
              <button className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#2f6534] transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-950 hover:text-white">
                Post an Internship
              </button>
            </Link>
          </div>
          <div className="mt-10 grid gap-4 text-center md:grid-cols-3">
            <div>
              <p className="text-3xl font-bold">{companies.length}</p>
              <p className="text-sm text-emerald-100">Total Companies</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{trainees.length}</p>
              <p className="text-sm text-emerald-100">Registered Students</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{totalApplicants}</p>
              <p className="text-sm text-emerald-100">Applications Received</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-center text-3xl font-bold text-zinc-900">
          Loved by Students & Companies
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.slice(0, 3).map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-white/70 bg-white/82 p-6 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-border dark:bg-card/82"
            >
              <div className="mb-3 flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm italic text-zinc-600">"{item.quote}"</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#3f7d45] to-[#2f6534] text-xs font-semibold text-white">
                  {item.name.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Computer Science Student
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

const HeroMetric = ({ label, value }) => (
  <div className="rounded-2xl border border-white/70 bg-white/65 p-3 shadow-sm backdrop-blur dark:border-border dark:bg-card/60">
    <p className="text-xl font-bold text-zinc-950 dark:text-foreground">
      {value}
    </p>
    <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-muted-foreground">
      {label}
    </p>
  </div>
);

const MiniStat = ({ icon, label }) => (
  <span className="inline-flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg bg-white px-2 py-2 text-center text-xs font-semibold text-zinc-600 dark:bg-card dark:text-muted-foreground">
    <span className="text-primary">{icon}</span>
    <span className="truncate">{label}</span>
  </span>
);

export default LandingPage;
