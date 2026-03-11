import { RouterModule, Routes } from "@angular/router";
import { InventoryPendingReciepts } from "./inventory-pending-reciepts";

export const routes: Routes = [
  {
    path: '',
    component: InventoryPendingReciepts,
    pathMatch: 'full',
    data: { pageTitle: 'inventory-pending-reciepts' },
  }
];

export const InventoryPendingRecieptsRouting = RouterModule.forChild(routes);
