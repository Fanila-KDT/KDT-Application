import { RouterModule, Routes } from "@angular/router";
import { ProductMaster } from "./product-master";

export const routes: Routes = [
  {
    path: 'product-master',
    component: ProductMaster,
    pathMatch: 'full',
    data: { pageTitle: 'Product Master' },
  }
];

export const ProductMasterRouting = RouterModule.forChild(routes);
