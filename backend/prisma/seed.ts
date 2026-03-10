import { prisma } from "../src/prisma";
import * as bcrypt from "bcryptjs";

const generateHash = (password: string): string => {
  return bcrypt.hashSync(password, 10);
};

const AI_TYPES = ["learn", "practice", "review", "reflect"] as const;

// ─── Helpers ───────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Генеруємо реалістичну дату "останньої активності"
// щоб streak не обнулявся — остання активність або сьогодні або вчора
function lastActiveDate(streakDays: number): Date {
  // 70% — активний сьогодні, 30% — вчора (але streak живий)
  const offsetDays = Math.random() < 0.7 ? 0 : 1;
  return daysAgo(offsetDays);
}

// ─── Goal templates з релевантними тасками ─────────────────────────────────

interface TaskTemplate {
  title: string;
  description: string;
  estimatedMinutes: number;
  type: (typeof AI_TYPES)[number] | "manual" | "daily";
  station?: string;
}

interface GoalTemplate {
  title: string;
  context: string;
  aiTasks: TaskTemplate[];
  manualTasks: TaskTemplate[];
  dailyTasks: TaskTemplate[];
}

const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    title: "Learn React",
    context:
      "Master React from basics to advanced patterns including hooks, context, and performance optimization.",
    aiTasks: [
      {
        title: "Complete JSX and component basics module",
        description: "Learn JSX syntax, functional components, and props",
        estimatedMinutes: 45,
        type: "learn",
        station: "Stage 1",
      },
      {
        title: "Build a counter app with useState",
        description: "Practice state management with hooks",
        estimatedMinutes: 30,
        type: "practice",
        station: "Stage 1",
      },
      {
        title: "Study useEffect lifecycle patterns",
        description: "Understand side effects and cleanup",
        estimatedMinutes: 40,
        type: "learn",
        station: "Stage 2",
      },
      {
        title: "Build a data-fetching component",
        description: "Fetch and display data from a public API",
        estimatedMinutes: 60,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Review React rendering and reconciliation",
        description: "Understand how React updates the DOM",
        estimatedMinutes: 35,
        type: "review",
        station: "Stage 3",
      },
      {
        title: "Implement Context API for global state",
        description: "Replace prop drilling with context",
        estimatedMinutes: 50,
        type: "practice",
        station: "Stage 3",
      },
      {
        title: "Reflect on React project structure",
        description: "Evaluate folder structure and code quality",
        estimatedMinutes: 20,
        type: "reflect",
        station: "Stage 3",
      },
    ],
    manualTasks: [
      {
        title: "Watch React crash course on YouTube",
        description: "Find a good intro video and take notes",
        estimatedMinutes: 60,
        type: "manual",
      },
      {
        title: "Set up Create React App project",
        description: "Bootstrap environment and explore structure",
        estimatedMinutes: 20,
        type: "manual",
      },
      {
        title: "Read official React docs",
        description: "Go through the Quick Start guide",
        estimatedMinutes: 45,
        type: "manual",
      },
      {
        title: "Clone and run a React project from GitHub",
        description: "Study someone else's code structure",
        estimatedMinutes: 30,
        type: "manual",
      },
    ],
    dailyTasks: [
      {
        title: "Code 30 min in React",
        description: "Daily hands-on practice session",
        estimatedMinutes: 30,
        type: "daily",
      },
      {
        title: "Read one React article",
        description: "Stay updated with community posts",
        estimatedMinutes: 15,
        type: "daily",
      },
    ],
  },
  {
    title: "Learn French",
    context:
      "Reach B1 level in French through vocabulary building, grammar study, and daily speaking practice.",
    aiTasks: [
      {
        title: "Complete beginner vocabulary set (100 words)",
        description: "Learn top 100 most common French words",
        estimatedMinutes: 40,
        type: "learn",
        station: "Stage 1",
      },
      {
        title: "Practice present tense conjugations",
        description: "Master être, avoir and regular -er verbs",
        estimatedMinutes: 35,
        type: "practice",
        station: "Stage 1",
      },
      {
        title: "Listen to French podcast episode",
        description: "Train your ear for native speed speech",
        estimatedMinutes: 25,
        type: "learn",
        station: "Stage 2",
      },
      {
        title: "Write 5 sentences about your daily routine",
        description: "Apply vocabulary in real sentences",
        estimatedMinutes: 20,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Review irregular verb list",
        description: "Focus on avoir, être, aller, faire",
        estimatedMinutes: 30,
        type: "review",
        station: "Stage 3",
      },
      {
        title: "Reflect on speaking confidence",
        description: "Note what's improved and what's still hard",
        estimatedMinutes: 15,
        type: "reflect",
        station: "Stage 3",
      },
    ],
    manualTasks: [
      {
        title: "Install Duolingo and start French course",
        description: "Set a daily goal of 10-15 minutes",
        estimatedMinutes: 15,
        type: "manual",
      },
      {
        title: "Find a French language exchange partner",
        description: "Use Tandem or HelloTalk app",
        estimatedMinutes: 30,
        type: "manual",
      },
      {
        title: "Watch a French film with subtitles",
        description: "Choose a movie from a list of popular French films",
        estimatedMinutes: 120,
        type: "manual",
      },
    ],
    dailyTasks: [
      {
        title: "10 min Duolingo French",
        description: "Daily streak practice on Duolingo",
        estimatedMinutes: 10,
        type: "daily",
      },
      {
        title: "Learn 5 new French words",
        description: "Use Anki flashcards",
        estimatedMinutes: 10,
        type: "daily",
      },
    ],
  },
  {
    title: "Run a half marathon",
    context:
      "Train for a 21km half marathon in 4 months through structured running plan and cross-training.",
    aiTasks: [
      {
        title: "Complete week 1 easy run (5km)",
        description: "Maintain conversational pace throughout",
        estimatedMinutes: 40,
        type: "practice",
        station: "Stage 1",
      },
      {
        title: "Learn proper running form",
        description: "Study cadence, posture and foot strike",
        estimatedMinutes: 25,
        type: "learn",
        station: "Stage 1",
      },
      {
        title: "Do interval training session",
        description: "4x400m repeats with 90s rest",
        estimatedMinutes: 45,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Review weekly mileage and recovery",
        description: "Check if training load is sustainable",
        estimatedMinutes: 20,
        type: "review",
        station: "Stage 2",
      },
      {
        title: "Complete 12km long run",
        description: "Longest run so far — run slow and steady",
        estimatedMinutes: 90,
        type: "practice",
        station: "Stage 3",
      },
      {
        title: "Reflect on race-day strategy",
        description: "Plan pacing, nutrition and gear",
        estimatedMinutes: 20,
        type: "reflect",
        station: "Stage 3",
      },
    ],
    manualTasks: [
      {
        title: "Buy proper running shoes",
        description: "Visit a running store for gait analysis",
        estimatedMinutes: 60,
        type: "manual",
      },
      {
        title: "Register for a local half marathon",
        description: "Find a race 3-4 months away",
        estimatedMinutes: 20,
        type: "manual",
      },
      {
        title: "Create training schedule spreadsheet",
        description: "Plan weekly runs for 16 weeks",
        estimatedMinutes: 40,
        type: "manual",
      },
    ],
    dailyTasks: [
      {
        title: "Morning stretch routine (10 min)",
        description: "Prevent injury with daily mobility work",
        estimatedMinutes: 10,
        type: "daily",
      },
      {
        title: "Log today's run or rest day",
        description: "Track progress in running journal",
        estimatedMinutes: 5,
        type: "daily",
      },
    ],
  },
  {
    title: "Master TypeScript",
    context:
      "Learn TypeScript deeply — from basic types to advanced generics, utility types and strict configurations.",
    aiTasks: [
      {
        title: "Understand primitive and object types",
        description: "string, number, boolean, arrays, objects",
        estimatedMinutes: 30,
        type: "learn",
        station: "Stage 1",
      },
      {
        title: "Practice type annotations in functions",
        description: "Add types to existing JS functions",
        estimatedMinutes: 35,
        type: "practice",
        station: "Stage 1",
      },
      {
        title: "Study interfaces vs type aliases",
        description: "Learn when to use each",
        estimatedMinutes: 25,
        type: "learn",
        station: "Stage 2",
      },
      {
        title: "Implement a typed API response handler",
        description: "Use generics to handle different data shapes",
        estimatedMinutes: 50,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Review strict mode configuration",
        description: "Enable strict and fix all errors",
        estimatedMinutes: 40,
        type: "review",
        station: "Stage 3",
      },
      {
        title: "Reflect on type safety improvements",
        description: "Document bugs TS helped you catch",
        estimatedMinutes: 15,
        type: "reflect",
        station: "Stage 3",
      },
    ],
    manualTasks: [
      {
        title: "Read TypeScript handbook introduction",
        description: "Official docs: basic types chapter",
        estimatedMinutes: 40,
        type: "manual",
      },
      {
        title: "Migrate a small JS project to TS",
        description: "Convert an existing project and fix errors",
        estimatedMinutes: 90,
        type: "manual",
      },
      {
        title: "Watch TypeScript course intro videos",
        description: "Matt Pocock or Execute Program",
        estimatedMinutes: 60,
        type: "manual",
      },
    ],
    dailyTasks: [
      {
        title: "Solve one TypeScript challenge",
        description: "Use type-challenges on GitHub",
        estimatedMinutes: 20,
        type: "daily",
      },
    ],
  },
  {
    title: "Read 12 books this year",
    context:
      "Build a consistent reading habit by reading one book per month across different genres.",
    aiTasks: [
      {
        title: "Create reading list for the year",
        description: "Choose 12 books across different genres",
        estimatedMinutes: 30,
        type: "learn",
        station: "Stage 1",
      },
      {
        title: "Read assigned book chapters (1-5)",
        description: "First reading block of the month",
        estimatedMinutes: 60,
        type: "practice",
        station: "Stage 1",
      },
      {
        title: "Take notes on key ideas from chapters 1-5",
        description: "Summarize main insights in your own words",
        estimatedMinutes: 25,
        type: "review",
        station: "Stage 1",
      },
      {
        title: "Finish the book",
        description: "Complete reading and write a short review",
        estimatedMinutes: 90,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Reflect on what you learned",
        description: "How will you apply the ideas?",
        estimatedMinutes: 20,
        type: "reflect",
        station: "Stage 2",
      },
    ],
    manualTasks: [
      {
        title: "Set up Goodreads account",
        description: "Track reading progress and discover books",
        estimatedMinutes: 15,
        type: "manual",
      },
      {
        title: "Visit library or order first book",
        description: "Get your first book ready to go",
        estimatedMinutes: 30,
        type: "manual",
      },
      {
        title: "Find a reading buddy or book club",
        description: "Accountability makes it easier",
        estimatedMinutes: 20,
        type: "manual",
      },
    ],
    dailyTasks: [
      {
        title: "Read for 30 minutes",
        description: "Daily reading habit before bed or morning",
        estimatedMinutes: 30,
        type: "daily",
      },
    ],
  },
  {
    title: "Meditate daily",
    context:
      "Establish a sustainable daily meditation practice for stress reduction and mental clarity.",
    aiTasks: [
      {
        title: "Complete guided beginner meditation (10 min)",
        description: "Use Headspace or Calm app intro session",
        estimatedMinutes: 15,
        type: "learn",
        station: "Stage 1",
      },
      {
        title: "Practice breath awareness for 3 days",
        description: "Focus only on the breath — 5 minutes each day",
        estimatedMinutes: 5,
        type: "practice",
        station: "Stage 1",
      },
      {
        title: "Try body scan meditation",
        description: "Progressive relaxation from head to toe",
        estimatedMinutes: 20,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Review your meditation journal",
        description: "Notice patterns in mood and focus",
        estimatedMinutes: 15,
        type: "review",
        station: "Stage 2",
      },
      {
        title: "Reflect on how meditation affects your day",
        description: "Write about changes you've noticed",
        estimatedMinutes: 15,
        type: "reflect",
        station: "Stage 3",
      },
    ],
    manualTasks: [
      {
        title: "Set up a dedicated meditation spot",
        description: "Find a quiet corner with a cushion",
        estimatedMinutes: 20,
        type: "manual",
      },
      {
        title: "Download a meditation app",
        description: "Headspace, Calm or Insight Timer",
        estimatedMinutes: 10,
        type: "manual",
      },
      {
        title: "Read about benefits of mindfulness",
        description: "Understand the science behind it",
        estimatedMinutes: 25,
        type: "manual",
      },
    ],
    dailyTasks: [
      {
        title: "Morning meditation (10 min)",
        description: "Sit before checking your phone",
        estimatedMinutes: 10,
        type: "daily",
      },
    ],
  },
  {
    title: "Learn Spanish",
    context:
      "Reach conversational Spanish through daily vocabulary, grammar exercises, and speaking practice.",
    aiTasks: [
      {
        title: "Learn 150 most common Spanish words",
        description: "Use spaced repetition with Anki",
        estimatedMinutes: 40,
        type: "learn",
        station: "Stage 1",
      },
      {
        title: "Practice ser vs estar distinction",
        description: "Most confusing grammar point for beginners",
        estimatedMinutes: 30,
        type: "practice",
        station: "Stage 1",
      },
      {
        title: "Complete listening exercise — native dialogue",
        description: "Transcribe what you hear",
        estimatedMinutes: 30,
        type: "learn",
        station: "Stage 2",
      },
      {
        title: "Have a 5-minute conversation with AI or tutor",
        description: "Force yourself to speak",
        estimatedMinutes: 15,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Review all vocabulary from Stage 1",
        description: "Test yourself without looking at cards",
        estimatedMinutes: 20,
        type: "review",
        station: "Stage 3",
      },
    ],
    manualTasks: [
      {
        title: "Start Duolingo Spanish tree",
        description: "Consistent daily practice for habit building",
        estimatedMinutes: 15,
        type: "manual",
      },
      {
        title: "Watch a Spanish series on Netflix",
        description: "Money Heist or Club de Cuervos with subtitles",
        estimatedMinutes: 60,
        type: "manual",
      },
    ],
    dailyTasks: [
      {
        title: "15 min Spanish Duolingo",
        description: "Keep the streak alive",
        estimatedMinutes: 15,
        type: "daily",
      },
      {
        title: "Review 10 flashcards",
        description: "Anki vocabulary review",
        estimatedMinutes: 10,
        type: "daily",
      },
    ],
  },
  {
    title: "Write a blog",
    context:
      "Start a personal blog and publish at least 2 articles per month on topics related to tech and personal growth.",
    aiTasks: [
      {
        title: "Define blog niche and target audience",
        description: "Write a one-paragraph mission statement",
        estimatedMinutes: 25,
        type: "learn",
        station: "Stage 1",
      },
      {
        title: "Create blog on Hashnode or Substack",
        description: "Set up domain, bio and first look",
        estimatedMinutes: 45,
        type: "practice",
        station: "Stage 1",
      },
      {
        title: "Write first blog post draft",
        description: "500-800 words on a topic you know well",
        estimatedMinutes: 60,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Edit and publish first post",
        description: "Proofread, add image and hit publish",
        estimatedMinutes: 30,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Review analytics after first week",
        description: "Check views, reads and shares",
        estimatedMinutes: 20,
        type: "review",
        station: "Stage 3",
      },
      {
        title: "Reflect on what topics get traction",
        description: "Double down on what readers like",
        estimatedMinutes: 20,
        type: "reflect",
        station: "Stage 3",
      },
    ],
    manualTasks: [
      {
        title: "Brainstorm 20 blog topic ideas",
        description: "Write freely without judging",
        estimatedMinutes: 30,
        type: "manual",
      },
      {
        title: "Read 5 blogs in your niche",
        description: "Study what style and format works",
        estimatedMinutes: 40,
        type: "manual",
      },
    ],
    dailyTasks: [
      {
        title: "Write 200 words",
        description: "Daily writing habit regardless of quality",
        estimatedMinutes: 20,
        type: "daily",
      },
    ],
  },
  {
    title: "Learn data science",
    context:
      "Build a solid foundation in data science: Python, pandas, visualization, and basic ML models.",
    aiTasks: [
      {
        title: "Complete Python basics refresher",
        description: "Lists, dicts, functions, list comprehensions",
        estimatedMinutes: 50,
        type: "learn",
        station: "Stage 1",
      },
      {
        title: "Explore dataset with pandas",
        description: "Load CSV, describe, check nulls, filter rows",
        estimatedMinutes: 45,
        type: "practice",
        station: "Stage 1",
      },
      {
        title: "Create data visualization with matplotlib",
        description: "Bar chart, line chart, scatter plot",
        estimatedMinutes: 40,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Build first linear regression model",
        description: "Use sklearn on a simple dataset",
        estimatedMinutes: 60,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Review model evaluation metrics",
        description: "RMSE, MAE, R2 — understand each",
        estimatedMinutes: 35,
        type: "review",
        station: "Stage 3",
      },
      {
        title: "Reflect on a full mini project",
        description: "End-to-end: data → model → insights",
        estimatedMinutes: 30,
        type: "reflect",
        station: "Stage 3",
      },
    ],
    manualTasks: [
      {
        title: "Install Anaconda and Jupyter Notebook",
        description: "Set up the data science environment",
        estimatedMinutes: 30,
        type: "manual",
      },
      {
        title: "Find a good Kaggle beginner dataset",
        description: "Titanic or Iris dataset for practice",
        estimatedMinutes: 20,
        type: "manual",
      },
      {
        title: "Enroll in free DS course (Coursera/Kaggle)",
        description: "Kaggle's Intro to ML is great",
        estimatedMinutes: 25,
        type: "manual",
      },
    ],
    dailyTasks: [
      {
        title: "Write 10 lines of Python",
        description: "Anything counts — keep coding daily",
        estimatedMinutes: 15,
        type: "daily",
      },
      {
        title: "Read one data science article",
        description: "Towards Data Science on Medium",
        estimatedMinutes: 15,
        type: "daily",
      },
    ],
  },
  {
    title: "Improve public speaking",
    context:
      "Overcome fear of public speaking and develop confidence through regular practice and feedback.",
    aiTasks: [
      {
        title: "Record a 2-minute self-introduction video",
        description: "Watch it back and note what to improve",
        estimatedMinutes: 20,
        type: "practice",
        station: "Stage 1",
      },
      {
        title: "Study the 3-part speech structure",
        description: "Opening hook, body, memorable close",
        estimatedMinutes: 25,
        type: "learn",
        station: "Stage 1",
      },
      {
        title: "Practice impromptu speaking (PREP method)",
        description: "Point, Reason, Example, Point",
        estimatedMinutes: 30,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Give a 5-minute presentation to a friend",
        description: "Get real feedback on delivery",
        estimatedMinutes: 30,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Review recording of your presentation",
        description: "Focus on pace, filler words, eye contact",
        estimatedMinutes: 20,
        type: "review",
        station: "Stage 3",
      },
      {
        title: "Reflect on your biggest speaking fear",
        description: "Write what scares you and why",
        estimatedMinutes: 15,
        type: "reflect",
        station: "Stage 3",
      },
    ],
    manualTasks: [
      {
        title: "Join a local Toastmasters club",
        description: "Best structured speaking practice available",
        estimatedMinutes: 60,
        type: "manual",
      },
      {
        title: "Watch 3 TED talks and analyze structure",
        description: "What makes them engaging?",
        estimatedMinutes: 60,
        type: "manual",
      },
    ],
    dailyTasks: [
      {
        title: "Speak for 1 minute on random topic",
        description: "Use random word generator as a prompt",
        estimatedMinutes: 5,
        type: "daily",
      },
    ],
  },
];

// ─── Users ─────────────────────────────────────────────────────────────────

const USERS = [
  {
    name: "Sofiia Stanishevska",
    email: "sophiyastanish@gmail.com",
    password: "Sofiia1305",
    money: 15,
    currentStreak: 7,
    longestStreak: 15,
  },
  {
    name: "Sofiia Kuzniak",
    email: "sofiia.kuzniak@gmail.com",
    password: "password123",
    money: 15,
    currentStreak: 7,
    longestStreak: 15,
  },
  {
    name: "Bohuslav Stanishevskyy",
    email: "bohuStan@gmail.com",
    password: "password123",
    money: 28,
    currentStreak: 12,
    longestStreak: 25,
  },
  {
    name: "Anastasiia Kasatkina",
    email: "nastiakasat@gmail.com",
    password: "password123",
    money: 9,
    currentStreak: 2,
    longestStreak: 10,
  },
  {
    name: "Illya Shuliak",
    email: "lqduser@gmail.com",
    password: "password123",
    money: 32,
    currentStreak: 14,
    longestStreak: 30,
  },
  {
    name: "Roman Pelekh",
    email: "tkdfjzlg@gmail.com",
    password: "password123",
    money: 21,
    currentStreak: 5,
    longestStreak: 12,
  },
  {
    name: "Sofiia Pylnyk",
    email: "hatikuji@gmail.com",
    password: "password123",
    money: 45,
    currentStreak: 18,
    longestStreak: 31,
  },
  {
    name: "Oleksandr Poliakov",
    email: "viyd12@gmail.com",
    password: "password123",
    money: 18,
    currentStreak: 8,
    longestStreak: 20,
  },
  {
    name: "Ruslana Kovtunovych",
    email: "rusyakovtunovych@gmail.com",
    password: "password123",
    money: 54,
    currentStreak: 21,
    longestStreak: 50,
  },
  {
    name: "Olena Struk",
    email: "o_struk@gmail.com",
    password: "password123",
    money: 12,
    currentStreak: 3,
    longestStreak: 8,
  },
  {
    name: "Sofiia Huliy",
    email: "sofiia.h@gmail.com",
    password: "password123",
    money: 36,
    currentStreak: 15,
    longestStreak: 35,
  },
  {
    name: "Iryna Bilous",
    email: "bilous_i@gmail.com",
    password: "password123",
    money: 24,
    currentStreak: 9,
    longestStreak: 18,
  },
  {
    name: "Oleh Korniichuk",
    email: "isntlazy@gmail.com",
    password: "password123",
    money: 60,
    currentStreak: 25,
    longestStreak: 43,
  },
  {
    name: "Yulia Rovetska",
    email: "playfullcreator@gmail.com",
    password: "password123",
    money: 17,
    currentStreak: 6,
    longestStreak: 14,
  },
  {
    name: "Yuliia Kovaliv",
    email: "kovaliv_y@gmail.com",
    password: "password123",
    money: 42,
    currentStreak: 16,
    longestStreak: 40,
  },
  {
    name: "Oleksandr Kolodiy",
    email: "lesyk_kolod@gmail.com",
    password: "password123",
    money: 31,
    currentStreak: 13,
    longestStreak: 28,
  },
  {
    name: "Viktoriia Savytska",
    email: "savytska@gmail.com",
    password: "password123",
    money: 50,
    currentStreak: 20,
    longestStreak: 48,
  },
  {
    name: "Andriy Stanishevskyy",
    email: "sandr463@gmail.com",
    password: "password123",
    money: 19,
    currentStreak: 7,
    longestStreak: 16,
  },
  {
    name: "Nataliia Stanishevska",
    email: "n_stanish@ukr.net",
    password: "password123",
    money: 38,
    currentStreak: 11,
    longestStreak: 32,
  },
  {
    name: "Volodymyr Stanishevskyy",
    email: "stanish@ukr.net",
    password: "password123",
    money: 26,
    currentStreak: 10,
    longestStreak: 22,
  },
  {
    name: "Ostap Kokoshko",
    email: "ostap.kokoshko@gmail.com",
    password: "password123",
    money: 68,
    currentStreak: 8,
    longestStreak: 10,
  },
];

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting seed...");

  await prisma.task.deleteMany({});
  await prisma.goal.deleteMany({});
  await prisma.user.deleteMany({});

  const createdUsers = await Promise.all(
    USERS.map((u) =>
      prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          password: generateHash(u.password),
          money: u.money,
          currentStreak: u.currentStreak,
          longestStreak: u.longestStreak,
        },
      }),
    ),
  );

  console.log(`✅ Created ${createdUsers.length} users`);

  let totalGoals = 0;
  let totalTasks = 0;
  let aiGoals = 0;
  let manualGoals = 0;

  for (const user of createdUsers) {
    // Кожен юзер отримує 2-4 цілі з різних шаблонів
    const goalCount = randomBetween(2, 4);
    const shuffledTemplates = [...GOAL_TEMPLATES].sort(
      () => Math.random() - 0.5,
    );
    const selectedTemplates = shuffledTemplates.slice(0, goalCount);

    for (const template of selectedTemplates) {
      const isAI = Math.random() < 0.5; // 50% AI / 50% manual
      const isCompleted = Math.random() < 0.15;

      // Реалістичний розподіл прогресу:
      // 35% — тільки почали (0–25%), 30% — в середині (25–60%),
      // 20% — майже готово (60–90%), 15% — завершено
      const progressRoll = Math.random();
      const rawProgress = isCompleted
        ? 100
        : progressRoll < 0.35
          ? Math.random() * 25 // 0–25%
          : progressRoll < 0.65
            ? 25 + Math.random() * 35 // 25–60%
            : 60 + Math.random() * 30; // 60–90%

      const completedAt = isCompleted ? daysAgo(randomBetween(1, 20)) : null;

      const goal = await prisma.goal.create({
        data: {
          title: template.title,
          context: isAI
            ? `AI-generated plan: ${template.context}`
            : `Personal goal: ${template.context}`,
          deadline: daysFromNow(randomBetween(30, 180)),
          userId: user.id,
          completedAt,
          currentStationProgress: parseFloat(rawProgress.toFixed(1)),
        },
      });

      totalGoals++;
      isAI ? aiGoals++ : manualGoals++;

      // ── Таски для AI-цілей ──────────────────────────────────────
      if (isAI) {
        // Беремо всі AI-таски з шаблону
        const aiTaskList = template.aiTasks;
        // Скільки вже "done" — залежить від прогресу
        const doneCount = Math.round(aiTaskList.length * (rawProgress / 100));

        for (let i = 0; i < aiTaskList.length; i++) {
          const t = aiTaskList[i];
          const isDone = i < doneCount;
          const generatedAt = daysAgo(randomBetween(5, 30));

          await prisma.task.create({
            data: {
              title: t.title,
              description: t.description,
              status: isDone ? "done" : "pending",
              type: t.type,
              goalId: goal.id,
              generatedAt,
              dueDate: daysFromNow(randomBetween(1, 14)),
              estimatedMinutes: t.estimatedMinutes,
              station: t.station ?? null,
              progressContribution: parseFloat(
                (100 / aiTaskList.length).toFixed(2),
              ),
            },
          });
          totalTasks++;
        }

        // Daily таски для AI-цілей
        for (const daily of template.dailyTasks) {
          const isDailyDone = Math.random() < 0.6;
          await prisma.task.create({
            data: {
              title: daily.title,
              description: daily.description,
              status: isDailyDone ? "done" : "pending",
              type: "daily",
              goalId: goal.id,
              generatedAt: new Date(),
              estimatedMinutes: daily.estimatedMinutes,
              progressContribution: 10,
            },
          });
          totalTasks++;
        }

        // ── Таски для manual-цілей ──────────────────────────────────
      } else {
        const manualTaskList = template.manualTasks;
        const doneCount = Math.round(
          manualTaskList.length * (rawProgress / 100),
        );

        for (let i = 0; i < manualTaskList.length; i++) {
          const t = manualTaskList[i];
          const isDone = i < doneCount;

          await prisma.task.create({
            data: {
              title: t.title,
              description: t.description,
              status: isDone ? "done" : "pending",
              type: "manual",
              goalId: goal.id,
              generatedAt: daysAgo(randomBetween(1, 20)),
              dueDate: daysFromNow(randomBetween(1, 21)),
              estimatedMinutes: t.estimatedMinutes,
              station: null,
              progressContribution: parseFloat(
                (100 / manualTaskList.length).toFixed(2),
              ),
            },
          });
          totalTasks++;
        }
      }
    }
  }

  console.log(
    `✅ Created ${totalGoals} goals (🤖 AI: ${aiGoals} | ✍️ Manual: ${manualGoals})`,
  );
  console.log(`✅ Created ${totalTasks} tasks`);
  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
