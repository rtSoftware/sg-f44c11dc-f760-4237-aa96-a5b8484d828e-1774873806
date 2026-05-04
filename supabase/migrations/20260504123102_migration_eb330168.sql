-- Tabla principal del quiz (uno por libro)
CREATE TABLE quiz (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  libro_id UUID NOT NULL REFERENCES libro(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  veces_ingresado INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_libro_quiz UNIQUE(libro_id)
);

-- Tabla de preguntas (9 por quiz)
CREATE TABLE quiz_pregunta (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quiz(id) ON DELETE CASCADE,
  numero_pregunta INTEGER NOT NULL CHECK (numero_pregunta >= 1 AND numero_pregunta <= 9),
  texto_pregunta TEXT NOT NULL,
  respuesta_correcta INTEGER NOT NULL CHECK (respuesta_correcta >= 1 AND respuesta_correcta <= 5),
  veces_acertada INTEGER DEFAULT 0,
  respuestas JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_quiz_numero UNIQUE(quiz_id, numero_pregunta)
);

-- Tabla de intentos/estadísticas por usuario
CREATE TABLE quiz_intento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quiz(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  respuestas_correctas INTEGER DEFAULT 0,
  total_preguntas INTEGER DEFAULT 9,
  completado BOOLEAN DEFAULT FALSE,
  tiempo_segundos INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX idx_quiz_libro ON quiz(libro_id);
CREATE INDEX idx_quiz_pregunta_quiz ON quiz_pregunta(quiz_id);
CREATE INDEX idx_quiz_intento_quiz ON quiz_intento(quiz_id);
CREATE INDEX idx_quiz_intento_user ON quiz_intento(user_id);

-- RLS Policies para quiz
ALTER TABLE quiz ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_select_public" ON quiz
  FOR SELECT USING (true);

CREATE POLICY "quiz_insert_auth" ON quiz
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "quiz_update_auth" ON quiz
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "quiz_delete_auth" ON quiz
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies para quiz_pregunta
ALTER TABLE quiz_pregunta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_pregunta_select_public" ON quiz_pregunta
  FOR SELECT USING (true);

CREATE POLICY "quiz_pregunta_insert_auth" ON quiz_pregunta
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "quiz_pregunta_update_auth" ON quiz_pregunta
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "quiz_pregunta_delete_auth" ON quiz_pregunta
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies para quiz_intento
ALTER TABLE quiz_intento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_intento_select_own" ON quiz_intento
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "quiz_intento_insert_own" ON quiz_intento
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quiz_intento_update_own" ON quiz_intento
  FOR UPDATE USING (auth.uid() = user_id);

-- Función para incrementar contador de veces ingresado
CREATE OR REPLACE FUNCTION increment_quiz_ingreso()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE quiz 
  SET veces_ingresado = veces_ingresado + 1,
      updated_at = NOW()
  WHERE id = NEW.quiz_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para incrementar contador cuando se crea un intento
CREATE TRIGGER on_quiz_intento_created
  AFTER INSERT ON quiz_intento
  FOR EACH ROW
  EXECUTE FUNCTION increment_quiz_ingreso();

COMMENT ON TABLE quiz IS 'Cuestionarios asociados a libros - uno por libro';
COMMENT ON TABLE quiz_pregunta IS 'Preguntas del cuestionario - 9 por quiz con 5 respuestas cada una';
COMMENT ON TABLE quiz_intento IS 'Registro de intentos de usuarios en los cuestionarios';
COMMENT ON COLUMN quiz_pregunta.respuestas IS 'Array JSON con 5 opciones de respuesta';
COMMENT ON COLUMN quiz_pregunta.respuesta_correcta IS 'Número de la respuesta correcta (1-5)';
COMMENT ON COLUMN quiz_pregunta.veces_acertada IS 'Contador de veces que se ha acertado esta pregunta';