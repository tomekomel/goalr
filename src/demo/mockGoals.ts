import type { Goal } from '../types'

const now = new Date()
const year = now.getFullYear()
const month = String(now.getMonth() + 1).padStart(2, '0')
const targetDate = `${year}-${month}-01`
const yearDate = `${year}-01-01`

export const defaultGoals: Goal[] = [
  // Monthly goals
  {
    id: crypto.randomUUID(),
    title: 'Launch MVP',
    description: 'Ship the minimum viable product to early adopters',
    period: 'monthly',
    status: 'in-progress',
    progress: 75,
    createdAt: Date.now() - 86400000 * 10,
    targetDate,
  },
  {
    id: crypto.randomUUID(),
    title: 'Read 4 books',
    description: 'Read four books this month across different genres',
    period: 'monthly',
    status: 'in-progress',
    progress: 50,
    createdAt: Date.now() - 86400000 * 8,
    targetDate,
  },
  {
    id: crypto.randomUUID(),
    title: 'Grow audience to 1k',
    description: 'Reach 1,000 followers on social media',
    period: 'monthly',
    status: 'done',
    progress: 100,
    createdAt: Date.now() - 86400000 * 15,
    targetDate,
  },

  // Weekly goals — Week 1
  {
    id: crypto.randomUUID(),
    title: 'Design landing page',
    description: 'Create wireframes and final design for the landing page',
    period: 'weekly',
    status: 'done',
    progress: 100,
    createdAt: Date.now() - 86400000 * 12,
    weekNumber: 1,
    targetDate,
  },
  {
    id: crypto.randomUUID(),
    title: 'Write marketing copy',
    description: 'Draft all copy for the website and social media',
    period: 'weekly',
    status: 'done',
    progress: 100,
    createdAt: Date.now() - 86400000 * 11,
    weekNumber: 1,
    targetDate,
  },

  // Weekly goals — Week 2
  {
    id: crypto.randomUUID(),
    title: 'Write 3 blog posts',
    description: 'Create content for the company blog',
    period: 'weekly',
    status: 'in-progress',
    progress: 60,
    createdAt: Date.now() - 86400000 * 5,
    weekNumber: 2,
    targetDate,
  },
  {
    id: crypto.randomUUID(),
    title: 'SEO keyword research',
    description: 'Identify target keywords for organic growth',
    period: 'weekly',
    status: 'to-do',
    progress: 0,
    createdAt: Date.now() - 86400000 * 4,
    weekNumber: 2,
    targetDate,
  },

  // Weekly goals — Week 3
  {
    id: crypto.randomUUID(),
    title: 'Ship redesign',
    description: 'Deploy the new design to production',
    period: 'weekly',
    status: 'to-do',
    progress: 0,
    createdAt: Date.now() - 86400000 * 3,
    weekNumber: 3,
    targetDate,
  },

  // Weekly goals — Week 4
  {
    id: crypto.randomUUID(),
    title: 'User testing sessions',
    description: 'Run usability tests with 5 target users',
    period: 'weekly',
    status: 'to-do',
    progress: 0,
    createdAt: Date.now() - 86400000 * 2,
    weekNumber: 4,
    targetDate,
  },

  // Yearly goals
  {
    id: crypto.randomUUID(),
    title: 'Run a half-marathon',
    description: 'Train and complete a half-marathon race',
    period: 'yearly',
    status: 'in-progress',
    progress: 35,
    createdAt: Date.now() - 86400000 * 30,
    targetDate: yearDate,
  },
  {
    id: crypto.randomUUID(),
    title: 'Save $5,000',
    description: 'Build an emergency fund of $5,000',
    period: 'yearly',
    status: 'in-progress',
    progress: 60,
    createdAt: Date.now() - 86400000 * 25,
    targetDate: yearDate,
  },
  {
    id: crypto.randomUUID(),
    title: 'Learn Spanish basics',
    description: 'Complete A1 level Spanish course',
    period: 'yearly',
    status: 'done',
    progress: 100,
    createdAt: Date.now() - 86400000 * 40,
    targetDate: yearDate,
  },
  {
    id: crypto.randomUUID(),
    title: 'Read 24 books',
    description: 'Read two books per month for the entire year',
    period: 'yearly',
    status: 'to-do',
    progress: 0,
    createdAt: Date.now() - 86400000 * 20,
    targetDate: yearDate,
  },

  // Backlog (planned) goals
  {
    id: crypto.randomUUID(),
    title: 'Build mobile app',
    description: 'Create a React Native version of the app',
    period: 'monthly',
    status: 'planned',
    progress: 0,
    createdAt: Date.now() - 86400000 * 7,
    targetDate,
  },
  {
    id: crypto.randomUUID(),
    title: 'Start a podcast',
    description: 'Launch a weekly podcast about productivity',
    period: 'monthly',
    status: 'planned',
    progress: 0,
    createdAt: Date.now() - 86400000 * 6,
    targetDate,
  },
]
