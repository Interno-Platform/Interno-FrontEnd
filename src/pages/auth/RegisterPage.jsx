import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  UserRound,
  Upload,
} from "lucide-react";
import Button from "@/components/common/Button";
import { notify } from "@/utils/notify";
import { useAuth } from "@/hooks/useAuth";

const isValidSocialMediaLink = (value) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return true;

  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();
    const allowedHosts = [
      "linkedin.com",
      "x.com",
      "twitter.com",
      "facebook.com",
      "instagram.com",
      "youtube.com",
      "tiktok.com",
      "github.com",
      "behance.net",
      "dribbble.com",
    ];

    return allowedHosts.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`),
    );
  } catch {
    return false;
  }
};

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["company", "trainee"]),
    gender: z.string().optional(),
    registration_number: z.string().optional(),
    profile_picture: z.instanceof(File).optional(),
    social_media_links: z
      .array(
        z.object({
          url: z
            .string()
            .trim()
            .refine(isValidSocialMediaLink, {
              message: "Enter a valid social media link",
            }),
        }),
      )
      .default([{ url: "" }]),
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
  .superRefine((data, ctx) => {
    if (data.role !== "company") {
      return;
    }

    const validLinks = (data.social_media_links || [])
      .map((item) => item?.url?.trim())
      .filter(Boolean);

    if (validLinks.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one valid social media link",
        path: ["social_media_links", 0, "url"],
      });
    }
  })
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
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "trainee",
      gender: "",
      social_media_links: [{ url: "" }],
    },
  });
  const selectedRole = watch("role");
  const profilePictureFile = watch("profile_picture");
  const {
    fields: socialMediaFields,
    append: appendSocialMediaLink,
    remove: removeSocialMediaLink,
  } = useFieldArray({
    control,
    name: "social_media_links",
  });

  useEffect(() => {
    if (selectedRole === "company" && socialMediaFields.length === 0) {
      appendSocialMediaLink({ url: "" });
    }
  }, [appendSocialMediaLink, selectedRole, socialMediaFields.length]);

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
      const payload = {
        ...values,
        social_media_links:
          values.role === "company"
            ? (values.social_media_links || [])
                .map((item) => item?.url?.trim())
                .filter(Boolean)
            : [],
      };

      await registerUser(payload);
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
    <div className="auth-page-shell overflow-hidden rounded-[1.6rem] border border-white/70 shadow-[0_28px_80px_rgba(15,23,42,0.13)] dark:border-border/70">
      <input type="hidden" {...register("role")} />
      <div className="grid min-h-[76vh] lg:grid-cols-[0.92fr_1.08fr]">
        <section className="auth-brand-panel relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-grid-soft opacity-15" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] backdrop-blur">
              <img
                src="/logo.png?v=2"
                alt="Interno logo"
                className="h-4 w-4 rounded object-contain"
              />
              Create account
            </div>
            <h1 className="mt-6 max-w-md text-4xl font-semibold leading-tight tracking-tight">
              Build your internship journey with Interno.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-emerald-50/95">
              Pick your role, complete your profile, and start collaborating in
              minutes.
            </p>
          </div>

          <div className="relative z-10 space-y-3">
            <div className="rounded-2xl border border-white/18 bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Two-step onboarding</p>
                  <p className="mt-1 text-xs leading-5 text-emerald-50/85">
                    Select your role, then complete only the details your
                    workspace needs.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-white/18 bg-white/10 p-4 backdrop-blur">
                <p className="text-2xl font-bold">01</p>
                <p className="mt-1 text-emerald-50/85">Choose role</p>
              </div>
              <div className="rounded-2xl border border-white/18 bg-white/10 p-4 backdrop-blur">
                <p className="text-2xl font-bold">02</p>
                <p className="mt-1 text-emerald-50/85">Create profile</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-5 md:p-10">
          <div className="w-full max-w-xl rounded-[1.35rem] border border-white/80 bg-white/90 p-7 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-border dark:bg-card/92 md:p-8">
            <div className="mb-7">
              <span className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm dark:bg-card">
                <img
                  src="/logo.png?v=2"
                  alt="Interno logo"
                  className="h-9 w-9 object-contain"
                />
              </span>
              <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-foreground">
                    Create account
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step === 1
                      ? "Choose how you want to use Interno."
                      : "Enter your account details to continue."}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Step {step}/2
                </span>
              </div>
            </div>

            <div className="mb-6 space-y-2">
              <div className="flex justify-between text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <span>Step {step} of 2</span>
                <span>{step === 1 ? "Role Selection" : "Account Details"}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2f6534] to-[#5c9a64] transition-all duration-300"
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
                  className="mt-2 flex h-11 w-full items-center justify-center gap-2 shadow-[0_14px_28px_rgba(47,101,52,0.22)]"
                  onClick={handleContinue}
                  type="button"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
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
                      className="field-input h-11 pl-9"
                      {...register("name")}
                      type="text"
                      placeholder={
                        selectedRole === "company"
                          ? "Company name"
                          : "Full name"
                      }
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
                    <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      className="field-input h-11 pl-9 pr-10"
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
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
                  <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/25 p-4">
                    <label className="block space-y-1">
                      <span className="text-sm font-semibold text-slate-700">
                        Registration Number{" "}
                        <span className="text-rose-600">*</span>
                      </span>
                      <input
                        className="field-input h-11"
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

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <span className="text-sm font-semibold text-slate-700">
                            Social Media Links{" "}
                            <span className="text-rose-600">*</span>
                          </span>
                          <p className="text-xs text-muted-foreground">
                            Add at least one valid company profile link.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-3"
                          onClick={() => appendSocialMediaLink({ url: "" })}
                        >
                          Add link
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {socialMediaFields.map((field, index) => (
                          <div key={field.id} className="space-y-1">
                            <div className="flex gap-2">
                              <div className="flex-1 space-y-1">
                                <input
                                  className="field-input h-11 w-full"
                                  {...register(
                                    `social_media_links.${index}.url`,
                                  )}
                                  type="url"
                                  placeholder="https://linkedin.com/company/your-brand"
                                />
                                {errors.social_media_links?.[index]?.url ? (
                                  <span className="text-xs text-rose-600">
                                    {
                                      errors.social_media_links[index].url
                                        .message
                                    }
                                  </span>
                                ) : null}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                className="px-3"
                                disabled={socialMediaFields.length === 1}
                                onClick={() => removeSocialMediaLink(index)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedRole === "trainee" && (
                  <label className="block space-y-1">
                    <span className="text-sm font-semibold text-slate-700">
                      Gender <span className="text-rose-600">*</span>
                    </span>
                    <select className="field-input h-11" {...register("gender")}>
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

                <p className="rounded-2xl border border-border/70 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                  Selected role:{" "}
                  <span className="font-semibold capitalize text-slate-900">
                    {selectedRole}
                  </span>
                </p>
                <Button
                  className="flex h-11 w-full items-center justify-center gap-2 shadow-[0_14px_28px_rgba(47,101,52,0.22)]"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? "Creating account..." : "Create account"}
                  {!isLoading ? <ArrowRight className="h-4 w-4" /> : null}
                </Button>
              </form>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <button
                className="rounded-lg px-1 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-slate-800 dark:hover:text-foreground"
                onClick={() => (step === 1 ? navigate(-1) : setStep(1))}
                type="button"
              >
                Back
              </button>
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  className="font-semibold text-primary transition-colors hover:text-primary/80"
                  to="/login"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const RoleCard = ({ title, description, selected, onSelect, icon }) => (
  <button
    className={`relative flex w-full items-start gap-3 rounded-2xl border p-4 text-left shadow-sm transition-all duration-200 ${
      selected
        ? "border-primary bg-primary/[0.06] ring-1 ring-primary/35"
        : "border-border bg-white/70 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-muted/30 dark:bg-card/60"
    }`}
    onClick={onSelect}
    type="button"
  >
    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
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
