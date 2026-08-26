import { Component } from '@angular/core';
import { SelectionType } from '@swimlane/ngx-datatable';
import { Subscription } from 'rxjs';
import { SalesQuotationModel } from '../../../../Model/SalesQuotation/sales-quotation.model';
import { Pagination } from '../../../../Model/pagingResponse';
import { SalesQuotationService } from '../../../../Service/SalesQuotationService/sales-quotation-service';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { EndPointService } from '../../../../Service/end-point.services';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';

@Component({
  selector: 'sales-quotation-list',
  standalone: false,
  templateUrl: './sales-quotation-list.html',
  styleUrls: ['./sales-quotation-list.css','../../../common.css']
})
export class SalesQuotationList {
  subscription: Subscription[] =  new Array<Subscription>();
  isLoading: boolean = false;
  disableGrid: boolean = false;
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
  selectedSalesQuotation: number = 0;
  filterSalesQuotation = new SalesQuotationModel();
  filteredRows: any[] = [];  
  salesQuotationPagingResponse: Pagination = new Pagination();
  startCount:any = 0;
  totalPages : number = 0;
  totalPages_pager: number =1;
  allRows: any[] = []; 
  userAccessList: any[] = [];
  chunkSize: number = 50;
  leftArrwDisable: boolean = true;
  rightArrwDisable: boolean = false;
  endCount: number=0;

  constructor(public salesQuotationService:SalesQuotationService,public commonService:CommonService,public endPointService:EndPointService,
            public userAccessService:UserAccessService) {
    this.gridHeight = this.endPointService.GridHeight;

    this.subscription.push(this.salesQuotationService.loadList.subscribe(async data => {
      if(data){
        if (data.length !== 0 ) {
          this.allRows = [...data]; // Save full dataset
          this.rows = [...data];    // Initial display
          this.temp = [...data];
          this.selected = [this.rows[0]];
          this.salesQuotationPagingResponse.TotalItems = this.rows.length;
          await this.viewDetails(this.rows[0]);
          await this.updatePageSize();
        }else{
          this.rows = [];
          this.temp = [];
        }
      }
    }));

    this.subscription.push(this.salesQuotationService.disableGrid.subscribe(data=>{
      this.disableGrid = data;
    }));

    this.subscription.push(this.salesQuotationService.ControlsEnableAndDisable.subscribe(data=>{
      if(data){
        this.ControlsEnableAndDisable();
      }
    }));

    this.subscription.push(this.salesQuotationService.ngOnInit.subscribe(data=>{
      if(data){
        this.salesQuotationService.getSalesQuotationList(sessionStorage.getItem('year'),1);
        this.disableGrid = false;
        this.salesQuotationService.btnClick.next('');
        this.salesQuotationService.cancelClick.next(true);
      }
    }));

    this.subscription.push(this.salesQuotationService.clickedSalesQuotation.subscribe(async x=>{
      if(x?.voucher_id){
        this.selected = [x];
      }
    }));

    this.subscription.push(this.salesQuotationService.Status.subscribe(([status,status_remarks]) => {
      if (status !='') {
        const idx = this.rows.findIndex(r => r.voucher_id === this.salesQuotationService.voucher_id);
        if (idx !== -1) {
          this.rows[idx] = { ...this.rows[idx], approval_status: status }; // immutable update
        }
      }
    }));

  }

  async ngOnInit() {
    this.filterSalesQuotation = new SalesQuotationModel();
    await this.salesQuotationService.getSalesQuotationList(sessionStorage.getItem('year'),1);
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
    this.rows = [];           // Original data
    this.temp = [];
    this.salesQuotationService.Status.next(['','']);
  }

  onActivate(event: any) {
    let rowItem = event.row;
    let rowIndex = this.rows.indexOf(rowItem);

    if(rowIndex+1!=this.controls.pageSize){
      if (event.type === 'keydown' && (event.event.code === 'ArrowDown'))
      {
        // Get Selected Row Index
        this.selectedSalesQuotation = 1 + rowIndex;
        this.viewDetails(this.rows[this.selectedSalesQuotation]);
        this.salesQuotationService.clickedSalesQuotation.next(this.rows[this.selectedSalesQuotation]);
      } 
      else if (event.type === 'keydown' && (event.event.code === 'ArrowUp'))
      {
        this.selectedSalesQuotation = rowIndex - 1;
        this.viewDetails(this.rows[this.selectedSalesQuotation]);
        this.salesQuotationService.clickedSalesQuotation.next(this.rows[this.selectedSalesQuotation]);
      }
      else if (event.type == 'click') 
      {
        let rowItem = event.row;
        this.selectedSalesQuotation = this.rows.indexOf(rowItem);
        this.viewDetails(event.row);
        this.salesQuotationService.clickedSalesQuotation.next(this.rows[this.selectedSalesQuotation]);
      }
    }
  }

  leftAlignCell(): string {
    return 'text-left';
  }

  updateFilter() {
    const f = this.filterSalesQuotation;
    this.filteredRows = this.allRows.filter(row =>
      (!f.document_number || row.document_number?.toLowerCase().includes(f.document_number.toLowerCase()))&&
      (!f.voucherDate || row.voucherDate?.toLowerCase().includes(f.voucherDate.toLowerCase()))&&
      (!f.salesman_name || row.salesman_name?.toLowerCase().includes(f.salesman_name.toLowerCase()))&&
      (!f.name || row.name?.toLowerCase().includes(f.name.toLowerCase()))&&
      (!f.approval_status || row.approval_status?.toLowerCase().includes(f.approval_status.toLowerCase()))
    );
    this.temp = [...this.filteredRows]; // ✅ Store filtered data for pagination
    this.currPage = 1; // ✅ Reset to first page
    this.updatePage(); // ✅ Apply pagination
    this.salesQuotationService.clickedSalesQuotation.next(this.rows[0]);
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
    let period_status = sessionStorage.getItem('period_status') || '';
    let data_entry_status = sessionStorage.getItem('data_entry_status') || ''; // ⚠️ you had a bug: you were reading period_status twice
   
    const periodAllowed = this.userAccessService.CheckPeriodAccess(
      "",
      period_status,
      data_entry_status
    );

    // 1. Run user access check first
    this.userAccessService.CheckUserAccess(this.salesQuotationService.FormName, this.salesQuotationService);

    // 2. Read current disable flags after CheckUserAccess
    const newDisable = this.salesQuotationService.newDisabled.getValue();
    const editDisabled = this.salesQuotationService.editDisabled.getValue();
    const deleteDisabled = this.salesQuotationService.deleteDisabled.getValue();

    if(this.commonService.isSystemAdmin.value == true){
      this.salesQuotationService.newDisabled.next(false); 
      this.salesQuotationService.editDisabled.next(false);
      this.salesQuotationService.deleteDisabled.next(false);
      return;
    }

    if(this.salesQuotationService.approval_status?.toUpperCase() === 'PENDING' || this.salesQuotationService.approval_status?.toUpperCase() === 'LOST' 
        || this.salesQuotationService.approval_status?.toUpperCase() === 'REJECTED' || this.salesQuotationService.approval_status?.toUpperCase() === 'APPROVED'){
      this.salesQuotationService.editDisabled.next(!(periodAllowed && editDisabled));
      this.salesQuotationService.deleteDisabled.next(!(periodAllowed && deleteDisabled));
      this.salesQuotationService.changeStatus.next(!(periodAllowed));
    }else{
      this.salesQuotationService.editDisabled.next(true);
      this.salesQuotationService.deleteDisabled.next(true);
      this.salesQuotationService.changeStatus.next(true);
    }
    this.salesQuotationService.newDisabled.next(!(periodAllowed && newDisable));

  }

}
