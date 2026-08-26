import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { SalesOrder} from "./sales-order";

export const routes: Routes = [
  {
    path: '',
    component: SalesOrder,
    pathMatch: 'full',
    data: { pageTitle: 'sales-order' },
    children: []
  }
];

export const SalesOrderRouting = RouterModule.forChild(routes);
