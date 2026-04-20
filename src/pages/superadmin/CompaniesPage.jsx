import { useEffect, useMemo, useState } from "react";
import Table from "@/components/common/Table";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Pagination from "@/components/common/Pagination";
import Modal from "@/components/common/Modal";
import Input from "@/components/common/Input";
import { formatDate, paginate } from "@/utils/helpers";
import { notify } from "@/utils/notify";
import {
  changeCompanyStatus,
  getApprovedCompanies,
} from "@/services/adminService";

const CompaniesPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [statusActionId, setStatusActionId] = useState(null);

  const loadCompanies = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const approvedResponse = await getApprovedCompanies();

      const approved = (approvedResponse?.data || []).map((item) => ({
        id: item.id,
        name: item.name || item.company_name,
        companyName: item.company_name || item.name,
        email: item.email || "N/A",
        phone: item.phone || item.phone_number || "N/A",
        website: item.website || item.website_url || "N/A",
        address: item.address || "N/A",
        city: item.city || "N/A",
        country: item.country || "N/A",
        industry: item.industry || "N/A",
        registrationNumber: item.registration_number || "N/A",
        profilePicture: item.profile_picture || item.logo_url || "",
        isActive: Number(item.is_active) === 1,
        approvalStatus: item.status || "approved",
        status: Number(item.is_active) === 1 ? "Active" : "Inactive",
        registeredDate: item.created_at,
      }));

      setCompanies(approved);
    } catch (error) {
      setLoadError(error?.message || "Unable to load companies.");
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const filtered = useMemo(
    () =>
      companies.filter(
        (company) =>
          (statusFilter === "All" ||
            String(company.status).toLowerCase() ===
              statusFilter.toLowerCase()) &&
          String(company.name || "")
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [search, statusFilter, companies],
  );

  const paged = paginate(filtered, page, 10);

  const handleViewCompany = (company) => {
    setSelectedCompany(company);
  };

  const closeCompanyDetails = () => {
    setSelectedCompany(null);
  };

  const handleToggleCompanyStatus = async (company) => {
    const nextStatus = !company?.isActive;

    setStatusActionId(company.id);
    try {
      await changeCompanyStatus(company.id, nextStatus);
      notify.success(
        nextStatus
          ? "Company activated successfully."
          : "Company deactivated successfully.",
      );
      await loadCompanies();
    } catch (error) {
      notify.error(error?.message, "Failed to update company status.");
    } finally {
      setStatusActionId(null);
    }
  };

  const getCompanyInitials = (name) => {
    return (
      String(name || "CO")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("") || "CO"
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search company"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-lg border border-slate-300 px-3"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <Button onClick={() => setOpen(true)}>Add New Company</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-600">Loading companies...</p>
      ) : null}

      {!isLoading && loadError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-3 text-sm text-rose-700">
          {loadError}
        </div>
      ) : null}

      <Table
        columns={[
          "Company Name",
          "Industry",
          "Status",
          "Registered Date",
          "Actions",
        ]}
        rows={paged.data}
        renderRow={(company) => (
          <tr key={company.id} className="border-t border-slate-100">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                {company.profilePicture ? (
                  <img
                    src={company.profilePicture}
                    alt={`${company.name} logo`}
                    className="h-10 w-10 rounded-xl border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-200/70 text-xs font-bold text-slate-700">
                    {getCompanyInitials(company.name)}
                  </div>
                )}
                <span className="font-medium text-slate-900">
                  {company.name}
                </span>
              </div>
            </td>
            <td className="px-4 py-3">{company.industry}</td>
            <td className="px-4 py-3">
              <Badge>{company.status || "Pending"}</Badge>
            </td>
            <td className="px-4 py-3">
              {company.registeredDate
                ? formatDate(company.registeredDate)
                : "N/A"}
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => handleViewCompany(company)}
                >
                  View
                </Button>
                <Button
                  variant={company.isActive ? "danger" : "ghost"}
                  onClick={() => handleToggleCompanyStatus(company)}
                  disabled={statusActionId === company.id}
                >
                  {statusActionId === company.id
                    ? "Updating..."
                    : !company.isActive
                      ? "Activate"
                      : "Deactivate"}
                </Button>
                <Button variant="danger">Delete</Button>
              </div>
            </td>
          </tr>
        )}
      />
      <Pagination page={page} totalPages={paged.totalPages} setPage={setPage} />

      <Modal open={open} onClose={() => setOpen(false)} title="Add New Company">
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Company Name" />
          <Input label="Industry" />
          <Input label="Email" />
          <Input label="Phone" />
        </div>
        <Button className="mt-4" onClick={() => setOpen(false)}>
          Save
        </Button>
      </Modal>

      <Modal
        open={Boolean(selectedCompany)}
        onClose={closeCompanyDetails}
        title="Company Details"
      >
        {!selectedCompany ? null : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              {selectedCompany.profilePicture ? (
                <img
                  src={selectedCompany.profilePicture}
                  alt={`${selectedCompany.name} logo`}
                  className="h-14 w-14 rounded-xl border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-200 text-sm font-bold text-slate-700">
                  {String(selectedCompany.name || "CO")
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase() || "")
                    .join("") || "CO"}
                </div>
              )}

              <div>
                <p className="text-base font-bold text-slate-900">
                  {selectedCompany.name}
                </p>
                <p className="text-xs text-slate-600">Approved company</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Company ID
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {selectedCompany.id}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Company Name
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {selectedCompany.companyName || selectedCompany.name}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {selectedCompany.email}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Phone
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {selectedCompany.phone}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Industry
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {selectedCompany.industry}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Registration Number
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {selectedCompany.registrationNumber}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Website
                </p>
                <p className="mt-1 text-sm text-slate-900 break-all">
                  {selectedCompany.website}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {selectedCompany.status}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Address
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {[
                    selectedCompany.address,
                    selectedCompany.city,
                    selectedCompany.country,
                  ]
                    .filter((value) => value && value !== "N/A")
                    .join(", ") || "N/A"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Registered Date
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {selectedCompany.registeredDate
                    ? formatDate(selectedCompany.registeredDate)
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CompaniesPage;
