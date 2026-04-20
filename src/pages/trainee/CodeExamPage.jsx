import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { submitExamSolution } from "@/services/traineeService";
import { notify } from "@/utils/notify";

const STARTER_CODE = {
  javascript: `function solve(input) {\n  // Write your solution here\n  return input;\n}\n`,
  python: `def solve(input_data):\n    # Write your solution here\n    return input_data\n`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n`,
};

const CodeExamPage = () => {
  const { assessmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const internship = location.state?.internship || null;
  const traineeId = Number(location.state?.traineeId);
  const examId = Number(location.state?.examId || assessmentId);
  const quizScore = Number(location.state?.quizScore || 0);
  const answeredCount = Number(location.state?.answeredCount || 0);
  const totalQuestions = Number(location.state?.totalQuestions || 0);

  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(STARTER_CODE.javascript);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  };

  const handleSubmitSolution = async () => {
    if (!code.trim()) {
      notify.info("Please write your code before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitExamSolution(traineeId, examId, code, language);
      notify.success("Code exam submitted successfully.");
      navigate(`/trainee/exam/${assessmentId}/result`, {
        state: {
          stage: "final",
          internship,
          quizScore,
          answeredCount,
          totalQuestions,
          language,
        },
      });
    } catch (error) {
      notify.error(error?.message, "Failed to submit code exam.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Coding Exam</h1>
            <p className="text-sm text-slate-600">
              {internship?.title || "Internship coding challenge"}
            </p>
          </div>
          <div className="w-48">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Language
            </label>
            <select
              className="field-input"
              onChange={(event) => handleLanguageChange(event.target.value)}
              value={language}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <Editor
          defaultLanguage="javascript"
          height="70vh"
          language={language}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
          value={code}
        />
      </Card>

      <div className="flex justify-end">
        <Button disabled={isSubmitting} onClick={handleSubmitSolution}>
          {isSubmitting ? "Submitting..." : "Submit Code Exam"}
        </Button>
      </div>
    </div>
  );
};

export default CodeExamPage;
