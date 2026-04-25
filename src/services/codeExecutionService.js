const JUDGE0_API_URL =
  import.meta.env.VITE_JUDGE0_API_URL || "https://ce.judge0.com";

const JUDGE0_SUBMISSIONS_URL = `${JUDGE0_API_URL.replace(/\/$/, "")}/submissions`;

const languageIds = {
  javascript: 63,
  python: 71,
  cpp: 54,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const toJudge0LanguageId = (language) =>
  languageIds[language] || languageIds.javascript;

const getErrorMessage = async (response) => {
  const fallbackMessage = "Failed to execute code on Judge0 CE.";

  try {
    const payload = await response.json();
    if (typeof payload?.error === "string") return payload.error;
    if (typeof payload?.message === "string") return payload.message;
    if (payload && typeof payload === "object") {
      const firstField = Object.values(payload).find(Array.isArray);
      if (Array.isArray(firstField) && firstField.length > 0) {
        return String(firstField[0]);
      }
    }
  } catch {
    return fallbackMessage;
  }

  return fallbackMessage;
};

const normalizeJudge0Result = (payload) => {
  const statusId = Number(payload?.status?.id || payload?.status_id || 0);
  const exitCode = payload?.exit_code;

  return {
    compileOutput: payload?.compile_output || "",
    output: payload?.stdout || "",
    stdout: payload?.stdout || "",
    stderr: payload?.stderr || "",
    code:
      statusId === 3
        ? Number(exitCode ?? 0)
        : Number(exitCode ?? (statusId || 1)),
    signal: payload?.exit_signal ?? null,
    statusId,
    statusDescription: payload?.status?.description || "",
  };
};

const waitForJudge0Result = async (token) => {
  const deadline = Date.now() + 15000;

  while (Date.now() < deadline) {
    const response = await fetch(
      `${JUDGE0_SUBMISSIONS_URL}/${token}?base64_encoded=false&fields=stdout,stderr,compile_output,exit_code,exit_signal,status,status_id`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    const payload = await response.json();
    const statusId = Number(payload?.status?.id || payload?.status_id || 0);

    if (statusId > 2) {
      return normalizeJudge0Result(payload);
    }

    await sleep(400);
  }

  throw new Error(
    "Judge0 CE execution timed out while waiting for the result.",
  );
};

export const executeCodeWithJudge0 = async ({ language, code, stdin = "" }) => {
  const createResponse = await fetch(
    `${JUDGE0_SUBMISSIONS_URL}?base64_encoded=false`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language_id: toJudge0LanguageId(language),
        source_code: code,
        stdin,
      }),
    },
  );

  if (!createResponse.ok) {
    throw new Error(await getErrorMessage(createResponse));
  }

  const createdPayload = await createResponse.json();
  const token = createdPayload?.token;

  if (!token) {
    throw new Error("Judge0 CE did not return a submission token.");
  }

  return waitForJudge0Result(token);
};

export const executeCodeWithPiston = executeCodeWithJudge0;
