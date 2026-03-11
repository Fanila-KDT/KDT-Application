import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { AccountMaster } from "./account-master";

export const routes: Routes = [
  {
    path: '',
    component: AccountMaster,
    pathMatch: 'full',
    data: { pageTitle: 'account-master' },
    children: []
  }
];

export const AccountMasterRouting = RouterModule.forChild(routes);
