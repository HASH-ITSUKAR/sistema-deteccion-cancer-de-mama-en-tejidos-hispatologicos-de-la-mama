export interface ResultadoPredicciones {
  imagen_procesada_modelo: string;
  resultados_individuales: { [key: string]: ResultadosIndividuales };
  XGBoost_ensamble:        XGBoostEnsamble;
}

export interface XGBoostEnsamble {
  prediccion:     number;
  probabilidades: Probabilidades;
}

export interface Probabilidades {
  clase_0: number;
  clase_1: number;
}

export interface ResultadosIndividuales {
  prediccion:       number;
  probabilidades:   Probabilidades;
  tipo_explicacion: string;
  dimensiones:      number[];
  mapa_calor:       string;
}
