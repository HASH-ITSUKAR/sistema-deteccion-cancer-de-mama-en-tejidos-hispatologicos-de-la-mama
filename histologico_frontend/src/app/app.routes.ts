import { Routes } from '@angular/router';
import DashboardLayout from './layouts/DashboardLayout/DashboardLayout';
import DashboardPage from './pages/dashboard-page/dashboard-page';
import { PrediccionPage } from './pages/prediccion-page/prediccion-page';
import { MetricasPage } from './pages/metricas-page/metricas-page';
import { EdaPage } from './pages/eda-page/eda-page';
import { EvaluacionPage } from './pages/evaluacion-page/evaluacion-page';
import { EntrenamientoPage } from './pages/entrenamiento-page/entrenamiento-page';

export const routes: Routes = [
  {
    path: '',
    component: DashboardLayout,
    children: [
      {
        path: '',
        component: DashboardPage
      },
      {
        path: 'prediccion',
        component: PrediccionPage
      },
      {
        path: 'metricas',
        component: MetricasPage
      },
      {
        path: 'eda',
        component: EdaPage
      },
      {
        path: 'evaluacion',
        component: EvaluacionPage
      },
      {
        path: 'entrenamiento',
        component: EntrenamientoPage
      },
      {
        path: '**',
        redirectTo: ''
      },
    ]
  },
];
