import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { PaymentRequest } from "./payment-request";

export const routes: Routes = [
  {
    path: '',
    component: PaymentRequest,
    pathMatch: 'full',
    data: { pageTitle: 'payment-request' },
    children: []
  }
];

export const PaymentRequestRouting = RouterModule.forChild(routes);
