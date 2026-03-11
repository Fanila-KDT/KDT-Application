import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { CurrencyMaster } from "./currency-master";

export const routes: Routes = [
  {
    path: '',
    component: CurrencyMaster,
    pathMatch: 'full',
    data: { pageTitle: 'Currency Master' },
    children: []
  }
];

export const CurrencyMasterRouting = RouterModule.forChild(routes);
