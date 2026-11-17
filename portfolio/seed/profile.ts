export const upworkProfileUrl = "https://www.upwork.com/freelancers/~0128b78af234b4cacd";

export const githubProfileUrl = "https://github.com/anthonyscott-works";

export const linkedinProfileUrl = "https://www.linkedin.com/in/anthony-scott-b1598a";

export const whatsappUrl = "https://wa.me/17325188483";

export const cvUrl = "/Anthony_Scott_FlowCV_Resume.pdf";

export const profile = {
  name: "Anthony Scott",
  title: "Senior Backend Architect | Go/GoLang, Python & Cloud Infrastructure",
  avatar: "/images/avatar.jpg",
  age: "46",
  residence: "US",
  address: "Portland, OR, USA",
  status: "Available",
  hourlyRate: 85,
  upworkUrl: upworkProfileUrl,
  githubUrl: githubProfileUrl,
  linkedinUrl: linkedinProfileUrl,
  whatsappUrl,
  cv: cvUrl,
  email: "anthonyscottpotss@hotmail.com",
  phone: "+1 (732) 518-8483",
  copyright: "Anthony Scott's portfolio © 2026.",
  typingTitles: ["Senior Backend Engineer", "AWS DevOps Engineer"],
};

export const bio = `👋 Hello! I am a **Senior GoLang Developer** and **Backend Architect** with **10+ years of experience** delivering robust, scalable, and high-performance **cloud-native solutions**.

⚙️ I specialize in **end-to-end backend architecture**, migrating legacy APIs, and resolving complex concurrency issues. Whether you need a high-throughput **Go microservice** or a fast **Node.js (TypeScript)** backend, I deliver **production-ready systems** that are built to scale.`;

export const socialMedia = [
  {
    id: "1",
    icon: "SiUpwork",
    label: "Upwork",
    mediaUrl: upworkProfileUrl,
    logoColor: { hex: "#6FDA44" },
    info: "Hire me for backend & cloud projects",
  },
  {
    id: "2",
    icon: "FaLinkedin",
    label: "LinkedIn",
    mediaUrl: linkedinProfileUrl,
    logoColor: { hex: "#0A66C2" },
    info: "Connect on LinkedIn",
  },
  {
    id: "4",
    icon: "FaGithub",
    label: "GitHub",
    mediaUrl: githubProfileUrl,
    logoColor: { hex: "#ffffff" },
    info: "View my repositories on GitHub",
  },
  {
    id: "5",
    icon: "FaWhatsapp",
    label: "WhatsApp",
    mediaUrl: whatsappUrl,
    logoColor: { hex: "#25D366" },
    info: "+1 (732) 518-8483",
  },
];

export const services = [
  {
    id: "1",
    title: "Backend & APIs",
    icon: "SiGo",
    description:
      "High-throughput Go microservices, Node.js (TypeScript) APIs, and REST, gRPC, and WebSocket integrations built for production scale.",
  },
  {
    id: "2",
    title: "Cloud & DevOps",
    icon: "SiDocker",
    description:
      "AWS, GCP, and Azure infrastructure with Docker, Kubernetes, Helm, and CI/CD pipelines from development to seamless deployment.",
  },
  {
    id: "3",
    title: "AI & LLM Orchestration",
    icon: "RiRobot2Line",
    description:
      "Local LLM integration, agentic AI workflows, data ingestion pipelines, and vector database search for intelligent backends.",
  },
  {
    id: "4",
    title: "Event-Driven Architecture",
    icon: "SiApachekafka",
    description:
      "Scalable messaging with Kafka, NATS, AWS SQS/SNS, and GCP Pub/Sub to reduce bottlenecks and cloud compute overhead.",
  },
];

export const prices = [
  {
    id: "1",
    packageName: "Popular",
    packagePrice: profile.hourlyRate,
    priceType: "hour",
    freelanceUrl: upworkProfileUrl,
    packageServices: [
      {
        id: "1",
        isIncluded: true,
        packageService: "Go & Node.js API Development",
      },
      {
        id: "2",
        isIncluded: true,
        packageService: "Docker & CI/CD Pipelines",
      },
      {
        id: "3",
        isIncluded: true,
        packageService: "PostgreSQL & Redis Integration",
      },
      {
        id: "4",
        isIncluded: false,
        packageService: "AI & LLM Orchestration",
      },
      {
        id: "5",
        isIncluded: false,
        packageService: "Legacy Monolith Migration",
      },
    ],
  },
  {
    id: "2",
    packageName: "Pro",
    packagePrice: profile.hourlyRate,
    priceType: "hour",
    freelanceUrl: upworkProfileUrl,
    packageServices: [
      {
        id: "1",
        isIncluded: true,
        packageService: "Go Microservices & Legacy Migration",
      },
      {
        id: "2",
        isIncluded: true,
        packageService: "AI & LLM Orchestration",
      },
      {
        id: "3",
        isIncluded: true,
        packageService: "Event-Driven Architecture (Kafka, NATS)",
      },
      {
        id: "4",
        isIncluded: true,
        packageService: "Kubernetes & Multi-Cloud (AWS/GCP/Azure)",
      },
      {
        id: "5",
        isIncluded: false,
        packageService: "UI/UX Design",
      },
      {
        id: "6",
        isIncluded: false,
        packageService: "Mobile App Development",
      },
    ],
  },
];

export const clients = [
  { id: "1", link: linkedinProfileUrl, icon: "FaLinkedin" },
  { id: "3", link: upworkProfileUrl, icon: "SiUpwork" },
  { id: "4", link: githubProfileUrl, icon: "FaGithub" },
];

export const testimonials = [
  {
    id: "1",
    userName: profile.name,
    userProfession: profile.title,
    quote:
      "I believe in writing clean, maintainable code and taking full ownership from development to seamless deployment. My focus is always on delivering quality work and building long-term professional relationships.",
    userImage: { url: profile.avatar },
  },
];

export const facts = [
  {
    id: "1",
    icon: "SiGo",
    description: "10+ years building scalable Go & cloud-native backends",
  },
  {
    id: "2",
    icon: "FaAws",
    description: "AWS, GCP & Azure deployments with Docker & Kubernetes",
  },
  {
    id: "3",
    icon: "SiPostgresql",
    description: "PostgreSQL, Redis, MongoDB & vector search expertise",
  },
  {
    id: "4",
    icon: "SiUpwork",
    description: "Available on Upwork at $85/hour for backend projects",
  },
];

export const resumeExperience = [
  {
    id: "1",
    badge: "2019 - Present",
    title: "Senior Backend Architect",
    subTitle: "Beejern",
    description:
      "Delivering Go microservices, legacy API migrations, event-driven systems, and cloud-native infrastructure for clients worldwide.",
    isExperience: true,
    logo: { url: profile.avatar },
  },
  {
    id: "2",
    badge: "2016 - 2019",
    title: "Backend Engineer",
    subTitle: "Surge Forwards",
    description:
      "Built high-throughput REST and gRPC APIs, optimized database performance, and deployed services on AWS with Docker and CI/CD pipelines.",
    isExperience: true,
    logo: { url: profile.avatar },
  },
  {
    id: "3",
    badge: "2014 - 2016",
    title: "Software Engineer",
    subTitle: "Three Rivers Corporation",
    description:
      "Developed Python and Node.js backend services, integrated third-party APIs, and supported production deployments on Linux systems.",
    isExperience: true,
    logo: { url: profile.avatar },
  },
];

export const resumeEducation = [
  {
    id: "4",
    badge: "2010 - 2014",
    title: "Portland State University",
    subTitle: "Computer Science",
    description: "Focused on software engineering, algorithms, distributed systems, and database design.",
    isExperience: false,
    logo: { url: profile.avatar },
  },
];

export const skills = {
  coding: [
    { id: "1", field: "Go", value: "95" },
    { id: "2", field: "Python", value: "90" },
    { id: "3", field: "Node.js", value: "85" },
    { id: "4", field: "Docker", value: "90" },
  ],
  knowledge: [
    "REST & gRPC API Design",
    "Microservices Architecture",
    "Event-Driven Systems",
    "CI/CD & Infrastructure as Code",
    "Database Optimization",
    "AI/LLM Integration",
  ],
  development: [
    { id: "1", field: "AWS", value: "90" },
    { id: "2", field: "Kubernetes", value: "85" },
    { id: "3", field: "Terraform", value: "80" },
    { id: "4", field: "Kafka", value: "85" },
  ],
  languages: [{ id: "1", field: "English", value: "10" }],
};

export const statistics = [
  {
    id: "1",
    title: "years experience",
    info: "10+",
  },
  {
    id: "2",
    title: "hourly rate",
    info: "$85",
    externalLink: upworkProfileUrl,
  },
  {
    id: "3",
    title: "core stack",
    info: "Go & Python",
  },
  {
    id: "4",
    title: "upwork profile",
    info: "Hire Me",
    externalLink: upworkProfileUrl,
  },
];

export const quoteData = {
  id: "quote",
  quote:
    "Clean, maintainable code and full ownership from development to deployment — that is how I deliver production-ready backend systems.",
  userName: profile.name,
  userProfession: profile.title,
  userImage: { url: profile.avatar },
};
