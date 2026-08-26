import { RouterModule, Routes } from "@angular/router";
import { PurchaseReturn } from "./purchase-return";

export const routes: Routes = [
  {
    path: '',
    component: PurchaseReturn,
    pathMatch: 'full',
    data: { pageTitle: 'purchase-return' },
  }
];

export const PurchaseReturnRouting = RouterModule.forChild(routes);
