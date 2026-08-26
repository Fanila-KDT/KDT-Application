import { RouterModule, Routes } from "@angular/router";
import { ItemReorderRequest } from "./item-reorder-request";

export const routes: Routes = [
  {
    path: '',
    component: ItemReorderRequest,
    pathMatch: 'full',
    data: { pageTitle: 'item-reorder-request' },
  }
];

export const ItemReorderRequestRouting = RouterModule.forChild(routes);