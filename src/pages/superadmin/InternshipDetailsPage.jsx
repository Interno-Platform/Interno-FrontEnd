import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Card from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import {
  changeInternshipStatus,
  getApprovedInternships,
  getPendingInternships,
} from "@/services/adminService";
import { notify } from "@/utils/notify";

const formatDate = (value) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleDateString();
};

const toSkillLabel = (skill) => {
  if (typeof skill === "string") return skill;
  return (
    skill?.name || skill?.skill_name || `Skill #${skill?.id || skill?.skill_id}`
  );
};

const toDisplayStatus = (status) => {
  const normalized = String(status || "pending").toLowerCase();
  if (normalized === "active") return "Approved";
  if (normalized === "approved") return "Approved";
  if (normalized === "pending") return "Pending";
  if (normalized === "rejected") return "Rejected";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const InternshipDetailsPage = () => {
  const { companyId, internshipId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [internship, setInternship] = useState(
    location.state?.internship || null,
  );
  const [isLoading, setIsLoading] = useState(!location.state?.internship);
  const [loadError, setLoadError] = useState("");
  const [actionKey, setActionKey] = useState("");
  const [resolvedListType, setResolvedListType] = useState(
    location.state?.listType || "pending",
  );

  useEffect(() => {
    if (location.state?.internship) {
      return;
    }

    const loadInternship = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const findById = (items) =>
          (Array.isArray(items) ? items : []).find(
            (item) =>
              String(item?.id ?? item?.internship_id) === String(internshipId),
          );

        const requestedListType = location.state?.listType;
        let matched = null;

        if (requestedListType === "approved") {
          const response = await getApprovedInternships(companyId);
          matched = findById(response?.data);
          setResolvedListType("approved");
        } else if (requestedListType === "pending") {
          const response = await getPendingInternships(companyId);
          matched = findById(response?.data);
          setResolvedListType("pending");
        } else {
          const [pendingResponse, approvedResponse] = await Promise.all([
            getPendingInternships(companyId),
            getApprovedInternships(companyId),
          ]);

          const pendingMatch = findById(pendingResponse?.data);
          const approvedMatch = findById(approvedResponse?.data);

          matched = pendingMatch || approvedMatch;
          setResolvedListType(pendingMatch ? "pending" : "approved");
        }

        if (!matched) {
          throw new Error("Internship not found.");
        }

        setInternship(matched);
      } catch (error) {
        setLoadError(error?.message || "Unable to load internship details.");
      } finally {
        setIsLoading(false);
      }
    };

    loadInternship();
  }, [companyId, internshipId, location.state?.internship]);

  const requiredSkills = useMemo(() => {
    if (!internship) return [];
    const source = internship.required_skills || internship.skills || [];
    if (!Array.isArray(source)) return [];
    return source.map(toSkillLabel).filter(Boolean);
  }, [internship]);

  const updateStatus = async (status) => {
    const targetCompanyId = internship?.company_id || companyId;
    const key = `${targetCompanyId}-${internshipId}-${status}`;
    setActionKey(key);
    try {
      await changeInternshipStatus(targetCompanyId, status);
      notify.success(
        status === "active"
          ? "Internship approved successfully."
          : "Internship rejected.",
      );
      navigate("/superadmin/internships", {
        state: {
          defaultTab: status === "active" ? "approved" : "pending",
        },
      });
    } catch (error) {
      notify.error(error?.message, "Failed to update internship status.");
    } finally {
      setActionKey("");
    }
  };

  const internshipStatus = toDisplayStatus(internship?.status);
  const canReview =
    String(internship?.status || "").toLowerCase() === "pending";

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Loading internship details...</p>
      </Card>
    );
  }

  if (!internship || loadError) {
    return (
      <Card className="space-y-3 border-rose-200 bg-rose-50/70">
        <p className="text-sm text-rose-700">
          {loadError || "Internship not found."}
        </p>
        <Link
          className="inline-flex rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          to="/superadmin/internships"
        >
          Back to internships
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-[#0f766e] via-[#0f766e] to-[#115e59] text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-100">
          {resolvedListType === "pending"
            ? "Pending Review"
            : "Approved Internship"}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {internship.title || "Untitled Internship"}
            </h1>
            <p className="mt-1 text-sm text-teal-100">
              {internship.company_name ||
                internship.name ||
                `Company #${companyId}`}
            </p>
          </div>
          <Badge className="bg-white/20 text-white">{internshipStatus}</Badge>
        </div>
      </Card>

      <Card className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Seats
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {internship.seats ?? internship.slots ?? "N/A"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Work Type
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {internship.location_type || internship.locationType || "N/A"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Created
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {formatDate(internship.created_at)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Deadline
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {formatDate(internship.deadline)}
          </p>
        </div>
      </Card>

      <Card className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Description
        </p>
        <p className="text-sm leading-7 text-slate-700">
          {internship.description || "No description provided."}
        </p>
      </Card>

      <Card className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Required Skills
        </p>
        {requiredSkills.length ? (
          <div className="flex flex-wrap gap-2">
            {requiredSkills.map((skill) => (
              <span
                key={`${internship.id || internship.company_id}-${skill}`}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">No required skills listed.</p>
        )}
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <Link
          className="inline-flex rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          to="/superadmin/internships"
          state={{ defaultTab: resolvedListType }}
        >
          Back
        </Link>

        {canReview ? (
          <div className="flex gap-2">
            <button
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              type="button"
              disabled={
                actionKey ===
                `${internship?.company_id || companyId}-${internshipId}-active`
              }
              onClick={() => updateStatus("active")}
            >
              Approve
            </button>
            <button
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              type="button"
              disabled={
                actionKey ===
                `${internship?.company_id || companyId}-${internshipId}-rejected`
              }
              onClick={() => updateStatus("rejected")}
            >
              Reject
            </button>
          </div>
        ) : (
          <p className="text-sm font-medium text-slate-600">
            This internship is already reviewed.
          </p>
        )}
      </Card>
    </div>
  );
};

export default InternshipDetailsPage;
