import { RouterModule, Routes } from "@angular/router";
import { ExpenseEntry } from "./expense-entry";

export const routes: Routes = [
  {
    path: '',
    component: ExpenseEntry,
    pathMatch: 'full',
    data: { pageTitle: 'expense-entry' },
  }
];

export const ExpenseEntryRouting = RouterModule.forChild(routes);