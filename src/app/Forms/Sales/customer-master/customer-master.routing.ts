import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { CustomerMaster } from "./customer-master";

export const routes: Routes = [
  {
    path: '',
    component: CustomerMaster,
    pathMatch: 'full',
    data: { pageTitle: 'customer-master' },
    children: []
  }
];

export const CustomerMasterRouting = RouterModule.forChild(routes);
