import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, PermissionGuard } from './Service/AuthenticationService/auth-guard';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'login-page',
    pathMatch: 'full'
  },
  {
    path: 'login-page',
    loadChildren: () =>
      import('./Forms/Main/login-page/login-page.module').then(m => m.LoginComponentModule)
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./Forms/Main/dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard]
  },
  {
    path: 'Forms',
    loadChildren: () =>
      import('./Forms/Inventory/product-master/product-master.module').then(m => m.ProductMasterModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'PRODUCT_MASTER', level: 1 , screenId: 1 }
  },
  {
    path: 'Forms/currency-master',
    loadChildren: () =>
      import('./Forms/Accounts/currency-master/currency-master.module').then(m => m.CurrencyMasterModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'CURRENCY_MASTER', level: 1  , screenId: 2 }
  },
  {
    path: 'Forms/account-master',
    loadChildren: () =>
      import('./Forms/Accounts/account-master/account-master.module').then(m => m.AccountMasterModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'ACCOUNT_MASTER', level: 1 , screenId: 3 }
  },
  {
    path: 'Forms/supplier-master',
    loadChildren: () =>
      import('./Forms/Accounts/supplier-master/supplier-master.module').then(m => m.SupplierMasterModule), canActivate: [AuthGuard,PermissionGuard],data: { permission: 'SUPPLIER_MASTER', level: 1 , screenId: 4 }
  },
  {
    path: 'Forms/warehouse-master',
    loadChildren: () =>
      import('./Forms/Inventory/warehouse-master/warehouse-master.module').then(m => m.WarehouseMasterModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'WAREHOUSE_MASTER', level: 1 , screenId: 5 }
  },
  {
    path: 'Forms/user-master',
    loadChildren: () =>
      import('./Forms/Admin/user-master/user-master.module').then(m => m.UserMasterModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'USER_MASTER', level: 1 , screenId: 6 }
  },
  {
    path: 'Forms/purchase-order',
    loadChildren: () =>
      import('./Forms/Inventory/purchase-order/purchase-order.module').then(m => m.PurchaseOrderModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'PURCHASE_ORDER', level: 1 , screenId: 7 }
  },
  {
    path: 'Forms/inventory-dashboard',
    loadChildren: () =>
      import('./Forms/Inventory/inventory-dashboard/inventory-dashboard.module').then(m => m.InventoryDashboardModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'GOODS_RECEIPT_NOTE', level: 1 , screenId: 8 }
  },
  {
    path: 'Forms/inventory-pending-reciepts',
    loadChildren: () =>
      import('./Forms/Inventory/inventory-pending-reciepts/inventory-pending-reciepts.module').then(m => m.InventoryPendingRecieptsModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'GOODS_RECEIPT_NOTE', level: 1, screenId: 9 }
  },
  {
    path: 'Forms/goods-reciept-note',
    loadChildren: () =>
      import('./Forms/Inventory/goods-reciept-note/goods-reciept-note.module').then(m => m.GoodsRecieptNoteModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'GOODS_RECEIPT_NOTE', level: 1 , screenId: 10}
  },
  {
    path: 'Forms/stock-verification',
    loadChildren: () =>
      import('./Forms/Inventory/stock-verification/stock-verification.module').then(m => m.StockVerificationModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'STOCK_VERIFICATION', level: 1 , screenId: 11 }
  },
  {
    path: 'Forms/expense-entry',
    loadChildren: () =>
      import('./Forms/Inventory/expense-entry/expense-entry.module').then(m => m.ExpenseEntryModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'PURCHASE_EXPENSE', level: 1 , screenId: 12 }
  },
  {
    path: 'Forms/stock-transfer',
    loadChildren: () =>
      import('./Forms/Inventory/stock-transfer/stock-transfer.module').then(m => m.StockTransferModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'STOCK_TRANSFER', level: 1 , screenId: 13 }
  },
  {
    path: 'Forms/stock-correction',
    loadChildren: () =>
      import('./Forms/Inventory/stock-correction/stock-correction.module').then(m => m.StockCorrectionModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'STOCK_CORRECTION', level: 1 , screenId: 14 }
  },
  {
    path: 'Forms/item-reorder-request',
    loadChildren: () =>
      import('./Forms/Inventory/item-reorder-request/item-reorder-request.module').then(m => m.ItemReorderRequestModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'ITEM_REORDER', level: 1 , screenId: 15 }
  },
  {
    path: 'Forms/stock-taking',
    loadChildren: () =>
      import('./Forms/Inventory/stock-taking/stock-taking.module').then(m => m.StockTakingModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'STOCK_TAKING', level: 1 , screenId: 16 }
  },
  {
    path: 'Forms/purchase-return',
    loadChildren: () =>
      import('./Forms/Inventory/purchase-return/purchase-return.module').then(m => m.PurchaseReturnModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'PURCHASE_RETURNS', level: 1 , screenId: 17 }
  },
  {
    path: 'Forms/stock-report',
    loadChildren: () =>
      import('./Forms/InventoryReports/stock-report/stock-report.module').then(m => m.StockReportModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'STOCK_REPORT', level: 1 , screenId: 18 }
  },
  {
    path: 'Forms/transaction',
    loadChildren: () =>
      import('./Forms/InventoryReports/transaction/transaction.module').then(m => m.TransactionReportModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'TRANSACTION_REPORT', level: 1 , screenId: 19 }
  },
  {
  path: 'Forms/purchase-order-report',
    loadChildren: () =>
      import('./Forms/InventoryReports/purchase-order-report/purchase-order-report.module').then(m => m.PurchaseOrderReportModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'PURCHASE_ORDER_REPORT', level: 1 , screenId: 20 }
  },
  {
  path: 'Forms/inventory-aging-report',
    loadChildren: () =>
      import('./Forms/InventoryReports/inventory-aging-report/inventory-aging-report.module').then(m => m.InventoryAgingReportModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'INVENTORY_AGING_REPORT', level: 1 , screenId: 21 }
  },
  {
  path: 'Forms/item-movement-report',
    loadChildren: () =>
      import('./Forms/InventoryReports/item-movement-report/item-movement-report.module').then(m => m.ItemMovementReportModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'ITEM_MOVEMENT_REPORT', level: 1 , screenId: 22 }
  },
  {
   path: 'Forms/customer-master',
    loadChildren: () =>
      import('./Forms/Sales/customer-master/customer-master.module').then(m => m.CustomerMasterModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'CUSTOMER_MASTER', level: 1 , screenId: 23 }
  },
  {
   path: 'Forms/salesman-master',
    loadChildren: () =>
      import('./Forms/Sales/salesman-master/salesman-master.module').then(m => m.SalesmanMasterModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'SALESMAN_MASTER', level: 1 , screenId: 24 }
  },
  {
   path: 'Forms/engineer-master',
    loadChildren: () =>
      import('./Forms/Sales/engineer-master/engineer-master.module').then(m => m.EngineerMasterModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'ENGINEER_MASTER', level: 1 , screenId: 25 }
  },
  {
   path: 'Forms/payment-terms-master',
    loadChildren: () =>
      import('./Forms/Sales/payment-terms-master/payment-terms-master.module').then(m => m.PaymentTermsMasterModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'PAYMENT_TERMS', level: 1 , screenId: 26 }
  },
  {
   path: 'Forms/area-master',
    loadChildren: () =>
      import('./Forms/Sales/area-master/area-master.module').then(m => m.AreaMasterModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'AREA_MASTER', level: 1 , screenId: 27}
  },
  {
   path: 'Forms/tag-master',
    loadChildren: () =>
      import('./Forms/Sales/tag-master/tag-master.module').then(m => m.TagMasterModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'TAG_MASTER', level: 1 , screenId: 28}
  },
  {
   path: 'Forms/sales-quotation',
    loadChildren: () =>
      import('./Forms/Sales/sales-quotation/sales-quotation.module').then(m => m.SalesQuotationModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'SALES_QUOTATION', level: 1 , screenId: 29}
  },
  {
   path: 'Forms/sales-order',
    loadChildren: () =>
      import('./Forms/Sales/sales-order/sales-order.module').then(m => m.SalesOrderModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'SALES_ORDER', level: 1 , screenId: 30}
  },
  {
   path: 'Forms/delivery-note',
    loadChildren: () =>
      import('./Forms/Sales/delivery-note/delivery-note.module').then(m => m.DeliveryNoteModule), canActivate: [AuthGuard], data: { permission: 'DELIVERY_NOTE', level: 1 , screenId: 31}
  },
  {
   path: 'Forms/sales-lead',
    loadChildren: () =>
      import('./Forms/Sales/sales-lead/sales-lead.module').then(m => m.SalesLeadModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'SALES_LEAD', level: 1 , screenId: 32}
  },
  {
   path: 'Forms/account-setup',
    loadChildren: () =>
      import('./Forms/Accounts/account-setup/account-setup.module').then(m => m.AccountSetupModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'ACCOUNT_SETUP', level: 1 , screenId: 33}
  },
  {
   path: 'Forms/payment-request',
    loadChildren: () =>
      import('./Forms/Accounts/payment-request/payment-request.module').then(m => m.PaymentRequestModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'PAYMENT_REQUEST', level: 1 , screenId: 34}
  },
  {
   path: 'Forms/maintenance-request',
    loadChildren: () =>
      import('./Forms/Service/maintenance-parts-request/maintenance-request.module').then(m => m.MaintenanceRequestModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'MAINTENANCE_REQUISITION', level: 1 , screenId: 35}
  },
  {
   path: 'Forms/maintenance-issue',
    loadChildren: () =>
      import('./Forms/Service/maintenance-parts-issue/maintenance-issue.module').then(m => m.MaintenanceIssueModule),canActivate: [AuthGuard,PermissionGuard], data: { permission: 'ASSET_MAINTENANCE', level: 1 , screenId: 36}
  },
  {
   path: 'Forms/sales-invoice',
    loadChildren: () =>
      import('./Forms/Sales/sales-invoice/sales-invoice.module').then(m => m.SalesInvoiceModule), data: { permission: 'SALES_ORDER', level: 1 , screenId: 37}
  }

];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

  
