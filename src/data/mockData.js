export const users = [
  {
    id: "u1",
    email: "admin@interno.com",
    password: "admin123",
    role: "admin",
    name: "System Admin",
  },
  
  {
    id: "u2",
    email: "hr@brightlabs.com",
    password: "company123",
    role: "company",
    name: "BrightLabs HR",
    companyId: "c1",
  },
  {
    id: "u3",
    email: "trainee@interno.com",
    password: "trainee123",
    role: "trainee",
    name: "Ava Carter",
    traineeId: "t1",
  },
];

export const companies = [
  {
    id: "c1",
    name: "BrightLabs",
    industry: "Software",
    status: "Active",
    registeredDate: "2025-01-12",
  },
  {
    id: "c2",
    name: "HealthNova",
    industry: "Healthcare",
    status: "Inactive",
    registeredDate: "2025-03-01",
  },
  {
    id: "c3",
    name: "FinEdge",
    industry: "Finance",
    status: "Active",
    registeredDate: "2025-02-18",
  },
];

export const trainees = [
  {
    id: "t1",
    name: "Ava Carter",
    email: "trainee@interno.com",
    status: "Active",
    assignedCompany: "BrightLabs",
    progress: 72,
    skills: ["React.js", "JavaScript", "Git"],
  },
  {
    id: "t2",
    name: "Noah Bennett",
    email: "noah@mail.com",
    status: "Active",
    assignedCompany: "FinEdge",
    progress: 48,
    skills: ["Python", "SQL"],
  },
  {
    id: "t3",
    name: "Mia Wong",
    email: "mia@mail.com",
    status: "Pending",
    assignedCompany: "HealthNova",
    progress: 20,
    skills: ["Communication"],
  },
];

export const internships = [
  {
    id: "i1",
    title: "Frontend Intern",
    company: "BrightLabs",
    companyId: "c1",
    duration: "3 Months",
    status: "Approved",
    applicants: 34,
    slots: 4,
    skills: ["React.js", "HTML/CSS", "Git"],
    industry: "Software",
    location: "Remote",
    workType: "Full-time",
    publishedAt: "2026-03-28",
    deadline: "2026-05-10",
    summary:
      "Build customer-facing UI flows and collaborate with product, design, and engineering on weekly releases.",
    responsibilities: [
      "Ship reusable React components for core product journeys.",
      "Work with designers to convert mockups into responsive screens.",
      "Participate in code reviews and sprint planning sessions.",
    ],
    benefits: [
      "Mentorship from senior frontend engineers.",
      "Hands-on product work with real users.",
      "Certificate and internship completion feedback.",
    ],
  },
  {
    id: "i2",
    title: "Data Analyst Intern",
    company: "FinEdge",
    companyId: "c3",
    duration: "6 Months",
    status: "Pending",
    applicants: 21,
    slots: 3,
    skills: ["SQL", "Python", "Excel"],
    industry: "Finance",
    location: "Hybrid",
    workType: "Part-time",
    publishedAt: "2026-03-30",
    deadline: "2026-05-18",
    summary:
      "Turn raw business data into dashboards, reports, and insights that support financial decision-making.",
    responsibilities: [
      "Clean, validate, and analyze datasets from internal tools.",
      "Create recurring reports for business and finance teams.",
      "Document data assumptions and analysis methods clearly.",
    ],
    benefits: [
      "Exposure to analytics workflows used in production teams.",
      "Direct feedback from the finance operations team.",
      "Opportunity to build a portfolio-ready case study.",
    ],
  },
  {
    id: "i3",
    title: "Product Ops Intern",
    company: "HealthNova",
    companyId: "c2",
    duration: "4 Months",
    status: "Approved",
    applicants: 17,
    slots: 2,
    skills: ["Communication", "Planning"],
    industry: "Healthcare",
    location: "On-site",
    workType: "Full-time",
    publishedAt: "2026-04-02",
    deadline: "2026-05-22",
    summary:
      "Coordinate launch tasks, support operational workflows, and help the product team keep delivery on track.",
    responsibilities: [
      "Track launch tasks and dependencies across product teams.",
      "Prepare weekly status updates for stakeholders.",
      "Support process improvements across internal workflows.",
    ],
    benefits: [
      "Cross-functional exposure across product and operations.",
      "Structured growth with regular mentoring sessions.",
      "Opportunity to influence real launch processes.",
    ],
  },
];

export const assessments = [
  {
    id: "a1",
    title: "Frontend Fundamentals",
    description: "Core React and JS competency test",
    duration: 30,
    passScore: 60,
    assignedTo: "All Trainees",
    questions: [
      {
        id: "q1",
        type: "mcq",
        text: "Which hook manages state?",
        options: ["useMemo", "useState", "useEffect", "useRef"],
        correctAnswer: "useState",
      },
      {
        id: "q2",
        type: "boolean",
        text: "JSX compiles to JavaScript.",
        correctAnswer: "True",
      },
      {
        id: "q3",
        type: "short",
        text: "Name one CSS layout system.",
        correctAnswer: "Grid",
      },
    ],
    results: [
      {
        traineeName: "Ava Carter",
        score: 78,
        status: "Passed",
        date: "2026-01-14",
      },
      {
        traineeName: "Noah Bennett",
        score: 52,
        status: "Failed",
        date: "2026-01-16",
      },
    ],
  },
];

export const applicationTrend = [
  { month: "Aug", applications: 120 },
  { month: "Sep", applications: 160 },
  { month: "Oct", applications: 190 },
  { month: "Nov", applications: 260 },
  { month: "Dec", applications: 220 },
  { month: "Jan", applications: 300 },
];

export const traineesPerCompany = [
  { company: "BrightLabs", trainees: 44 },
  { company: "FinEdge", trainees: 32 },
  { company: "HealthNova", trainees: 18 },
];

export const testimonials = [
  {
    id: 1,
    name: "Sarah K.",
    quote: "I got hired full-time after my internship through this platform.",
  },
  {
    id: 2,
    name: "Alex M.",
    quote: "The assessments and progress tracking are excellent.",
  },
  {
    id: 3,
    name: "Lina P.",
    quote: "Finding internships that match my skills was easy.",
  },
];

export const activities = [
  { id: 1, message: "BrightLabs internship approved", time: "2h ago" },
  { id: 2, message: "Ava Carter submitted assessment", time: "5h ago" },
  { id: 3, message: "New company registration: NovaWorks", time: "1d ago" },
];
