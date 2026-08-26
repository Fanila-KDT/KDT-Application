import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { AreaMaster } from "./area-master";

export const routes: Routes = [
  {
    path: '',
    component: AreaMaster,
    pathMatch: 'full',
    data: { pageTitle: 'area-master' },
    children: []
  }
];

export const AreaMasterRouting = RouterModule.forChild(routes);
