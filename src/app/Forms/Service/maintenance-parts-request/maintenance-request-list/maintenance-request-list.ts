import { ChangeDetectorRef, Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { MaintenanceRequestModel } from '../../../../Model/MaintenanceRequest/maintenance-request.model';
import { SelectionType } from '@swimlane/ngx-datatable';
import { MaintenanceRequestService } from '../../../../Service/MaintenanceRequestService/maintenance-request-service';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { EndPointService } from '../../../../Service/end-point.services';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';
import { Pagination } from '../../../../Model/pagingResponse';
import { Router } from '@angular/router';
import { DashboardService } from '../../../../Service/DashboardService/dashboard-service';

@Component({
  selector: 'maintenance-request-list',
  standalone: false,
  templateUrl: './maintenance-request-list.html',
  styleUrls: ['./maintenance-request-list.css','../../../common.css']
})
export class MaintenanceRequestList {
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
  selectedMaintenanceRequest: number=0;
  filterMaintenanceRequest = new MaintenanceRequestModel();
  filteredRows: any[] = [];  
  maintenanceRequestPagingResponse: Pagination = new Pagination();
  startCount:any = 0;
  totalPages : number = 0;
  totalPages_pager: number =1;
  allRows: any[] = []; 
  userAccessList: any[] = [];
  chunkSize: number = 50;
  leftArrwDisable: boolean = true;
  rightArrwDisable: boolean = false;
  endCount: number=0;

  constructor(public maintenanceRequestService:MaintenanceRequestService,public commonService:CommonService,public endPointService:EndPointService,public userAccessService:UserAccessService,
            private cdRef: ChangeDetectorRef,private router: Router,public dashboardService: DashboardService) {
    this.gridHeight = this.endPointService.GridHeight;

    this.subscription.push(this.maintenanceRequestService.loadList.subscribe(async data => {
      if(data){
        if (data.length !== 0 ) {
          this.allRows = [...data]; // Save full dataset
          this.rows = [...data];    // Initial display
          this.temp = [...data];
          this.selected = [this.rows[0]];
          this.maintenanceRequestPagingResponse.TotalItems = this.rows.length;
          await this.viewDetails(this.rows[0]);
          await this.updatePageSize();
          this.cdRef.markForCheck();
        }else{
          this.rows = [];
          this.temp = [];
        }
      }
    }));

    this.subscription.push(this.maintenanceRequestService.disableGrid.subscribe(data=>{
      this.disableGrid = data;
    }));

    this.subscription.push(this.maintenanceRequestService.ControlsEnableAndDisable.subscribe(data=>{
      if(data){
        this.ControlsEnableAndDisable();
      }
    }));

    this.subscription.push(this.maintenanceRequestService.ngOnInit.subscribe(data=>{
      if(data){
        this.maintenanceRequestService.GetMaintenanceRequestList(sessionStorage.getItem('year')??this.endPointService.year,1);
        this.disableGrid = false;
        this.maintenanceRequestService.btnClick.next('');
        this.maintenanceRequestService.cancelClick.next(true);
      }
    }));

    this.subscription.push(this.maintenanceRequestService.clickedRequest.subscribe(async x=>{
      if(x?.voucher_id){
        this.selected = [x];
      }
    }));
  }

  async ngOnInit() {
    this.filterMaintenanceRequest = new MaintenanceRequestModel();
    await this.maintenanceRequestService.GetMaintenanceRequestList(sessionStorage.getItem('year')??this.endPointService.year,1);
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
        this.selectedMaintenanceRequest = 1 + rowIndex;
        this.viewDetails(this.rows[this.selectedMaintenanceRequest]);
        this.maintenanceRequestService.clickedRequest.next(this.rows[this.selectedMaintenanceRequest]);
      } 
      else if (event.type === 'keydown' && (event.event.code === 'ArrowUp'))
      {
        this.selectedMaintenanceRequest = rowIndex - 1;
        this.viewDetails(this.rows[this.selectedMaintenanceRequest]);
        this.maintenanceRequestService.clickedRequest.next(this.rows[this.selectedMaintenanceRequest]);
      }
      else if (event.type == 'click') 
      {
        let rowItem = event.row;
        this.selectedMaintenanceRequest = this.rows.indexOf(rowItem);
        this.viewDetails(event.row);
        this.maintenanceRequestService.clickedRequest.next(this.rows[this.selectedMaintenanceRequest]);
      }
    }
  }

  leftAlignCell(): string {
    return 'text-left';
  }

  updateFilter() {
    const f = this.filterMaintenanceRequest;
    this.filteredRows = this.allRows.filter(row =>
      (!f.document_number || row.document_number?.toLowerCase().includes(f.document_number.toLowerCase()))&&
      (!f.tag_no || row.tag_no?.toLowerCase().includes(f.tag_no.toLowerCase()))&&
      (!f.model_name || row.model_name?.toLowerCase().includes(f.model_name.toLowerCase()))&&
      (!f.voucherDate || row.voucherDate?.toLowerCase().includes(f.voucherDate.toLowerCase()))&&
      (!f.approval_status || row.approval_status?.toLowerCase().includes(f.approval_status.toLowerCase()))
    );
    this.temp = [...this.filteredRows]; // ✅ Store filtered data for pagination
    this.currPage = 1; // ✅ Reset to first page
    this.updatePage(); // ✅ Apply pagination
    this.maintenanceRequestService.clickedRequest.next(this.rows[0]);
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
    this.userAccessService.CheckUserAccess(this.maintenanceRequestService.FormName, this.maintenanceRequestService);

    // 2. Read current disable flags after CheckUserAccess
    const newDisable = this.maintenanceRequestService.newDisabled.getValue();
    const editDisabled = this.maintenanceRequestService.editDisabled.getValue();
    const deleteDisabled = this.maintenanceRequestService.deleteDisabled.getValue();

    if(this.commonService.isSystemAdmin.value == true){
      this.maintenanceRequestService.newDisabled.next(false); 
      this.maintenanceRequestService.editDisabled.next(false);
      this.maintenanceRequestService.deleteDisabled.next(false);
      return;
    }

    this.maintenanceRequestService.newDisabled.next(!newDisable);
    this.maintenanceRequestService.editDisabled.next(!editDisabled);
    this.maintenanceRequestService.deleteDisabled.next(!deleteDisabled);

    const cached = localStorage.getItem('userAccessList');
    var userAccessList: any[] = [];
    if (cached) {
      userAccessList = JSON.parse(cached);
    }
    const isAccAdmin = userAccessList?.some( (u: any) => u.permissionName === 'ACCOUNTS_ADMIN' );
    if (isAccAdmin ) {
      this.commonService.isAccAdmin.next(true);
    }else{
      this.commonService.isAccAdmin.next(false);
    }
  }

  async OpenIssueItem(row: any) {
    const items = await this.maintenanceRequestService .GetMaintenanceRequestDetails(row.voucher_id);
    this.dashboardService.IssueItem = 1;
    this.dashboardService.clickedIssueItems.next(items); 
    this.dashboardService.clickedIssueRow.next(row); 
    //sessionStorage.setItem('clickedPurchaseOrder', JSON.stringify(row)); // ⚠️ store as JSON string
    this.router.navigate(['/Forms/maintenance-issue']);
  }
}

