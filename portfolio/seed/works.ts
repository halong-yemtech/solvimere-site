import { githubProfileUrl, upworkProfileUrl } from "./profile";

export const workTabs = ["All", "AI", "Data", "Automation"];

// Folder names under public/works (kept URL- and Windows-safe: no spaces, ":" or "&")
const aiScribeFolder = "ai-medical-scribe";
const carbonFolder = "carbon-footprint-calculator";
const manufacturingFolder = "manufacturing-dashboard";

function workImage(folder: string, file: string) {
  return { url: `/works/${folder}/${file}` };
}

function workImages(folder: string, files: string[]) {
  return files.map((file) => workImage(folder, file));
}

export const works = [
  {
    id: "1",
    title: "AI Medical Scribe for Clinicians: Automating Patient Documentation",
    images: [workImage(aiScribeFolder, "01.png")],
    workTabs: [{ tab: "AI" }, { tab: "All" }],
  },
  {
    id: "2",
    title: "Carbon Emission & Footprint Calculator for Sustainable Decisions",
    images: [workImage(carbonFolder, "01.png")],
    workTabs: [{ tab: "Data" }, { tab: "All" }],
  },
  {
    id: "3",
    title: "Manufacturing Production Dashboard & Factory Automation",
    images: [workImage(manufacturingFolder, "thumbnail.png")],
    workTabs: [{ tab: "Automation" }, { tab: "All" }],
  },
];

export const workDetails = {
  "1": {
    id: "1",
    title: "AI Medical Scribe for Clinicians: Automating Patient Documentation",
    description: `Worked with **Heidi Health** to develop an AI-powered medical scribe that assists clinicians by automating patient encounter documentation. The tool listens to doctor-patient conversations in real time and generates accurate medical notes, allowing clinicians to focus on care instead of administrative work.

The scribe uses **NLP** and speech recognition to transcribe and understand medical conversations, ensuring notes are accurate and compliant with medical standards.

**Key technologies:**
- AI & Machine Learning for decision-making and note generation
- NLP for medical terminology and context
- Speech recognition for real-time transcription
- Cloud computing for scalable EHR integration
- Python & TensorFlow for model development

**My role:**
- Developed and optimized NLP models for accurate medical note generation
- Integrated speech recognition for real-time doctor-patient transcription
- Ensured seamless cloud integration for scalability and security`,
    images: workImages(aiScribeFolder, [
      "01.png",
      "02.png",
      "03.png",
      "04.png",
      "05.png",
    ]),
    workUrl: upworkProfileUrl,
    githubUrl: githubProfileUrl,
    clientName: "Heidi Health",
    ownerName: "Anthony Scott",
    techStack: [
      "Python",
      "PyTorch",
      "NLP",
      "LLM",
      "Node.js",
      "React",
      "AWS",
    ],
    userActions: [
      "NLP Model Development",
      "Speech Recognition Integration",
      "Cloud Deployment",
    ],
    date: new Date("2024-08-01"),
  },
  "2": {
    id: "2",
    title: "Carbon Emission & Footprint Calculator for Sustainable Decisions",
    description: `Worked with **Kyogreen** to build a carbon emission and footprint calculator that helps individuals and organizations measure and reduce environmental impact. The tool analyzes inputs such as energy consumption, transportation, and waste to calculate total carbon emissions and provide actionable sustainability insights.

**Key technologies:**
- AI & machine learning for predictive environmental impact modeling
- Data analytics for accurate footprint calculations
- Python for backend algorithms and calculation logic
- Cloud computing for scalable deployment and storage

**My role:**
- Built machine learning models to predict and calculate carbon footprints
- Created data processing pipelines for environmental data analysis
- Ensured scalable, reliable cloud-based deployment`,
    images: workImages(carbonFolder, ["01.png", "02.png", "03.png", "04.png"]),
    workUrl: upworkProfileUrl,
    githubUrl: githubProfileUrl,
    clientName: "Kyogreen",
    ownerName: "Anthony Scott",
    techStack: [
      "React",
      "Node.js",
      "MongoDB",
      "PyTorch",
      "Machine Learning",
      "NLP",
    ],
    userActions: [
      "ML Model Development",
      "Data Pipeline Engineering",
      "Cloud Deployment",
    ],
    date: new Date("2024-05-15"),
  },
  "3": {
    id: "3",
    title: "Manufacturing Production Dashboard & Factory Automation",
    description: `Designed and implemented an **automated production monitoring system** that collects data from multiple sources, processes it in real time, and delivers live operational dashboards to production managers and business stakeholders.

**The challenge:**
- Production data scattered across multiple spreadsheets
- Manual daily reporting consuming several hours
- No real-time visibility into machine performance
- Inventory shortages causing production delays
- Quality issues identified too late
- Difficult for management to monitor KPIs across departments

**My role:** Project management, system design, and end-to-end implementation of the automation and reporting workflow.`,
    images: [workImage(manufacturingFolder, "thumbnail.png")],
    workUrl: upworkProfileUrl,
    githubUrl: githubProfileUrl,
    clientName: "Manufacturing Client",
    ownerName: "Anthony Scott",
    techStack: ["n8n", "PostgreSQL", "Power BI", "REST API", "Slack", "Docker"],
    userActions: [
      "Project Management",
      "Dashboard Design",
      "Factory Automation",
    ],
    date: new Date("2024-02-10"),
  },
};

export function getWorkById(id: keyof typeof workDetails) {
  return workDetails[id];
}
