import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
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
    <div className="overflow-hidden rounded-3xl border border-border/70 bg-white shadow-xl">
      <div className="grid min-h-[76vh] lg:grid-cols-2">
        <section className="auth-aurora relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute inset-0 bg-noise-soft opacity-20" />
          <div className="pointer-events-none absolute left-10 top-20 h-44 w-44 rounded-full border border-white/20 bg-white/10 blur-[1px] float-slower" />
          <div className="pointer-events-none absolute bottom-16 right-12 h-56 w-56 rounded-full border border-white/20 bg-white/10 blur-[1px] float-slow" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
              <img
                src="/logo.png?v=2"
                alt="Interno logo"
                className="h-4 w-4 rounded object-contain"
              />
              Interno Platform
            </div>
            <h1 className="mt-5 max-w-md text-4xl font-semibold tracking-tight">
              Manage internship operations from one modern workspace.
            </h1>
            <p className="mt-3 max-w-md text-sm text-emerald-50/95">
              Applications, assessments, approvals, and hiring workflows in one
              secure dashboard.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md rounded-2xl border border-border/70 bg-white p-8 shadow-xl">
            <div className="mb-6">
              <span className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                Login
              </h2>
              <p className="text-sm text-muted-foreground">
                Sign in to continue to your dashboard.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <label className="block space-y-1">
                <span className="text-sm font-semibold text-slate-700">
                  Email
                </span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    className="field-input pl-9"
                    {...register("email")}
                    type="email"
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
                  <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    className="field-input pl-9 pr-10"
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
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

              <Button className="w-full" disabled={isLoading} type="submit">
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="mt-4 text-sm text-muted-foreground">
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

export default LoginPage;
