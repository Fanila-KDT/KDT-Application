import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { SalesInvoice } from "./sales-invoice";

export const routes: Routes = [
  {
    path: '',
    component: SalesInvoice,
    pathMatch: 'full',
    data: { pageTitle: 'sales-invoice' },
    children: []
  }
];

export const SalesInvoiceRouting = RouterModule.forChild(routes);
