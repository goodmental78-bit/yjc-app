
import { GoogleGenAI, Type } from "@google/genai";

// Always use the standard initialization format with process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSpiritualInsight = async (lessonTitle: string, quizScore: number) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `목자훈련 교육생이 '${lessonTitle}' 강의를 듣고 퀴즈에서 ${quizScore}점을 받았습니다. 
      이 교육생에게 따뜻한 격려의 말과 함께, 일상에서 목자의 마음을 어떻게 실천할 수 있을지 
      짧고 은혜로운 조언(3문장 내외)을 해주세요. 말투는 정중하고 부드러운 한국어 교회 톤으로 해주세요.`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "오늘 하루도 주님의 은혜 안에서 승리하시길 기도합니다.";
  }
};