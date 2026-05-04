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

    // Validaciones
    if (!libroTitulo || !libroContenido || !quizId) {
      console.error("Missing required fields:", { libroTitulo: !!libroTitulo, libroContenido: !!libroContenido, quizId: !!quizId });
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    if (libroContenido.trim().length === 0) {
      return res.status(400).json({ error: "El libro no tiene contenido" });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return res.status(500).json({ error: "API key de OpenAI no configurada. Configúrala en las variables de entorno del proyecto." });
    }

    console.log("Generating questions for book:", libroTitulo);
    console.log("Content length:", libroContenido.length);

    // Preparar el prompt para la IA
    const prompt = `Eres un experto en crear cuestionarios educativos de alta calidad. 

IMPORTANTE: Debes responder ÚNICAMENTE con un objeto JSON válido, sin texto adicional antes o después.

Analiza el siguiente contenido del libro "${libroTitulo}" y genera exactamente 9 preguntas de comprensión profunda basadas en el contenido real:

CONTENIDO DEL LIBRO:
${libroContenido.substring(0, 8000)}

INSTRUCCIONES:
1. Lee y analiza el contenido del libro cuidadosamente
2. Identifica los conceptos clave, eventos importantes, personajes principales y temas centrales
3. Genera 9 preguntas que evalúen la comprensión profunda del contenido
4. Para cada pregunta, crea 5 opciones de respuesta plausibles
5. Solo UNA opción debe ser correcta
6. Las preguntas deben ser específicas del contenido, no genéricas

FORMATO DE RESPUESTA (JSON):
{
  "preguntas": [
    {
      "numero_pregunta": 1,
      "texto_pregunta": "Pregunta específica sobre el contenido",
      "respuestas": ["Opción 1", "Opción 2", "Opción 3", "Opción 4", "Opción 5"],
      "respuesta_correcta": 1
    }
  ]
}

Responde SOLO con el JSON, sin explicaciones adicionales.`;

    // Llamar a la API de OpenAI
    console.log("Calling OpenAI API...");
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
            content: "Eres un experto en educación que crea cuestionarios de alta calidad. Respondes únicamente en formato JSON válido."
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
      return res.status(500).json({ 
        error: `Error de OpenAI: ${errorData.error?.message || "Error desconocido"}` 
      });
    }

    const openaiData = await openaiResponse.json();
    console.log("OpenAI response received");
    
    const content = openaiData.choices[0]?.message?.content;

    if (!content) {
      console.error("No content in OpenAI response:", openaiData);
      return res.status(500).json({ error: "No se recibió respuesta de la IA" });
    }

    console.log("Raw AI response:", content.substring(0, 200));

    // Limpiar el contenido (remover markdown si existe)
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    // Parsear la respuesta JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanContent);
      console.log("Parsed response successfully, questions count:", parsedResponse.preguntas?.length);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      console.error("Content received:", cleanContent);
      return res.status(500).json({ 
        error: "La IA no devolvió un JSON válido. Intenta de nuevo." 
      });
    }

    const preguntas: PreguntaGenerada[] = parsedResponse.preguntas;

    if (!preguntas || preguntas.length === 0) {
      console.error("No questions in parsed response");
      return res.status(500).json({ error: "No se generaron preguntas" });
    }

    // Validar que tenemos exactamente 9 preguntas
    if (preguntas.length !== 9) {
      console.warn(`Expected 9 questions, got ${preguntas.length}`);
    }

    // Guardar las preguntas en la base de datos
    console.log("Saving questions to database...");
    const { createPregunta } = await import("@/services/quizService");
    
    const savedCount = 0;
    for (let i = 0; i < preguntas.length; i++) {
      const pregunta = preguntas[i];
      
      // Validar estructura de la pregunta
      if (!pregunta.texto_pregunta || !pregunta.respuestas || pregunta.respuestas.length !== 5) {
        console.error(`Invalid question structure at index ${i}:`, pregunta);
        continue;
      }

      const { error } = await createPregunta(
        quizId,
        pregunta.numero_pregunta,
        pregunta.texto_pregunta,
        pregunta.respuestas,
        pregunta.respuesta_correcta
      );
      
      if (error) {
        console.error(`Error saving question ${pregunta.numero_pregunta}:`, error);
        return res.status(500).json({ 
          error: `Error al guardar pregunta ${pregunta.numero_pregunta}: ${error.message}` 
        });
      }
    }

    console.log(`Successfully saved ${preguntas.length} questions`);

    return res.status(200).json({ 
      success: true, 
      preguntas: preguntas,
      mensaje: `${preguntas.length} preguntas generadas y guardadas exitosamente`
    });

  } catch (error) {
    console.error("Error generating questions:", error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : "Error al generar preguntas" 
    });
  }
}