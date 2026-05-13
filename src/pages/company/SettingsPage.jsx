import { useEffect, useMemo, useState } from "react";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { useAuthStore } from "@/store/authStore";
import { updateUserProfile } from "@/services/authService";
import { notify } from "@/utils/notify";
import {
  getCompanyDisplayName,
  getCompanyLogoUrl,
  getUserInitials,
} from "@/utils/companyProfile";

const buildCompanyForm = (user) => {
  const details = user?.details || {};

  return {
    company_name:
      user?.company_name || details?.company_name || user?.name || "",
    email: user?.email || details?.email || "",
    registration_number:
      user?.registration_number || details?.registration_number || "",
    website: user?.website || details?.website || "",
    industry: user?.industry || details?.industry || "",
    employee_count: user?.employee_count || details?.employee_count || "",
    city: user?.city || details?.city || "",
    country: user?.country || details?.country || "",
    address: user?.address || details?.address || "",
    phone: user?.phone || details?.phone || "",
  };
};

const imageAllowedTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
];

const CompanySettingsPage = () => {
  const { user, updateUser } = useAuthStore();
  const [profileForm, setProfileForm] = useState(() => buildCompanyForm(user));
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const companyName = profileForm.company_name || getCompanyDisplayName(user);
  const companyLogoUrl = getCompanyLogoUrl(user);
  const initials = useMemo(() => getUserInitials(companyName), [companyName]);
  const displayedLogoUrl = logoPreview || companyLogoUrl;

  useEffect(() => {
    setProfileForm(buildCompanyForm(user));
    setLogoFile(null);
    setLogoPreview("");
  }, [user]);

  useEffect(
    () => () => {
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    },
    [logoPreview],
  );

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoChange = (file) => {
    if (!file) {
      return;
    }

    if (!imageAllowedTypes.includes(file.type)) {
      notify.error("Please choose an image file.", "Invalid file type.");
      return;
    }

    if (logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    if (logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoFile(null);
    setLogoPreview("");
  };

  const handleSaveProfile = async () => {
    const payload = Object.entries(profileForm).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && String(value).trim()) {
        acc[key] = value;
      }
      return acc;
    }, {});

    if (!Object.keys(payload).length && !logoFile) {
      notify.error("Update at least one field before saving.");
      return;
    }

    if (logoFile) {
      payload.profile_picture = logoFile;
    }

    setIsSavingProfile(true);
    try {
      const response = await updateUserProfile(payload);
      const updatedUser =
        response?.data?.user || response?.user || response?.data || null;

      if (updatedUser) {
        updateUser(updatedUser);
      }

      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }

      setLogoFile(null);
      setLogoPreview("");
      notify.success("Company profile updated successfully.");
    } catch (error) {
      notify.error(error?.message, "Failed to update company profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card className="flex items-center gap-4">
        {displayedLogoUrl ? (
          <img
            alt={companyName}
            className="h-20 w-20 rounded-2xl object-cover ring-1 ring-border"
            src={displayedLogoUrl}
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
            {initials}
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {companyName}
          </h2>
          <p className="text-sm text-muted-foreground">
            {user?.email || profileForm.email || "No email available"}
          </p>
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
            {user?.role || "company"}
          </p>
        </div>
      </Card>

      <Card className="max-w-4xl space-y-5">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Company Profile Settings
          </h3>
          <p className="text-sm text-muted-foreground">
            Update your company details and logo from one place.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Company Name"
            name="company_name"
            onChange={handleFieldChange}
            value={profileForm.company_name}
          />
          <Input
            label="Contact Email"
            name="email"
            onChange={handleFieldChange}
            value={profileForm.email}
          />
          <Input
            label="Registration Number"
            name="registration_number"
            onChange={handleFieldChange}
            value={profileForm.registration_number}
          />
          <Input
            label="Website"
            name="website"
            onChange={handleFieldChange}
            value={profileForm.website}
          />
          <Input
            label="Industry"
            name="industry"
            onChange={handleFieldChange}
            value={profileForm.industry}
          />
          <Input
            label="Employee Count"
            name="employee_count"
            onChange={handleFieldChange}
            value={profileForm.employee_count}
          />
          <Input
            label="City"
            name="city"
            onChange={handleFieldChange}
            value={profileForm.city}
          />
          <Input
            label="Country"
            name="country"
            onChange={handleFieldChange}
            value={profileForm.country}
          />
          <Input
            label="Address"
            name="address"
            onChange={handleFieldChange}
            value={profileForm.address}
          />
          <Input
            label="Phone"
            name="phone"
            onChange={handleFieldChange}
            value={profileForm.phone}
          />
        </div>

        <div className="space-y-3">
          <span className="block text-sm font-semibold text-slate-700">
            Company Logo
          </span>
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
            {displayedLogoUrl ? (
              <img
                alt={companyName}
                className="h-24 w-24 rounded-2xl object-cover ring-1 ring-border"
                src={displayedLogoUrl}
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-slate-500 ring-1 ring-slate-200">
                {initials}
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Upload a new logo to update how your company appears across the
                platform.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <label
                  className="inline-flex cursor-pointer items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
                  htmlFor="company-logo-upload"
                >
                  Change Logo
                </label>
                <input
                  accept="image/*"
                  className="hidden"
                  id="company-logo-upload"
                  onChange={(event) =>
                    handleLogoChange(event.target.files?.[0])
                  }
                  type="file"
                />
                {logoFile ? (
                  <button
                    className="text-sm font-medium text-slate-500 hover:text-slate-900"
                    type="button"
                    onClick={handleRemoveLogo}
                  >
                    Remove selected image
                  </button>
                ) : null}
              </div>
              <p className="text-xs text-slate-500">
                PNG, JPG, WEBP, or GIF only.
              </p>
            </div>
          </div>
        </div>

        <Button
          className="w-full md:w-auto"
          disabled={isSavingProfile}
          onClick={handleSaveProfile}
        >
          {isSavingProfile ? "Saving..." : "Save Profile"}
        </Button>
      </Card>
    </div>
  );
};

export default CompanySettingsPage;
