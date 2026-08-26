import { ChangeDetectorRef, Component } from '@angular/core';
import { Pagination } from '../../../../Model/pagingResponse';
import { StockTakingModel } from '../../../../Model/StockTaking/stock-taking.model';
import { SelectionType } from '@swimlane/ngx-datatable';
import { Subscription } from 'rxjs';
import { StockTakingService } from '../../../../Service/StockTakingService/stock-taking-service';
import { EndPointService } from '../../../../Service/end-point.services';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';
import { PurchaseOrderService } from '../../../../Service/PurchaseOrderService/purchase-order-service';
import { CommonService } from '../../../../Service/CommonService/common-service';

@Component({
  selector: 'stock-taking-list',
  standalone: false,
  templateUrl: './stock-taking-list.html',
  styleUrls: ['./stock-taking-list.css','../../../common.css']
})
export class StockTakingList {

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
  selectedStockTaking: number=0;
  filterStockTaking = new StockTakingModel();
  filteredRows: any[] = [];  
  stockTakingPagingResponse: Pagination = new Pagination();
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

  
  constructor(public stockTakingService:StockTakingService,public commonService:CommonService,public endPointService:EndPointService,public userAccessService:UserAccessService,
            private cdRef: ChangeDetectorRef,public purchaseOrderService:PurchaseOrderService) {
    this.gridHeight = this.endPointService.GridHeight;

    this.subscription.push(this.stockTakingService.loadListStockTaking.subscribe(async data => {
      if(data){
        if (data.length !== 0 ) {
          this.allRows = [...data]; // Save full dataset
          this.rows = [...data];    // Initial display
          this.temp = [...data];
          this.selected = [this.rows[0]];
          this.stockTakingPagingResponse.TotalItems = this.rows.length;
          await this.viewDetails(this.rows[0]);
          await this.updatePageSize();
          this.cdRef.markForCheck();
        }else{
          this.rows = [];
          this.temp = [];
        }
      }
    }));

    this.subscription.push(this.stockTakingService.disableGrid.subscribe(data=>{
      this.disableGrid = data;
    }));

    this.subscription.push(this.stockTakingService.ControlsEnableAndDisable.subscribe(data=>{
      this.approval_status = this.rows.length > 0 ? this.rows[this.selectedStockTaking].approval_status : '';
      if(data){
        this.ControlsEnableAndDisable();
      }
    }));

    this.subscription.push(this.stockTakingService.ngOnInit.subscribe(data=>{
      if(data){
        this.stockTakingService.getStockTakingList(sessionStorage.getItem('year'),1);
        this.disableGrid = false;
        this.stockTakingService.btnClick.next('');
        this.stockTakingService.cancelClick.next(true);
      }
    }));

    this.subscription.push(this.stockTakingService.clickedStockTras.subscribe(async x=>{
      if(x.stock_taking_id){
        this.selected = [x];
      }
    }));
  }

  async ngOnInit() {
    this.filterStockTaking = new StockTakingModel();
    await this.stockTakingService.getStockTakingList(this.endPointService.year,1);
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
    this.rows = [];           // Original data
    this.temp = [];
  }

  onActivate(event: any) {
    let rowItem = event.row;
    let rowIndex = this.rows.indexOf(rowItem);

    if(rowIndex+1!=this.controls.pageSize){
      if (event.type === 'keydown' && (event.event.code === 'ArrowDown'))
      {
        // Get Selected Row Index
        this.selectedStockTaking = 1 + rowIndex;
        this.viewDetails(this.rows[this.selectedStockTaking]);
        this.approval_status = this.rows[this.selectedStockTaking].approval_status;
        this.stockTakingService.clickedStockTras.next(this.rows[this.selectedStockTaking]);
      } 
      else if (event.type === 'keydown' && (event.event.code === 'ArrowUp'))
      {
        this.selectedStockTaking = rowIndex - 1;
        this.viewDetails(this.rows[this.selectedStockTaking]);
        this.approval_status = this.rows[this.selectedStockTaking].approval_status;
        this.stockTakingService.clickedStockTras.next(this.rows[this.selectedStockTaking]);
      }
      else if (event.type == 'click') 
      {
        let rowItem = event.row;
        this.selectedStockTaking = this.rows.indexOf(rowItem);
        this.viewDetails(event.row);
        this.approval_status = this.rows[this.selectedStockTaking].approval_status;
        this.stockTakingService.clickedStockTras.next(this.rows[this.selectedStockTaking]);
      }
    }
  }

  leftAlignCell(): string {
    return 'text-left';
  }

  updateFilter() {
    const f = this.filterStockTaking;
    this.filteredRows = this.allRows.filter(row =>
      (!f.document_number || row.document_number?.toLowerCase().includes(f.document_number.toLowerCase()))&&
      (!f.approval_status || row.approval_status?.toLowerCase().includes(f.approval_status.toLowerCase()))&&
      (!f.created_by || row.created_by?.toLowerCase().includes(f.created_by.toLowerCase()))&&
      (!f.godown_name || row.godown_name?.toLowerCase().includes(f.godown_name.toLowerCase()))
    );
    this.temp = [...this.filteredRows]; // ✅ Store filtered data for pagination
    this.currPage = 1; // ✅ Reset to first page
    this.updatePage(); // ✅ Apply pagination
    this.approval_status = this.rows[0].approval_status;
    this.stockTakingService.clickedStockTras.next(this.rows[0]);
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
    this.userAccessService.CheckUserAccess(this.stockTakingService.FormName, this.stockTakingService);

    // 2. Read current disable flags after CheckUserAccess
    const newDisable = this.stockTakingService.newDisabled.getValue();
    const editDisabled = this.stockTakingService.editDisabled.getValue();
    const deleteDisabled = this.stockTakingService.deleteDisabled.getValue();

    // 3. Only if user access allows (enabled), apply period rules
    let period_status = sessionStorage.getItem('period_status') || '';
    let data_entry_status = sessionStorage.getItem('data_entry_status') || ''; 
    let approval_status = this.approval_status;

    const periodAllowed = this.userAccessService.CheckPeriodAccess(
      approval_status,
      period_status,
      data_entry_status
    );

    if(this.commonService.isSystemAdmin.value == true){
      this.stockTakingService.newDisabled.next(false);
      this.stockTakingService.editDisabled.next(false);
      this.stockTakingService.deleteDisabled.next(false);
      return;
    }

    this.stockTakingService.newDisabled.next(!(periodAllowed && newDisable));
    
    this.stockTakingService.editDisabled.next(
      !(periodAllowed && this.approval_status?.toUpperCase() === 'DRAFT' && editDisabled)
    );
    
    this.stockTakingService.deleteDisabled.next(
      !(periodAllowed && this.approval_status?.toUpperCase() === 'DRAFT' && deleteDisabled)
    );
  }
}
