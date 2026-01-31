import { GoogleGenAI } from "@google/genai";
import { MenuItem } from "../types";

let ai: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!ai) {
    // Guidelines require strictly using process.env.API_KEY directly
    // and assuming it is pre-configured and valid.
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const getMenuRecommendation = async (userQuery: string, menuItems: MenuItem[]): Promise<string> => {
  const client = getAIClient();
  
  if (!client) {
    return "Lo siento, el servicio de asistente inteligente no está disponible actualmente (Falta API Key).";
  }

  const menuContext = menuItems.map(item => `${item.name} (${item.category}): ${item.description}`).join('\n');

  const systemInstruction = `
    Eres un camarero inteligente y amable en el restaurante "Sabor del Magreb".
    Aquí está nuestro menú:
    ${menuContext}

    Tu tarea es ayudar al cliente a elegir una comida basada en su solicitud.
    - Habla en español con un tono cálido y acogedor (puedes usar jerga marroquí ligera si aplica, como 'amigo' o 'bienvenido').
    - Sugiere solo una o dos comidas.
    - Explica por qué elegiste esa comida basándote en el deseo del cliente (ej: si quiere algo picante, sugiere los Tacos).
    - Sé breve (no más de 50 palabras).
    - Usa algunos emojis apropiados para la comida.
  `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "No pude encontrar una recomendación exacta, ¡pero nuestro menú está lleno de opciones deliciosas!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Tuve un pequeño problema de conexión, ¡puedes explorar el menú tú mismo!";
  }
};