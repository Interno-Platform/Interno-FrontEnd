import { useEffect, useMemo, useState } from "react";
import {
  Clock3,
  MapPin,
  Search,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Card from "@/components/common/Card";
import {
  getBrowseInternships,
  getInternshipJourneyTarget,
} from "@/services/internshipDiscoveryService";
import { getTraineeSkills } from "@/services/traineeService";
import { useAuthStore } from "@/store/authStore";
import { calcMatchScore } from "@/utils/helpers";

const normalizeSkillNames = (skills) => {
  if (!Array.isArray(skills)) {
    return [];
  }

  return skills
    .map((skill) =>
      typeof skill === "string"
        ? skill.trim()
        : String(skill?.name || skill?.skill_name || "").trim(),
    )
    .filter(Boolean);
};

const BrowseInternshipsPage = () => {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [internships, setInternships] = useState([]);
  const [savedSkills, setSavedSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const traineeId = Number(user?.id);
  const traineeSkills = useMemo(
    () => normalizeSkillNames(savedSkills),
    [savedSkills],
  );

  useEffect(() => {
    const loadInternships = async () => {
      if (!traineeId) {
        setInternships([]);
        setSavedSkills([]);
        setLoadError("Trainee account not found. Please sign in again.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError("");
      try {
        const [list, skillsResponse] = await Promise.all([
          getBrowseInternships(),
          getTraineeSkills(traineeId),
        ]);

        const fetchedSkills = normalizeSkillNames(
          skillsResponse?.data?.skills ??
            skillsResponse?.skills ??
            skillsResponse?.data ??
            skillsResponse,
        );

        setSavedSkills(fetchedSkills);
        setInternships(list);
      } catch (error) {
        setInternships([]);
        setSavedSkills([]);
        setLoadError(error?.message || "Unable to load internships.");
      } finally {
        setIsLoading(false);
      }
    };

    loadInternships();
  }, [traineeId]);

  const filtered = useMemo(
    () =>
      internships
        .map((item) => ({
          ...item,
          score: calcMatchScore(item.skills, traineeSkills),
        }))
        .filter((item) => {
          const titleMatch = item.title
            .toLowerCase()
            .includes(search.trim().toLowerCase());
          const industryMatch =
            industry === "All" || item.location_type === industry;
          return titleMatch && industryMatch;
        }),
    [industry, internships, search, traineeSkills],
  );

  const openJourney = (internship) => {
    const target = getInternshipJourneyTarget(internship, traineeId);
    navigate(target.to, {
      state: target.state,
    });
  };

  const handleCardKeyDown = (event, internship) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openJourney(internship);
    }
  };

  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Browse Internships
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Discover roles aligned with your current skills and goals.
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            type="button"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#164616]"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search internships"
              type="text"
              value={search}
            />
          </label>
          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#164616]"
            onChange={(event) => setIndustry(event.target.value)}
            value={industry}
          >
            <option value="All">All</option>
            <option value="REMOTE">Remote</option>
            <option value="ONSITE">Onsite</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>
      </Card>

      {isLoading ? (
        <Card>
          <p className="text-sm text-slate-600">Loading internships...</p>
        </Card>
      ) : null}

      {!isLoading && loadError ? (
        <Card className="border-rose-200 bg-rose-50/70">
          <p className="text-sm text-rose-700">{loadError}</p>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {!isLoading && filtered.length === 0 ? (
          <Card className="md:col-span-2 xl:col-span-3">
            <p className="text-sm text-slate-600">
              No internships found for the current filters.
            </p>
          </Card>
        ) : null}

        {filtered.map((internship) => (
          <Card
            key={internship.id}
            className="group cursor-pointer space-y-3 border-slate-200 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164616]/20"
            onClick={() => openJourney(internship)}
            onKeyDown={(event) => handleCardKeyDown(event, internship)}
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {internship.score}% match
              </span>
              <span className="text-xs font-medium text-slate-500">
                {internship.duration}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {internship.progress?.label || "Not applied"}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {internship.title}
            </h3>
            <p className="inline-flex items-center gap-1 text-sm text-slate-600">
              <MapPin className="h-4 w-4" /> {internship.company}
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1">
                <MapPin className="h-3.5 w-3.5" /> {internship.location}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1">
                <Clock3 className="h-3.5 w-3.5" /> {internship.workType}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {internship.skills.slice(0, 4).map((skill) => (
                <span
                  key={`${internship.id}-${skill}`}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
                >
                  {skill}
                </span>
              ))}
            </div>
            <div className="max-h-0 overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 text-sm text-slate-600 opacity-0 transition-all duration-300 group-hover:max-h-48 group-hover:py-4 group-hover:opacity-100">
              <div className="flex items-start gap-2 transition-transform duration-300 group-hover:translate-y-0">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <div className="space-y-2">
                  <p className="font-semibold text-slate-900">Quick preview</p>
                  <p>{internship.summary || "No summary available."}</p>
                  <p className="text-xs text-slate-500">
                    Deadline: {internship.deadline || "Open until filled"} |
                    Posted: {internship.publishedAt || "Recently"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Link
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={(event) => event.stopPropagation()}
                state={{ internship }}
                to={`/trainee/internships/${internship.id}`}
              >
                View details
              </Link>
              <button
                className="flex-1 rounded-lg bg-[#164616] px-3 py-2 text-center text-sm font-semibold text-white hover:bg-[#123a12]"
                onClick={(event) => {
                  event.stopPropagation();
                  openJourney(internship);
                }}
                type="button"
              >
                {internship.progress?.actionLabel || "Open stage"}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {!isLoading && !loadError && traineeSkills.length === 0 ? (
        <Card className="border-amber-200 bg-amber-50/70">
          <p className="text-sm text-amber-800">
            No saved skills found in your profile. Save your extracted skills
            first to see matching internships.
          </p>
        </Card>
      ) : null}
    </div>
  );
};

export default BrowseInternshipsPage;
