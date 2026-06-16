export const site = {
  name: "Finance Buddy",
  logoMark: "Finance",
  logoSuffix: "Buddy",
  domain: "financebuddy.app",
  tagline:
    "Your private micro-budgeting assistant built for student life",
  phone: "",
  email: "hello@financebuddy.app",
  supportEmail: "support@financebuddy.app",
  location: "Privacy-first budgeting for students everywhere",
} as const;

export const hero = {
  eyebrow: "For students managing real budgets",
  title: "Track every dollar.",
  titleAccent: "Stress less about month-end.",
  description:
    "Log expenses in seconds, set category budgets, get smart forecasts, and stay ahead of overspending — all in one private app.",
} as const;

export const chairCta = {
  title: "Ready to take control?",
  description:
    "Open Finance Buddy — set your allowance, log food and transport spending, fix categories with one tap, and see your month-end balance before it arrives.",
  primaryLabel: "Open App",
  secondaryLabel: "See Features",
} as const;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/what-we-do" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const services = [
  {
    id: "budget-setup",
    title: "Monthly Budget Setup",
    shortTitle: "Budget | Allowance",
    description:
      "Set your monthly income or allowance and allocate amounts across food, transport, subscriptions, and more.",
    featured: true,
    comingSoon: false,
    stackColor: "#4a4844",
    stackImage: "/marketing/features/budget-setup.webp",
    stackImageLabel: "Student setting monthly budget categories on a laptop",
    details: {
      intro:
        "Start each month with a clear plan — income, category limits, and savings targets tailored to student life.",
      benefits: [
        "Set monthly allowance or part-time income in one place",
        "Create custom categories for food, transport, rent, and fun",
        "Adjust budgets when income changes mid-month",
        "See remaining balance at a glance across all categories",
      ],
      whoWeHelp:
        "Students living on a fixed allowance, part-time wages, or a mix of both who need a simple monthly starting point.",
      steps: [
        "Enter your monthly income or allowance",
        "Split it across the categories that matter to you",
        "Review totals and tweak limits until the plan feels right",
      ],
    },
  },
  {
    id: "expense-tracking",
    title: "Smart Expense Tracking",
    shortTitle: "Log | Capture",
    description:
      "Add expenses manually, paste receipt text, or describe a purchase in plain language — logged in seconds.",
    featured: false,
    comingSoon: false,
    stackColor: "#3d4548",
    stackImage: "/marketing/features/expense-tracking.webp",
    stackImageLabel: "Student quickly logging a daily expense on phone",
    details: {
      intro:
        "Whether it's coffee before class or a late-night delivery, capture spending the way you actually live — fast and flexible.",
      benefits: [
        "Manual entry for cash and card purchases",
        "Paste receipt text when you have it handy",
        "Natural-language input like '12 uber home Friday'",
        "Edit or delete any record — your data stays yours",
      ],
      whoWeHelp:
        "Busy students who forget to log immediately and need flexible ways to catch up without losing track.",
      steps: [
        "Tap to add an expense in under ten seconds",
        "Choose manual, receipt text, or natural language",
        "Confirm amount, date, and category — done",
      ],
    },
  },
  {
    id: "auto-categorize",
    title: "Auto-Categorization",
    shortTitle: "Suggest | Correct",
    description:
      "The system suggests a category for each expense — and you can fix it with one tap when it's wrong.",
    featured: false,
    comingSoon: false,
    stackColor: "#503a3a",
    stackImage: "/marketing/features/auto-categorize.webp",
    stackImageLabel: "Expense category suggestion with easy correction UI",
    details: {
      intro:
        "Optional AI helps classify spending based on description and history — always explainable, always overridable.",
      benefits: [
        "Smart category suggestions from purchase descriptions",
        "One-tap correction when the guess is off",
        "Learns from your fixes without exposing data to others",
        "Clear labels so you always know why a category was chosen",
      ],
      whoWeHelp:
        "Students who want speed without giving up control — especially when subscriptions and shopping blur together.",
      steps: [
        "Log an expense with a short description",
        "Review the suggested category and confidence",
        "Accept or correct — your choice updates future suggestions",
      ],
    },
  },
  {
    id: "forecast-alerts",
    title: "Forecast & Alerts",
    shortTitle: "Predict | Warn",
    description:
      "See your projected month-end balance and get warned before a category budget runs out.",
    featured: false,
    comingSoon: false,
    stackColor: "#424538",
    stackImage: "/marketing/features/forecast-alerts.webp",
    stackImageLabel: "Month-end balance forecast chart with alert badge",
    details: {
      intro:
        "A forecast engine uses your actual spending pace to predict where you'll land — and alerts you before limits are crossed.",
      benefits: [
        "End-of-month balance forecast from real expense data",
        "Threshold alerts when a category nears its limit",
        "Weekly nudges when spending pace is too high",
        "Suggestions presented as guidance, not financial advice",
      ],
      whoWeHelp:
        "Students who've been surprised by an empty account before payday and want a heads-up while there's still time to adjust.",
      steps: [
        "Track expenses normally through the month",
        "Check your forecast anytime on the dashboard",
        "Act on alerts before overspending becomes a problem",
      ],
    },
  },
  {
    id: "savings-goals",
    title: "Savings Goal Tracker",
    shortTitle: "Save | Goals",
    description:
      "Set targets for emergencies, trips, or big purchases and watch progress update as you save.",
    featured: false,
    comingSoon: true,
    stackColor: "#3f3a48",
    stackImage: "/marketing/features/savings-goals.webp",
    stackImageLabel: "Savings goal progress ring for student emergency fund",
    details: {
      intro:
        "Turn leftover budget into meaningful goals — emergency buffer, holiday fund, or that laptop upgrade.",
      benefits: [
        "Multiple savings goals with target amounts and deadlines",
        "Progress bars tied to your actual remaining budget",
        "Gentle reminders when you're close to a milestone",
        "Private goals visible only to you",
      ],
      whoWeHelp:
        "Students building an emergency fund or saving for something specific alongside day-to-day budgeting.",
      steps: [
        "Create a goal with a name, target, and optional deadline",
        "Allocate spare budget or log transfers toward it",
        "Track progress and celebrate milestones along the way",
      ],
    },
  },
  {
    id: "monthly-reports",
    title: "Monthly Summary Reports",
    shortTitle: "Report | Insights",
    description:
      "Weekly and monthly reports break down patterns and offer practical saving suggestions.",
    featured: false,
    comingSoon: true,
    stackColor: "#3a4240",
    stackImage: "/marketing/features/monthly-reports.webp",
    stackImageLabel: "Monthly spending summary with category breakdown",
    details: {
      intro:
        "At month-end, get a clear picture of where money went — plus optional AI summaries and saving tips you can act on.",
      benefits: [
        "Category breakdowns and spending trend charts",
        "Comparison to previous months at a glance",
        "Optional AI-generated summaries of patterns",
        "Practical suggestions — never guaranteed financial advice",
      ],
      whoWeHelp:
        "Students who want to understand habits, not just totals — and improve month over month.",
      steps: [
        "Finish the month with expenses logged",
        "Open your monthly report from the dashboard",
        "Review patterns and pick one suggestion to try next month",
      ],
    },
  },
] as const;

export const whyChooseUs = [
  {
    number: "01",
    title: "Log in Seconds",
    description:
      "Manual entry, receipt text, or natural language — capture food, transport, subscriptions, and impulse buys before you forget.",
    image: "/marketing/features/log-in-seconds.webp",
    imageLabel: "Student logging an expense on their phone between classes",
  },
  {
    number: "02",
    title: "Stay on Track",
    description:
      "Category budgets, remaining balances, and threshold alerts keep you aware of limits before payday panic sets in.",
    image: "/marketing/features/stay-on-track.webp",
    imageLabel: "Budget dashboard showing remaining category balances",
  },
  {
    number: "03",
    title: "Plan Ahead",
    description:
      "Forecast your month-end balance from real spending data so you can adjust before running out — not after.",
    image: "/marketing/features/plan-ahead.webp",
    imageLabel: "Forecast chart predicting end-of-month student balance",
  },
  {
    number: "04",
    title: "Private by Default",
    description: "Your financial data stays yours — never shared with other users",
    imageLabel: "Secure private student finance data illustration",
  },
] as const;

export const impactQuote =
  "Knowing where your money goes is the first step to making it last the whole month.";

export const stats = [
  { value: 3, suffix: "", label: "Ways to Log Expenses" },
  { value: 100, suffix: "%", label: "Private by Default" },
  { value: 6, suffix: "", label: "Core Features" },
  { value: 24, suffix: "/7", label: "Budget Visibility" },
] as const;

export const testimonials = [
  {
    quote:
      "I used to guess how much I had left for food every week. Finance Buddy shows my remaining budget and warned me before I blew past takeout — saved me from calling home for money.",
    name: "Priya Sharma",
    role: "Second-year Engineering, Melbourne",
    image: "/marketing/testimonials/priya-sharma.webp",
    imageAlt: "Illustrated portrait of Priya Sharma",
  },
  {
    quote:
      "The category suggestions are usually right, and when they're not I fix them in one tap. Logging '8.50 coffee' as natural language actually works — weirdly satisfying.",
    name: "Marcus Chen",
    role: "First-year Business, Sydney",
    image: "/marketing/testimonials/marcus-chen.webp",
    imageAlt: "Illustrated portrait of Marcus Chen",
  },
  {
    quote:
      "The month-end forecast caught my subscription creep before it ate my transport budget. The monthly report made me realise how much I was spending on delivery apps.",
    name: "Emma Okonkwo",
    role: "Third-year Nursing, Brisbane",
    image: "/marketing/testimonials/emma-okonkwo.webp",
    imageAlt: "Illustrated portrait of Emma Okonkwo",
  },
] as const;

export const clientLogos = [
  { name: "Monash University", src: "/marketing/logos/monash-university.svg" },
  { name: "UNSW Sydney", src: "/marketing/logos/unsw-sydney.svg" },
  { name: "University of Melbourne", src: "/marketing/logos/university-of-melbourne.svg" },
  { name: "UQ Brisbane", src: "/marketing/logos/uq-brisbane.svg" },
  { name: "UTS Sydney", src: "/marketing/logos/uts-sydney.svg" },
  { name: "Student Union", src: "/marketing/logos/student-union.svg" },
  { name: "Campus Life", src: "/marketing/logos/campus-life.svg" },
  { name: "Res Hall", src: "/marketing/logos/res-hall.svg" },
] as const;

export const founder = {
  name: "Jawad Asghar",
  role: "Founder & Product Lead",
  title: "Founder | TechGuy | Student",
  credentials: "Computer Science Undergrad",
  image: "/marketing/about/founder-jawad-asghar.webp",
  imageAlt: "Jawad Asghar, Founder of Finance Buddy",
  quote: "Students deserve tools that respect their privacy and their reality — small budgets, big pressure.",
  bio: "Jawad built Finance Buddy after watching friends struggle through uni on tight allowances — juggling food, transport, subscriptions, and emergency costs with spreadsheets and guesswork.",
  extendedBio:
    "With a background in product design and personal finance education, Jawad focuses on privacy-first tools that help students log spending quickly, understand patterns, and make better day-to-day decisions — without exposing sensitive data or pretending to be a financial adviser.",
} as const;

export const howItWorks = [
  {
    step: "1",
    title: "Set Your Budget",
    description:
      "Enter your monthly allowance or income and split it across categories like food, transport, subscriptions, and savings.",
  },
  {
    step: "2",
    title: "Log Expenses Daily",
    description:
      "Add purchases manually, paste receipt text, or type naturally — the system categorizes and updates your remaining budget.",
  },
  {
    step: "3",
    title: "Stay Ahead",
    description:
      "Check forecasts, respond to alerts, and review monthly reports to build better habits over time.",
  },
] as const;

export const faqs = [
  {
    question: "Is Finance Buddy free for students?",
    answer:
      "We're launching with a free tier for core budgeting — monthly setup, expense logging, forecasts, and alerts. Premium features like advanced reports may come later.",
  },
  {
    question: "Is my financial data private?",
    answer:
      "Yes. Your budget and expenses are private by default. We never expose one user's data to another, and you can edit or delete your records anytime.",
  },
  {
    question: "Do I need to connect my bank account?",
    answer:
      "No. Finance Buddy is designed for manual and text-based entry first — no bank credentials required for the MVP.",
  },
  {
    question: "How does auto-categorization work?",
    answer:
      "Optional AI suggests a category based on your description and past corrections. Suggestions are explainable, and you always have the final say.",
  },
  {
    question: "Is this financial advice?",
    answer:
      "No. Forecasts, alerts, and saving suggestions are informational only — practical guidance to help you decide, not guaranteed financial advice.",
  },
  {
    question: "Can I log cash expenses late?",
    answer:
      "Absolutely. Add expenses with any date — perfect for cash purchases you remember after the fact.",
  },
  {
    question: "What if the wrong category is suggested?",
    answer:
      "Tap to correct it. Your fix improves future suggestions for you without affecting anyone else's data.",
  },
  {
    question: "Can I delete all my data?",
    answer:
      "Yes. You can delete individual expenses or wipe your account data entirely from settings when that feature ships.",
  },
] as const;

export type AboutValue = {
  id: string;
  label: string;
  text: string;
  color: string;
};

export const aboutValues: AboutValue[] = [
  {
    id: "private-first",
    label: "Private",
    text: "Financial data private by default",
    color: "#4a7fd4",
  },
  {
    id: "student-built",
    label: "Student-first",
    text: "Built for real student budgets and habits",
    color: "#2d6a6a",
  },
  {
    id: "explainable-ai",
    label: "Explainable",
    text: "Optional AI you can always override",
    color: "#5c4d7a",
  },
  {
    id: "secure-data",
    label: "Secure",
    text: "Your records stay isolated to your account",
    color: "#3d5a80",
  },
  {
    id: "fast-logging",
    label: "Fast",
    text: "Log expenses in seconds, not minutes",
    color: "#4a6b5c",
  },
  {
    id: "flexible-budgets",
    label: "Flexible",
    text: "Adjust when income or subscriptions change",
    color: "#8b5a4a",
  },
];

export const trustSignals = [
  "Private by default",
  "No bank login required",
  "Edit or delete any record",
  "Built for student life",
] as const;

export const aboutPage = {
  eyebrow: "About",
  title: "Budgeting that fits",
  titleAccent: "student life.",
  description:
    "Finance Buddy helps students track small budgets, avoid month-end surprises, and build better money habits — without exposing sensitive financial data.",
  highlights: [
    { label: "Core features", value: "6" },
    { label: "Privacy", value: "First" },
    { label: "Built for", value: "Students" },
  ],
} as const;

export const whatWeDoPage = {
  eyebrow: "Features",
  title: "Everything you need to",
  titleAccent: "own your budget.",
  description:
    "From monthly setup to expense logging, smart categorization, forecasts, savings goals, and reports — one workflow designed for how students actually spend.",
  highlights: [
    { label: "Feature areas", value: "6" },
    { label: "Early access", value: "Free" },
    { label: "Focus", value: "Student budgets" },
  ],
} as const;

export const contactPage = {
  eyebrow: "Contact",
  title: "Let's talk about",
  titleAccent: "your budget goals.",
  description:
    "Questions, support, or feedback — reach out anytime. We're here to help with Finance Buddy.",
  highlights: [
    { label: "App access", value: "Open" },
    { label: "Response time", value: "1–2 days" },
    { label: "Support", value: "Free" },
  ],
  formTitle: "Send a message",
  formDescription:
    "Tell us a little about yourself and we'll notify you when Finance Buddy is ready to try.",
  processTitle: "What happens next",
  processDescription:
    "A simple path from interest to your first budget — designed around how busy students actually operate.",
  processSteps: [
    {
      step: "01",
      title: "You reach out",
      description:
        "Share your email and what you're hoping to track — food, transport, subscriptions, or all of the above.",
    },
    {
      step: "02",
      title: "We confirm access",
      description:
        "Our team adds you to the early access list and sends setup instructions when your spot opens.",
    },
    {
      step: "03",
      title: "You start budgeting",
      description:
        "Set your monthly budget, log a few expenses, and see forecasts and alerts from your real data.",
    },
  ],
  responseQuote:
    "Most students tell us seeing their month-end forecast for the first time is the moment budgeting finally clicks.",
} as const;

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: readonly string[];
  list?: readonly string[];
};

export const privacyPolicy = {
  title: "Privacy Policy",
  eyebrow: "Legal",
  updated: "16 June 2026",
  intro:
    "Finance Buddy respects your privacy and is committed to protecting personal and financial information in line with applicable privacy laws.",
  sections: [
    {
      id: "collection",
      title: "Information we collect",
      paragraphs: [
        "We may collect information you provide when you create an account, log expenses, set budgets, contact us, or use our website — including your name, email address, budget amounts, expense descriptions, and category preferences.",
        "We may also collect limited technical information when you visit our website, such as browser type and pages viewed, to improve the experience.",
      ],
    },
    {
      id: "use",
      title: "How we use your information",
      paragraphs: [
        "We use your information to provide budgeting features, generate forecasts and reports, send alerts you opt into, improve the product, and respond to support requests.",
      ],
      list: [
        "Storing and displaying your budgets and expenses",
        "Generating category suggestions and spending analytics",
        "Sending threshold alerts and optional summaries",
        "Maintaining the security and performance of our systems",
      ],
    },
    {
      id: "financial",
      title: "Financial data handling",
      paragraphs: [
        "Your budget and expense data is private to your account. We do not expose one user's financial information to another user. Optional AI features process your data only to provide suggestions for your account.",
        "We do not sell your financial data. We do not require bank account credentials for core features.",
      ],
    },
    {
      id: "disclosure",
      title: "When we disclose information",
      paragraphs: [
        "We may disclose information to service providers who help us operate the product (such as hosting providers), regulators where required by law, or advisers bound by confidentiality obligations. We do not sell personal information.",
      ],
    },
    {
      id: "security",
      title: "Storage and security",
      paragraphs: [
        "We take reasonable steps to protect personal and financial information from misuse, loss, unauthorised access, modification, or disclosure. No method of transmission over the internet is completely secure, but we review our safeguards regularly.",
      ],
    },
    {
      id: "rights",
      title: "Your rights and enquiries",
      paragraphs: [
        "You may request access to, correction of, or deletion of personal information we hold about you, subject to applicable exceptions.",
        "For privacy-related questions or requests, contact us at hello@financebuddy.app.",
      ],
    },
  ] satisfies readonly LegalSection[],
} as const;

export const termsOfService = {
  title: "Terms of Service",
  eyebrow: "Legal",
  updated: "16 June 2026",
  intro:
    "These terms govern your use of the Finance Buddy website and application. By using Finance Buddy, you agree to these terms.",
  sections: [
    {
      id: "website",
      title: "Use of Finance Buddy",
      paragraphs: [
        "Finance Buddy provides budgeting tools for personal use. Content, forecasts, alerts, and suggestions are for informational purposes only and do not constitute financial, legal, or tax advice.",
        "You agree to use the service lawfully and not to attempt unauthorised access to our systems or other users' data.",
      ],
    },
    {
      id: "accounts",
      title: "Accounts and data",
      paragraphs: [
        "You are responsible for the accuracy of information you enter. You may edit or delete your financial records through the application.",
        "We may suspend accounts that violate these terms or attempt to access other users' data.",
      ],
    },
    {
      id: "ai",
      title: "AI features and suggestions",
      paragraphs: [
        "Optional AI features may suggest categories, summarize spending, or offer saving ideas. These are suggestions only — not guaranteed outcomes or professional financial advice. You should use your own judgment when making financial decisions.",
      ],
    },
    {
      id: "accuracy",
      title: "Information accuracy",
      paragraphs: [
        "We aim to keep forecasts and reports accurate based on data you provide, but we do not warrant that calculations are error-free. Service availability and features may change during early access.",
      ],
    },
    {
      id: "liability",
      title: "Limitation of liability",
      paragraphs: [
        "To the extent permitted by law, Finance Buddy is not liable for loss arising from reliance on forecasts, alerts, or suggestions, or from temporary unavailability of the service.",
        "Nothing in these terms excludes rights or remedies that cannot be excluded under applicable consumer protection laws.",
      ],
    },
    {
      id: "changes",
      title: "Changes and contact",
      paragraphs: [
        "We may update these terms from time to time. Continued use after changes are published constitutes acceptance of the updated terms.",
        "Questions about these terms can be directed to hello@financebuddy.app.",
      ],
    },
  ] satisfies readonly LegalSection[],
} as const;

export const legalFooterLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
] as const;
