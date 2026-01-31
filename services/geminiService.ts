import { GoogleGenAI } from "@google/genai";
import { MenuItem } from "../types";

let ai: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!ai) {
    // Guidelines require strictly using process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' directly
    // and assuming it is pre-configured and valid.
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' });
  }
  return ai;
};

export const getMenuRecommendation = async (userQuery: string, menuItems: MenuItem[]): Promise<string> => {
  const client = getAIClient();
  
  if (!client) {
    return "Lo siento, el servicio de asistente inteligente no estÃ¡ disponible actualmente (Falta API Key).";
  }

  const menuContext = menuItems.map(item => `${item.name} (${item.category}): ${item.description}`).join('\n');

  const systemInstruction = `
    Eres un camarero inteligente y amable en el restaurante "Sabor del Magreb".
    AquÃ­ estÃ¡ nuestro menÃº:
    ${menuContext}

    Tu tarea es ayudar al cliente a elegir una comida basada en su solicitud.
    - Habla en espaÃ±ol con un tono cÃ¡lido y acogedor (puedes usar jerga marroquÃ­ ligera si aplica, como 'amigo' o 'bienvenido').
    - Sugiere solo una o dos comidas.
    - Explica por quÃ© elegiste esa comida basÃ¡ndote en el deseo del cliente (ej: si quiere algo picante, sugiere los Tacos).
    - SÃ© breve (no mÃ¡s de 50 palabras).
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

    return response.text || "No pude encontrar una recomendaciÃ³n exacta, Â¡pero nuestro menÃº estÃ¡ lleno de opciones deliciosas!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Tuve un pequeÃ±o problema de conexiÃ³n, Â¡puedes explorar el menÃº tÃº mismo!";
  }
};