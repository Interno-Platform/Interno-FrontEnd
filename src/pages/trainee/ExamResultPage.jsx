import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  Hash,
  Medal,
  ServerCrash,
  User2,
} from "lucide-react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import { getQuizStatus } from "@/services/traineeService";

const ExamResultPage = () => {
  const { state } = useLocation();
  const [quizStatus, setQuizStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const traineeId = Number(state?.traineeId);
  const examId = Number(state?.examId || state?.assessmentId);
  const quizScore = Number(quizStatus?.score ?? state?.quizScore ?? 0);
  const answeredCount = Number(state?.answeredCount || 0);
  const totalQuestions = Number(state?.totalQuestions || 0);
  const language = state?.language || "N/A";
  const isQuizStage = state?.stage === "quiz";
  const assessmentId = Number(state?.assessmentId || examId);

  const statusLabel = useMemo(() => {
    const rawStatus = String(quizStatus?.status || "submitted");
    return rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
  }, [quizStatus?.status]);

  useEffect(() => {
    if (!traineeId || !examId) {
      return;
    }

    let isActive = true;

    const loadQuizStatus = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await getQuizStatus(traineeId, examId);
        const data = response?.data ?? response ?? null;

        if (isActive) {
          setQuizStatus(data);
        }
      } catch (error) {
        if (isActive) {
          setLoadError(
            error?.message || "Failed to load quiz status from the server.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadQuizStatus();

    return () => {
      isActive = false;
    };
  }, [examId, traineeId]);

  const displayStatus = quizStatus?.status || "submitted";
  const submittedAt = quizStatus?.submitted_at
    ? new Date(quizStatus.submitted_at).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not available";
  const passed = quizScore >= 60;

  if (!state) {
    return <Card>No exam result found.</Card>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Card className="overflow-hidden mt-5 border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-0 text-white shadow-xl">
        <div className="grid gap-6 p-6 md:grid-cols-[1.3fr_0.7fr] md:p-8">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-300">
              Quiz Result
            </p>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold md:text-4xl">
                {state.internship?.title || "Assessment flow"}
              </h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge>{statusLabel}</Badge>
              <Badge className="bg-slate-800 text-slate-100">
                Exam #{quizStatus?.exam_id ?? examId}
              </Badge>
              <Badge className="bg-slate-800 text-slate-100">
                Trainee #{quizStatus?.trainee_id ?? traineeId}
              </Badge>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-300">Quiz Score</p>
                <p className="mt-1 text-5xl font-black text-white">
                  {quizScore}%
                </p>
              </div>
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                  passed
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-amber-500/20 text-amber-300"
                }`}
              >
                <Medal className="h-7 w-7" />
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm text-slate-200">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Status
                </span>
                <span className="font-semibold">{displayStatus}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4" /> Submitted at
                </span>
                <span className="font-semibold">{submittedAt}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card className="space-y-2 border-slate-200 bg-slate-50">
          <p className="text-sm font-medium text-slate-700">
            Loading status...
          </p>
          <p className="text-sm text-slate-500">
            Fetching the latest quiz status from the backend.
          </p>
        </Card>
      ) : null}

      {loadError ? (
        <Card className="border-amber-200 bg-amber-50 text-amber-900">
          <div className="flex items-start gap-3">
            <ServerCrash className="mt-0.5 h-5 w-5" />
            <div className="space-y-1">
              <p className="font-semibold">Could not load live status</p>
              <p className="text-sm text-amber-800">{loadError}</p>
            </div>
          </div>
        </Card>
      ) : null}

      <Card className="space-y-2">
        {isQuizStage ? (
          <>
            <h3 className="font-semibold">Quiz Completed</h3>
            <p className="text-sm text-slate-600">
              Your quiz score has been saved. Continue now to complete the
              technical coding exam.
            </p>
          </>
        ) : (
          <>
            <h3 className="font-semibold">Submission Completed</h3>
            <p className="text-sm text-slate-600">
              Your assessment and coding exam have been submitted successfully.
              You can track your application status from My Applications.
            </p>
          </>
        )}
      </Card>

      {isQuizStage ? (
        <Card className="space-y-3 border-emerald-200 bg-emerald-50/70">
          <h3 className="font-semibold text-emerald-900">Choose next step</h3>
          <p className="text-sm text-emerald-800">
            You can continue immediately to the technical coding exam, or leave
            now and continue later.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/trainee/exam/${assessmentId}/code`}
              state={{
                internship: state.internship,
                traineeId: state.traineeId,
                examId: state.examId,
                quizScore,
                answeredCount,
                totalQuestions,
              }}
            >
              <Button>Start Tech Exam</Button>
            </Link>
            <Link to="/trainee/applications">
              <Button variant="ghost">Continue later</Button>
            </Link>
          </div>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Link to="/trainee/applications">
          <Button>Go to My Applications</Button>
        </Link>
        <Link to="/trainee">
          <Button variant="ghost">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default ExamResultPage;
