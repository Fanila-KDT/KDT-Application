import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { PurchaseOrder } from "./purchase-order";

export const routes: Routes = [
  {
    path: '',
    component: PurchaseOrder,
    pathMatch: 'full',
    data: { pageTitle: 'purchase-order' },
    children: []
  }
];

export const PurchaseOrderRouting = RouterModule.forChild(routes);
