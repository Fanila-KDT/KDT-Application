import { RouterModule, Routes } from "@angular/router";
import { StockTaking } from "./stock-taking";

export const routes: Routes = [
  {
    path: '',
    component: StockTaking,
    pathMatch: 'full',
    data: { pageTitle: 'stock-taking' },
  }
];

export const StockTakingRouting = RouterModule.forChild(routes);