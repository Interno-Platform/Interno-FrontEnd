import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  AlertTriangle,
  CalendarClock,
  CircleCheckBig,
  ClipboardList,
  Code2,
  FileText,
  Sparkles,
} from "lucide-react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { executeCodeWithJudge0 } from "@/services/codeExecutionService";
import {
  getInternshipTechExam,
  getQuizStatus,
  submitExamSolution,
} from "@/services/traineeService";
import { notify } from "@/utils/notify";

const STARTER_CODE = {
  javascript: `function solve(input) {\n  // Write your solution here\n  return input;\n}\n`,
  python: `def solve(input_data):\n    # Write your solution here\n    return input_data\n`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n`,
};

const INITIAL_VALIDATION_FEEDBACK = {
  status: "idle",
  title: "",
  message: "",
  details: "",
};

const buildOutputMismatchDetails = (expectedOutput, actualOutput) => {
  const expectedPreview = expectedOutput || "(empty)";
  const actualPreview = actualOutput || "(empty)";
  return `Expected output:\n${expectedPreview}\n\nActual output:\n${actualPreview}`;
};

const CodeExamPage = () => {
  const { assessmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const internship = location.state?.internship || null;
  const traineeId = Number(location.state?.traineeId);
  const examIdFromState = Number(location.state?.examId);
  const quizScore = Number(location.state?.quizScore || 0);
  const answeredCount = Number(location.state?.answeredCount || 0);
  const totalQuestions = Number(location.state?.totalQuestions || 0);
  const internshipId = Number(
    internship?.id ?? internship?.internship_id ?? assessmentId,
  );

  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(STARTER_CODE.javascript);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [techExam, setTechExam] = useState(null);
  const [isLoadingExam, setIsLoadingExam] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [quizSnapshot, setQuizSnapshot] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [validationFeedback, setValidationFeedback] = useState(
    INITIAL_VALIDATION_FEEDBACK,
  );

  const examId = useMemo(() => {
    const candidates = [
      Number(techExam?.id),
      Number(techExam?.exam_id),
      Number(techExam?.examId),
      examIdFromState,
    ];

    return candidates.find((id) => Number.isFinite(id) && id > 0) || null;
  }, [examIdFromState, techExam?.id, techExam?.exam_id, techExam?.examId]);

  const requirements = useMemo(() => {
    if (Array.isArray(techExam?.requirements)) {
      return techExam.requirements;
    }

    if (typeof techExam?.requirements === "string") {
      return techExam.requirements
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  }, [techExam?.requirements]);

  const challengeMetrics = useMemo(
    () => ({
      requirementsCount: requirements.length,
      hasExpectedInput: Boolean(String(techExam?.expected_input || "").trim()),
      hasExpectedOutput: Boolean(
        String(techExam?.expected_output || "").trim(),
      ),
    }),
    [requirements.length, techExam?.expected_input, techExam?.expected_output],
  );

  const examLanguage = useMemo(() => {
    const backendLanguage = String(
      techExam?.programmingLanguage || "javascript",
    )
      .trim()
      .toLowerCase();

    if (backendLanguage === "c++" || backendLanguage === "cpp") {
      return "cpp";
    }

    if (backendLanguage === "python") {
      return "python";
    }

    return "javascript";
  }, [techExam?.programmingLanguage]);

  const displayLanguage = useMemo(() => {
    if (language === "cpp") return "C++";
    if (language === "python") return "Python";
    return "JavaScript";
  }, [language]);

  const displayQuizScore = useMemo(() => {
    if (Number.isFinite(quizScore) && quizScore > 0) {
      return quizScore;
    }

    const scoreFromApi = Number(quizSnapshot?.score);
    return Number.isFinite(scoreFromApi) ? scoreFromApi : 0;
  }, [quizScore, quizSnapshot?.score]);

  const displayAnsweredCount = useMemo(() => {
    if (Number.isFinite(answeredCount) && answeredCount > 0) {
      return answeredCount;
    }
    return Number.isFinite(Number(quizSnapshot?.answered_count))
      ? Number(quizSnapshot.answered_count)
      : 0;
  }, [answeredCount, quizSnapshot?.answered_count]);

  const displayTotalQuestions = useMemo(() => {
    if (Number.isFinite(totalQuestions) && totalQuestions > 0) {
      return totalQuestions;
    }
    return Number.isFinite(Number(quizSnapshot?.total_questions))
      ? Number(quizSnapshot.total_questions)
      : null;
  }, [totalQuestions, quizSnapshot?.total_questions]);

  useEffect(() => {
    if (!internshipId) {
      setLoadError("Tech exam context not found.");
      return;
    }

    let isActive = true;

    const loadTechExam = async () => {
      setIsLoadingExam(true);
      setLoadError("");

      try {
        const response = await getInternshipTechExam(internshipId);
        const data = response?.data ?? response ?? null;

        if (!data) {
          throw new Error("Tech exam not found for this internship.");
        }

        if (isActive) {
          setTechExam(data);
          const nextLanguage =
            String(data?.programmingLanguage || "")
              .trim()
              .toLowerCase() || "javascript";
          const normalizedLanguage =
            nextLanguage === "c++" || nextLanguage === "cpp"
              ? "cpp"
              : nextLanguage === "python"
                ? "python"
                : "javascript";
          setLanguage(normalizedLanguage);
          setCode(STARTER_CODE[normalizedLanguage] || STARTER_CODE.javascript);
        }
      } catch (error) {
        if (isActive) {
          setTechExam(null);
          setLoadError(
            error?.response?.status === 404
              ? "No tech exam is attached to this internship yet."
              : error?.message || "Failed to load tech exam.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingExam(false);
        }
      }
    };

    loadTechExam();

    return () => {
      isActive = false;
    };
  }, [internshipId]);

  useEffect(() => {
    if (!traineeId || !examId) {
      return;
    }

    let isActive = true;

    const loadQuizSnapshot = async () => {
      try {
        const response = await getQuizStatus(traineeId, examId);
        const data = response?.data ?? response ?? null;

        if (isActive) {
          setQuizSnapshot(data);
        }
      } catch {
        if (isActive) {
          setQuizSnapshot(null);
        }
      }
    };

    loadQuizSnapshot();

    return () => {
      isActive = false;
    };
  }, [traineeId, examId]);

  if (!traineeId || !examId) {
    return (
      <Card className="mx-auto max-w-3xl">
        Coding exam context not found. Please complete the assessment first.
      </Card>
    );
  }

  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage);
    if (!code.trim() || Object.values(STARTER_CODE).includes(code)) {
      setCode(STARTER_CODE[nextLanguage]);
    }
    setValidationFeedback(INITIAL_VALIDATION_FEEDBACK);
  };

  const normalizeOutput = (value) =>
    String(value || "")
      .replace(/\r\n/g, "\n")
      .trimEnd();

  const handleSubmitSolution = async () => {
    if (!examId) {
      notify.error("Exam id is missing. Please reload and try again.");
      return;
    }

    if (!code.trim()) {
      notify.info("Please write your code before submitting.");
      return;
    }

    const expectedOutput = normalizeOutput(techExam?.expected_output);
    if (!expectedOutput) {
      notify.error("Expected output is missing for this challenge.");
      return;
    }

    setIsSubmitting(true);
    setValidationFeedback({
      status: "running",
      title: "Running Validation",
      message: "Running code against expected output...",
      details: "",
    });

    try {
      const executionResult = await executeCodeWithJudge0({
        language,
        code,
        stdin: String(techExam?.expected_input || ""),
      });

      const runtimeOutput = normalizeOutput(
        executionResult.stdout || executionResult.output,
      );
      const runtimeError = normalizeOutput(
        executionResult.stderr || executionResult.compileOutput,
      );

      if (executionResult.code !== 0 || runtimeError) {
        setValidationFeedback({
          status: "failed",
          title: "Execution Error",
          message:
            "Code execution failed. Fix runtime or compile errors first.",
          details: runtimeError || "Runtime error while executing the code.",
        });
        notify.error(
          "Code execution failed. Fix runtime/compile errors first.",
        );
        return;
      }

      const isOutputMatch = runtimeOutput === expectedOutput;

      if (!isOutputMatch) {
        setValidationFeedback({
          status: "failed",
          title: "Output Mismatch",
          message: "Your program output does not match the expected output.",
          details: buildOutputMismatchDetails(expectedOutput, runtimeOutput),
        });
        notify.error("Output does not match expected output.");
        return;
      }

      setValidationFeedback({
        status: "passed",
        title: "Validation Passed",
        message: "Output matched expected output. Submitting solution...",
        details: "",
      });

      await submitExamSolution(traineeId, examId, code, language);
      notify.success("Code exam submitted successfully.");
      navigate(`/trainee/exam/${assessmentId}/result`, {
        state: {
          stage: "final",
          internship,
          examId,
          quizScore,
          answeredCount,
          totalQuestions,
          language,
        },
      });
    } catch (error) {
      setValidationFeedback({
        status: "failed",
        title: "Validation Failed",
        message: error?.message || "Validation failed before submission.",
        details: "Please review your solution and try again.",
      });
      notify.error(error?.message, "Failed to submit code exam.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-700/80 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-3 text-slate-100 shadow-2xl md:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
              Technical Exam
            </p>
            <h1 className="mt-1 text-xl font-bold leading-tight md:text-3xl">
              {techExam?.exam_title || internship?.title || "Coding Exam"}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              {techExam?.exam_description ||
                "Build a clean, correct solution and submit when ready."}
            </p>
          </div>

          <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-3">
            <div className="rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
                Q&A Progress
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-200">
                <ClipboardList className="h-3.5 w-3.5" />
                {displayAnsweredCount}/{displayTotalQuestions ?? "-"}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.12em] text-emerald-200/80">
                Quiz Score
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-emerald-200">
                <CircleCheckBig className="h-3.5 w-3.5" />
                {displayQuizScore}%
              </p>
            </div>

            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.12em] text-cyan-200/80">
                Language
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-cyan-200">
                <Code2 className="h-3.5 w-3.5" />
                {displayLanguage}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[1.02fr_1.48fr]">
          <section className="min-h-[60vh] overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/70">
            <div className="sticky top-0 z-10 border-b border-slate-700/80 bg-slate-950/95 px-4 py-3 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Problem Statement
                </p>
                <div className="flex gap-1 rounded-lg bg-slate-900 p-1">
                  {[
                    {
                      key: "description",
                      label: "Description",
                      icon: FileText,
                    },
                    {
                      key: "requirements",
                      label: "Requirements",
                      icon: Sparkles,
                    },
                    { key: "io", label: "I/O", icon: Code2 },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                          isActive
                            ? "bg-emerald-500/20 text-emerald-200"
                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        }`}
                        onClick={() => setActiveTab(tab.key)}
                        type="button"
                      >
                        <Icon className="h-3.5 w-3.5" /> {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="max-h-[74vh] space-y-4 overflow-y-auto px-4 py-4">
              {isLoadingExam ? (
                <p className="text-sm text-slate-300">Loading tech exam...</p>
              ) : null}

              {loadError ? (
                <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
                  {loadError}
                </div>
              ) : null}

              {activeTab === "description" ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <h2 className="text-base font-semibold text-slate-100">
                    Description
                  </h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                    {techExam?.exam_description ||
                      "Solve the challenge using clean and efficient code."}
                  </p>
                </div>
              ) : null}

              {activeTab === "requirements" ? (
                <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <h2 className="text-base font-semibold text-slate-100">
                    Requirements
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {requirements.length ? (
                      requirements.map((requirement, index) => (
                        <span
                          key={`${requirement}-${index}`}
                          className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-xs text-slate-200"
                        >
                          {requirement}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">
                        No explicit requirements provided.
                      </span>
                    )}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-700 bg-slate-800/70 px-2.5 py-2 text-center">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
                        Skills
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-200">
                        {challengeMetrics.requirementsCount}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-700 bg-slate-800/70 px-2.5 py-2 text-center">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
                        Input Spec
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-200">
                        {challengeMetrics.hasExpectedInput ? "Yes" : "No"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-700 bg-slate-800/70 px-2.5 py-2 text-center">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
                        Output Spec
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-200">
                        {challengeMetrics.hasExpectedOutput ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === "io" ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Expected Input
                    </p>
                    <pre className="mt-2 whitespace-pre-wrap font-mono text-xs leading-6 text-slate-200">
                      {techExam?.expected_input || "Not specified."}
                    </pre>
                  </div>

                  <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Expected Output
                    </p>
                    <pre className="mt-2 whitespace-pre-wrap font-mono text-xs leading-6 text-slate-200">
                      {techExam?.expected_output || "Not specified."}
                    </pre>
                  </div>
                </div>
              ) : null}

              <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-2.5 text-xs text-slate-400">
                <div className="flex flex-wrap items-center gap-2">
                  <CalendarClock className="h-3.5 w-3.5" />
                  <span>
                    {techExam?.created_at
                      ? `Created at ${new Date(techExam.created_at).toLocaleString()}`
                      : "Creation date not available"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="flex min-h-[60vh] flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/70">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-700/80 px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Code Editor
                </p>
              </div>

              <div className="w-full sm:w-48">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Language
                </label>
                <select
                  className="field-input border-slate-600 bg-slate-800 text-slate-100"
                  onChange={(event) => handleLanguageChange(event.target.value)}
                  value={language}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
            </div>

            <div className="flex-1 bg-[#0b1020]">
              <Editor
                defaultLanguage={examLanguage}
                height="72vh"
                language={language}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontLigatures: true,
                  smoothScrolling: true,
                  scrollBeyondLastLine: false,
                  padding: { top: 16 },
                }}
                onChange={(value) => setCode(value || "")}
                theme="vs-dark"
                value={code}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-700/80 bg-slate-900 px-4 py-3">
              <div className="space-y-1">
                <p className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  Keep your code clean, readable, and optimized.
                </p>
                {validationFeedback.status !== "idle" ? (
                  <div
                    className={`mt-2 max-w-2xl rounded-lg border px-3 py-2 text-xs ${
                      validationFeedback.status === "passed"
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                        : validationFeedback.status === "failed"
                          ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
                          : "border-amber-500/40 bg-amber-500/10 text-amber-100"
                    }`}
                  >
                    <p className="inline-flex items-center gap-1 font-semibold">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {validationFeedback.title}
                    </p>
                    <p className="mt-1">{validationFeedback.message}</p>
                    {validationFeedback.details ? (
                      <pre className="mt-2 whitespace-pre-wrap rounded-md bg-slate-950/50 p-2 font-mono text-[11px] leading-5 text-slate-100">
                        {validationFeedback.details}
                      </pre>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <Button
                disabled={
                  isSubmitting ||
                  isLoadingExam ||
                  !techExam ||
                  Boolean(loadError)
                }
                onClick={handleSubmitSolution}
              >
                {isSubmitting ? "Validating..." : "Validate & Submit"}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CodeExamPage;
