import { insertTraineeSkills } from "./traineeService";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || "llama-3.3-70b-versatile";

const SUPPORTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const MAX_TEXT_CHARS = 50000;
const MAX_CHUNK_CHARS = 3500;
const MAX_CHUNKS = 12;

const normalizeText = (value) =>
  String(value || "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const takePreview = (value, maxChars) => {
  const text = String(value || "");
  if (text.length <= maxChars) {
    return { content: text, truncated: false };
  }

  return {
    content: text.slice(0, maxChars),
    truncated: true,
  };
};

const parseSkills = (value) => {
  if (!value) return [];
  const cleanValue = String(value).replace(/```json\n?|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleanValue);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
    if (Array.isArray(parsed?.skills)) {
      return parsed.skills.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
  }

  return cleanValue
    .split(/[\n,]+/)
    .map((item) => item.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
};

const SKILL_ALIASES = new Map([
  ["javascript", "JavaScript"],
  ["java script", "JavaScript"],
  ["js", "JavaScript"],
  ["typescript", "TypeScript"],
  ["type script", "TypeScript"],
  ["ts", "TypeScript"],
  ["python", "Python"],
  ["py", "Python"],
  ["java", "Java"],
  ["c", "C"],
  ["c++", "C++"],
  ["c#", "C#"],
  ["go", "Go"],
  ["golang", "Go"],
  ["php", "PHP"],
  ["ruby", "Ruby"],
  ["swift", "Swift"],
  ["kotlin", "Kotlin"],
  ["rust", "Rust"],
  ["r", "R"],
  ["html", "HTML"],
  ["css", "CSS"],
  ["sql", "SQL"],
  ["dart", "Dart"],
  ["scala", "Scala"],
  ["perl", "Perl"],
  ["matlab", "MATLAB"],
  ["objective-c", "Objective-C"],
  ["objective c", "Objective-C"],
  ["shell", "Shell"],
  ["bash", "Bash"],
]);

const CV_SKILL_PATTERNS = [
  { name: "JavaScript", regex: /\b(java\s*script|javascript|js)\b/i },
  { name: "TypeScript", regex: /\b(type\s*script|typescript|ts)\b/i },
  { name: "Python", regex: /\bpython\b/i },
  { name: "Java", regex: /\bjava\b(?!\s*script)/i },
  { name: "C#", regex: /\bc#\b/i },
  { name: "C++", regex: /\bc\+\+\b/i },
  { name: "C", regex: /(?:^|[\s,;:()\-])c(?:$|[\s,;:()\-])/i },
  { name: "Go", regex: /\b(go|golang)\b/i },
  { name: "PHP", regex: /\bphp\b/i },
  { name: "Ruby", regex: /\bruby\b/i },
  { name: "Swift", regex: /\bswift\b/i },
  { name: "Kotlin", regex: /\bkotlin\b/i },
  { name: "Rust", regex: /\brust\b/i },
  { name: "R", regex: /(?:^|[\s,;:()\-])r(?:$|[\s,;:()\-])/i },
  { name: "HTML", regex: /\bhtml\b/i },
  { name: "CSS", regex: /\bcss\b/i },
  { name: "SQL", regex: /\bsql\b/i },
  { name: "Dart", regex: /\bdart\b/i },
  { name: "Scala", regex: /\bscala\b/i },
  { name: "Perl", regex: /\bperl\b/i },
  { name: "MATLAB", regex: /\bmatlab\b/i },
  { name: "Objective-C", regex: /\bobjective[\s-]*c\b/i },
  { name: "Shell", regex: /\bshell\b/i },
  { name: "Bash", regex: /\bbash\b/i },
];

const normalizeSkill = (value) => {
  const key = String(value || "")
    .replace(/\uFFFD/g, "")
    .trim()
    .toLowerCase();
  return SKILL_ALIASES.get(key) || "";
};

const extractSkillsMentionedInCv = (text) =>
  CV_SKILL_PATTERNS.filter((entry) => entry.regex.test(String(text || ""))).map(
    (entry) => entry.name,
  );

const filterSkillsFromCvOnly = (skills, rawText) => {
  const cvMentioned = new Set(extractSkillsMentionedInCv(rawText));
  const result = [];
  const seen = new Set();

  skills.forEach((item) => {
    const skill = normalizeSkill(item);
    if (!skill) return;
    if (!cvMentioned.has(skill)) return;
    const key = skill.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    result.push(skill);
  });

  return result;
};


const splitIntoChunks = (text, maxChunkChars) => {
  const paragraphs = String(text || "")
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!paragraphs.length) return [];

  const chunks = [];
  let current = "";

  paragraphs.forEach((paragraph) => {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length <= maxChunkChars) {
      current = candidate;
      return;
    }

    if (current) {
      chunks.push(current);
    }

    if (paragraph.length <= maxChunkChars) {
      current = paragraph;
      return;
    }

    for (let index = 0; index < paragraph.length; index += maxChunkChars) {
      chunks.push(paragraph.slice(index, index + maxChunkChars));
    }
    current = "";
  });

  if (current) {
    chunks.push(current);
  }

  return chunks;
};

const extractTextFromPdf = async (file) => {
  const buffer = await file.arrayBuffer();
  const document = await pdfjsLib
    // Some production servers serve .mjs with a non-JS MIME type,
    // which breaks worker module loading. Parsing on main thread avoids that.
    .getDocument({ data: new Uint8Array(buffer), disableWorker: true })
    .promise;

  const pagesText = [];
  for (let pageIndex = 1; pageIndex <= document.numPages; pageIndex += 1) {
    const page = await document.getPage(pageIndex);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .trim();
    if (pageText) {
      pagesText.push(pageText);
    }
  }

  return normalizeText(pagesText.join("\n\n"));
};

const extractTextFromDocx = async (file) => {
  const mammothModule = await import("mammoth/mammoth.browser.js");
  const mammoth = mammothModule.default || mammothModule;
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return normalizeText(result?.value || "");
};

const extractCvText = async (file) => {
  const type = file?.type;

  if (type === "text/plain") {
    return normalizeText(await file.text());
  }

  if (type === "application/pdf") {
    return extractTextFromPdf(file);
  }

  if (type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return extractTextFromDocx(file);
  }

  if (type === "application/msword") {
    throw new Error("DOC format is not supported for parsing. Please upload PDF, DOCX, or TXT.");
  }

  throw new Error("Unsupported CV type. Use PDF, DOCX, or TXT.");
};

const requestSkillsFromChunk = async (apiKey, file, chunk, chunkIndex, totalChunks) => {
  const prompt = [
    "You are a technical skill extractor.",
    "Extract ONLY programming languages from the CV chunk below.",
    "Do NOT include frameworks, libraries, databases, tools, cloud platforms, or soft skills.",
    "Return a JSON array of strings only. No explanation, no markdown.",
    "Example output: [\"JavaScript\", \"Python\", \"Java\"]",
    "",
    `File: ${file.name} | Chunk: ${chunkIndex + 1}/${totalChunks}`,
    "",
    "CV chunk:",
    chunk,
  ].join("\n");

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.1,
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content:
            "You extract only programming languages from CV text and respond with valid JSON only as an array of strings.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Groq extraction request failed.");
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content || "";
  return parseSkills(content);
};

export const extractSkillsFromCV = async (file) => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_GROQ_API_KEY.");
  }

  if (!SUPPORTED_TYPES.includes(file?.type)) {
    throw new Error("Unsupported CV type. Use PDF, DOC, DOCX, or TXT.");
  }

  const rawText = await extractCvText(file);
  if (!rawText) {
    throw new Error("Could not extract text from CV. Please upload a text-based PDF, DOCX, or TXT.");
  }

  const { content: safeText } = takePreview(rawText, MAX_TEXT_CHARS);
  const chunks = splitIntoChunks(safeText, MAX_CHUNK_CHARS).slice(0, MAX_CHUNKS);
  if (!chunks.length) {
    throw new Error("CV appears empty after text extraction.");
  }

  const allSkills = [];
  for (let index = 0; index < chunks.length; index += 1) {
    const chunkSkills = await requestSkillsFromChunk(
      apiKey,
      file,
      chunks[index],
      index,
      chunks.length,
    );
    allSkills.push(...chunkSkills);
  }

  const extractedSkills = filterSkillsFromCvOnly(allSkills, rawText);

  if (!extractedSkills.length) {
    throw new Error("No programming languages were extracted from CV.");
  }

  return { success: true, extractedSkills };
};

export const insertExtractedSkillsForTrainee = async (
  traineeId,
  cvFile,
  extractedSkills,
) => {
  if (!traineeId) throw new Error("Missing trainee id.");
 
  // Send exactly what AI returned (no dedupe/remapping before API call).
  const aiSkills = Array.isArray(extractedSkills)
    ? extractedSkills.filter((skill) => String(skill || "").trim())
    : [];

  if (!aiSkills.length) {
    throw new Error("No valid extracted skills found to save.");
  }

  const insertResponse = await insertTraineeSkills(
    traineeId,
    cvFile,
    aiSkills,
  );

  const responseSkills =
    insertResponse?.matchedSkills ||
    insertResponse?.data?.matchedSkills ||
    insertResponse?.skills ||
    insertResponse?.data?.skills ||
    [];

  const matchedSkills = Array.isArray(responseSkills)
    ? responseSkills.map((item, index) => ({
        id: Number(item?.id ?? item?.skill_id) || index + 1,
        name: item?.name || item?.skill_name || String(item || "").trim(),
      }))
    : aiSkills.map((name, index) => ({ id: index + 1, name: String(name).trim() }));

  return { ...insertResponse, matchedSkills, skillNames: aiSkills };
};

export const extractAndInsertSkillsFromCV = async (traineeId, cvFile) => {
  const extraction = await extractSkillsFromCV(cvFile);
  const extractedSkills = extraction?.extractedSkills || [];
  const inserted = await insertExtractedSkillsForTrainee(
    traineeId,
    cvFile,
    extractedSkills,
  );
  return { ...extraction, ...inserted, extractedSkills };
};
