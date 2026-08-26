import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { SalesQuotation } from "./sales-quotation";

export const routes: Routes = [
  {
    path: '',
    component: SalesQuotation,
    pathMatch: 'full',
    data: { pageTitle: 'sales-quotation' },
    children: []
  }
];

export const SalesQuotationRouting = RouterModule.forChild(routes);
