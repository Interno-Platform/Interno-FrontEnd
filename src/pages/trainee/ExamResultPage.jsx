import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  Hash,
  Medal,
  ServerCrash,
  Target,
} from "lucide-react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import { getQuizStatus } from "@/services/traineeService";
import { getInternshipDetails, applyForInternship } from "@/services/applicationService";
import { notify } from "@/utils/notify";

const toFiniteNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeSkillScores = (value) => {
  const list = Array.isArray(value?.data?.skillScores)
    ? value.data.skillScores
    : Array.isArray(value?.skillScores)
      ? value.skillScores
      : Array.isArray(value?.data?.skill_scores)
        ? value.data.skill_scores
        : Array.isArray(value?.skill_scores)
          ? value.skill_scores
          : [];

  return list.map((skill, index) => {
    const totalQuestions = toFiniteNumber(
      skill?.totalQuestions ?? skill?.total_questions,
    );
    const answeredQuestions = toFiniteNumber(
      skill?.answeredQuestions ?? skill?.answered_questions,
    );
    const correctAnswers = toFiniteNumber(
      skill?.correctAnswers ?? skill?.correct_answers,
    );
    const scorePercentage = toFiniteNumber(
      skill?.scorePercentage ?? skill?.score_percentage,
      totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
    );

    return {
      id: skill?.skillId ?? skill?.skill_id ?? index,
      name: skill?.skillName ?? skill?.skill_name ?? `Skill ${index + 1}`,
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      scorePercentage,
    };
  });
};

const ExamResultPage = () => {
  const { state } = useLocation();
  const [quizStatus, setQuizStatus] = useState(null);
  const [internshipDetails, setInternshipDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [applicationError, setApplicationError] = useState("");
  const [hasApplied, setHasApplied] = useState(false);

  const traineeId = Number(state?.traineeId);
  const examId = Number(state?.examId || state?.assessmentId);
  const internshipId = Number(state?.internship?.id);
  const hasSubmitQuizScore = state?.quizScore !== undefined && state?.quizScore !== null;
  const submitQuizScore = toFiniteNumber(state?.quizScore);
  const quizScore = toFiniteNumber(
    state?.quizScore ??
      state?.quizCompletion?.score ??
      state?.quizCompletion?.quizScore ??
      state?.quizCompletion?.quiz_score ??
      state?.quizCompletion?.examSubmission?.score ??
      quizStatus?.score ??
      quizStatus?.quizScore ??
      quizStatus?.quiz_score,
  );
  const answeredCount = Number(state?.answeredCount || 0);
  const totalQuestions = Number(state?.totalQuestions || 0);
  const isQuizStage = state?.stage === "quiz";
  const isFinalStage = state?.stage === "final";
  const assessmentId = Number(state?.assessmentId || examId);
  const passingScore = Number(internshipDetails?.passingScore ?? 60);
  const hasPassed = quizScore >= passingScore;
  const skillScores = useMemo(
    () => normalizeSkillScores(state?.quizCompletion ?? quizStatus),
    [quizStatus, state?.quizCompletion],
  );
  const completedSummary = state?.quizCompletion ?? quizStatus ?? {};
  const completedAnsweredQuestions = toFiniteNumber(
    completedSummary?.answeredQuestions ??
      completedSummary?.answered_questions ??
      answeredCount,
  );
  const completedCorrectAnswers = toFiniteNumber(
    completedSummary?.correctAnswers ?? completedSummary?.correct_answers,
  );
  const completedTotalQuestions = toFiniteNumber(
    completedSummary?.totalQuestions ??
      completedSummary?.total_questions ??
      totalQuestions,
  );

  const statusLabel = useMemo(() => {
    const rawStatus = String(quizStatus?.status || "submitted");
    return rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
  }, [quizStatus?.status]);

  useEffect(() => {
    if (!traineeId || !examId) {
      return;
    }

    let isActive = true;

    const loadData = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const [quizStatusResponse, internshipResponse] = await Promise.all([
          getQuizStatus(traineeId, examId),
          internshipId ? getInternshipDetails(internshipId) : Promise.resolve(null),
        ]);
        
        const quizStatusData = quizStatusResponse?.data ?? quizStatusResponse ?? null;

        if (isActive) {
          setQuizStatus(quizStatusData);
          if (internshipResponse) {
            setInternshipDetails(internshipResponse);
          }
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

    loadData();

    return () => {
      isActive = false;
    };
  }, [examId, traineeId, internshipId]);

  // Auto-apply after completing coding exam
  useEffect(() => {
    if (!isFinalStage || !traineeId || !internshipId || hasApplied || isApplying) {
      return;
    }

    let isActive = true;

    const submitApplication = async () => {
      setIsApplying(true);
      setApplicationError("");

      try {
        await applyForInternship(traineeId, internshipId);
        
        if (isActive) {
          setHasApplied(true);
          notify.success("Application submitted successfully after completing all assessments.");
        }
      } catch (error) {
        if (isActive) {
          const errorMessage = error?.message || "Failed to submit application";
          setApplicationError(errorMessage);
          notify.error(errorMessage);
        }
      } finally {
        if (isActive) {
          setIsApplying(false);
        }
      }
    };

    submitApplication();

    return () => {
      isActive = false;
    };
  }, [isFinalStage, traineeId, internshipId, hasApplied, isApplying]);

  const displayStatus = quizStatus?.status || "submitted";
  const submittedAt = quizStatus?.submitted_at
    ? new Date(quizStatus.submitted_at).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not available";
  const passed = hasPassed;

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
              {hasSubmitQuizScore ? (
                <Badge className="bg-emerald-500/20 text-emerald-100">
                  Submit score {submitQuizScore}%
                </Badge>
              ) : null}
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
              {isQuizStage && (
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2">
                    <Hash className="h-4 w-4" /> Required Score
                  </span>
                  <span className="font-semibold">{passingScore}%</span>
                </div>
              )}
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

      {isQuizStage && skillScores.length ? (
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">Skill Scores</h3>
              <p className="text-sm text-slate-600">
                Score is taken from submit quiz. Skill details are grouped from
                quiz completion.
              </p>
            </div>
            <Badge className="bg-slate-100 text-slate-700">
              {completedAnsweredQuestions}/{completedTotalQuestions} answered
            </Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {skillScores.map((skill) => (
              <div
                key={`${skill.id}-${skill.name}`}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {skill.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {skill.correctAnswers} correct of {skill.totalQuestions}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700">
                    <Target className="h-4 w-4" />
                    {skill.scorePercentage}%
                  </span>
                </div>

                <div className="mt-4 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.min(Math.max(skill.scorePercentage, 0), 100)}%`,
                    }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span>{skill.answeredQuestions} answered</span>
                  <span>{skill.totalQuestions - skill.answeredQuestions} skipped</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-slate-600">
            Overall correct answers: {completedCorrectAnswers} of{" "}
            {completedTotalQuestions}.
          </p>
        </Card>
      ) : null}

      <Card className="space-y-2">
        {isQuizStage ? (
          <>
            <h3 className="font-semibold">
              {hasPassed ? "Quiz Completed" : "Quiz Not Passed"}
            </h3>
            <p className="text-sm text-slate-600">
              {hasPassed
                ? "Your quiz score has been saved. Continue now to complete the technical coding exam."
                : `Your score of ${quizScore}% is below the required passing score of ${passingScore}%. Please try the quiz again to proceed to the technical exam.`}
            </p>
          </>
        ) : isFinalStage ? (
          <>
            <h3 className="font-semibold">
              {hasApplied ? "Application Submitted" : "Finalizing Application..."}
            </h3>
            <p className="text-sm text-slate-600">
              {hasApplied
                ? "Congratulations! Your complete application including all assessments has been submitted successfully. You can now track your application status from My Applications."
                : isApplying
                  ? "Submitting your application..."
                  : "Your assessment and coding exam have been submitted. Your application will be processed shortly."}
            </p>
            {applicationError && (
              <p className="text-sm text-red-600">
                Application submission error: {applicationError}
              </p>
            )}
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

      {isQuizStage && hasPassed ? (
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
                quizCompletion: state.quizCompletion,
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
      ) : isQuizStage && !hasPassed ? (
        <Card className="space-y-3 border-red-200 bg-red-50/70">
          <h3 className="font-semibold text-red-900">Try Again</h3>
          <p className="text-sm text-red-800">
            You need to score at least {passingScore}% to proceed to the
            technical exam. You can retake this quiz to improve your score.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to="/trainee/applications">
              <Button>Back to Applications</Button>
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
