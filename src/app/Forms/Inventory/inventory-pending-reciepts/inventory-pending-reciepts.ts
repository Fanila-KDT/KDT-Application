import { Component } from '@angular/core';
import { RecieptEntryService } from '../../../Service/RecieptEntryService/reciept-entry-service';
import { Subscription } from 'rxjs';
import { SelectionType } from '@swimlane/ngx-datatable';
import { Pagination } from '../../../Model/pagingResponse';
import { RecieptEntryModel } from '../../../Model/RecieptEnry/reciept-enry.model';
import { Router } from '@angular/router';
import { DashboardService } from '../../../Service/DashboardService/dashboard-service';
import { UserAccessService } from '../../../Service/AuthenticationService/user-access';
import { AlertService } from '../../../shared/alert/alert.service';

@Component({
  selector: 'inventory-pending-reciepts',
  standalone: false,
  templateUrl: './inventory-pending-reciepts.html',
  styleUrl: './inventory-pending-reciepts.css'
})
export class InventoryPendingReciepts {
  subscription: Subscription[] = new Array<Subscription>();
  disableGrid: boolean =false;
  rows: any[] = [];           // Original data
  temp:any[] = [];     
  isLoading: boolean = false;
  selected: any[] = [];
  reorderable = true;
  SelectionType = SelectionType;
  controls = {
    pageSize:this.rows.length
  };
  filterPendingReciept = new RecieptEntryModel();
  allRows: any[] = []; // full dataset
  filteredRows: any[] = []; // current visible chunk
  userAccessList: any[] = [];
  selectedPendingReciept: number=0;
  scroll: boolean = true;
  Heading: string = "";

  constructor(private recieptEntryService:RecieptEntryService, private dashboardService: DashboardService,private router: Router,public userAccessService:UserAccessService,
              private alertService: AlertService) { 

    const saved = sessionStorage.getItem('List'); 
    if (saved) { 
      this.rows = JSON.parse(saved);
      this.allRows = [...this.rows];
    }
    this.Heading = sessionStorage.getItem('Heading')||""; 
    console.log(this.rows[0]);
  }

  ngOnInit() {
    
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  updateFilter() {
    const f = this.filterPendingReciept;
    this.filteredRows = this.allRows.filter(row =>
      (!f.account_name || row.account_name?.toString().includes(f.account_name.toString())) &&
      (!f.document_number || row.document_number?.toLowerCase().includes(f.document_number.toLowerCase())) &&
      (!f.voucherDate || row.voucherDate?.toLowerCase().includes(f.voucherDate.toLowerCase()))
    );
    this.rows = [...this.filteredRows]; // ✅ Store filtered data for pagination
  }

  isVisibleGroupingDD() {
      if (this.rows.length != 0) {
        return false;
      }
      else {
        return true;
      }
    }
  
    async viewDetails(row: any) {
      this.isLoading = true;
      this.selected = [row];
      this.isLoading = false;
    }
  
    updateGridHeight(): number {
      return  820 // ✅ cap at 400px
    }
  
    leftAlignCell(): string {
      return 'text-left';
    }

    onActivate(event: any) {
    let rowItem = event.row;
    let rowIndex = this.rows.indexOf(rowItem);

    if(rowIndex+1!=this.controls.pageSize){
      if (event.type === 'keydown' && (event.event.code === 'ArrowDown'))
      {
        this.selectedPendingReciept = 1 + rowIndex;
      } 
      else if (event.type === 'keydown' && (event.event.code === 'ArrowUp'))
      {
        this.selectedPendingReciept = rowIndex - 1;
        this.viewDetails(this.rows[this.selectedPendingReciept]);
      }
      else if (event.type == 'click') 
      {
        this.selectedPendingReciept = this.rows.indexOf(rowItem);
      }
    }
  }


  OpenItem(row: any) { 
    // Step 1: run user access check
    this.userAccessService.CheckUserAccess(this.recieptEntryService.FormName, this.recieptEntryService);

    const newDisabled = this.recieptEntryService.newDisabled.getValue();

    // Step 2: if user access disables, block navigation
    if (newDisabled) {
      this.alertService.triggerAlert('You do not have permission to create new entries.', 4000, 'error');
      return;
    }

    // Step 3: run period access check only if user access allows
    let period_status = sessionStorage.getItem('period_status') || '';
    let data_entry_status = sessionStorage.getItem('data_entry_status') || ''; // ⚠️ fix: you had period_status twice
    let approval_status = row.approval_status; // or this.approval_status depending on context

    const periodAllowed = this.userAccessService.CheckPeriodAccess(
      approval_status,
      period_status,
      data_entry_status
    );

    if (!periodAllowed) {
      this.alertService.triggerAlert('Period/Data entry restrictions block this action.', 4000, 'error');
      return;
    }

    // Step 4: both checks passed → proceed
    this.dashboardService.RecieptEntry = 1;
    this.dashboardService.clickedRecieptEntry.next(row); 
    sessionStorage.setItem('clickedReciept', JSON.stringify(row)); // ⚠️ store as JSON string
    this.router.navigate(['/Forms/goods-reciept-note']); 
  }

}
