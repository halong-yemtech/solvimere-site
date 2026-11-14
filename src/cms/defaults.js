import { team, avatars, insights, logos, testimonials, works } from "../data.js";
import {
  aboutStats,
  aboutValues,
  articles,
  caseStats,
  caseStudies,
  featuredArticle,
  industries,
  industryResults,
  industryStrengths,
  journey,
  platformPoints,
  presence,
  productStats,
  products,
  resourceTopics,
  solutionAdvantages,
  solutionNeeds,
  solutions,
} from "../siteContent.js";

export const pageDefaults = {
  home: {
    hero: {
      eyebrow: "Software studio",
      title: "Intelligent Software,\nBuilt For Production",
      emphasis: "Production",
      lede: "We design, build, and operate custom platforms, applied AI, and computer vision that hold up on the floor, not just in a demo.",
    },
    photos: {
      hero: "/images/photos/group.png",
      aboutLeft: "/images/photos/about-left.webp",
      aboutRight: "/images/photos/about-right.webp",
      engineer: "/images/photos/engineer.png",
      process: "/images/photos/work.webp",
      expertise: "/images/photos/laptop.jpg",
      session: "/images/photos/session.jpg",
      cta: "/images/photos/cta.jpg",
    },
    avatars: avatars.map((image) => ({ image })),
    logos: logos.map(([file, name]) => ({ name, image: `/images/logos/${file}.png` })),
    works,
    testimonials,
    insights,
  },
  settings: {
    email: "hello@solvimere.com",
    phone: "+1 (620) 229-7727",
    address: "Tampa, FL 33602, United States",
    siteName: "Solvimere",
    logo: "/images/logo-white.png",
    tagline:
      "A software studio for custom platforms, applied AI, and computer vision. Built to last in production, not just in a demo.",
  },
  team: {
    hero: {
      eyebrow: "Our team",
      title: "Meet the people behind Solvimere",
      emphasis: "Solvimere",
      lede: "A team of developers, designers, and AI specialists building intelligent products and automation systems that help businesses grow faster, smarter, and with more control.",
    },
    members: team,
  },
  products: {
    hero: {
      eyebrow: "Our products",
      title: "Smarter technology for every part of your business.",
      emphasis: "your business.",
      lede: "Explore the Solvimere platform suite — integrated AI products built to automate operations, deepen customer intelligence, and turn data into decisive action.",
    },
    stats: productStats,
    items: products,
  },
  solutions: {
    hero: {
      eyebrow: "Solutions",
      title: "Tailored AI solutions for real business impact.",
      emphasis: "real business impact.",
      lede: "Solvimere helps businesses turn AI, automation, and data into practical solutions. We design and build intelligent systems that solve real challenges and drive measurable growth.",
    },
    items: solutions,
    needs: solutionNeeds,
    advantages: solutionAdvantages,
    platformPoints,
    photos: {
      feature: "/images/photos/insight-product.jpg",
    },
  },
  industries: {
    hero: {
      eyebrow: "Industries",
      title: "Industry-specific solutions for a smarter tomorrow.",
      emphasis: "smarter tomorrow.",
      lede: "Every industry faces unique challenges. Solvimere builds AI-powered software, automation systems, and digital solutions tailored to the work — helping you work smarter, serve better, and grow faster.",
    },
    items: industries,
    strengths: industryStrengths,
    results: industryResults,
  },
  "case-studies": {
    hero: {
      eyebrow: "Case studies",
      title: "See how smart technology drives real business results.",
      emphasis: "real business results.",
      lede: "From customer experience to operational intelligence, Solvimere helps businesses turn complex challenges into measurable outcomes across every stage of growth.",
    },
    stats: caseStats,
    studies: caseStudies,
  },
  resources: {
    hero: {
      eyebrow: "Resources",
      title: "Insights and expertise for a smarter digital future.",
      emphasis: "smarter digital future.",
      lede: "Articles, guides, and notes on AI, automation, software, and digital transformation — practical material for teams that need to operate faster.",
    },
    topics: resourceTopics,
    featured: featuredArticle,
    articles,
  },
  about: {
    hero: {
      eyebrow: "About Solvimere",
      title: "Technology built around possibility.",
      emphasis: "possibility.",
      lede: "Solvimere is a technology company based in Singapore, bringing together developers, designers, and AI specialists to create intelligent digital products and automation systems that help businesses grow faster, smarter, and with more control.",
    },
    mission:
      "To build intelligent digital solutions that help businesses grow faster, smarter, and more efficiently.",
    vision: "To create a future where technology empowers people and businesses worldwide.",
    values: aboutValues,
    stats: aboutStats,
    journey,
    presence,
    photos: {
      portrait: "/images/photos/about-left.webp",
      presence: "/images/photos/about-right.webp",
    },
  },
};

export const pageTitles = {
  home: "Home",
  settings: "Site settings",
  team: "Team",
  products: "Products",
  solutions: "Solutions",
  industries: "Industries",
  "case-studies": "Case studies",
  resources: "Resources",
  about: "About",
};
