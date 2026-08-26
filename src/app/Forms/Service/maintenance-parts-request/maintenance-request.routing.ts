import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { MaintenanceRequest } from "./maintenance-request";

export const routes: Routes = [
  {
    path: '',
    component: MaintenanceRequest,
    pathMatch: 'full',
    data: { pageTitle: 'maintenance-parts-request' },
    children: []
  }
];

export const MaintenanceRequestRouting = RouterModule.forChild(routes);
