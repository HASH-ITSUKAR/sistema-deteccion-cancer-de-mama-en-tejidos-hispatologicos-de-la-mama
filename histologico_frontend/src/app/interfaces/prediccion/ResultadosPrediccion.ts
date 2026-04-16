import { Prediccion } from "./Prediccion";

export interface ResultadoPredicciones {
  [modelo: string]: Prediccion;
}
