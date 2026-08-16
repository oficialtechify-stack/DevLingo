import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function parseFallbackJob(jobInput: string) {
  const lower = jobInput.toLowerCase();
  
  let company = "Tech Enterprise";
  let roleTitle = "Senior Software Engineer";
  let level = "Senior";
  let techStack = ["TypeScript", "React", "Node.js", "Cloud Architecture", "System Design"];

  if (lower.includes("frontend") || lower.includes("front-end") || lower.includes("react") || lower.includes("vue") || lower.includes("next")) {
    roleTitle = "Senior Frontend / Fullstack Engineer";
    techStack = ["React 19", "TypeScript", "Next.js", "Tailwind CSS", "Web Vitals & Performance", "GraphQL"];
  } else if (lower.includes("backend") || lower.includes("back-end") || lower.includes("node") || lower.includes("python") || lower.includes("golang") || lower.includes("java")) {
    roleTitle = "Senior Backend & Distributed Systems Engineer";
    techStack = ["Node.js / Go", "PostgreSQL / Redis", "Microservices", "Kafka", "Docker & Kubernetes", "AWS"];
  } else if (lower.includes("mobile") || lower.includes("react-native") || lower.includes("flutter") || lower.includes("ios") || lower.includes("android")) {
    roleTitle = "Senior Mobile Engineer";
    techStack = ["React Native", "TypeScript", "Mobile CI/CD", "Native Modules", "Offline-First Sync"];
  } else if (lower.includes("ai") || lower.includes("ml") || lower.includes("data") || lower.includes("machine learning")) {
    roleTitle = "AI / Machine Learning Engineer";
    techStack = ["Python", "PyTorch", "LLM Fine-tuning", "RAG Architecture", "Vector Databases", "FastAPI"];
  } else if (lower.includes("devops") || lower.includes("sre") || lower.includes("cloud")) {
    roleTitle = "Senior Cloud & DevOps / SRE Engineer";
    techStack = ["Kubernetes", "Terraform", "AWS / GCP", "Prometheus & Grafana", "CI/CD Pipelines"];
  }

  // Extract possible company from URL or text
  if (lower.includes("google")) company = "Google";
  else if (lower.includes("meta") || lower.includes("facebook")) company = "Meta";
  else if (lower.includes("amazon") || lower.includes("aws")) company = "Amazon AWS";
  else if (lower.includes("netflix")) company = "Netflix";
  else if (lower.includes("stripe")) company = "Stripe";
  else if (lower.includes("nubank")) company = "Nubank";
  else if (lower.includes("uber")) company = "Uber";
  else if (lower.includes("microsoft")) company = "Microsoft";
  else if (lower.includes("spotify")) company = "Spotify";
  else if (lower.includes("vercel")) company = "Vercel";
  else if (lower.includes("airbnb")) company = "Airbnb";
  else if (lower.includes("atlassian")) company = "Atlassian";

  return {
    company,
    roleTitle,
    level,
    techStack,
    summary: `Vaga de alto impacto com foco em escalabilidade, arquitetura limpa e entregas de software em ambientes de alta disponibilidade internacional.`,
    responsibilities: [
      "Arquitetar soluções distribuídas com alta resiliência e baixa latência",
      "Liderar code reviews técnicos e propor padrões de engenharia em equipe global",
      "Colaborar em inglês com Product Managers, Designers e times de infraestrutura"
    ],
    keyTopics: [
      "System Design & Trade-offs (Escalabilidade vs Consistência)",
      "Performance Optimization & Profiling em Produção",
      "Experiência com Métricas STAR em Incidentes Reais"
    ],
    starTip: "Estruture suas respostas destacando a Situação (métrica inicial), Tarefa, Ação técnica específica e o Resultado quantificável (% de melhoria ou redução de custos).",
    firstQuestion: `Hello! Thank you for applying for the ${roleTitle} position at ${company}. To kick off our technical interview, could you walk me through a mission-critical system or feature you built recently, highlighting the key architectural decisions and performance trade-offs you had to navigate?`,
    sourceUrl: jobInput.startsWith("http") ? jobInput : undefined
  };
}

function getFallbackInterviewIntroduction(jobContext?: any): string {
  if (jobContext) {
    return `Hello! Welcome to your technical interview for the ${jobContext.roleTitle || 'Senior Engineer'} position at ${jobContext.company || 'our company'}.\n\n` +
      `I've reviewed your application and the job requirements for our ${jobContext.techStack?.join(', ') || 'tech stack'}.\n\n` +
      `${jobContext.firstQuestion || "To get started, could you introduce yourself and tell me about a complex technical challenge you solved in your recent work?"}`;
  }

  return (
    "Hello! Welcome to your technical interview. I'm a Senior Engineering Manager at a global tech company, and I'll be conducting your technical assessment today.\n\n" +
    "To start, could you introduce yourself and tell me about a complex project where you had to make critical architectural and performance trade-offs?"
  );
}

function generateFallbackResponse(userMessage: string, historyLength: number, jobContext?: any): string {
  const companyName = jobContext?.company || "our engineering team";
  const roleName = jobContext?.roleTitle || "Senior Developer";
  
  const responses = [
    (
      `That is a very structured explanation! Your grasp of technical constraints aligns well with what we look for at ${companyName}.\n\n` +
      "💡 *English Pro-Tip*: When discussing trade-offs, phrases like *'We evaluated eventual consistency vs strict ACID guarantees and prioritized low-latency reads'* highlight mature engineering seniority.\n\n" +
      `Follow-up technical question: In the context of ${roleName}, how do you approach automated testing and continuous deployment (CI/CD) to guarantee zero downtime during schema migrations?`
    ),
    (
      "Great response. Your systematic approach to problem solving is very clear.\n\n" +
      "💡 *English Pro-Tip*: Instead of saying *'I fixed the slow parts'*, use *'I profiled the execution bottlenecks using tracing tools and optimized the database query plans, reducing p99 latency by 35%'*.\n\n" +
      "System Design Question: If our traffic surges by 10x during an unexpected event, how would you design circuit breakers and fallback mechanisms to avoid cascading failures across our microservices?"
    ),
    (
      "Very insightful breakdown of circuit breaking and rate limiting strategies!\n\n" +
      "💡 *English Pro-Tip*: Terms like *'graceful degradation'*, *'backpressure handling'*, and *'idempotency keys'* add strong credibility in international interviews.\n\n" +
      "Behavioral / STAR Question: Can you describe a situation where you had a strong technical disagreement with a colleague or product lead? How did you build consensus without stalling delivery?"
    ),
    (
      "Outstanding communication. Demonstrating collaborative leadership alongside deep technical craft is exactly what sets apart high-impact engineers.\n\n" +
      "💡 *English Pro-Tip*: Conclude STAR stories with the long-term impact on the team: *'This not only unblocked the milestone but also established an ADR framework adopted by three adjacent squads.'*\n\n" +
      `We've covered a lot of ground today! Do you have any questions for me about our tech stack, team rituals, or engineering roadmap at ${companyName}?`
    ),
  ];

  const index = Math.min(historyLength, responses.length - 1);
  return responses[index];
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // Leads in-memory and disk backup
  const leadsFilePath = path.join(process.cwd(), "leads-data.json");
  let leadsList: any[] = [];

  try {
    const fs = await import("fs");
    if (fs.existsSync(leadsFilePath)) {
      const data = fs.readFileSync(leadsFilePath, "utf-8");
      leadsList = JSON.parse(data);
    }
  } catch (err) {
    console.warn("Could not load leads file:", err);
  }

  // API Routes for Leads (Pré-Registro)
  app.post("/api/leads", async (req, res) => {
    try {
      const { name, email, phone, area, knownTechs, customTechs, hasCourse, courseDetails, jobContext } = req.body;
      
      if (!name || !email || !phone) {
        return res.status(400).json({ error: "Nome, e-mail e telefone são obrigatórios" });
      }

      const newLead = {
        id: "lead_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        phone: String(phone).trim(),
        area: String(area || "Geral").trim(),
        knownTechs: Array.isArray(knownTechs) ? knownTechs : [],
        customTechs: customTechs ? String(customTechs).trim() : "",
        hasCourse: hasCourse ? String(hasCourse).trim() : "Não informado",
        courseDetails: courseDetails ? String(courseDetails).trim() : "",
        jobContext: jobContext || null,
        createdAt: new Date().toISOString(),
        status: "novo",
      };

      leadsList.unshift(newLead);

      try {
        const fs = await import("fs");
        fs.writeFileSync(leadsFilePath, JSON.stringify(leadsList, null, 2), "utf-8");
      } catch (saveErr) {
        console.warn("Could not persist lead to disk:", saveErr);
      }

      return res.status(201).json({ success: true, lead: newLead, totalLeads: leadsList.length });
    } catch (err: any) {
      console.error("Error creating lead:", err);
      return res.status(500).json({ error: "Falha ao salvar pré-registro" });
    }
  });

  app.get("/api/leads", (req, res) => {
    return res.json({
      leads: leadsList,
      total: leadsList.length,
      timestamp: new Date().toISOString(),
    });
  });

  app.delete("/api/leads/:id", async (req, res) => {
    const { id } = req.params;
    leadsList = leadsList.filter((l) => l.id !== id);
    try {
      const fs = await import("fs");
      fs.writeFileSync(leadsFilePath, JSON.stringify(leadsList, null, 2), "utf-8");
    } catch (saveErr) {
      console.warn("Could not persist leads to disk after deletion:", saveErr);
    }
    return res.json({ success: true, remaining: leadsList.length });
  });

  // API Routes
  app.post("/api/gemini/analyze-job", async (req, res) => {
    const { jobInput } = req.body;
    if (!jobInput || typeof jobInput !== "string") {
      return res.status(400).json({ error: "Parâmetro jobInput inválido" });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.json(parseFallbackJob(jobInput));
    }

    const isUrl = /^https?:\/\//i.test(jobInput.trim());

    try {
      const prompt = isUrl
        ? `
        O usuário forneceu o seguinte link/URL de uma vaga de tecnologia (ex: LinkedIn, Indeed, Greenhouse, Lever, etc.):
        URL: "${jobInput.trim()}"

        Utilize sua capacidade de pesquisa na web (Google Search grounding) e conhecimento do mercado para investigar ou analisar a vaga descrita nesta URL (empresa, cargo, requisitos técnicos, nível de senioridade, cultura da empresa).
        
        Monte uma preparação de entrevista completa em inglês para esta vaga de Big Tech / startup internacional.
        Retorne estritamente um objeto JSON com o formato:
        {
          "company": "Nome da empresa (ex: Google, Stripe, Nubank, Vercel, Uber)",
          "roleTitle": "Título do cargo em inglês (ex: Senior Fullstack Engineer)",
          "level": "Nível do cargo (ex: Junior, Pleno, Senior, Staff, Principal, Tech Lead)",
          "techStack": ["Tecnologia 1", "Tecnologia 2", "Tecnologia 3", "Tecnologia 4", "Tecnologia 5"],
          "summary": "Resumo em Português em 2 frases sobre os desafios principais da vaga e escopo de impacto",
          "responsibilities": [
            "Responsabilidade principal 1 em português",
            "Responsabilidade principal 2 em português",
            "Responsabilidade principal 3 em português"
          ],
          "keyTopics": [
            "Tópico técnico 1 (ex: Distributed Transactions & Idempotency)",
            "Tópico técnico 2 (ex: Microfrontends & Core Web Vitals)",
            "Tópico comportamental / STAR (ex: Cross-functional alignment)"
          ],
          "starTip": "Dica prática em português de resposta usando o método STAR para esta vaga específica",
          "firstQuestion": "Primeira pergunta técnica introdutória em INGLÊS que o recrutador/Engineering Manager sênior fará para esta vaga específica",
          "sourceUrl": "${jobInput.trim()}"
        }
      `
        : `
        O usuário escreveu o seguinte texto livre descrevendo uma vaga de emprego ou cargo de tecnologia dos sonhos:
        """${jobInput.trim()}"""

        Analise cuidadosamente o que o usuário escreveu. Busque na internet referências de mercado, requisitos reais de Big Techs e padrões da indústria para este tipo de cargo/stack.
        
        Extraia a empresa (ou defina uma Big Tech líder desse segmento se não informada), o cargo exato, nível de senioridade, a stack tecnológica necessária, os tópicos quentes de System Design / Behavioral Fit e a primeira pergunta real em inglês.

        Retorne estritamente um objeto JSON com o formato:
        {
          "company": "Nome da empresa citada ou sugerida (ex: Stripe, Netflix, Google, Nubank, Uber)",
          "roleTitle": "Título do cargo em inglês (ex: Senior Backend Engineer)",
          "level": "Nível do cargo (ex: Junior, Pleno, Senior, Staff, Tech Lead)",
          "techStack": ["Tecnologia 1", "Tecnologia 2", "Tecnologia 3", "Tecnologia 4", "Tecnologia 5"],
          "summary": "Resumo em Português em 2 frases sobre os desafios principais e escopo",
          "responsibilities": [
            "Responsabilidade principal 1 em português",
            "Responsabilidade principal 2 em português",
            "Responsabilidade principal 3 em português"
          ],
          "keyTopics": [
            "Tópico técnico 1 (ex: System Design & Caching)",
            "Tópico técnico 2 (ex: High-Throughput Pipelines)",
            "Tópico comportamental / STAR"
          ],
          "starTip": "Dica prática em português de como formular respostas no método STAR para esta vaga",
          "firstQuestion": "Primeira pergunta técnica em INGLÊS que o recrutador técnico fará para iniciar a entrevista",
          "sourceUrl": ""
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "Você é um especialista internacional em contratação e recrutamento de engenharia de software para Big Techs e startups globais com acesso a pesquisa e padrões do setor.",
        },
      });

      const text = response.text?.trim();
      if (!text) {
        return res.json(parseFallbackJob(jobInput));
      }

      const parsed = JSON.parse(text);
      return res.json({
        ...parsed,
        sourceUrl: isUrl ? jobInput.trim() : undefined,
      });
    } catch (err: any) {
      console.warn("Error calling Gemini for job analysis, falling back:", err?.message);
      return res.json(parseFallbackJob(jobInput));
    }
  });

  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      const ai = getAIClient();

      if (!ai) {
        return res.json({ text: getFallbackInterviewIntroduction() });
      }

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            systemInstruction: systemInstruction,
          },
        });
        return res.json({ text: response.text || getFallbackInterviewIntroduction() });
      } catch (apiErr: any) {
        console.warn("Gemini API call failed, using high-quality fallback:", apiErr?.message);
        return res.json({ text: getFallbackInterviewIntroduction() });
      }
    } catch (error: any) {
      console.error("Gemini API route error:", error);
      res.json({ text: getFallbackInterviewIntroduction() });
    }
  });

  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, history, systemInstruction, jobContext } = req.body;
      const ai = getAIClient();

      if (!ai) {
        const historyCount = Array.isArray(history) ? Math.floor(history.length / 2) : 0;
        return res.json({ text: generateFallbackResponse(message, historyCount, jobContext) });
      }

      try {
        const chat = ai.chats.create({
          model: "gemini-3.7-flash",
          config: {
            systemInstruction: systemInstruction,
          },
          history: history || [],
        });
        const response = await chat.sendMessage({ message });
        return res.json({ text: response.text });
      } catch (apiErr: any) {
        console.warn("Gemini Chat call failed, using high-quality fallback:", apiErr?.message);
        const historyCount = Array.isArray(history) ? Math.floor(history.length / 2) : 0;
        return res.json({ text: generateFallbackResponse(message, historyCount, jobContext) });
      }
    } catch (error: any) {
      console.error("Gemini Chat route error:", error);
      const historyCount = Array.isArray(req.body?.history) ? Math.floor(req.body.history.length / 2) : 0;
      res.json({ text: generateFallbackResponse(req.body?.message || "", historyCount, req.body?.jobContext) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
