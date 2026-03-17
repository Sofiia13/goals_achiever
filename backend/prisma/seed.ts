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

// ─── Types ─────────────────────────────────────────────────────────────────

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

// ─── Realistic goal templates ──────────────────────────────────────────────
//
// Chosen based on what real people actually set goals for:
// fitness, language learning, career skills, finance, creative projects.
//
// Each template has:
//   - 6–8 AI tasks (learn / practice / review / reflect) across 3 stations
//   - 3–4 manual tasks
//   - 1–2 daily habit tasks

const GOAL_TEMPLATES: GoalTemplate[] = [
  // ── 1. Fitness ─────────────────────────────────────────────────────────
  {
    title: "Get in shape for summer",
    context:
      "Lose 8kg and build a visible fitness base through consistent gym sessions and diet improvements over 4 months.",
    aiTasks: [
      {
        title: "Learn the basics of calorie deficit",
        description: "Understand TDEE, macros and how body composition works",
        estimatedMinutes: 25,
        type: "learn",
        station: "Stage 1",
      },
      {
        title: "Complete first full-body beginner workout",
        description: "3 sets of squats, push-ups, rows, planks",
        estimatedMinutes: 45,
        type: "practice",
        station: "Stage 1",
      },
      {
        title: "Track calories for 3 days straight",
        description: "Use MyFitnessPal to log everything honestly",
        estimatedMinutes: 15,
        type: "practice",
        station: "Stage 1",
      },
      {
        title: "Learn proper squat and deadlift form",
        description: "Watch tutorials, film yourself, compare",
        estimatedMinutes: 30,
        type: "learn",
        station: "Stage 2",
      },
      {
        title: "Complete week 4 progressive overload session",
        description: "Increase weight or reps vs last session",
        estimatedMinutes: 60,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Review progress photos and measurements",
        description: "Compare week 1 vs week 4 — waist, weight, energy",
        estimatedMinutes: 20,
        type: "review",
        station: "Stage 2",
      },
      {
        title: "Complete first 5km run without stopping",
        description: "Go slow — pace doesn't matter, finish line does",
        estimatedMinutes: 40,
        type: "practice",
        station: "Stage 3",
      },
      {
        title: "Reflect on what habits actually stuck",
        description: "What changed in diet, sleep, energy? What didn't work?",
        estimatedMinutes: 20,
        type: "reflect",
        station: "Stage 3",
      },
    ],
    manualTasks: [
      {
        title: "Buy a kitchen food scale",
        description: "Accurate portion tracking without guessing",
        estimatedMinutes: 20,
        type: "manual",
      },
      {
        title: "Choose a gym or set up home workout space",
        description: "Remove friction — make it easy to show up",
        estimatedMinutes: 30,
        type: "manual",
      },
      {
        title: "Meal prep lunches for the week",
        description: "Cook 5 portions of a high-protein meal in one session",
        estimatedMinutes: 90,
        type: "manual",
      },
    ],
    dailyTasks: [
      {
        title: "Log meals in MyFitnessPal",
        description: "Takes 3 minutes — builds self-awareness fast",
        estimatedMinutes: 5,
        type: "daily",
      },
      {
        title: "10-minute morning walk",
        description: "Low effort, high return for fat loss and mood",
        estimatedMinutes: 10,
        type: "daily",
      },
    ],
  },

  // ── 2. Career ──────────────────────────────────────────────────────────
  {
    title: "Switch to a UX design career",
    context:
      "Transition from a non-design role into UX design within 6 months by building a portfolio and landing first freelance project.",
    aiTasks: [
      {
        title: "Understand the UX design process end-to-end",
        description:
          "Research, define, ideate, prototype, test — the double diamond",
        estimatedMinutes: 35,
        type: "learn",
        station: "Stage 1",
      },
      {
        title: "Complete first wireframing exercise",
        description: "Redesign a confusing app screen you use daily",
        estimatedMinutes: 50,
        type: "practice",
        station: "Stage 1",
      },
      {
        title: "Conduct a 20-minute user interview",
        description: "Ask a friend about their frustrations with any app",
        estimatedMinutes: 30,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Study Gestalt principles and visual hierarchy",
        description: "The 6 laws every UX designer must know",
        estimatedMinutes: 40,
        type: "learn",
        station: "Stage 2",
      },
      {
        title: "Build first clickable prototype in Figma",
        description: "At least 5 connected screens for a real use case",
        estimatedMinutes: 90,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Review 5 UX portfolios of junior designers",
        description: "Note what case study structure and visuals they use",
        estimatedMinutes: 45,
        type: "review",
        station: "Stage 3",
      },
      {
        title: "Write a full UX case study for portfolio",
        description: "Problem → Research → Solution → Results",
        estimatedMinutes: 120,
        type: "practice",
        station: "Stage 3",
      },
      {
        title: "Reflect on skill gaps before applying to roles",
        description: "Compare your portfolio to job postings honestly",
        estimatedMinutes: 25,
        type: "reflect",
        station: "Stage 3",
      },
    ],
    manualTasks: [
      {
        title: "Create a Figma account and finish the basics tutorial",
        description: "Figma's own tutorial takes about 1 hour",
        estimatedMinutes: 60,
        type: "manual",
      },
      {
        title: "Enroll in Google UX Design Certificate on Coursera",
        description: "Free to audit — solid beginner curriculum",
        estimatedMinutes: 20,
        type: "manual",
      },
      {
        title: "Set up portfolio website on Notion or Webflow",
        description: "Placeholder is fine — publish early, improve often",
        estimatedMinutes: 45,
        type: "manual",
      },
      {
        title: "Apply to 3 junior UX roles or freelance gigs",
        description: "Even rejections teach you what recruiters want",
        estimatedMinutes: 60,
        type: "manual",
      },
    ],
    dailyTasks: [
      {
        title: "Spend 20 min on a Figma challenge",
        description: "Daily UI or a small redesign — consistency compounds",
        estimatedMinutes: 20,
        type: "daily",
      },
    ],
  },

  // ── 3. Finance ─────────────────────────────────────────────────────────
  {
    title: "Save $5,000 emergency fund",
    context:
      "Build a 3-month emergency fund from scratch by tracking spending, cutting unnecessary expenses, and automating savings.",
    aiTasks: [
      {
        title: "Calculate your actual monthly expenses",
        description: "Go through last 3 months of bank statements",
        estimatedMinutes: 45,
        type: "learn",
        station: "Stage 1",
      },
      {
        title: "Identify 3 recurring expenses to cut",
        description:
          "Subscriptions, delivery food, unused memberships — be honest",
        estimatedMinutes: 30,
        type: "practice",
        station: "Stage 1",
      },
      {
        title: "Set up a zero-based budget for next month",
        description: "Every dollar gets a job — income minus expenses = 0",
        estimatedMinutes: 40,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Learn about high-yield savings accounts",
        description:
          "Compare top accounts — where should the emergency fund live?",
        estimatedMinutes: 25,
        type: "learn",
        station: "Stage 2",
      },
      {
        title: "Review month 2 budget vs actuals",
        description:
          "Where did you overspend? What worked? Adjust for month 3.",
        estimatedMinutes: 30,
        type: "review",
        station: "Stage 3",
      },
      {
        title: "Reflect on money mindset blocks",
        description: "What beliefs about money are slowing you down?",
        estimatedMinutes: 20,
        type: "reflect",
        station: "Stage 3",
      },
    ],
    manualTasks: [
      {
        title: "Open a dedicated savings account",
        description: "Keep emergency fund separate from daily spending",
        estimatedMinutes: 20,
        type: "manual",
      },
      {
        title: "Set up automatic transfer on payday",
        description: "Automate before you can spend it",
        estimatedMinutes: 15,
        type: "manual",
      },
      {
        title: "Cancel at least 2 unused subscriptions",
        description: "Check bank app for recurring charges",
        estimatedMinutes: 20,
        type: "manual",
      },
    ],
    dailyTasks: [
      {
        title: "Log one purchase in budget tracker",
        description: "Takes 30 seconds — builds awareness instantly",
        estimatedMinutes: 1,
        type: "daily",
      },
    ],
  },

  // ── 4. Language ────────────────────────────────────────────────────────
  {
    title: "Reach B1 English for job interviews",
    context:
      "Improve spoken and written English from A2 to B1 level in 3 months to confidently interview at international companies.",
    aiTasks: [
      {
        title: "Study 200 most common interview vocabulary words",
        description: "Strengths, weaknesses, teamwork, deadlines, ownership",
        estimatedMinutes: 40,
        type: "learn",
        station: "Stage 1",
      },
      {
        title: "Record yourself answering 'Tell me about yourself'",
        description: "Listen back and fix 3 most noticeable errors",
        estimatedMinutes: 20,
        type: "practice",
        station: "Stage 1",
      },
      {
        title: "Master STAR answer structure",
        description: "Situation, Task, Action, Result — practice 2 examples",
        estimatedMinutes: 35,
        type: "learn",
        station: "Stage 2",
      },
      {
        title: "Practice 5 common interview questions out loud",
        description: "Time yourself — each answer under 2 minutes",
        estimatedMinutes: 25,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Do a mock interview with AI or a friend",
        description: "Full 30-minute session with real questions",
        estimatedMinutes: 40,
        type: "practice",
        station: "Stage 3",
      },
      {
        title: "Review recording of mock interview",
        description: "Mark filler words, grammar mistakes, unclear answers",
        estimatedMinutes: 30,
        type: "review",
        station: "Stage 3",
      },
      {
        title: "Reflect on progress and remaining weak spots",
        description: "What still sounds unnatural? What improved most?",
        estimatedMinutes: 15,
        type: "reflect",
        station: "Stage 3",
      },
    ],
    manualTasks: [
      {
        title: "Watch 3 YouTube mock interview videos",
        description: "Study pacing, vocabulary, and structure of good answers",
        estimatedMinutes: 60,
        type: "manual",
      },
      {
        title: "Find a speaking partner on iTalki or Tandem",
        description: "Book 2 sessions per week for real conversation practice",
        estimatedMinutes: 30,
        type: "manual",
      },
      {
        title: "Write your CV in English",
        description: "Use Grammarly to catch errors — have a native review it",
        estimatedMinutes: 90,
        type: "manual",
      },
    ],
    dailyTasks: [
      {
        title: "Read one English article (10 min)",
        description: "BBC Learning English or Medium — anything with new vocab",
        estimatedMinutes: 10,
        type: "daily",
      },
      {
        title: "Write 3 sentences about your day in English",
        description: "Journal-style — focus on correct past tense",
        estimatedMinutes: 5,
        type: "daily",
      },
    ],
  },

  // ── 5. Creative ────────────────────────────────────────────────────────
  {
    title: "Launch a side project and get first users",
    context:
      "Build and launch a small SaaS or tool within 8 weeks, get at least 10 real users and collect honest feedback.",
    aiTasks: [
      {
        title: "Validate problem with 5 potential users",
        description:
          "Interview people, not survey them — ask about current pain",
        estimatedMinutes: 60,
        type: "learn",
        station: "Stage 1",
      },
      {
        title: "Write a one-page product spec",
        description:
          "Problem, target user, core feature, success metric — 1 page max",
        estimatedMinutes: 40,
        type: "practice",
        station: "Stage 1",
      },
      {
        title: "Build and deploy a working MVP",
        description: "The simplest version that solves the core problem",
        estimatedMinutes: 240,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Write a landing page that explains the value",
        description:
          "Headline, 3 benefits, screenshot, one CTA — nothing more",
        estimatedMinutes: 90,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Review first 10 user signups and their behavior",
        description: "Where do they drop off? What do they click first?",
        estimatedMinutes: 45,
        type: "review",
        station: "Stage 3",
      },
      {
        title: "Collect 5 structured feedback interviews",
        description: "What do they like, what's missing, would they pay?",
        estimatedMinutes: 60,
        type: "practice",
        station: "Stage 3",
      },
      {
        title: "Reflect on whether to continue, pivot, or stop",
        description: "Honest assessment based on real signal",
        estimatedMinutes: 30,
        type: "reflect",
        station: "Stage 3",
      },
    ],
    manualTasks: [
      {
        title: "Post on Twitter/X and LinkedIn about building in public",
        description: "Audience before product — start sharing early",
        estimatedMinutes: 20,
        type: "manual",
      },
      {
        title: "Submit to Product Hunt",
        description: "Schedule launch, prepare assets, ask friends to upvote",
        estimatedMinutes: 60,
        type: "manual",
      },
      {
        title: "Share in 3 relevant Reddit or Discord communities",
        description: "Be genuinely helpful first, then share the tool",
        estimatedMinutes: 30,
        type: "manual",
      },
    ],
    dailyTasks: [
      {
        title: "Ship one small improvement",
        description: "Fix a bug, improve copy, add one feature — every day",
        estimatedMinutes: 30,
        type: "daily",
      },
    ],
  },

  // ── 6. Mental health ───────────────────────────────────────────────────
  {
    title: "Reduce anxiety and build mental resilience",
    context:
      "Develop practical tools to manage anxiety day-to-day through therapy, journaling, breathwork, and CBT techniques.",
    aiTasks: [
      {
        title: "Learn the cognitive triangle (CBT basics)",
        description:
          "How thoughts, emotions, and behavior reinforce each other",
        estimatedMinutes: 25,
        type: "learn",
        station: "Stage 1",
      },
      {
        title: "Practice box breathing during next stressful moment",
        description: "4 seconds in, hold 4, out 4, hold 4 — 3 rounds",
        estimatedMinutes: 10,
        type: "practice",
        station: "Stage 1",
      },
      {
        title: "Write a thought record for an anxious moment",
        description: "What triggered it? What did you tell yourself? Evidence?",
        estimatedMinutes: 20,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Study the difference between worry and problem-solving",
        description: "When to engage thoughts vs when to let them pass",
        estimatedMinutes: 25,
        type: "learn",
        station: "Stage 2",
      },
      {
        title: "Review your journal entries from the past 2 weeks",
        description: "What triggers repeat? What coping worked?",
        estimatedMinutes: 30,
        type: "review",
        station: "Stage 3",
      },
      {
        title: "Reflect on how anxiety has changed over the month",
        description: "Frequency, intensity, recovery speed — honest self-check",
        estimatedMinutes: 20,
        type: "reflect",
        station: "Stage 3",
      },
    ],
    manualTasks: [
      {
        title: "Book first session with a therapist",
        description: "Online options: BetterHelp, Uknow, local clinic",
        estimatedMinutes: 30,
        type: "manual",
      },
      {
        title: "Read 'Feeling Good' by David Burns (first 3 chapters)",
        description: "The CBT classic — practical, not just theory",
        estimatedMinutes: 90,
        type: "manual",
      },
      {
        title: "Tell one trusted person how you've been feeling",
        description: "Connection is underrated medicine",
        estimatedMinutes: 30,
        type: "manual",
      },
    ],
    dailyTasks: [
      {
        title: "5-minute evening journal entry",
        description: "One thing that triggered stress, one thing that went well",
        estimatedMinutes: 5,
        type: "daily",
      },
      {
        title: "Morning breathing exercise",
        description: "Before looking at phone — 10 deep breaths",
        estimatedMinutes: 5,
        type: "daily",
      },
    ],
  },

  // ── 7. Productivity ────────────────────────────────────────────────────
  {
    title: "Stop procrastinating and finish my thesis",
    context:
      "Complete a 60-page thesis in 3 months by breaking it into daily writing blocks and eliminating distraction patterns.",
    aiTasks: [
      {
        title: "Create a chapter outline with word targets",
        description:
          "Break 60 pages into 6 chapters, assign deadlines to each",
        estimatedMinutes: 45,
        type: "learn",
        station: "Stage 1",
      },
      {
        title: "Write 300 words without stopping (timer on)",
        description: "No editing allowed — just get words on page",
        estimatedMinutes: 25,
        type: "practice",
        station: "Stage 1",
      },
      {
        title: "Complete literature review first draft",
        description: "15 sources, 1 paragraph summary each",
        estimatedMinutes: 120,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Review and restructure chapter 1",
        description: "Read it like a stranger — does the argument flow?",
        estimatedMinutes: 60,
        type: "review",
        station: "Stage 2",
      },
      {
        title: "Complete methodology chapter",
        description: "Research design, data collection, analysis approach",
        estimatedMinutes: 180,
        type: "practice",
        station: "Stage 3",
      },
      {
        title: "Do a full thesis read-through",
        description: "Print it out, read with a red pen — fix flow issues",
        estimatedMinutes: 120,
        type: "review",
        station: "Stage 3",
      },
      {
        title: "Reflect on writing habits built through this process",
        description: "What changed? What would you do differently?",
        estimatedMinutes: 20,
        type: "reflect",
        station: "Stage 3",
      },
    ],
    manualTasks: [
      {
        title: "Set up a distraction-free writing environment",
        description: "Cold Turkey or Freedom app, dedicated writing folder",
        estimatedMinutes: 20,
        type: "manual",
      },
      {
        title: "Book regular check-ins with thesis supervisor",
        description: "Accountability from above is hard to skip",
        estimatedMinutes: 15,
        type: "manual",
      },
      {
        title: "Find a writing buddy for co-working sessions",
        description: "Body doubling kills procrastination",
        estimatedMinutes: 20,
        type: "manual",
      },
    ],
    dailyTasks: [
      {
        title: "Write 500 words minimum",
        description: "Before any meetings, before email — first block of day",
        estimatedMinutes: 40,
        type: "daily",
      },
      {
        title: "Review yesterday's writing (10 min)",
        description: "Light edit only — keep momentum going",
        estimatedMinutes: 10,
        type: "daily",
      },
    ],
  },

  // ── 8. Tech skill ──────────────────────────────────────────────────────
  {
    title: "Learn SQL for data analysis",
    context:
      "Go from zero SQL knowledge to being able to independently write analytical queries for business reports.",
    aiTasks: [
      {
        title: "Understand relational databases and table structure",
        description: "What is a schema, primary key, foreign key, row, column",
        estimatedMinutes: 30,
        type: "learn",
        station: "Stage 1",
      },
      {
        title: "Write your first SELECT query",
        description: "Filter, sort, limit — on a real dataset in SQLiteOnline",
        estimatedMinutes: 25,
        type: "practice",
        station: "Stage 1",
      },
      {
        title: "Master GROUP BY with aggregate functions",
        description: "SUM, COUNT, AVG, MIN, MAX — solve 5 practice exercises",
        estimatedMinutes: 40,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Learn INNER JOIN and LEFT JOIN",
        description: "Understand with diagrams, then write 3 join queries",
        estimatedMinutes: 45,
        type: "learn",
        station: "Stage 2",
      },
      {
        title: "Write a business report query from scratch",
        description:
          "Monthly sales by region, top 10 customers — real scenario",
        estimatedMinutes: 60,
        type: "practice",
        station: "Stage 3",
      },
      {
        title: "Review and optimize a slow query",
        description: "Add indexes, avoid SELECT *, explain plan",
        estimatedMinutes: 35,
        type: "review",
        station: "Stage 3",
      },
      {
        title: "Reflect on comfort level with ad-hoc data questions",
        description: "Can you now answer a business question independently?",
        estimatedMinutes: 15,
        type: "reflect",
        station: "Stage 3",
      },
    ],
    manualTasks: [
      {
        title: "Complete Mode Analytics SQL Tutorial (free)",
        description: "Best structured beginner course available",
        estimatedMinutes: 90,
        type: "manual",
      },
      {
        title: "Download a real dataset from Kaggle",
        description: "E-commerce or HR dataset — something you find interesting",
        estimatedMinutes: 20,
        type: "manual",
      },
      {
        title: "Solve 10 LeetCode Easy SQL problems",
        description: "Database section — builds pattern recognition",
        estimatedMinutes: 60,
        type: "manual",
      },
    ],
    dailyTasks: [
      {
        title: "Write at least one SQL query",
        description: "Even a tiny one — keeps syntax fresh",
        estimatedMinutes: 15,
        type: "daily",
      },
    ],
  },

  // ── 9. Social / relationships ──────────────────────────────────────────
  {
    title: "Rebuild social life after moving to a new city",
    context:
      "Make at least 3 genuine new friendships within 3 months by being proactive about social events and following up consistently.",
    aiTasks: [
      {
        title: "Map your current social network honestly",
        description: "Who do you actually talk to? Who would you like to?",
        estimatedMinutes: 20,
        type: "learn",
        station: "Stage 1",
      },
      {
        title: "Find and attend one local event or meetup",
        description: "Meetup.com, Facebook Events, Eventbrite — just show up",
        estimatedMinutes: 120,
        type: "practice",
        station: "Stage 1",
      },
      {
        title: "Send 3 follow-up messages after the event",
        description: "Reference something specific from your conversation",
        estimatedMinutes: 20,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Suggest a 1-on-1 activity with someone new",
        description: "Coffee, walk, climbing — anything with clear end time",
        estimatedMinutes: 60,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Review what makes you feel drained vs energized socially",
        description: "Which interactions were worth it? Which weren't?",
        estimatedMinutes: 20,
        type: "review",
        station: "Stage 3",
      },
      {
        title: "Reflect on how you show up in new relationships",
        description:
          "Are you asking questions, sharing yourself, following through?",
        estimatedMinutes: 20,
        type: "reflect",
        station: "Stage 3",
      },
    ],
    manualTasks: [
      {
        title: "Join one recurring group activity",
        description:
          "Football team, book club, climbing gym, language exchange",
        estimatedMinutes: 30,
        type: "manual",
      },
      {
        title: "Message 3 acquaintances you've been meaning to reconnect with",
        description: "Low-stakes — no excuse not to",
        estimatedMinutes: 15,
        type: "manual",
      },
      {
        title: "Host a small casual get-together at home",
        description: "5–8 people, no occasion needed — just do it",
        estimatedMinutes: 180,
        type: "manual",
      },
    ],
    dailyTasks: [
      {
        title: "Reach out to one person",
        description: "Text, comment, voice note — any form counts",
        estimatedMinutes: 5,
        type: "daily",
      },
    ],
  },

  // ── 10. Health habit ───────────────────────────────────────────────────
  {
    title: "Fix sleep schedule and stop feeling tired",
    context:
      "Get consistent 7–8 hours of quality sleep by fixing bedtime, reducing screen time, and building a wind-down routine.",
    aiTasks: [
      {
        title: "Track sleep for one full week",
        description: "Log bedtime, wake time, quality 1–5 in a simple note",
        estimatedMinutes: 5,
        type: "learn",
        station: "Stage 1",
      },
      {
        title: "Learn the biology of sleep cycles and circadian rhythm",
        description: "Why consistency of wake time matters more than bedtime",
        estimatedMinutes: 20,
        type: "learn",
        station: "Stage 1",
      },
      {
        title: "Build a 20-minute wind-down routine",
        description:
          "Phone down, dim lights, stretch or read — do it 5 nights in a row",
        estimatedMinutes: 20,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Test no-screen 60 min before bed for 7 days",
        description: "Hardest habit — track honestly, don't fake the data",
        estimatedMinutes: 60,
        type: "practice",
        station: "Stage 2",
      },
      {
        title: "Review week 3 sleep log vs week 1",
        description: "Did average sleep time increase? Energy levels?",
        estimatedMinutes: 15,
        type: "review",
        station: "Stage 3",
      },
      {
        title: "Reflect on what factors most affected sleep quality",
        description: "Caffeine, alcohol, stress, exercise timing — what moved?",
        estimatedMinutes: 15,
        type: "reflect",
        station: "Stage 3",
      },
    ],
    manualTasks: [
      {
        title: "Set a fixed wake time and stick to it 7 days including weekends",
        description: "Most powerful single sleep intervention",
        estimatedMinutes: 5,
        type: "manual",
      },
      {
        title: "Buy blackout curtains or an eye mask",
        description: "Darkness increases melatonin — cheap and effective",
        estimatedMinutes: 20,
        type: "manual",
      },
      {
        title: "Remove phone charger from bedroom",
        description: "Charge in hallway — removes biggest temptation",
        estimatedMinutes: 5,
        type: "manual",
      },
    ],
    dailyTasks: [
      {
        title: "Log sleep quality (1 min)",
        description: "Bedtime, wake time, how rested you felt 1–5",
        estimatedMinutes: 1,
        type: "daily",
      },
      {
        title: "Phones down at set time",
        description: "Set a screen-off alarm as a trigger",
        estimatedMinutes: 5,
        type: "daily",
      },
    ],
  },
];

// ─── Users ─────────────────────────────────────────────────────────────────
//
// Realistic distribution of streaks and balances:
//   ~30% of users are "power users" (high streak, high balance)
//   ~40% are "consistent but average"
//   ~30% just started or fell off

const USERS = [
  // Power users — high streak, earned significant coins
  // Max longestStreak across all users = 28 (Oleh)
  {
    name: "Sofiia Stanishevska",
    email: "sophiyastanish@gmail.com",
    password: "Sofiia1305",
    money: 24,
    currentStreak: 14,
    longestStreak: 21,
  },
  {
    name: "Ruslana Kovtunovych",
    email: "rusyakovtunovych@gmail.com",
    password: "password123",
    money: 28,
    currentStreak: 13,
    longestStreak: 25,
  },
  {
    name: "Oleh Korniichuk",
    email: "isntlazy@gmail.com",
    password: "password123",
    money: 43,
    currentStreak: 20,
    longestStreak: 28,
  },
  {
    name: "Viktoriia Savytska",
    email: "savytska@gmail.com",
    password: "password123",
    money: 38,
    currentStreak: 10,
    longestStreak: 17,
  },
  {
    name: "Illya Shuliak",
    email: "lqduser@gmail.com",
    password: "password123",
    money: 22,
    currentStreak: 17,
    longestStreak: 23,
  },

  // Consistent users — moderate everything
  {
    name: "Sofiia Kuzniak",
    email: "sofiia.kuzniak@gmail.com",
    password: "password123",
    money: 42,
    currentStreak: 4,
    longestStreak: 8,
  },
  {
    name: "Bohuslav Stanishevskyy",
    email: "bohuStan@gmail.com",
    password: "password123",
    money: 55,
    currentStreak: 6,
    longestStreak: 13,
  },
  {
    name: "Oleksandr Poliakov",
    email: "viyd12@gmail.com",
    password: "password123",
    money: 38,
    currentStreak: 5,
    longestStreak: 10,
  },
  {
    name: "Sofiia Huliy",
    email: "sofiia.h@gmail.com",
    password: "password123",
    money: 64,
    currentStreak: 8,
    longestStreak: 15,
  },
  {
    name: "Iryna Bilous",
    email: "bilous_i@gmail.com",
    password: "password123",
    money: 47,
    currentStreak: 5,
    longestStreak: 11,
  },
  {
    name: "Yuliia Kovaliv",
    email: "kovaliv_y@gmail.com",
    password: "password123",
    money: 33,
    currentStreak: 9,
    longestStreak: 18,
  },
  {
    name: "Oleksandr Kolodiy",
    email: "lesyk_kolod@gmail.com",
    password: "password123",
    money: 23,
    currentStreak: 7,
    longestStreak: 14,
  },
  {
    name: "Roman Pelekh",
    email: "tkdfjzlg@gmail.com",
    password: "password123",
    money: 33,
    currentStreak: 4,
    longestStreak: 7,
  },
  {
    name: "Nataliia Stanishevska",
    email: "n_stanish@ukr.net",
    password: "password123",
    money: 20,
    currentStreak: 7,
    longestStreak: 16,
  },
  {
    name: "Andriy Stanishevskyy",
    email: "sandr463@gmail.com",
    password: "password123",
    money: 28,
    currentStreak: 3,
    longestStreak: 8,
  },

  // New or inconsistent users — low streak, small balance
  {
    name: "Anastasiia Kasatkina",
    email: "nastiakasat@gmail.com",
    password: "password123",
    money: 11,
    currentStreak: 2,
    longestStreak: 4,
  },
  {
    name: "Sofiia Pylnyk",
    email: "hatikuji@gmail.com",
    password: "password123",
    money: 7,
    currentStreak: 3,
    longestStreak: 5,
  },
  {
    name: "Olena Struk",
    email: "o_struk@gmail.com",
    password: "password123",
    money: 14,
    currentStreak: 1,
    longestStreak: 5,
  },
  {
    name: "Yulia Rovetska",
    email: "playfullcreator@gmail.com",
    password: "password123",
    money: 19,
    currentStreak: 2,
    longestStreak: 6,
  },
  {
    name: "Volodymyr Stanishevskyy",
    email: "stanish@ukr.net",
    password: "password123",
    money: 22,
    currentStreak: 2,
    longestStreak: 6,
  },
  {
    name: "Ostap Kokoshko",
    email: "ostap.kokoshko@gmail.com",
    password: "password123",
    money: 8,
    currentStreak: 0,
    longestStreak: 3,
  },
];

// ─── Realistic AI usage distribution ──────────────────────────────────────
//
// Real usage data from productivity apps shows:
//   ~65–70% of engaged users try AI planning features
//   and in this seed we want AI goals/tasks to be slightly dominant overall
//
// We model this by giving each user a personal "AI affinity" score:
//   power users → 82–92% of their goals use AI
//   consistent users → 62–78%
//   new/inconsistent users → 40–55%

function aiAffinityForUser(userIndex: number): number {
  if (userIndex < 5) return 0.82 + Math.random() * 0.1;  // power users
  if (userIndex < 15) return 0.62 + Math.random() * 0.16; // consistent
  return 0.4 + Math.random() * 0.15;                       // new/inconsistent
}

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

  for (let userIndex = 0; userIndex < createdUsers.length; userIndex++) {
    const user = createdUsers[userIndex];
    const aiAffinity = aiAffinityForUser(userIndex);

    // Power users juggle more goals; new users have 1–2
    const goalCount =
      userIndex < 5
        ? randomBetween(3, 4)
        : userIndex < 15
          ? randomBetween(2, 3)
          : randomBetween(1, 2);

    const shuffledTemplates = [...GOAL_TEMPLATES].sort(() => Math.random() - 0.5);
    const selectedTemplates = shuffledTemplates.slice(0, goalCount);

    for (const template of selectedTemplates) {
      const isAI = Math.random() < aiAffinity;

      // Realistic progress distribution:
      //   new users → mostly early stages (0–30%)
      //   power users → spread across all stages, more completions
      const completionChance = userIndex < 5 ? 0.25 : userIndex < 15 ? 0.12 : 0.05;
      const isCompleted = Math.random() < completionChance;

      let rawProgress: number;
      if (isCompleted) {
        rawProgress = 100;
      } else if (userIndex >= 15) {
        // New users — mostly just started
        rawProgress = Math.random() * 30;
      } else {
        const r = Math.random();
        rawProgress =
          r < 0.45
            ? Math.random() * 22
            : r < 0.8
              ? 22 + Math.random() * 28
              : 50 + Math.random() * 20;
      }

      // Abandoned goals: ~8% of non-completed goals have no recent activity
      // (completedAt stays null but progress is stalled — represented by a
      // past-only dueDate on tasks)
      const isAbandoned = !isCompleted && Math.random() < 0.08;

      const completedAt = isCompleted ? daysAgo(randomBetween(1, 30)) : null;

      const goal = await prisma.goal.create({
        data: {
          title: template.title,
          context: isAI
            ? `AI-generated plan: ${template.context}`
            : `Personal goal: ${template.context}`,
          deadline: isAbandoned
            ? daysAgo(randomBetween(5, 40))      // already missed
            : daysFromNow(randomBetween(14, 150)),
          userId: user.id,
          completedAt,
          currentStationProgress: parseFloat(rawProgress.toFixed(1)),
        },
      });

      totalGoals++;
      isAI ? aiGoals++ : manualGoals++;

      // ── AI goal tasks ───────────────────────────────────────────────
      if (isAI) {
        const aiTaskList = template.aiTasks;
        const maxDoneShare = userIndex < 5 ? 0.75 : userIndex < 15 ? 0.55 : 0.35;
        const doneCount = isCompleted
          ? aiTaskList.length
          : Math.min(
              Math.round(aiTaskList.length * (rawProgress / 100)),
              Math.floor(aiTaskList.length * maxDoneShare),
            );

        for (let i = 0; i < aiTaskList.length; i++) {
          const t = aiTaskList[i];
          const isDone = i < doneCount;
          const generatedAt = isDone
            ? daysAgo(doneCount - i + randomBetween(1, 4))
            : daysAgo(randomBetween(0, 2));

          await prisma.task.create({
            data: {
              title: t.title,
              description: t.description,
              status: isDone ? "done" : "pending",
              type: t.type,
              goalId: goal.id,
              generatedAt,
              dueDate: isAbandoned
                ? daysAgo(randomBetween(1, 20))
                : daysFromNow(randomBetween(1, 21)),
              estimatedMinutes: t.estimatedMinutes,
              station: t.station ?? null,
              progressContribution: parseFloat(
                (100 / aiTaskList.length).toFixed(2),
              ),
            },
          });
          totalTasks++;
        }

        // Daily tasks for AI goals — lower completion rate for new users
        for (const daily of template.dailyTasks) {
          const dailyCompletionRate =
            userIndex < 5 ? 0.55 : userIndex < 15 ? 0.38 : 0.22;
          const isDailyDone = Math.random() < dailyCompletionRate;

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

        // ── Manual goal tasks ─────────────────────────────────────────────
      } else {
        const manualTaskList = template.manualTasks;
        const maxDoneShare = userIndex < 5 ? 0.7 : userIndex < 15 ? 0.5 : 0.3;
        const doneCount = isCompleted
          ? manualTaskList.length
          : Math.min(
              Math.round(manualTaskList.length * (rawProgress / 100)),
              Math.floor(manualTaskList.length * maxDoneShare),
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
              generatedAt: isDone
                ? daysAgo(doneCount - i + randomBetween(1, 5))
                : daysAgo(randomBetween(0, 3)),
              dueDate: isAbandoned
                ? daysAgo(randomBetween(1, 30))
                : daysFromNow(randomBetween(1, 30)),
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

  const aiPct = ((aiGoals / totalGoals) * 100).toFixed(1);
  const manualPct = ((manualGoals / totalGoals) * 100).toFixed(1);

  console.log(
    `✅ Created ${totalGoals} goals (🤖 AI: ${aiGoals} [${aiPct}%] | ✍️ Manual: ${manualGoals} [${manualPct}%])`,
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