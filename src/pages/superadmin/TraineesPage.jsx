import { useEffect, useMemo, useState } from "react";
import Table from "@/components/common/Table";
import Badge from "@/components/common/Badge";
import Pagination from "@/components/common/Pagination";
import Input from "@/components/common/Input";
import { paginate } from "@/utils/helpers";
import { getAllTrainees } from "@/services/adminService";
import { notify } from "@/utils/notify";

const TraineesPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [trainees, setTrainees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
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

    loadTrainees();
  }, []);

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
        columns={[
          "Name",
          "Email",
          "Status",
          "Assigned Company",
          "Progress %",
          "Actions",
        ]}
        rows={paged.data}
        renderRow={(trainee) => (
          <tr key={trainee.id} className="border-t border-slate-100">
            <td className="px-4 py-3">{trainee.name || "N/A"}</td>
            <td className="px-4 py-3">{trainee.email || "N/A"}</td>
            <td className="px-4 py-3">
              <Badge>{trainee.status || "Active"}</Badge>
            </td>
            <td className="px-4 py-3">
              {trainee.company_name || trainee.assignedCompany || "N/A"}
            </td>
            <td className="px-4 py-3">{trainee.progress ?? 0}%</td>
            <td className="px-4 py-3">
              <div className="flex gap-2 text-xs text-blue-600">
                <button>Profile</button>
                <button>Edit</button>
                <button>Deactivate</button>
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
