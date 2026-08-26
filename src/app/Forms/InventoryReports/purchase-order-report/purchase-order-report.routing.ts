import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { PurchaseOrderReport } from "./purchase-order-report";

export const routes: Routes = [
  {
    path: '',
    component: PurchaseOrderReport,
    pathMatch: 'full',
    data: { pageTitle: 'Purchase Order Report' },
    children: []
  }
];

export const PurchaseOrderReportRouting = RouterModule.forChild(routes);
