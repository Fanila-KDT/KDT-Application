import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { PaymentTermsMaster } from "./payment-terms-master";

export const routes: Routes = [
  {
    path: '',
    component: PaymentTermsMaster,
    pathMatch: 'full',
    data: { pageTitle: 'payment-terms-master' },
    children: []
  }
];

export const PaymentTermsMasterRouting = RouterModule.forChild(routes);
