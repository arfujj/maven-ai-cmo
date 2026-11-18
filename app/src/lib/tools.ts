// The Toolkit: every tool runs one Maven skill (its real SKILL.md and chosen references) against a
// business's analysis and produces a finished deliverable. Shared by client and server.

export type ToolCategory = "found" | "chosen" | "call" | "back" | "content" | "strategy";

export const CATEGORIES: { id: ToolCategory; name: string; blurb: string }[] = [
  { id: "found", name: "Get found", blurb: "Show up on Google Maps, search and AI answers" },
  { id: "chosen", name: "Get chosen", blurb: "Win the click against the businesses next to you" },
  { id: "call", name: "Get the call", blurb: "Turn visits into calls, and calls into booked jobs" },
  { id: "back", name: "Bring them back", blurb: "Follow-up, repeat jobs and referrals" },
  { id: "content", name: "Content", blurb: "Articles, posts and guides that build trust" },
  { id: "strategy", name: "Strategy", blurb: "Voice, positioning, competitors and results" },
];

export interface ToolInput {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
  optional?: boolean;
  help?: string;
}

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  produces: string;
  skill: string;
  refs?: string[];
  inputs: ToolInput[];
  minutes: string;
  /** Extra instruction appended to the task. */
  task: string;
}

export const TOOLS: Tool[] = [
  // ---------------- Get found ----------------
  {
    id: "google-posts",
    name: "A month of Google posts",
    category: "found",
    description: "Four to eight Google Business Profile posts for the next month, each with one offer or proof point and one action.",
    produces: "Ready-to-paste posts with dates and photo ideas",
    skill: "google-business-profile",
    refs: ["post-craft.md"],
    inputs: [
      { name: "news", label: "Offers, news or seasonal angles", type: "textarea", optional: true, placeholder: "Spring AC tune-up $89, new technician, 24/7 emergency line…" },
      { name: "month", label: "Month", type: "text", optional: true, placeholder: "December" },
    ],
    minutes: "~1 min",
    task: "Write a month of Google Business Profile posts (4 to 8). For each: suggested date, post type, the text (under 1,200 characters), the button, and a photo to take. Close with the profile fixes you noticed in the evidence (categories, hours, photos), as a short checklist.",
  },
  {
    id: "local-seo-plan",
    name: "Local SEO plan",
    category: "found",
    description: "Decides which services and towns deserve their own page, which get a section, and which to skip.",
    produces: "A page map with priorities",
    skill: "local-seo-plan",
    refs: ["quality-bar.md", "decision-examples.md"],
    inputs: [
      { name: "towns", label: "Towns and areas you serve", type: "textarea", placeholder: "Dallas, Richardson, Garland, Plano…" },
      { name: "services", label: "Services that matter most", type: "textarea", optional: true, placeholder: "Leave blank to use the services on your site" },
    ],
    minutes: "~1 min",
    task: "Produce the local SEO plan: a table of service × town decisions (page / section / skip) with the reason for each, the build order, and what each page needs to rank. No search-volume numbers unless given; reason from the evidence and the skill's judgment.",
  },
  {
    id: "town-page",
    name: "Town page",
    category: "found",
    description: "A service page for one town that isn't the same page with the city swapped.",
    produces: "Full page copy with headings, FAQ and local proof",
    skill: "service-area-pages",
    refs: ["page-anatomy.md"],
    inputs: [
      { name: "town", label: "Town", type: "text", placeholder: "Richardson, TX" },
      { name: "service", label: "Service", type: "text", placeholder: "Water heater repair" },
      { name: "local", label: "Real local details", type: "textarea", optional: true, help: "Jobs you've done there, neighborhoods, landmarks, local regulations. Real details make the page rank.", placeholder: "Lots of 1970s homes with galvanized pipes in Canyon Creek…" },
    ],
    minutes: "~1 min",
    task: "Write the complete town page: title tag, meta description, H1, every section in order, a short FAQ, and the call to action. Mark every place a real local detail or photo should go with [add: …] instead of inventing one.",
  },
  {
    id: "ai-search-fixes",
    name: "Get recommended by AI",
    category: "found",
    description: "What to change so ChatGPT, Perplexity and Google's AI name your business when people ask.",
    produces: "A prioritized fix list plus ready-to-publish answer blocks",
    skill: "ai-search",
    refs: ["aeo-judgment.md"],
    inputs: [{ name: "questions", label: "Questions customers ask AI", type: "textarea", optional: true, placeholder: "Who's the best emergency plumber in Dallas? How much does a water heater cost?" }],
    minutes: "~1 min",
    task: "Produce the AI search fix list: the questions this business should be the answer to, why AI tools may not name it today (from the evidence), the fixes in order, and 3 ready-to-publish answer blocks for the site. Do not claim to have queried any AI tool.",
  },
  {
    id: "website-fixes",
    name: "Website fix list",
    category: "found",
    description: "The technical and on-page fixes that stop your site from being found or getting calls, ranked.",
    produces: "A ranked fix list your web person can work through",
    skill: "site-audit",
    refs: ["checks.md"],
    inputs: [],
    minutes: "~1 min",
    task: "From the evidence (pages read, speed, structured data, AI crawler access, first-screen check), write a ranked list of 5 to 10 website fixes. Each: what's wrong, the evidence, why it costs calls or rankings, the exact fix, and who does it. Say clearly that a full crawl was not run.",
  },

  // ---------------- Get chosen ----------------
  {
    id: "review-replies",
    name: "Reply to your reviews",
    category: "chosen",
    description: "Owner replies to your real Google reviews, in your voice, including the tough ones.",
    produces: "A reply for each review, ready to post",
    skill: "reviews",
    refs: ["reply-playbook.md"],
    inputs: [{ name: "extra", label: "Paste more reviews", type: "textarea", optional: true, placeholder: "Paste reviews you want answered, one per line" }],
    minutes: "~1 min",
    task: "Write an owner reply for every review in the evidence (and any pasted). For each: the reviewer and rating, a one-line read of what they need, then the reply. Keep replies short, specific and human. Never offer anything that breaks Google's review policy.",
  },
  {
    id: "review-system",
    name: "Review request system",
    category: "chosen",
    description: "The texts, emails and script to ask every customer for a review, so you catch up with rivals.",
    produces: "Text, email, in-person script and follow-up timing",
    skill: "reviews",
    refs: ["ask-playbook.md", "review-policy-facts.md"],
    inputs: [{ name: "when", label: "When does a job usually end?", type: "text", optional: true, placeholder: "Technician finishes on site; invoice sent same day" }],
    minutes: "~1 min",
    task: "Build the review ask system: the moment to ask, the in-person script for the technician, the text message, the email, one follow-up, and how to track it. Compare the review pace with competitors if the evidence allows. Stay inside Google's policy (no gating, no incentives).",
  },
  {
    id: "homepage-rewrite",
    name: "Homepage first screen",
    category: "chosen",
    description: "A rewritten top of your homepage: headline, proof and button, so a phone visitor calls.",
    produces: "Headline options, proof line, buttons and layout notes",
    skill: "first-screen-check",
    refs: ["checks.md"],
    inputs: [],
    minutes: "~1 min",
    task: "Rewrite the first screen on a phone. Give: 3 headline options (service + town in the customer's words, recommend one), the proof line, the call button and secondary action, what to remove (popups, sliders), and a simple wireframe in text. Use only real proof from the evidence.",
  },
  {
    id: "landing-page",
    name: "Landing page",
    category: "chosen",
    description: "A complete page for one service and one offer, built to get the call from ads or search.",
    produces: "Full page copy, section by section",
    skill: "landing-page",
    refs: ["local-pages.md"],
    inputs: [
      { name: "service", label: "Service", type: "text", placeholder: "Drain cleaning" },
      { name: "offer", label: "Offer", type: "text", optional: true, placeholder: "$99 drain clearing, same day" },
    ],
    minutes: "~2 min",
    task: "Write the full landing page: each section in order with its headline and copy, the proof to show, the FAQ, and the calls to action. Phone first. Mark missing proof with [add: …].",
  },
  {
    id: "positioning",
    name: "Positioning and offer",
    category: "chosen",
    description: "The angle that makes you the obvious choice in your town, and an offer worth calling about.",
    produces: "3 to 5 angles, one recommended, plus the offer",
    skill: "positioning-angles",
    refs: ["angle-frameworks.md", "hormozi-offer.md"],
    inputs: [],
    minutes: "~2 min",
    task: "Find 3 to 5 positioning angles from the evidence (customers' words, rivals' complaints, the business's real proof). Star one and explain why. Then design the offer: what's included, the guarantee, the name, and how to say it in one sentence.",
  },
  {
    id: "lead-magnet",
    name: "Lead magnet",
    category: "chosen",
    description: "A checklist, guide or quote calculator people trade their email or phone number for.",
    produces: "The concept, the full content and the opt-in copy",
    skill: "lead-magnet",
    refs: ["local-magnets.md"],
    inputs: [{ name: "idea", label: "Idea", type: "text", optional: true, placeholder: "Water heater replacement cost guide" }],
    minutes: "~2 min",
    task: "Pick the best lead magnet for this business (or develop the idea given), then write it in full plus the opt-in page copy and the first follow-up message.",
  },

  // ---------------- Get the call ----------------
  {
    id: "missed-call",
    name: "Missed-call text-back",
    category: "call",
    description: "The text that goes out when a call is missed, plus the follow-up so leads don't go cold.",
    produces: "Text-back, follow-up sequence and setup steps",
    skill: "speed-to-lead",
    refs: ["text-back-and-follow-up.md"],
    inputs: [{ name: "hours", label: "When is the phone answered?", type: "text", optional: true, placeholder: "Mon–Fri 7–6, on-call after hours" }],
    minutes: "~1 min",
    task: "Write the missed-call text-back (business hours and after hours versions), the follow-up for web forms, a 3-touch follow-up for unbooked quotes, and plain setup steps using common tools. Include how to measure missed-call share.",
  },
  {
    id: "google-ads",
    name: "Google Ads campaign",
    category: "call",
    description: "One focused search campaign: keywords, ads, budget split and a test plan.",
    produces: "Campaign structure, ad copy and test plan",
    skill: "paid-ads",
    refs: ["ads-judgment.md"],
    inputs: [
      { name: "service", label: "Service to advertise", type: "text", placeholder: "Emergency plumbing" },
      { name: "budget", label: "Monthly ad budget", type: "text", optional: true, placeholder: "$1,500" },
    ],
    minutes: "~2 min",
    task: "Build one search campaign: structure, keyword themes and negatives, 3 responsive search ads (headlines ≤30 characters, descriptions ≤90, counted), where each ad sends people, budget and bidding, and a 4-week test plan with keep-or-kill rules. Tracking calls comes first; say so if the evidence suggests it isn't set up.",
  },
  {
    id: "meta-ads",
    name: "Facebook & Instagram ads",
    category: "call",
    description: "Ad angles, copy and creative briefs for Meta, built from what your customers say.",
    produces: "3 ad concepts with copy and creative briefs",
    skill: "paid-ads",
    refs: ["platform-specs.md"],
    inputs: [{ name: "offer", label: "What are you promoting?", type: "text", placeholder: "Spring AC tune-up" }],
    minutes: "~2 min",
    task: "Write 3 Meta ad concepts (different hooks: direct, proof, contrarian). For each: primary text, headline, description, the image or 15-second video brief, and the audience. Add a simple test plan.",
  },
  {
    id: "call-tracking",
    name: "Call tracking setup",
    category: "call",
    description: "Make Google Ads and your reports count real calls and forms, so you know what works.",
    produces: "A step-by-step setup guide for this business",
    skill: "google-ads-tracking",
    refs: ["google-ads-facts.md"],
    inputs: [{ name: "tools", label: "Phone or booking tools you use", type: "text", optional: true, placeholder: "CallRail, ServiceTitan, Housecall Pro…" }],
    minutes: "~1 min",
    task: "Write the tracking setup for this business: what counts as a conversion, how to track calls from ads, the website and the Google profile, how to connect the booking system, and how to check it works. Plain steps an owner can hand to someone.",
  },
  {
    id: "ads-check",
    name: "Are my ads working?",
    category: "call",
    description: "A pause test that shows whether ads bring calls or just take credit for them.",
    produces: "A test plan and a call-log template",
    skill: "ads-incrementality-check",
    refs: ["pause-test-worksheet.md"],
    inputs: [{ name: "ads", label: "Which ads do you run?", type: "text", placeholder: "Google Performance Max and Local Services Ads" }],
    minutes: "~1 min",
    task: "Design the pause test: what to pause, for how long, what to count from the phone log, how to read the result, and the risks. Include a call-log table template.",
  },

  // ---------------- Bring them back ----------------
  {
    id: "email-sequence",
    name: "Email sequence",
    category: "back",
    description: "Welcome, quote follow-up, review ask or seasonal emails, written in your voice.",
    produces: "Every email with subject lines and timing",
    skill: "email-sequences",
    refs: ["local-templates.md"],
    inputs: [{ name: "type", label: "Sequence", type: "select", options: ["Quote follow-up", "Welcome new customer", "Review ask", "Seasonal maintenance reminder", "Win back past customers"] }],
    minutes: "~1 min",
    task: "Write the full sequence: for each email the send timing, 2 subject lines, preview text and body. Short, plain, one action each. Add the sending checklist (SPF, DKIM, DMARC, unsubscribe).",
  },
  {
    id: "newsletter",
    name: "Newsletter edition",
    category: "back",
    description: "A newsletter past customers actually open: useful, local and short.",
    produces: "A complete edition with subject lines",
    skill: "newsletter",
    inputs: [{ name: "topic", label: "Topic or season", type: "text", optional: true, placeholder: "Getting your home ready for the first freeze" }],
    minutes: "~1 min",
    task: "Write one complete newsletter edition: 3 subject lines, the body with one useful idea, one local or customer story placeholder, and one soft call to action.",
  },

  // ---------------- Content ----------------
  {
    id: "seo-article",
    name: "SEO article",
    category: "content",
    description: "An article that answers what your customers search, built to rank and to be quoted by AI.",
    produces: "A full article with title, meta and FAQ",
    skill: "seo-content",
    refs: ["eeat-examples.md"],
    inputs: [{ name: "topic", label: "Topic or question", type: "text", placeholder: "How much does it cost to replace a water heater in Dallas?" }],
    minutes: "~2 min",
    task: "Write the full article: title, meta description, a direct answer in the first 60 words, the sections, a short FAQ, and the call to action. Mark every number that needs a source with [source needed] unless it comes from the evidence.",
  },
  {
    id: "social-posts",
    name: "Social posts",
    category: "content",
    description: "A week of posts for Facebook, Instagram or LinkedIn that sound like you, not a template.",
    produces: "5 posts with hooks and image ideas",
    skill: "social-content",
    refs: ["post-craft.md"],
    inputs: [
      { name: "platform", label: "Platform", type: "select", options: ["Facebook", "Instagram", "LinkedIn", "Nextdoor"] },
      { name: "topic", label: "Topics or recent jobs", type: "textarea", optional: true, placeholder: "Replaced a sewer line in Lakewood, winter pipe tips…" },
    ],
    minutes: "~1 min",
    task: "Write 5 posts for the platform. Each: the hook, the post, and the photo or video to pair it with. No hashtag walls, no engagement bait.",
  },
  {
    id: "repurpose",
    name: "Repurpose content",
    category: "content",
    description: "Turn one article, video transcript or post into native posts for other platforms.",
    produces: "Posts for 3 platforms from one piece",
    skill: "content-atomizer",
    refs: ["platform-templates.md"],
    inputs: [{ name: "content", label: "Paste the content", type: "textarea", placeholder: "Paste an article, transcript or long post" }],
    minutes: "~1 min",
    task: "Turn the pasted content into native posts for Facebook, Instagram and Google Business Profile (and LinkedIn if it fits), each written for that platform.",
  },
  {
    id: "long-guide",
    name: "Long-form guide",
    category: "content",
    description: "A long, genuinely useful guide with real numbers and sources, for your site or to share.",
    produces: "An outline and full draft",
    skill: "long-form-article",
    refs: ["structure.md", "writing-rules.md"],
    inputs: [{ name: "topic", label: "Guide topic", type: "text", placeholder: "The homeowner's guide to sewer line problems" }],
    minutes: "~2 min",
    task: "Write the guide: three title options (recommend one), the outline, then the full draft. Every number either comes from the evidence or is marked [confirm]. Flag every line the owner must confirm in a list at the end.",
  },

  // ---------------- Strategy ----------------
  {
    id: "brand-voice",
    name: "Brand voice guide",
    category: "strategy",
    description: "How your business sounds, so every page, post and reply is consistent.",
    produces: "A one-page voice guide with examples",
    skill: "brand-voice",
    refs: ["ai-tells.md"],
    inputs: [],
    minutes: "~1 min",
    task: "Write the voice guide from the site and the customers' words: tone, sentence style, words to use and avoid, how the voice changes by channel, and before/after examples.",
  },
  {
    id: "competitor-teardown",
    name: "Competitor teardown",
    category: "strategy",
    description: "What the businesses ranking above you do better, where they're weak, and how to beat them.",
    produces: "A teardown of each rival and your openings",
    skill: "competitive-intel",
    refs: ["local-teardown.md"],
    inputs: [{ name: "names", label: "Rivals to focus on", type: "text", optional: true, placeholder: "Leave blank to use your map-pack rivals" }],
    minutes: "~1 min",
    task: "Tear down each competitor in the evidence: what they win on, their weak spots (including customer complaints), and the openings for this business. End with the 3 moves that exploit those openings.",
  },
  {
    id: "results-review",
    name: "Review my numbers",
    category: "strategy",
    description: "Paste last month's numbers and get an honest read on what worked and what to change.",
    produces: "A diagnosis and next actions",
    skill: "performance-review",
    refs: ["metrics-judgment.md"],
    inputs: [{ name: "numbers", label: "Paste your numbers", type: "textarea", placeholder: "Calls 142 (Oct) vs 118 (Sep), booked jobs 61, Google Ads spend $1,800, 74 conversions reported, 23 new reviews…" }],
    minutes: "~1 min",
    task: "Review the numbers: what moved and why (evidence first), which channel deserves credit (checked against the business's own count), what to keep, cut and test, and 3 next actions.",
  },
  {
    id: "client-report",
    name: "Monthly client report",
    category: "strategy",
    description: "For agencies: the plain-language monthly report an owner actually reads.",
    produces: "A ready-to-send monthly report",
    skill: "client-report",
    refs: ["report-craft.md"],
    inputs: [
      { name: "month", label: "Month", type: "text", placeholder: "October 2026" },
      { name: "work", label: "What you did this month", type: "textarea", placeholder: "Rewrote homepage, 8 Google posts, review texts live…" },
      { name: "numbers", label: "The numbers", type: "textarea", placeholder: "Booked jobs 41 (33 last month), calls 128, reviews +19…" },
    ],
    minutes: "~1 min",
    task: "Write the monthly client report: the headline (the number vs last month and plan), what we did, what it did, what didn't work, next month's three moves, and what we need from the client.",
  },
];

export const TOOL_BY_ID = Object.fromEntries(TOOLS.map((t) => [t.id, t])) as Record<string, Tool>;

/** Which tool does the work for a skill named in a fix or a plan bet. */
const SKILL_TO_TOOL: Record<string, string> = {
  "google-business-profile": "google-posts",
  reviews: "review-system",
  "first-screen-check": "homepage-rewrite",
  "landing-page": "landing-page",
  "direct-response-copy": "homepage-rewrite",
  "speed-to-lead": "missed-call",
  "google-ads-tracking": "call-tracking",
  "local-seo-plan": "local-seo-plan",
  "service-area-pages": "town-page",
  "ai-search": "ai-search-fixes",
  "site-audit": "website-fixes",
  "positioning-angles": "positioning",
  "email-sequences": "email-sequence",
  "paid-ads": "google-ads",
  "ads-incrementality-check": "ads-check",
  "seo-content": "seo-article",
  "social-content": "social-posts",
  "competitive-intel": "competitor-teardown",
  "brand-voice": "brand-voice",
  "lead-magnet": "lead-magnet",
};
export const toolForSkill = (skill: string): Tool | null => {
  const key = Object.keys(SKILL_TO_TOOL).find((k) => skill.toLowerCase().includes(k));
  return key ? TOOL_BY_ID[SKILL_TO_TOOL[key]] : null;
};
