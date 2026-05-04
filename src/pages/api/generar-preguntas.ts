import type { NextApiRequest, NextApiResponse } from "next";

type PreguntaGenerada = {
  numero_pregunta: number;
  texto_pregunta: string;
  respuestas: string[];
  respuesta_correcta: number;
};

type RequestBody = {
  libroTitulo: string;
  libroContenido: string;
  quizId: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { libroTitulo, libroContenido, quizId }: RequestBody = req.body;

    if (!libroTitulo || !libroContenido || !quizId) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    // Validar que el contenido no esté vacío
    if (libroContenido.trim().length === 0) {
      return res.status(400).json({ error: "El libro no tiene contenido" });
    }

    // Preparar el prompt para la IA
    const prompt = `Eres un experto en crear cuestionarios educativos de alta calidad. 

Analiza el siguiente contenido del libro "${libroTitulo}" y genera EXACTAMENTE 9 preguntas de comprensión basadas en el contenido real del libro.

CONTENIDO DEL LIBRO:
"""
${libroContenido}
"""

INSTRUCCIONES CRÍTICAS:
1. Las preguntas DEBEN estar basadas en información específica del contenido del libro
2. NO inventes información que no esté en el contenido
3. Las preguntas deben evaluar comprensión profunda, no solo memoria
4. Cada pregunta debe tener EXACTAMENTE 5 opciones de respuesta
5. SOLO UNA respuesta debe ser correcta
6. Las respuestas incorrectas deben ser plausibles pero claramente incorrectas
7. Usa citas o referencias específicas del texto cuando sea apropiado
8. Varía la dificultad: 3 fáciles, 3 medias, 3 difíciles

Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura exacta:
{
  "preguntas": [
    {
      "numero_pregunta": 1,
      "texto_pregunta": "Pregunta específica basada en el contenido",
      "respuestas": ["Opción 1", "Opción 2", "Opción 3", "Opción 4", "Opción 5"],
      "respuesta_correcta": 1
    }
  ]
}

IMPORTANTE: 
- NO incluyas markdown, explicaciones ni texto adicional
- SOLO el objeto JSON
- Asegúrate de que respuesta_correcta sea un número entre 1 y 5`;

    // Llamar a la API de OpenAI
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Eres un experto en educación que crea cuestionarios de alta calidad basados en contenido específico. Siempre respondes SOLO con JSON válido, sin markdown ni explicaciones."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error("OpenAI API error:", errorData);
      return res.status(500).json({ error: "Error al comunicarse con OpenAI" });
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: "No se recibió respuesta de la IA" });
    }

    // Limpiar el contenido (remover markdown si existe)
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    // Parsear la respuesta JSON
    const parsedResponse = JSON.parse(cleanContent);
    const preguntas: PreguntaGenerada[] = parsedResponse.preguntas;

    // Validar que se generaron exactamente 9 preguntas
    if (!preguntas || preguntas.length !== 9) {
      return res.status(500).json({ 
        error: `Se esperaban 9 preguntas, se recibieron ${preguntas?.length || 0}` 
      });
    }

    // Validar estructura de cada pregunta
    for (const pregunta of preguntas) {
      if (!pregunta.texto_pregunta || 
          !Array.isArray(pregunta.respuestas) || 
          pregunta.respuestas.length !== 5 ||
          typeof pregunta.respuesta_correcta !== "number" ||
          pregunta.respuesta_correcta < 1 || 
          pregunta.respuesta_correcta > 5) {
        return res.status(500).json({ 
          error: "Formato de pregunta inválido generado por la IA" 
        });
      }
    }

    // Guardar las preguntas en la base de datos
    const { createPregunta } = await import("@/services/quizService");
    
    for (const pregunta of preguntas) {
      await createPregunta(
        quizId,
        pregunta.numero_pregunta,
        pregunta.texto_pregunta,
        pregunta.respuestas,
        pregunta.respuesta_correcta
      );
    }

    return res.status(200).json({ 
      success: true, 
      preguntas: preguntas,
      mensaje: "Preguntas generadas y guardadas exitosamente"
    });

  } catch (error) {
    console.error("Error generating questions:", error);
    return res.status(500).json({ error: "Error al generar preguntas" });
  }
}