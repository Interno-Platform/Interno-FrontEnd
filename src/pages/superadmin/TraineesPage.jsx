import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "@/components/common/Table";
import Badge from "@/components/common/Badge";
import Pagination from "@/components/common/Pagination";
import Input from "@/components/common/Input";
import { paginate } from "@/utils/helpers";
import { changeTraineeStatus, getAllTrainees } from "@/services/adminService";
import { notify } from "@/utils/notify";

const TraineesPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [trainees, setTrainees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [statusActionId, setStatusActionId] = useState(null);

  const loadTrainees = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await getAllTrainees();
      const list = Array.isArray(response?.data) ? response.data : [];
      setTrainees(list);
    } catch (error) {
      setLoadError(error?.message || "Unable to load trainees.");
      setTrainees([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrainees();
  }, []);

  const handleOpenProfile = (trainee) => {
    navigate(`/superadmin/trainees/${trainee?.id}`, {
      state: { trainee },
    });
  };

  const handleDeactivate = async (trainee) => {
    const targetUserId = trainee?.user_id || trainee?.id;
    if (!targetUserId) {
      notify.error("Unable to determine trainee account id.");
      return;
    }

    setStatusActionId(trainee.id);
    try {
      await changeTraineeStatus(targetUserId, false);
      notify.success("Trainee deactivated successfully.");
      await loadTrainees();
    } catch (error) {
      notify.error(error?.message, "Failed to deactivate trainee.");
    } finally {
      setStatusActionId(null);
    }
  };

  const getTraineeInitials = (name) =>
    String(name || "T")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "T";

  const paged = useMemo(
    () =>
      paginate(
        trainees.filter(
          (entry) =>
            String(entry.name || "")
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            String(entry.email || "")
              .toLowerCase()
              .includes(search.toLowerCase()),
        ),
        page,
        10,
      ),
    [page, search, trainees],
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search trainees"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {isLoading ? (
        <p className="text-sm text-slate-600">Loading trainees...</p>
      ) : null}
      {!isLoading && loadError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-3 text-sm text-rose-700">
          {loadError}
        </div>
      ) : null}
      <Table
        columns={["Name", "Email", "Status", "Phone", "City", "Actions"]}
        rows={paged.data}
        renderRow={(trainee) => (
          <tr key={trainee.id} className="border-t border-slate-100">
            <td className="px-4 py-3">
              <div className="flex items-center gap-2.5">
                {trainee.profile_picture ? (
                  <img
                    src={trainee.profile_picture}
                    alt={trainee.name || "Trainee"}
                    className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-[10px] font-semibold text-slate-700">
                    {getTraineeInitials(trainee.name)}
                  </div>
                )}
                <span>{trainee.name || "N/A"}</span>
              </div>
            </td>
            <td className="px-4 py-3">{trainee.email || "N/A"}</td>
            <td className="px-4 py-3">
              <Badge>
                {Number(trainee.is_active ?? 1) === 1 ? "Active" : "Inactive"}
              </Badge>
            </td>
            <td className="px-4 py-3">{trainee.phone || "N/A"}</td>
            <td className="px-4 py-3">{trainee.city || "N/A"}</td>
            <td className="px-4 py-3">
              <div className="flex gap-2 text-xs text-blue-600">
                <button onClick={() => handleOpenProfile(trainee)}>
                  Profile
                </button>
                <button
                  className="text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={
                    statusActionId === trainee.id ||
                    Number(trainee.is_active ?? 1) !== 1
                  }
                  onClick={() => handleDeactivate(trainee)}
                >
                  {statusActionId === trainee.id ? "Updating..." : "Deactivate"}
                </button>
              </div>
            </td>
          </tr>
        )}
      />
      <Pagination page={page} totalPages={paged.totalPages} setPage={setPage} />
    </div>
  );
};

export default TraineesPage;
