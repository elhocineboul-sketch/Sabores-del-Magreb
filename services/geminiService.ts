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
    return "عذراً، خدمة المساعد الذكي غير متوفرة حالياً (مفتاح API مفقود).";
  }

  const menuContext = menuItems.map(item => `${item.name} (${item.category}): ${item.description}`).join('\n');

  const systemInstruction = `
    أنت نادل ذكي وودود في مطعم "Sabores del Magreb".
    هذه هي قائمة الطعام لدينا:
    ${menuContext}

    مهمتك هي مساعدة العميل في اختيار وجبة بناءً على طلبه.
    - تحدث باللغة العربية بلهجة ودودة ومرحبة.
    - اقترح وجبة أو وجبتين فقط.
    - اشرح لماذا اخترت هذه الوجبة بناءً على رغبة العميل (مثلاً: إذا طلب شيئاً حاراً، اقترح التاكوس).
    - كن مختصراً (لا تتجاوز 50 كلمة).
    - استخدم بعض الرموز التعبيرية (emojis) المناسبة للطعام.
  `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "لم أتمكن من العثور على توصية مناسبة، لكن القائمة مليئة بالخيارات اللذيذة!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "واجهت مشكلة بسيطة في الاتصال، يمكنك تصفح القائمة بنفسك!";
  }
};