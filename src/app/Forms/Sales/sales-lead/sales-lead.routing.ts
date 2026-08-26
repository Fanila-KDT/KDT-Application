import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { SalesLead } from "./sales-lead";

export const routes: Routes = [
  {
    path: '',
    component: SalesLead,
    pathMatch: 'full',
    data: { pageTitle: 'sales-lead' },
    children: []
  }
];

export const SalesLeadRouting = RouterModule.forChild(routes);
