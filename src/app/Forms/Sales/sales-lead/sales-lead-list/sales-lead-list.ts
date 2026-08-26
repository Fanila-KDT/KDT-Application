import { Component } from '@angular/core';
import { SelectionType } from '@swimlane/ngx-datatable';
import { Subscription } from 'rxjs';
import { SalesLeadModel } from '../../../../Model/SalesLead/sales-lead.model';
import { Pagination } from '../../../../Model/pagingResponse';
import { SalesLeadService } from '../../../../Service/SalesLeadService/sales-lead-service';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { EndPointService } from '../../../../Service/end-point.services';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';

@Component({
  selector: 'sales-lead-list',
  standalone: false,
  templateUrl: './sales-lead-list.html',
  styleUrls: ['./sales-lead-list.css','../../../common.css']
})
export class SalesLeadList {
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
  selectedSalesLead: number=0;
  filterSalesLead = new SalesLeadModel();
  filteredRows: any[] = [];  
  salesLeadPagingResponse: Pagination = new Pagination();
  startCount:any = 0;
  totalPages : number = 0;
  totalPages_pager: number =1;
  allRows: any[] = []; 
  userAccessList: any[] = [];
  chunkSize: number = 50;
  leftArrwDisable: boolean = true;
  rightArrwDisable: boolean = false;
  endCount: number=0;

   constructor(public salesLeadService:SalesLeadService,public commonService:CommonService,public endPointService:EndPointService,public userAccessService:UserAccessService) {
    this.gridHeight = this.endPointService.GridHeight;

    this.subscription.push(this.salesLeadService.loadList.subscribe(async data => {
      if(data){
        if (data.length !== 0 ) {
          this.allRows = [...data]; // Save full dataset
          this.rows = [...data];    // Initial display
          this.temp = [...data];
          this.selected = [this.rows[0]];
          this.salesLeadPagingResponse.TotalItems = this.rows.length;
          await this.viewDetails(this.rows[0]);
          await this.updatePageSize();
        }else{
          this.rows = [];
          this.temp = [];
        }
      }
    }));

    this.subscription.push(this.salesLeadService.disableGrid.subscribe(data=>{
      this.disableGrid = data;
    }));

    this.subscription.push(this.salesLeadService.ControlsEnableAndDisable.subscribe(data=>{
      if(data){
        this.ControlsEnableAndDisable();
      }
    }));

    this.subscription.push(this.salesLeadService.ngOnInit.subscribe(data=>{
      if(data){
        this.salesLeadService.getSalesLeadList(1);
        this.disableGrid = false;
        this.salesLeadService.btnClick.next('');
        this.salesLeadService.cancelClick.next(true);
      }
    }));

    this.subscription.push(this.salesLeadService.clickedSalesLead.subscribe(async x=>{
      if(x.id){
        this.selected = [x];
      }
    }));
  }

  async ngOnInit() {
    this.filterSalesLead = new SalesLeadModel();
    await this.salesLeadService.getSalesLeadList(1);
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
        this.selectedSalesLead = 1 + rowIndex;
        this.viewDetails(this.rows[this.selectedSalesLead]);
        this.salesLeadService.clickedSalesLead.next(this.rows[this.selectedSalesLead]);
      } 
      else if (event.type === 'keydown' && (event.event.code === 'ArrowUp'))
      {
        this.selectedSalesLead = rowIndex - 1;
        this.viewDetails(this.rows[this.selectedSalesLead]);
        this.salesLeadService.clickedSalesLead.next(this.rows[this.selectedSalesLead]);
      }
      else if (event.type == 'click') 
      {
        let rowItem = event.row;
        this.selectedSalesLead = this.rows.indexOf(rowItem);
        this.viewDetails(event.row);
        this.salesLeadService.clickedSalesLead.next(this.rows[this.selectedSalesLead]);
      }
    }
  }

  leftAlignCell(): string {
    return 'text-left';
  }

  updateFilter() {
    const f = this.filterSalesLead;
    this.filteredRows = this.allRows.filter(row =>
      (!f.document_number || row.document_number?.toLowerCase().includes(f.document_number.toLowerCase()))&&
      (!f.employee_id || row.employee_id?.toLowerCase().includes(f.employee_id.toLowerCase()))&&
      (!f.salesman_name || row.salesman_name?.toLowerCase().includes(f.salesman_name.toLowerCase()))&&
      (!f.customer_name || row.customer_name?.toLowerCase().includes(f.customer_name.toLowerCase()))&&
      (!f.new_machine_model || row.new_machine_model?.toLowerCase().includes(f.new_machine_model.toLowerCase()))&&
      (!f.voucherDate || row.voucherDate?.toLowerCase().includes(f.voucherDate.toLowerCase()))&&
      (!f.status || row.status?.toLowerCase().includes(f.status.toLowerCase()))
    );
    this.temp = [...this.filteredRows]; // ✅ Store filtered data for pagination
    this.currPage = 1; // ✅ Reset to first page
    this.updatePage(); // ✅ Apply pagination
    this.salesLeadService.clickedSalesLead.next(this.rows[0]);
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
    this.userAccessService.CheckUserAccess(this.salesLeadService.FormName, this.salesLeadService);

    // 2. Read current disable flags after CheckUserAccess
    const newDisable = this.salesLeadService.newDisabled.getValue();
    const editDisabled = this.salesLeadService.editDisabled.getValue();
    const deleteDisabled = this.salesLeadService.deleteDisabled.getValue();

    if(this.commonService.isSystemAdmin.value == true){
      this.salesLeadService.newDisabled.next(false); 
      this.salesLeadService.editDisabled.next(false);
      this.salesLeadService.deleteDisabled.next(false);
      return;
    }

    this.salesLeadService.newDisabled.next(!newDisable);
    this.salesLeadService.editDisabled.next(!editDisabled);
    this.salesLeadService.deleteDisabled.next(!deleteDisabled);

    const cached = localStorage.getItem('userAccessList');
    var userAccessList: any[] = [];
    if (cached) {
      userAccessList = JSON.parse(cached);
    }
    const isTagAdmin = userAccessList?.some( (u: any) => u.permissionName === 'TAG_ADMIN' );
    if (isTagAdmin ) {
      this.commonService.isTagAdmin.next(true);
    }else{
      this.commonService.isTagAdmin.next(false);
    }
  }

}
