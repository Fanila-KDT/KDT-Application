import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { SalesmanMaster } from "./salesman-master";

export const routes: Routes = [
  {
    path: '',
    component: SalesmanMaster,
    pathMatch: 'full',
    data: { pageTitle: 'salesman-master' },
    children: []
  }
];

export const SalesmanMasterRouting = RouterModule.forChild(routes);
