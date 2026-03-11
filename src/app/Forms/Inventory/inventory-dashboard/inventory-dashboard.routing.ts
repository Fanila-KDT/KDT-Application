import { RouterModule, Routes } from "@angular/router";
import { InventoryDashboard } from "./inventory-dashboard";

export const routes: Routes = [
  {
    path: '',
    component: InventoryDashboard,
    pathMatch: 'full',
    data: { pageTitle: 'inventory-dashboard' },
  }
];

export const InventoryDashboardRouting = RouterModule.forChild(routes);
