import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { EngineerMaster } from "./engineer-master";

export const routes: Routes = [
  {
    path: '',
    component: EngineerMaster,
    pathMatch: 'full',
    data: { pageTitle: 'engineer-master' },
    children: []
  }
];

export const EngineerMasterRouting = RouterModule.forChild(routes);
