import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { UserMaster } from "./user-master";

export const routes: Routes = [
  {
    path: '',
    component: UserMaster,
    pathMatch: 'full',
    data: { pageTitle: 'User Master' },
    children: []
  }
];

export const UserMasterRouting = RouterModule.forChild(routes);
