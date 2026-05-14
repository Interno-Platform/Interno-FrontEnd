import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { roleLandingMap } from "@/utils/constants";
import Button from "@/components/common/Button";
import { useAuth } from "@/hooks/useAuth";
import { notify } from "@/utils/notify";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    try {
      const response = await login(values.email, values.password);
      const successMessage = response?.message || "Login successful";
      const companyApproval =
        response?.user?.approved ??
        response?.user?.is_active ??
        response?.user?.details?.approved ??
        response?.user?.details?.is_active;
      const userRole =
        response?.user?.role ||
        response?.user?.details?.role ||
        response?.details?.role ||
        response?.role;

      if (userRole === "company" && String(companyApproval) !== "1") {
        notify.error(
          "Your company account is pending admin approval",
          "Your company account is pending admin approval",
        );
        return;
      }

      if (!userRole || !roleLandingMap[userRole]) {
        notify.error(
          "Login succeeded but role is missing",
          "Unable to complete login. Please contact support.",
        );
        return;
      }

      notify.success(successMessage || "Welcome back.");
      navigate(roleLandingMap[userRole]);
    } catch (error) {
      notify.error(error?.message, "Invalid email or password.");
    }
  };

  return (
    <div className="auth-page-shell overflow-hidden rounded-[1.6rem] border border-white/70 shadow-[0_28px_80px_rgba(15,23,42,0.13)] dark:border-border/70">
      <div className="grid min-h-[76vh] lg:grid-cols-[1.02fr_0.98fr]">
        <section className="auth-brand-panel relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-grid-soft opacity-15" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] backdrop-blur">
              <img
                src="/logo.png?v=2"
                alt="Interno logo"
                className="h-4 w-4 rounded object-contain"
              />
              Interno Platform
            </div>
            <h1 className="mt-6 max-w-md text-4xl font-semibold leading-tight tracking-tight">
              Welcome back to your internship command center.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-emerald-50/95">
              Continue managing applications, assessments, approvals, and hiring
              workflows from one focused workspace.
            </p>
          </div>

          <div className="relative z-10 grid gap-3">
            <AuthFeature
              icon={<GraduationCap className="h-4 w-4" />}
              title="Trainee progress"
              copy="Track profile strength, exams, and applications."
            />
            <AuthFeature
              icon={<Building2 className="h-4 w-4" />}
              title="Company hiring"
              copy="Review applicants and publish internships faster."
            />
            <AuthFeature
              icon={<ShieldCheck className="h-4 w-4" />}
              title="Secure approvals"
              copy="Role-based access keeps every workflow controlled."
            />
          </div>
        </section>

        <section className="flex items-center justify-center p-5 md:p-10">
          <div className="w-full max-w-md rounded-[1.35rem] border border-white/80 bg-white/90 p-7 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-border dark:bg-card/92 md:p-8">
            <div className="mb-7">
              <span className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm dark:bg-card">
                <img
                  src="/logo.png?v=2"
                  alt="Interno logo"
                  className="h-9 w-9 object-contain"
                />
              </span>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-foreground">
                    Sign in
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Use your account to continue to your dashboard.
                  </p>
                </div>
                <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:inline-flex">
                  Secure
                </span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <label className="block space-y-1">
                <span className="text-sm font-semibold text-slate-700">
                  Email
                </span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    className="field-input h-11 pl-9"
                    {...register("email")}
                    type="email"
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email ? (
                  <span className="text-xs text-rose-600">
                    {errors.email.message}
                  </span>
                ) : null}
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-semibold text-slate-700">
                  Password
                </span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    className="field-input h-11 pl-9 pr-10"
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                  />
                  <button
                    className="absolute right-3 top-2.5 rounded-md p-1 text-muted-foreground transition-all duration-200 hover:bg-muted"
                    onClick={() => setShowPassword((value) => !value)}
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password ? (
                  <span className="text-xs text-rose-600">
                    {errors.password.message}
                  </span>
                ) : null}
              </label>

              <Button
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 shadow-[0_14px_28px_rgba(47,101,52,0.22)]"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? "Signing in..." : "Sign in"}
                {!isLoading ? <ArrowRight className="h-4 w-4" /> : null}
              </Button>
            </form>

            <div className="mt-5 flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <BadgeCheck className="h-4 w-4 text-primary" />
              Role-based routing sends you to the right workspace.
            </div>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link
                className="font-semibold text-primary transition-all duration-200 hover:text-primary/80"
                to="/register"
              >
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

const AuthFeature = ({ icon, title, copy }) => (
  <div className="flex items-start gap-3 rounded-2xl border border-white/18 bg-white/10 p-4 backdrop-blur">
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-emerald-50">
      {icon}
    </span>
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-5 text-emerald-50/85">{copy}</p>
    </div>
  </div>
);

export default LoginPage;
