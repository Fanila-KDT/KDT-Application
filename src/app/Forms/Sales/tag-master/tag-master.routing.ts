import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { TagMaster } from "./tag-master";

export const routes: Routes = [
  {
    path: '',
    component: TagMaster,
    pathMatch: 'full',
    data: { pageTitle: 'tag-master' },
    children: []
  }
];

export const TagMasterRouting = RouterModule.forChild(routes);
