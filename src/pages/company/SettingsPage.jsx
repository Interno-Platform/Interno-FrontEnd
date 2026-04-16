import { useMemo } from "react";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { useAuthStore } from "@/store/authStore";
import {
  getCompanyDisplayName,
  getCompanyLogoUrl,
  getUserInitials,
} from "@/utils/companyProfile";

const CompanySettingsPage = () => {
  const { user } = useAuthStore();
  const companyName = getCompanyDisplayName(user);
  const companyLogoUrl = getCompanyLogoUrl(user);
  const initials = useMemo(() => getUserInitials(companyName), [companyName]);

  return (
    <div className="space-y-5">
      <Card className="flex items-center gap-4">
        {companyLogoUrl ? (
          <img
            alt={companyName}
            className="h-20 w-20 rounded-2xl object-cover ring-1 ring-border"
            src={companyLogoUrl}
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
            {user?.email || "No email available"}
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
            Current company data loaded from your account.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Company Name"
            defaultValue={user?.company_name || user?.name || ""}
          />
          <Input label="Contact Email" defaultValue={user?.email || ""} />
          <Input
            label="Registration Number"
            defaultValue={user?.registration_number || ""}
          />
          <Input label="Website" defaultValue={user?.website || ""} />
          <Input label="Industry" defaultValue={user?.industry || ""} />
          <Input
            label="Employee Count"
            defaultValue={user?.employee_count || ""}
          />
          <Input label="City" defaultValue={user?.city || ""} />
          <Input label="Country" defaultValue={user?.country || ""} />
          <Input label="Address" defaultValue={user?.address || ""} />
          <Input label="Phone" defaultValue={user?.phone || ""} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">
              Company Logo
            </span>
            {companyLogoUrl ? (
              <img
                alt={companyName}
                className="h-24 w-24 rounded-2xl object-cover ring-1 ring-border"
                src={companyLogoUrl}
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-500">
                No logo
              </div>
            )}
          </label>
        </div>

        <Button className="w-full md:w-auto">Save Profile</Button>
      </Card>
    </div>
  );
};

export default CompanySettingsPage;
