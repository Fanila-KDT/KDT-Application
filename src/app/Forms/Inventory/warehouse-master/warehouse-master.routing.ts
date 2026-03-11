import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { WarehouseMaster } from "./warehouse-master";

export const routes: Routes = [
  {
    path: '',
    component: WarehouseMaster,
    pathMatch: 'full',
    data: { pageTitle: 'warehouse-master' },
    children: []
  }
];

export const WarehouseMasterRouting = RouterModule.forChild(routes);
