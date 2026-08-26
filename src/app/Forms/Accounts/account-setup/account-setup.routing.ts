import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { AccountSetup } from "./account-setup";

export const routes: Routes = [
  {
    path: '',
    component: AccountSetup,
    pathMatch: 'full',
    data: { pageTitle: 'account-setup' },
    children: []
  }
];

export const AccountSetupRouting = RouterModule.forChild(routes);
