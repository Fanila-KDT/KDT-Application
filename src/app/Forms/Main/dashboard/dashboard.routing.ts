import { RouterModule, Routes } from "@angular/router";
import { Dashboard } from "./dashboard";

export const routes: Routes = [
  {
    path: '', // ✅ empty path because it's already mounted at /dashboard
    component: Dashboard,
    pathMatch: 'full',
    data: { pageTitle: 'Dashboard' },
    children: []
  }
];

export const DashboardRouting = RouterModule.forChild(routes);
