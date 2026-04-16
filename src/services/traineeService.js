import { api } from "./api";

// Insert Skills - POST /api/trainees/insert-skills/:trainee_id
export const insertTraineeSkills = async (traineeId, cvFile, skills) => {
  const formData = new FormData();
  formData.append("cv_file", cvFile);

  // Send one `skills` key containing a single JSON array value.
  formData.append("skills", JSON.stringify(skills));

  const response = await api.post(
    `/api/trainees/insert-skills/${traineeId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

// Submit Quiz Answers - POST /api/trainees/submit-quiz-answers
export const submitQuizAnswers = async (traineeId, answers) => {
  const normalizedAnswers = Array.isArray(answers)
    ? answers
        .map((answer) => ({
          questionId: Number(answer.questionId ?? answer.question_id),
          selectedOptionId: Number(
            answer.selectedOptionId ?? answer.selected_option_id,
          ),
        }))
        .filter(
          (answer) =>
            Number.isFinite(answer.questionId) &&
            Number.isFinite(answer.selectedOptionId),
        )
    : [];

  const response = await api.post("/api/trainees/submit-quiz-answers", {
    traineeId,
    answers: normalizedAnswers,
  });
  return response.data;
};

// Submit Exam Solution - POST /api/trainees/submit-exam-solution
export const submitExamSolution = async (
  traineeId,
  examId,
  codeSolution,
  language,
) => {
  const response = await api.post("/api/trainees/submit-exam-solution", {
    traineeId,
    examId,
    codeSolution,
    language,
  });
  return response.data;
};

// Mark Quiz Completed - POST /api/trainees/mark-quiz-completed
export const markQuizCompleted = async (
  traineeId,
  examId,
  quizScore,
  internshipId,
) => {
  const response = await api.post("/api/trainees/mark-quiz-completed", {
    traineeId,
    examId,
    quizScore,
    internshipId,
  });
  return response.data;
};

// Get Quiz Status - GET /api/trainees/quiz-status/:traineeId/:examId
export const getQuizStatus = async (traineeId, examId) => {
  const response = await api.get(
    `/api/trainees/quiz-status/${traineeId}/${examId}`,
  );
  return response.data;
};

// Get Trainee Scores - GET /api/trainees/trainee-scores/:traineeId
export const getTraineeScores = async (traineeId) => {
  const response = await api.get(`/api/trainees/trainee-scores/${traineeId}`);
  return response.data;
};

// Get Skill Score - GET /api/trainees/skill-scores/:traineeId/:skillId
export const getSkillScore = async (traineeId, skillId) => {
  const response = await api.get(
    `/api/trainees/skill-scores/${traineeId}/${skillId}`,
  );
  return response.data;
};

// Get Trainee Progress - GET /api/trainees/trainee-progress/:traineeId
export const getTraineeProgress = async (traineeId) => {
  const response = await api.get(`/api/trainees/trainee-progress/${traineeId}`);
  return response.data;
};

// Get Trainee Skills - GET /api/trainees/skills/:traineeId
export const getTraineeSkills = async (traineeId) => {
  const response = await api.get(`/api/trainees/skills/${traineeId}`);
  return response.data;
};
