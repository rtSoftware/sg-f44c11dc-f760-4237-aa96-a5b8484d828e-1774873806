import type { NextApiRequest, NextApiResponse } from "next";

type PreguntaGenerada = {
  texto_pregunta: string;
  respuestas: string[];
  respuesta_correcta: number;
};

type ResponseData = {
  preguntas?: PreguntaGenerada[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { contenido, cantidad = 9 } = req.body;

  if (!contenido || typeof contenido !== "string") {
    return res.status(400).json({ error: "Contenido inválido" });
  }

  try {
    // Aquí integraremos OpenAI o similar
    // Por ahora, retornamos un mock para que la interfaz funcione
    
    const preguntasMock: PreguntaGenerada[] = Array.from({ length: cantidad }, (_, i) => ({
      texto_pregunta: `Pregunta ${i + 1} generada automáticamente basada en el contenido del libro`,
      respuestas: [
        `Respuesta A para pregunta ${i + 1}`,
        `Respuesta B para pregunta ${i + 1}`,
        `Respuesta C para pregunta ${i + 1}`,
        `Respuesta D para pregunta ${i + 1}`,
        `Respuesta E para pregunta ${i + 1}`,
      ],
      respuesta_correcta: Math.floor(Math.random() * 5) + 1,
    }));

    return res.status(200).json({ preguntas: preguntasMock });
  } catch (error) {
    console.error("Error generating questions:", error);
    return res.status(500).json({ error: "Error al generar preguntas" });
  }
}