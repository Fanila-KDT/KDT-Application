import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import * as config from '../../../assets/api/URLconfig.json';
import { Subscription } from 'rxjs';
import { UserAccessService } from '../../Service/AuthenticationService/user-access';

type HeaderKey = 'dashboard' | 'Inventory' | 'Sales' | 'Service' | 'Accounts' | 'HR' | 'Admin';
type SectionKey = 'masters' | 'transactions' | 'reports';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.html',
  styleUrls: ['./navigation.css'],
  standalone: false
})
export class NavigationComponent implements OnInit {
  public urlConfig: any = config;
  subscription: Subscription[] = [];
  activeHeader: HeaderKey = 'dashboard';
  openSection: SectionKey | null = null;

  sidebarConfig: Record<HeaderKey, Record<SectionKey, { path: string; label: string }[]>> = {
    dashboard: { masters: [], transactions: [], reports: [] },
    Inventory: {
      masters: [
        { path: '/Forms/product-master', label: 'Product Master' },
        { path: '/Forms/warehouse-master', label: 'Warehouse Master' }
      ],
      transactions: [
        { path: '/Forms/inventory-dashboard', label: 'Dashboard' },
        { path: '/Forms/purchase-order', label: 'Purchase Order' },
        { path: '/Forms/goods-reciept-note', label: 'Goods Receipt Note' },
        { path: '/Forms/stock-verification', label: 'Stock Verification' },
        { path: '/Forms/expense-entry', label: 'Expense Entry' },
        { path: '/Forms/purchase-return', label: 'Purchase Return' },
        { path: '/Forms/stock-transfer', label: 'Stock Transfer' },
        { path: '/Forms/stock-correction', label: 'Stock Correction' },
        { path: '/Forms/item-reorder-request', label: 'Reorder Request' },
        { path: '/Forms/stock-taking', label: 'Stock Taking' }
      ],
      reports: [
        { path: '/Forms/stock-report', label: 'Stock Report' },
        { path: '/Forms/transaction', label: 'Transactions Report' },
        { path: '/Forms/purchase-order-report', label: 'Purchase Order Report' },
        { path: '/Forms/inventory-aging-report', label: 'Inventory Aging Report' },
        { path: '/Forms/item-movement-report', label: 'Item Movement Report' }
      ]
    },
    Sales: { 
      masters: [
        { path: '/Forms/customer-master', label: 'Customer Master' },
        { path: '/Forms/salesman-master', label: 'Salesman Master' },
        { path: '/Forms/engineer-master', label: 'Engineer Master' },
        { path: '/Forms/payment-terms-master', label: 'Payment Terms' },
        { path: '/Forms/area-master', label: 'Area Master' },
        { path: '/Forms/tag-master', label: 'Tag Master' }
      ],transactions: [
        { path: '/Forms/sales-quotation', label: 'Sales Quotation' },
        { path: '/Forms/sales-order', label: 'Sales Order' },
        { path: '/Forms/delivery-note', label: 'Delivery Note' },
        { path: '/Forms/sales-lead', label: 'Sales Lead' },
        { path: '/Forms/sales-invoice', label: 'Sales Invoice' }
      ], 
      reports: [

      ] 
    },
    Service: { 
      masters: [
        { path: '/Forms/maintenance-request', label: 'Maintenance Parts Request' },
        { path: '/Forms/maintenance-issue', label: 'Maintenance Parts Issue' }
      ], 
      transactions: [], 
      reports: [] 
    },
    Accounts: {
      masters: [
        { path: '/Forms/currency-master', label: 'Currency Master' },
        { path: '/Forms/account-master', label: 'Account Master' },
        { path: '/Forms/supplier-master', label: 'Supplier Master' },
        { path: '/Forms/account-setup', label: 'Account Set Up' },
        { path: '/Forms/payment-request', label: 'Payment Request' }
      ],
      transactions: [],
      reports: []
    },
    HR: { masters: [], transactions: [], reports: [] },
    Admin: {
      masters: [
        { path: '/Forms/user-master', label: 'User Master' }
      ],
      transactions: [],
      reports: []
    }
  };

  constructor(private router: Router, public userAccessService: UserAccessService) {}

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const segment = event.urlAfterRedirects.split('/')[1] as HeaderKey;
        const validHeaders: HeaderKey[] = ['Inventory','Sales','Service','Accounts','HR','Admin'];

        if (validHeaders.includes(segment)) {
          this.userAccessService.setHeader(segment);
        }
      }
    });

    this.subscription.push(
      this.userAccessService.HeaderName.subscribe(x => {
        if (x !== 'dashboard') {
          this.activeHeader = x as HeaderKey;
          sessionStorage.setItem('activeHeader', x);
        } else {
          let temp = sessionStorage.getItem('activeHeader') || '';
          this.activeHeader = temp as HeaderKey;
        }
      })
    );
  }

  toggleSection(section: SectionKey): void {
    if (this.openSection === section) {
      this.openSection = null; // collapse if clicked again
    } else {
      this.openSection = section; // open new section
    }
  }
}

