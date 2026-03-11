import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { SupplierMaster } from "./supplier-master";

export const routes: Routes = [
  {
    path: '',
    component: SupplierMaster,
    pathMatch: 'full',
    data: { pageTitle: 'Supplier Master' },
    children: []
  }
];

export const SupplierMasterRouting = RouterModule.forChild(routes);
