import type { NextApiRequest, NextApiResponse } from "next";

interface PreguntaGenerada {
  texto_pregunta: string;
  respuestas: string[];
  respuesta_correcta: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { contenido, cantidad = 9 } = req.body;

  if (!contenido || typeof contenido !== "string") {
    return res.status(400).json({ error: "El contenido del libro es requerido" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ 
      error: "API key de OpenAI no configurada. Agrega OPENAI_API_KEY en .env.local" 
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Eres un experto en crear preguntas de comprensión de lectura. 
Genera preguntas de opción múltiple basadas en el contenido proporcionado.
Cada pregunta debe tener exactamente 5 opciones de respuesta.
Responde ÚNICAMENTE con un objeto JSON válido en el formato especificado, sin texto adicional.`
          },
          {
            role: "user",
            content: `Basándote en el siguiente contenido, genera ${cantidad} preguntas de comprensión de lectura.

CONTENIDO:
${contenido.substring(0, 8000)}

Genera exactamente ${cantidad} preguntas y responde SOLO con este formato JSON exacto:
{
  "preguntas": [
    {
      "numero_pregunta": 1,
      "texto_pregunta": "¿Pregunta aquí?",
      "respuestas": [
        "Respuesta correcta",
        "Respuesta incorrecta 1",
        "Respuesta incorrecta 2",
        "Respuesta incorrecta 3",
        "Respuesta incorrecta 4"
      ],
      "respuesta_correcta": 1
    }
  ]
}

IMPORTANTE:
- Cada pregunta debe tener exactamente 5 opciones
- La respuesta_correcta es un número del 1 al 5
- La primera opción (índice 1) es la correcta en el ejemplo
- Las preguntas deben evaluar comprensión profunda del contenido
- No incluyas texto adicional, solo el JSON`
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error de OpenAI:", errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const contenidoRespuesta = data.choices[0]?.message?.content;

    if (!contenidoRespuesta) {
      throw new Error("No se recibió respuesta de OpenAI");
    }

    let preguntasGeneradas;
    try {
      const jsonMatch = contenidoRespuesta.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : contenidoRespuesta;
      preguntasGeneradas = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Error parseando respuesta de OpenAI:", contenidoRespuesta);
      throw new Error("La respuesta de OpenAI no es un JSON válido");
    }

    if (!preguntasGeneradas.preguntas || !Array.isArray(preguntasGeneradas.preguntas)) {
      throw new Error("Formato de respuesta inválido");
    }

    const preguntasValidadas: PreguntaGenerada[] = [];
    for (let i = 0; i < preguntasGeneradas.preguntas.length; i++) {
      const p = preguntasGeneradas.preguntas[i];
      
      if (!p.texto_pregunta || !Array.isArray(p.respuestas) || !p.respuesta_correcta) {
        console.warn(`Pregunta ${i + 1} inválida, omitiendo`);
        continue;
      }

      if (p.respuestas.length !== 5) {
        console.warn(`Pregunta ${i + 1} no tiene 5 respuestas, omitiendo`);
        continue;
      }

      preguntasValidadas.push({
        texto_pregunta: p.texto_pregunta,
        respuestas: p.respuestas,
        respuesta_correcta: p.respuesta_correcta,
      });
    }

    if (preguntasValidadas.length === 0) {
      throw new Error("No se generaron preguntas válidas");
    }

    return res.status(200).json({ preguntas: preguntasValidadas });

  } catch (error) {
    console.error("Error generando preguntas:", error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : "Error al generar preguntas" 
    });
  }
}