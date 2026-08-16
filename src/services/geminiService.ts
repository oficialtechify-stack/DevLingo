import { JobAnalysis, ChatMessage } from '../types';

export type { ChatMessage, JobAnalysis };

export const generateContent = async (prompt: string | any, systemInstruction?: string) => {
  const response = await fetch("/api/gemini/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, systemInstruction }),
  });
  if (!response.ok) throw new Error("Failed to generate content");
  return await response.json();
};

export const sendChatMessage = async (message: string, history: ChatMessage[], systemInstruction?: string) => {
  const response = await fetch("/api/gemini/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, systemInstruction }),
  });
  if (!response.ok) throw new Error("Failed to send chat message");
  return await response.json();
};

export const analyzeJobPosition = async (jobInput: string): Promise<JobAnalysis> => {
  const response = await fetch("/api/gemini/analyze-job", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobInput }),
  });
  if (!response.ok) {
    throw new Error("Falha ao analisar a vaga do LinkedIn");
  }
  return await response.json();
};
