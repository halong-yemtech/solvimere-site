export const products = [
  {
    category: "Digital Platforms",
    name: "AI Agent Platform",
    description:
      "Autonomous agents that can reason, use tools, retrieve information, and execute multi-step business tasks.",
    skills: ["FastAPI", "LangGraph", "OpenAI/Anthropic APIs", "RAG"],
    href: "https://agentco.ai/portfolio",
    image: "/images/products/agentco.webp",
  },
  {
    category: "Automation",
    name: "AI Workflow Automation",
    description: "Connects AI with existing business applications to automate repetitive workflows.",
    skills: ["Webhooks", "LLMs", "Workflow design"],
    href: "https://agentlabs.agency/portfolio",
    image: "/images/products/agentlabs.jpg",
  },
  {
    category: "Digital Platforms",
    name: "AI Marketing Agent",
    description:
      "AI agents automate marketing tasks such as content generation, lead handling, and campaign workflows.",
    skills: ["LLMs", "Agents", "Python", "APIs", "CRM integrations"],
    href: "https://hyperloop-ai.com/portfolio",
    image: "/images/products/hyperloop.png",
  },
  {
    category: "Intelligence",
    name: "AI Voice Agent",
    description:
      "AI voice agents that communicate with customers over the phone and perform tasks such as qualification, scheduling, and support.",
    skills: ["Python", "LLMs", "Speech-to-text", "Text-to-speech", "Telephony APIs"],
    href: "https://zencia.ai/case-studies",
    image: "/images/products/zencia.png",
  },
  {
    category: "Intelligence",
    name: "AI Contract Analyzer",
    description:
      "Extracts important clauses, entities, and information from contracts and allows users to query documents.",
    skills: ["OCR", "NLP", "LLMs", "RAG", "Vector DB"],
    href: "https://unicoconnect.com",
    image: "/images/products/unicoconnect.png",
  },
  {
    category: "AI Agent",
    name: "Sim",
    description: "Visual, open-source platform for building and deploying autonomous AI agents.",
    skills: ["Python", "LLMs", "Agents", "APIs"],
    href: "https://sim.ai",
    image: "/images/products/sim.png",
  },
  {
    category: "AI Agent",
    name: "Bluejay",
    description: "Tests, monitors, and evaluates voice and chat AI agents.",
    skills: ["LLM evaluation", "APIs", "Observability"],
    href: "https://getbluejay.ai",
    image: "/images/products/bluejay.jpg",
  },
  {
    category: "AI Infrastructure",
    name: "AgentMail",
    description: "Email inbox and API infrastructure designed specifically for AI agents.",
    skills: ["Python", "APIs", "MCP", "AI agents"],
    href: "https://www.agentmail.to",
    image: "/images/products/agentmail.png",
  },
  {
    category: "Automation",
    name: "Yutori",
    description: "Autonomous browser and computer-use agents that research and perform web tasks.",
    skills: ["Python", "Browser automation", "LLMs", "Agents"],
    href: "https://yutori.com",
    image: "/images/products/yutori.png",
  },
  {
    category: "Automation",
    name: "Lapis",
    description: "AI agents create, launch, and optimize paid advertising campaigns.",
    skills: ["AI agents", "Marketing automation", "Analytics", "APIs"],
    href: "https://trylapis.com",
    image: "/images/products/lapis.png",
  },
  {
    category: "Data & Analytics",
    name: "Context.dev",
    description: "API for scraping, searching, crawling, and researching live web data for AI products.",
    skills: ["Python", "Web scraping", "APIs", "RAG"],
    href: "https://www.context.dev",
    image: "/images/products/context-dev.png",
  },
];

export const productFilters = ["All", ...new Set(products.map((item) => item.category))];

export const productStats = [
  ["40+", "AI agents deployed"],
  ["10×", "Faster workflows"],
  ["120+", "Businesses served"],
  ["99.9%", "Platform uptime"],
];

export const solutions = [
  {
    title: "AI business automation",
    body: "Automate repetitive processes and turn complex workflows into intelligent systems.",
    icon: "nodes",
  },
  {
    title: "AI customer intelligence",
    body: "Deliver faster, smarter support, more personalized experiences, and deeper customer insights.",
    icon: "people",
  },
  {
    title: "Data & analytics",
    body: "Transform business data into actionable intelligence and better decisions.",
    icon: "spark",
  },
  {
    title: "Digital platforms & software",
    body: "Design and build scalable software products tailored to your business needs.",
    icon: "code",
  },
];

export const solutionNeeds = [
  {
    title: "Automate operations",
    body: "Reduce manual work and operational complexity.",
    icon: "box",
  },
  {
    title: "Improve customer experience",
    body: "Deliver faster, smarter interactions.",
    icon: "heart",
  },
  {
    title: "Unlock business intelligence",
    body: "Turn data into useful decisions.",
    icon: "spark",
  },
  {
    title: "Build and scale digital products",
    body: "Launch and evolve modern software.",
    icon: "share",
  },
];

export const solutionAdvantages = [
  {
    title: "Custom-built for your needs",
    body: "No one-size-fits-all. Every solution is tailored.",
    icon: "spark",
  },
  {
    title: "Secure and reliable",
    body: "Enterprise-grade security and compliance.",
    icon: "shield",
  },
  {
    title: "Expert team",
    body: "AI specialists, engineers, and designers.",
    icon: "people",
  },
  {
    title: "Long-term partnership",
    body: "We grow with you, not just for you.",
    icon: "heart",
  },
];

export const platformPoints = [
  "AI-powered workflows",
  "Seamless integrations",
  "Intelligent agents",
  "Automated decision-making",
  "Real-time analytics",
];

export const industries = [
  {
    title: "Financial services",
    body: "Enhance risk management, detect fraud, and automate operations with AI-driven solutions.",
    icon: "bank",
    image: "/images/photos/laptop.jpg",
  },
  {
    title: "Healthcare",
    body: "Improve patient experiences, streamline operations, and enable better decision-making.",
    icon: "pulse",
    image: "/images/photos/clinical.jpg",
  },
  {
    title: "Retail & e-commerce",
    body: "Personalize customer journeys, optimize inventory, and increase sales with intelligent systems.",
    icon: "cart",
    image: "/images/photos/retail.jpg",
  },
  {
    title: "Logistics & supply chain",
    body: "Improve visibility, automate processes, and reduce operational costs across your supply chain.",
    icon: "box",
    image: "/images/photos/robot.jpg",
  },
  {
    title: "Professional services",
    body: "Boost productivity, automate workflows, and deliver greater value to your clients.",
    icon: "people",
    image: "/images/photos/session.jpg",
  },
  {
    title: "Technology",
    body: "Build scalable platforms, integrate systems, and accelerate innovation with modern technology.",
    icon: "code",
    image: "/images/photos/insight-ml.jpg",
  },
  {
    title: "Real estate",
    body: "Simplify property management, improve customer engagement, and increase operational efficiency.",
    icon: "building",
    image: "/images/photos/about-right.webp",
  },
  {
    title: "Manufacturing",
    body: "Enable smart factories, predict maintenance, and optimize production processes.",
    icon: "factory",
    image: "/images/photos/inspection.jpg",
  },
];

export const industryStrengths = [
  { title: "Domain experts", body: "Real-world experience across industries." },
  { title: "Flexible solutions", body: "Tailored to your business and goals." },
  { title: "Scalable growth", body: "Built for today, ready for tomorrow." },
  { title: "Long-term partnership", body: "We grow with you." },
];

export const industryResults = [
  {
    category: "Financial services",
    title: "Automating KYC & compliance",
    metrics: [
      ["70%", "Faster verification"],
      ["50%", "Less manual review"],
    ],
  },
  {
    category: "Healthcare",
    title: "AI-powered patient support",
    metrics: [
      ["3×", "Faster response"],
      ["40%", "Higher satisfaction"],
    ],
  },
  {
    category: "Retail & e-commerce",
    title: "Intelligent recommendation engine",
    metrics: [
      ["35%", "Higher conversion"],
      ["25%", "Higher order value"],
    ],
  },
  {
    category: "Logistics & supply chain",
    title: "Smart fleet optimization",
    metrics: [
      ["20%", "Lower fuel costs"],
      ["45%", "More on-time delivery"],
    ],
  },
];

export const caseStats = [
  ["35%", "Average efficiency gain"],
  ["3×", "Faster service delivery"],
  ["92%", "Customer satisfaction uplift"],
];

export const caseStudies = [
  {
    category: "Financial services",
    title: "Automated loan processing system",
    summary:
      "Built a streamlined underwriting workflow that reduced manual review time and improved decision consistency.",
    image: "/images/photos/laptop.jpg",
    metrics: [
      ["65%", "Less manual processing"],
      ["2.5×", "Faster application turnaround"],
    ],
  },
  {
    category: "Healthcare",
    title: "Intelligent patient data platform",
    summary:
      "Connected fragmented patient information into a single operational view for faster care coordination and reporting.",
    image: "/images/photos/clinical.jpg",
    metrics: [
      ["50%", "Less data processing time"],
      ["35%", "Better operational efficiency"],
    ],
  },
  {
    category: "Retail & e-commerce",
    title: "AI-powered customer support",
    summary:
      "Helped a retail brand automate support workflows while delivering a more consistent and personalized customer experience.",
    image: "/images/photos/session.jpg",
    metrics: [
      ["3×", "Faster customer response"],
      ["40%", "Higher customer satisfaction"],
    ],
  },
  {
    category: "Logistics & supply chain",
    title: "Smart fleet optimization",
    summary:
      "Created a predictive operations layer that gave teams better route visibility, asset planning, and on-time performance.",
    image: "/images/photos/robot.jpg",
    metrics: [
      ["20%", "Lower fuel costs"],
      ["45%", "Higher on-time delivery"],
    ],
  },
  {
    category: "Manufacturing",
    title: "Predictive maintenance network",
    summary: "Unified machine telemetry and maintenance data to reduce downtime and improve operational resilience.",
    image: "/images/photos/inspection.jpg",
    metrics: [
      ["28%", "Lower maintenance costs"],
      ["60%", "Fewer unplanned shutdowns"],
    ],
  },
  {
    category: "Retail & e-commerce",
    title: "Omnichannel revenue intelligence",
    summary:
      "Turned fragmented retail signals into a single growth dashboard that informed pricing, inventory, and campaign decisions.",
    image: "/images/photos/retail.jpg",
    metrics: [
      ["31%", "Increase in conversion"],
      ["24%", "Higher average order value"],
    ],
  },
];

export const resourceTopics = [
  ["All", "All"],
  ["AI & Automation", "24"],
  ["Product Updates", "12"],
  ["Guides & How-Tos", "18"],
  ["Case Studies", "10"],
  ["Industry Insights", "14"],
];

export const featuredArticle = {
  topic: "AI & Automation",
  title: "The future of AI agents in business operations",
  description:
    "Discover how AI agents are transforming workflows, reducing manual work, and creating new opportunities for business growth.",
  image: "/images/photos/insight-ml.jpg",
  date: "Featured",
};

export const articles = [
  {
    topic: "AI & Automation",
    title: "5 ways AI automation can improve your business efficiency",
    description: "Discover practical ways to automate repetitive tasks and free up your team for higher-value work.",
    date: "Apr 28, 2025",
    image: "/images/photos/laptop.jpg",
  },
  {
    topic: "Guides & How-Tos",
    title: "A complete guide to building AI-powered chatbots",
    description: "A step-by-step guide to building and integrating AI chatbots for better customer engagement.",
    date: "Apr 22, 2025",
    image: "/images/photos/session.jpg",
  },
  {
    topic: "Data & Analytics",
    title: "Turning data into decisions: the power of business intelligence",
    description: "How modern analytics tools help businesses make faster, smarter, more confident decisions.",
    date: "Apr 16, 2025",
    image: "/images/photos/insight-product.jpg",
  },
  {
    topic: "Industry Insights",
    title: "Digital transformation trends in Southeast Asia (2025)",
    description: "Key trends and opportunities shaping the future of digital business in the region.",
    date: "Apr 10, 2025",
    image: "/images/photos/about-left.webp",
  },
  {
    topic: "Case Studies",
    title: "How a retail brand increased sales with AI recommendations",
    description: "See how AI-driven personalization helped a retail client boost conversion rates.",
    date: "Apr 4, 2025",
    image: "/images/photos/retail.jpg",
  },
  {
    topic: "Technology",
    title: "The benefits of cloud-native applications for modern businesses",
    description: "Why cloud-native architecture is essential for scalability, flexibility, and long-term growth.",
    date: "Mar 28, 2025",
    image: "/images/photos/insight-vision.jpg",
  },
  {
    topic: "Product Updates",
    title: "Introducing Solvimere Automation Platform v2.0",
    description: "New features, better performance, and more integrations to help you automate faster.",
    date: "Mar 20, 2025",
    image: "/images/photos/engineer.png",
  },
  {
    topic: "Guides & How-Tos",
    title: "How to choose the right AI solution for your business",
    description: "A practical checklist to help you find the best AI solution for your goals, budget, and industry.",
    date: "Mar 12, 2025",
    image: "/images/photos/work.webp",
  },
];

export const aboutValues = ["Innovation", "Customer success", "Collaboration", "Integrity", "Long-term thinking"];

export const aboutStats = [
  ["50+", "Team members"],
  ["10+", "Nationalities"],
  ["4", "Offices, Singapore and remote"],
  ["100%", "Focus on customer success"],
];

export const journey = [
  ["2020", "Solvimere founded in Singapore with a vision to build intelligent digital solutions."],
  ["2021", "Launched our first AI-powered product and welcomed our early customers."],
  ["2022", "Expanded our team, product portfolio, and global partnerships."],
  ["2024", "Serving businesses across industries and scaling for the future."],
];

export const presence = [
  ["Singapore", "Headquarters"],
  ["Europe", "Clients and partners"],
  ["Americas", "Clients and partners"],
  ["APAC", "Partner network"],
];
