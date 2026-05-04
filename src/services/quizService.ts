import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Quiz = Tables<"quiz">;
type QuizPregunta = Tables<"quiz_pregunta">;
type QuizIntento = Tables<"quiz_intento">;

/**
 * Obtener quiz de un libro
 */
export async function getQuizByLibroId(libroId: string) {
  const { data, error } = await supabase
    .from("quiz")
    .select("*")
    .eq("libro_id", libroId)
    .single();

  return { data, error };
}

/**
 * Crear quiz para un libro
 */
export async function createQuiz(libroId: string, titulo: string, descripcion?: string): Promise<{ data: Quiz | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("quiz")
      .insert({
        libro_id: libroId,
        titulo,
        descripcion,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error creating quiz:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Actualizar quiz
 */
export async function updateQuiz(quizId: string, updates: Partial<Quiz>): Promise<{ data: Quiz | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("quiz")
      .update(updates)
      .eq("id", quizId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error updating quiz:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Obtener todas las preguntas de un quiz
 */
export async function getPreguntasByQuizId(quizId: string) {
  const { data, error } = await supabase
    .from("quiz_pregunta")
    .select("*")
    .eq("quiz_id", quizId)
    .order("numero_pregunta", { ascending: true });

  return { data, error };
}

/**
 * Crear una pregunta
 */
export async function createPregunta(
  quizId: string,
  numeroPregunta: number,
  textoPregunta: string,
  respuestas: string[],
  respuestaCorrecta: number
): Promise<{ data: QuizPregunta | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("quiz_pregunta")
      .insert({
        quiz_id: quizId,
        numero_pregunta: numeroPregunta,
        texto_pregunta: textoPregunta,
        respuestas,
        respuesta_correcta: respuestaCorrecta,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error creating pregunta:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Actualizar una pregunta
 */
export async function updatePregunta(
  preguntaId: string,
  updates: {
    texto_pregunta?: string;
    respuestas?: string[];
    respuesta_correcta?: number;
  }
): Promise<{ data: QuizPregunta | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("quiz_pregunta")
      .update(updates)
      .eq("id", preguntaId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error updating pregunta:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Eliminar una pregunta
 */
export async function deletePregunta(preguntaId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from("quiz_pregunta")
      .delete()
      .eq("id", preguntaId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error deleting pregunta:", error);
    return { error: error as Error };
  }
}

/**
 * Generar preguntas con IA basadas en el contenido del libro
 */
export async function generarPreguntasIA(
  contenidoLibro: string,
  cantidadPreguntas: number = 9
): Promise<{
  data: Array<{
    texto_pregunta: string;
    respuestas: string[];
    respuesta_correcta: number;
  }> | null;
  error: Error | null;
}> {
  try {
    const response = await fetch("/api/generar-preguntas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contenido: contenidoLibro,
        cantidad: cantidadPreguntas,
      }),
    });

    if (!response.ok) {
      throw new Error("Error al generar preguntas con IA");
    }

    const data = await response.json();
    return { data: data.preguntas, error: null };
  } catch (error) {
    console.error("Error generando preguntas con IA:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Eliminar todas las preguntas de un quiz
 */
export async function deleteAllPreguntas(quizId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from("quiz_pregunta")
      .delete()
      .eq("quiz_id", quizId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error deleting all preguntas:", error);
    return { error: error as Error };
  }
}