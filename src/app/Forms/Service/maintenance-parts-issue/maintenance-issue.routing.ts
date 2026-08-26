import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { MaintenanceIssue } from "./maintenance-issue";

export const routes: Routes = [
  {
    path: '',
    component: MaintenanceIssue,
    pathMatch: 'full',
    data: { pageTitle: 'maintenance-parts-issue' },
    children: []
  }
];

export const MaintenanceIssueRouting = RouterModule.forChild(routes);
