import { ChangeDetectorRef, Component } from '@angular/core';
import { EndPointService } from '../../../../Service/end-point.services';
import { ExpenseEntryService } from '../../../../Service/ExpenseEntryService/expense-entry-service';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';
import { SelectionType } from '@swimlane/ngx-datatable';
import { ExpenseEntryModel } from '../../../../Model/ExpenseEntry/expense-entry.model';
import { Subscription } from 'rxjs';
import { Pagination } from '../../../../Model/pagingResponse';

@Component({
  selector: 'expense-entry-list',
  standalone: false,
  templateUrl: './expense-entry-list.html',
  styleUrls: ['./expense-entry-list.css', '../../../common.css']
})
export class ExpenseEntryList {
  subscription: Subscription[] =  new Array<Subscription>();
  isLoading: boolean = false;
  disableGrid: boolean =false;
  rows: any[] = [];           // Original data
  temp:any[] = [];
  gridHeight:number;
  scroll: boolean = true;
  controls = {
    pageSize:50
  };
  selected: any[] = [];
  reorderable = true;
  SelectionType = SelectionType;
  totRowCounts: number=0;
  currPage: number = 1;
  selectedExpenseEntry: number=0;
  filterExpenseEntry = new ExpenseEntryModel();
  filteredRows: any[] = [];  
  expenseEntryPagingResponse: Pagination = new Pagination();
  startCount:any = 0;
  totalPages : number = 0;
  totalPages_pager: number =1;
  allRows: any[] = []; 
  userAccessList: any[] = [];
  chunkSize: number = 50;
  leftArrwDisable: boolean = true;
  rightArrwDisable: boolean = false;
  endCount: number=0;
  approval_status:string ='';

  constructor(public expenseEntryService:ExpenseEntryService,public endPointService:EndPointService,public userAccessService:UserAccessService,
            private cdRef: ChangeDetectorRef) {
    this.gridHeight = this.endPointService.GridHeight;

    this.subscription.push(this.expenseEntryService.loadListExpenseEntry.subscribe(async data => {
      if(data){
        if (data.length !== 0 ) {
          this.allRows = [...data]; // Save full dataset
          this.rows = [...data];    // Initial display
          this.temp = [...data];
          this.selected = [this.rows[0]];
          this.expenseEntryPagingResponse.TotalItems = this.rows.length;
          await this.viewDetails(this.rows[0]);
          await this.updatePageSize();
          this.cdRef.markForCheck();
        }else{
          this.rows = [];
          this.temp = [];
        }
      }
    }));

    this.subscription.push(this.expenseEntryService.disableGrid.subscribe(data=>{
      this.disableGrid = data;
    }));

    this.subscription.push(this.expenseEntryService.ControlsEnableAndDisable.subscribe(data=>{
      this.ControlsEnableAndDisable()
    }));

    this.subscription.push(this.expenseEntryService.ngOnInit.subscribe(data=>{
      if(data){
        this.expenseEntryService.getExpenseEntryList(sessionStorage.getItem('year'),1);
        this.disableGrid = false;
        this.expenseEntryService.btnClick.next('');
        this.expenseEntryService.cancelClick.next(true);
      }
    }));
    
  }

  async ngOnInit() {
    await this.expenseEntryService.getExpenseEntryList(this.endPointService.year,1);
  }

  onActivate(event: any) {
    let rowItem = event.row;
    let rowIndex = this.rows.indexOf(rowItem);

    if(rowIndex+1!=this.controls.pageSize){
      if (event.type === 'keydown' && (event.event.code === 'ArrowDown'))
      {
        // Get Selected Row Index
        this.selectedExpenseEntry = 1 + rowIndex;
        this.viewDetails(this.rows[this.selectedExpenseEntry]);
        this.approval_status = this.rows[this.selectedExpenseEntry].approval_status;
        this.expenseEntryService.clickedEntry.next(this.rows[this.selectedExpenseEntry]);
      } 
      else if (event.type === 'keydown' && (event.event.code === 'ArrowUp'))
      {
        this.selectedExpenseEntry = rowIndex - 1;
        this.viewDetails(this.rows[this.selectedExpenseEntry]);
        this.approval_status = this.rows[this.selectedExpenseEntry].approval_status;
        this.expenseEntryService.clickedEntry.next(this.rows[this.selectedExpenseEntry]);
      }
      else if (event.type == 'click') 
      {
        let rowItem = event.row;
        this.selectedExpenseEntry = this.rows.indexOf(rowItem);
        this.viewDetails(event.row);
        this.approval_status = this.rows[this.selectedExpenseEntry].approval_status;
        this.expenseEntryService.clickedEntry.next(this.rows[this.selectedExpenseEntry]);
      }
    }
  }

  leftAlignCell(): string {
    return 'text-left';
  }

  updateFilter() {
    const f = this.filterExpenseEntry;
    this.filteredRows = this.allRows.filter(row =>
      (!f.document_number || row.document_number?.toLowerCase().includes(f.document_number.toLowerCase()))&&
      (!f.approval_status || row.approval_status?.toLowerCase().includes(f.approval_status.toLowerCase()))&&
      (!f.voucherDate || row.voucherDate?.toLowerCase().includes(f.voucherDate.toLowerCase()))&&
      (!f.ref_grn || row.ref_grn?.toLowerCase().toString().includes(f.ref_grn.toLowerCase().toString()))
    );
    this.temp = [...this.filteredRows]; // ✅ Store filtered data for pagination
    this.currPage = 1; // ✅ Reset to first page
    this.updatePage(); // ✅ Apply pagination
    this.approval_status = this.rows[0].approval_status;
    this.expenseEntryService.clickedEntry.next(this.rows[0]);
  }

  isVisibleGroupingDD() {
    if (this.rows.length != 0) {
      return false;
    }
    else {
      return true;
    }
  }

  async updatePageSize() {
    this.paginate('');
    this.onPageSizeChange(this.controls.pageSize);
  }

  async viewDetails(row: any) {
    this.isLoading = true;
    this.selected = [row];
    this.isLoading = false;
  }
  
  paginate(direction: 'left' | 'right' | ''): void {
    if (direction === 'right' && this.currPage < this.totalPages_pager) {
      this.currPage++;
    } else if (direction === 'left' && this.currPage > 1) {
      this.currPage--;
    }
    this.updatePage();
  }

  goToPage(page: number): void {
    this.currPage = Math.max(1, Math.min(page, this.totalPages_pager));
    this.updatePage();
  }

  onPageSizeChange(newSize: number): void {
    this.controls.pageSize = newSize;
    this.totalPages_pager = Math.max(1, Math.ceil(this.temp.length / newSize));
    this.currPage = Math.min(this.currPage, this.totalPages_pager);
    this.updatePage();
  }

  private updatePage(): void {
    const pageSize = Number(this.controls.pageSize)
    const totalRows = this.temp.length;
    this.totalPages_pager = Math.max(1, Math.ceil(totalRows / pageSize));
    this.currPage = Math.max(1, Math.min(this.currPage, this.totalPages_pager));
    const startIndex = (this.currPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalRows);
    this.rows = this.temp.slice(startIndex, endIndex);
    this.selected = this.rows.length > 0 ? [this.rows[0]] : [];
    this.totRowCounts = totalRows;
    this.startCount = totalRows === 0 ? 0 : startIndex + 1;
    this.endCount = totalRows === 0 ? 0 : endIndex;
    this.leftArrwDisable = this.currPage <= 1;
    this.rightArrwDisable = this.currPage >= this.totalPages_pager;
  }

  getMiddlePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(2, this.currPage - 1);
    const end = Math.min(this.totalPages_pager - 1, this.currPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  ControlsEnableAndDisable() {
    // 1. Run user access check first
    this.userAccessService.CheckUserAccess(this.expenseEntryService.FormName, this.expenseEntryService);

    // 2. Read current disable flags after CheckUserAccess
    const editDisabled = this.expenseEntryService.editDisabled.getValue();
    const deleteDisabled = this.expenseEntryService.editDisabled.getValue();

    // 3. Only if user access allows (enabled), apply period rules
    if ( !editDisabled || !deleteDisabled) {
      let period_status = sessionStorage.getItem('period_status') || '';
      let data_entry_status = sessionStorage.getItem('data_entry_status') || ''; 
      let approval_status = this.approval_status;

      const periodAllowed = this.userAccessService.CheckPeriodAccess(
        approval_status,
        period_status,
        data_entry_status
      );

      this.expenseEntryService.editDisabled.next(
        !periodAllowed || this.approval_status == 'DRAFT'
      );
      
      this.expenseEntryService.deleteDisabled.next(
        !periodAllowed || this.approval_status == 'DRAFT'
      );
    }
  }
}
