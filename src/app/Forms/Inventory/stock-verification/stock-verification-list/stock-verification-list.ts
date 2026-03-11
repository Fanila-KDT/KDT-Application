import { ChangeDetectorRef, Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Pagination } from '../../../../Model/pagingResponse';
import { StockVerificationModel } from '../../../../Model/StockVerification/stock-verification.model';
import { SelectionType } from '@swimlane/ngx-datatable';
import { StockVerificationService } from '../../../../Service/StockVerificationService/stock-verification-service';
import { EndPointService } from '../../../../Service/end-point.services';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';

@Component({
  selector: 'stock-verification-list',
  standalone: false,
  templateUrl: './stock-verification-list.html',
  styleUrls: ['./stock-verification-list.css', '../../../common.css']
})
export class StockVerificationList {

  disableGrid: boolean =false;
  rows: any[] = [];           // Original data
  temp:any[] = [];     
  isLoading: boolean = false;
  selected: any[] = [];
  reorderable = true;
  SelectionType = SelectionType;
  controls = {
    pageSize:50
  };
  stockVarificationPagingResponse: Pagination = new Pagination();
  filterStockVerification = new StockVerificationModel();
  startCount:any = 0;
  totalPages : number = 0;
  totalPages_pager: number =1;
  allRows: any[] = []; // full dataset
  filteredRows: any[] = []; // current visible chunk
  userAccessList: any[] = [];
  currPage: number = 1;
  chunkSize: number = 50;
  selectedStockVarification: number=0;
  subscription: Subscription[] =  new Array<Subscription>();
  prevPage: number = 0;
  start: number=0;
  end: number=0;
  leftArrwDisable: boolean = true;
  rightArrwDisable: boolean = false;
  totRowCounts: number=0;
  endCount: number=0;
  gridHeight:number;
  scroll: boolean = true;
  clrFilterDisable = false;
  approval_status:string ='';

  constructor(public stockVerificationService:StockVerificationService,public endPointService:EndPointService,public userAccessService:UserAccessService,
            private cdRef: ChangeDetectorRef) {
    this.gridHeight = this.endPointService.GridHeight;

    this.subscription.push(this.stockVerificationService.loadListStockVerification.subscribe(async data => {
      if(data){
        if (data.length !== 0 ) {
          this.allRows = [...data]; // Save full dataset
          this.rows = [...data];    // Initial display
          this.temp = [...data];
          this.selected = [this.rows[0]];
          this.stockVarificationPagingResponse.TotalItems = this.rows.length;
          await this.viewDetails(this.rows[0]);
          await this.updatePageSize();
          this.cdRef.markForCheck();
        }else{
          this.rows = [];
          this.temp = [];
        }
      }
    }));

    this.subscription.push(this.stockVerificationService.disableGrid.subscribe(data=>{
      this.disableGrid = data;
    }));

    this.subscription.push(this.stockVerificationService.ControlsEnableAndDisable.subscribe(data=>{
      this.ControlsEnableAndDisable()
    }));

    this.subscription.push(this.stockVerificationService.addRowAfterModify.subscribe(data => {
      if (data[0]?.voucher_id) {
        this.selected = [data[0]];
        this.stockVerificationService.clickedStock.next(this.selected[0]);
        this.approval_status = this.selected[0].approval_status;
      }
    }));
  }

  async ngOnInit() {
    await this.stockVerificationService.getStockVerificationList(this.endPointService.year);
    this.cdRef.markForCheck();
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  onActivate(event: any) {
    let rowItem = event.row;
    let rowIndex = this.rows.indexOf(rowItem);

    if(rowIndex+1!=this.controls.pageSize){
      if (event.type === 'keydown' && (event.event.code === 'ArrowDown'))
      {
        // Get Selected Row Index
        this.selectedStockVarification = 1 + rowIndex;
        this.viewDetails(this.rows[this.selectedStockVarification]);
        this.approval_status = this.rows[this.selectedStockVarification].approval_status;
        this.stockVerificationService.clickedStock.next(this.rows[this.selectedStockVarification]);
      } 
      else if (event.type === 'keydown' && (event.event.code === 'ArrowUp'))
      {
        this.selectedStockVarification = rowIndex - 1;
        this.viewDetails(this.rows[this.selectedStockVarification]);
        this.approval_status = this.rows[this.selectedStockVarification].approval_status;
        this.stockVerificationService.clickedStock.next(this.rows[this.selectedStockVarification]);
      }
      else if (event.type == 'click') 
      {
        let rowItem = event.row;
        this.selectedStockVarification = this.rows.indexOf(rowItem);
        this.viewDetails(event.row);
        this.approval_status = this.rows[this.selectedStockVarification].approval_status;
        this.stockVerificationService.clickedStock.next(this.rows[this.selectedStockVarification]);
      }
    }
  }

  updateFilter() {
    const f = this.filterStockVerification;
    this.filteredRows = this.allRows.filter(row =>
      (!f.godown_name || row.godown_name?.toLowerCase().includes(f.godown_name.toLowerCase())) &&
      (!f.approval_status || row.approval_status?.toLowerCase().includes(f.approval_status.toLowerCase())) &&
      (!f.account_name || row.account_name?.toLowerCase().includes(f.account_name.toLowerCase())) &&
      (!f.document_number || row.document_number?.toLowerCase().includes(f.document_number.toLowerCase())) &&
      (!f.po_no || row.po_no?.toLowerCase().includes(f.po_no.toLowerCase())) &&
      (!f.verifiedDate || row.verifiedDate?.toLowerCase().includes(f.verifiedDate.toLowerCase()))
    );
    this.temp = [...this.filteredRows]; // ✅ Store filtered data for pagination
    this.currPage = 1; // ✅ Reset to first page
    this.updatePage(); // ✅ Apply pagination
    this.approval_status = this.rows[0].approval_status;
    this.stockVerificationService.clickedStock.next(this.rows[0]);
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

  leftAlignCell(): string {
    return 'text-left';
  }

  ControlsEnableAndDisable() {
    // 1. Run user access check first
    this.userAccessService.CheckUserAccess(this.stockVerificationService.FormName, this.stockVerificationService);

    // 2. Read current disable flags after CheckUserAccess
    const editDisabled = this.stockVerificationService.editDisabled.getValue();

    // 3. Only if user access allows (enabled), apply period rules
    if ( !editDisabled) {
      let period_status = sessionStorage.getItem('period_status') || '';
      let data_entry_status = sessionStorage.getItem('data_entry_status') || ''; 
      let approval_status = this.approval_status;

      const periodAllowed = this.userAccessService.CheckPeriodAccess(
        approval_status,
        period_status,
        data_entry_status
      );

      this.stockVerificationService.editDisabled.next(
        !periodAllowed || this.approval_status !== 'Stock Checking'
     );
    }
  }
}
