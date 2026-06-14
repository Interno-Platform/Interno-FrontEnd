import {
  BriefcaseBusiness,
  Bell,
  Upload,
  FileCheck,
  ShieldCheck,
  Search,
} from "lucide-react";

import Card from "@/components/common/Card";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";

const instructions = [
  {
    icon: BriefcaseBusiness,
    text: "Review your applications, pending reviews, completed assessments, and updates.",
  },
  {
    icon: Bell,
    text: "You'll receive notifications whenever your application status changes.",
  },
  {
    icon: Upload,
    text: "Upload your CV and required documents from your profile page.",
  },
  {
    icon: FileCheck,
    text: "Assessment results will appear automatically after completion.",
  },
  {
    icon: ShieldCheck,
    text: "Complete Your Profile To View Matching Internships.",
  },
  {
    icon: Search,
    text: "Browse internships regularly and apply to matching opportunities.",
  },
];

const TraineeDashboardPage = () => {
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="border-primary/10 bg-gradient-to-r from-primary/10 to-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Trainee Home Feed
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Welcome back, {user?.name || "Trainee"} 👋
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Complete your profile and apply to the best-matched opportunities
              today.
            </p>
          </div>
        </div>
      </Card>

      {/* Instructions Card */}
      <Card className="space-y-5">
        {step < instructions.length ? (
          <>
            {/* STEP VIEW */}
            <div className="py-4 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Getting Started
              </span>

              <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                Step {step + 1} of {instructions.length}
              </h3>

              {/* Main Step Card */}
              <div className="relative mt-8 overflow-hidden rounded-3xl border border-primary/10 bg-white p-8 shadow-lg">
                {/* decorations */}
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
                <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-primary/5 blur-xl" />

                <div className="relative">
                  {/* ICON */}
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    {(() => {
                      const Icon = instructions[step].icon;
                      return <Icon className="h-8 w-8 text-primary" />;
                    })()}
                  </div>

                  {/* Step badge */}
                  <div className="mb-4 flex justify-center">
                    <span className="rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                      Step {step + 1}
                    </span>
                  </div>

                  {/* TEXT */}
                  <p className="text-center text-xl font-medium leading-9 text-slate-700">
                    {instructions[step].text}
                  </p>
                </div>
              </div>
            </div>

            {/* NAVIGATION */}
            <div className="flex items-center justify-between">
              <button
                disabled={step === 0}
                onClick={() => setStep((prev) => prev - 1)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {/* DOTS */}
              <div className="flex gap-2">
                {instructions.map((_, index) => (
                  <div
                    key={index}
                    className={`transition-all duration-300 ${
                      index === step
                        ? "h-2 w-8 rounded-full bg-primary"
                        : "h-2 w-2 rounded-full bg-slate-300"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setStep((prev) => prev + 1)}
                className="rounded-xl bg-primary px-5 py-2.5 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                {step === instructions.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* STATIC VIEW */}
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Helpful Instructions
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Quick reference guide
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {instructions.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                      <Icon size={18} />
                    </div>

                    <p className="text-sm leading-6 text-slate-600">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default TraineeDashboardPage;
