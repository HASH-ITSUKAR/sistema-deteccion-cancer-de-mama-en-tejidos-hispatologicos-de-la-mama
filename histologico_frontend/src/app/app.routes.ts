import { Routes } from '@angular/router';
import DashboardLayout from './layouts/DashboardLayout/DashboardLayout';
import DashboardPage from './pages/dashboard-page/dashboard-page';
import { PrediccionPage } from './pages/prediccion-page/prediccion-page';

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
        path: '**',
        redirectTo: ''
      },
    ]
  },
];
