import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BriefcaseBusiness,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserRound,
  Upload,
} from "lucide-react";
import Button from "@/components/common/Button";
import { notify } from "@/utils/notify";
import { useAuth } from "@/hooks/useAuth";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["company", "trainee"]),
    gender: z.string().optional(),
    registration_number: z.string().optional(),
    profile_picture: z.instanceof(File).optional(),
  })
  .refine(
    (data) => {
      if (data.role === "company" && !data.registration_number) {
        return false;
      }
      return true;
    },
    {
      message: "Registration number is required for companies",
      path: ["registration_number"],
    },
  )
  .refine(
    (data) => {
      if (data.role === "trainee" && !data.gender) {
        return false;
      }
      return true;
    },
    {
      message: "Gender is required for trainees",
      path: ["gender"],
    },
  );

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: "trainee", gender: "" },
  });
  const selectedRole = watch("role");
  const profilePictureFile = watch("profile_picture");

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("profile_picture", file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePreview(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values) => {
    try {
      await registerUser(values);
      notify.success("Registration completed. Please sign in.");
      navigate("/login");
    } catch (error) {
      notify.error(error?.message, "Registration could not be completed.");
    }
  };

  const handleContinue = () => {
    if (!selectedRole) {
      notify.info("Please select your role first.");
      return;
    }
    setStep(2);
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-border/70 bg-white shadow-xl">
      <input type="hidden" {...register("role")} />
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
              Create account
            </div>
            <h1 className="mt-5 max-w-md text-4xl font-semibold tracking-tight">
              Build your internship journey with Interno.
            </h1>
            <p className="mt-3 max-w-md text-sm text-emerald-50/95">
              Pick your role, complete your profile, and start collaborating in
              minutes.
            </p>
          </div>

          <div className="relative z-10 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm">
            <p className="font-semibold">Two-step onboarding</p>
            <p className="mt-2 text-emerald-50/95">1. Select role</p>
            <p className="text-emerald-50/95">2. Add account details</p>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md rounded-2xl border border-border/70 bg-white p-8 shadow-xl">
            <div className="mb-6">
              <span className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
                <img
                  src="/logo.png?v=2"
                  alt="Interno logo"
                  className="h-full w-full object-contain"
                />
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                Register
              </h2>
              <p className="text-sm text-muted-foreground">
                {step === 1
                  ? "Choose how you want to use Interno."
                  : "Enter your account details to continue."}
              </p>
            </div>

            <div className="mb-6 space-y-2">
              <div className="flex justify-between text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <span>Step {step} of 2</span>
                <span>{step === 1 ? "Role Selection" : "Account Details"}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: step === 1 ? "50%" : "100%" }}
                />
              </div>
            </div>

            {step === 1 ? (
              <div className="space-y-3">
                <RoleCard
                  title="I am a Trainee"
                  description="Find opportunities and track your applications."
                  icon={<UserRound className="h-4 w-4" />}
                  selected={selectedRole === "trainee"}
                  onSelect={() =>
                    setValue("role", "trainee", {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
                <RoleCard
                  title="I am a Company"
                  description="Post internships and manage applicants."
                  icon={<BriefcaseBusiness className="h-4 w-4" />}
                  selected={selectedRole === "company"}
                  onSelect={() =>
                    setValue("role", "company", {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
                <Button
                  className="mt-2 w-full"
                  onClick={handleContinue}
                  type="button"
                >
                  Continue
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Name
                  </span>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      className="field-input pl-9"
                      {...register("name")}
                      type="text"
                    />
                  </div>
                  {errors.name ? (
                    <span className="text-xs text-rose-600">
                      {errors.name.message}
                    </span>
                  ) : null}
                </label>

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

                {selectedRole === "company" && (
                  <label className="block space-y-1">
                    <span className="text-sm font-semibold text-slate-700">
                      Registration Number{" "}
                      <span className="text-rose-600">*</span>
                    </span>
                    <input
                      className="field-input"
                      {...register("registration_number")}
                      type="text"
                      placeholder="e.g., REG123456"
                    />
                    {errors.registration_number ? (
                      <span className="text-xs text-rose-600">
                        {errors.registration_number.message}
                      </span>
                    ) : null}
                  </label>
                )}

                {selectedRole === "trainee" && (
                  <label className="block space-y-1">
                    <span className="text-sm font-semibold text-slate-700">
                      Gender <span className="text-rose-600">*</span>
                    </span>
                    <select className="field-input" {...register("gender")}>
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    {errors.gender ? (
                      <span className="text-xs text-rose-600">
                        {errors.gender.message}
                      </span>
                    ) : null}
                  </label>
                )}

                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Profile Picture{" "}
                    <span className="text-xs text-muted-foreground">
                      (Optional)
                    </span>
                  </span>
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        className="hidden"
                        accept="image/*"
                        id="profile_picture"
                        onChange={handleProfilePictureChange}
                        type="file"
                      />
                      <label
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 p-4 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5"
                        htmlFor="profile_picture"
                      >
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {profilePictureFile
                            ? "Change picture"
                            : "Upload picture"}
                        </span>
                      </label>
                    </div>
                    {profilePreview && (
                      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                        <img
                          alt="Profile preview"
                          className="h-10 w-10 rounded-lg object-cover"
                          src={profilePreview}
                        />
                        <span className="text-sm text-muted-foreground">
                          {profilePictureFile?.name}
                        </span>
                      </div>
                    )}
                  </div>
                  {errors.profile_picture ? (
                    <span className="text-xs text-rose-600">
                      {errors.profile_picture.message}
                    </span>
                  ) : null}
                </label>

                <p className="text-sm text-muted-foreground">
                  Selected role:{" "}
                  <span className="font-semibold capitalize text-slate-900">
                    {selectedRole}
                  </span>
                </p>
                <Button className="w-full" disabled={isLoading} type="submit">
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            )}

            <button
              className="mt-4 rounded-lg px-1 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-slate-800"
              onClick={() => (step === 1 ? navigate(-1) : setStep(1))}
              type="button"
            >
              Back
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

const RoleCard = ({ title, description, selected, onSelect, icon }) => (
  <button
    className={`relative flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200 ${
      selected
        ? "border-primary bg-primary/[0.04] ring-1 ring-primary/40"
        : "border-border hover:border-primary/50 hover:bg-muted/30"
    }`}
    onClick={onSelect}
    type="button"
  >
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
      {icon}
    </span>
    <div>
      <h3
        className={`text-base font-semibold ${
          selected ? "text-primary" : "text-slate-900"
        }`}
      >
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <span
      className={`ml-auto inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
        selected
          ? "border-primary bg-primary text-white"
          : "border-border text-transparent"
      }`}
    >
      <Check className="h-3.5 w-3.5" />
    </span>
  </button>
);

export default RegisterPage;
