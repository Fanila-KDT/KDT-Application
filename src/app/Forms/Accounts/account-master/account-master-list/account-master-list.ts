import { Component } from '@angular/core';
import { SelectionType } from '@swimlane/ngx-datatable';
import { AccountMasterModel } from '../../../../Model/AccountMaster/account-master.model';
import { Pagination } from '../../../../Model/pagingResponse';
import { Subscription } from 'rxjs';
import { AccountMasterService } from '../../../../Service/AccountMasterService/account-master-service';
import { App } from '../../../../app';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { EndPointService } from '../../../../Service/end-point.services';

@Component({
  selector: 'account-master-list',
  standalone: false,
  templateUrl: './account-master-list.html',
  styleUrls: ['./account-master-list.css','../../../common.css']
})
export class AccountMasterList {
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
  accountMasterPagingResponse: Pagination = new Pagination();
  filterAccountMaster = new AccountMasterModel();
  startCount:any =0;
  totalPages : number = 0;
  totalPages_pager: number =1;
  allRows: any[] = []; // full dataset
  filteredRows: any[] = []; // current visible chunk
  userAccessList: any[] = [];
  currPage: number = 1;
  chunkSize: number = 50;
  selectedAccountMaster: number=0;
  subscription: Subscription[];
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

  constructor(private commonService: CommonService,public accountMasterService:AccountMasterService,public userAccessService:UserAccessService,public endPointService:EndPointService) {
    this.gridHeight = this.endPointService.GridHeight;
    this.subscription = new Array<Subscription>();
    this.subscription.push(this.accountMasterService.loadList.subscribe(async data => {
      if(data){
        if (data.length !== 0 ) {
          this.allRows = [...data]; // Save full dataset
          this.rows = [...data];    // Initial display
          this.temp = [...data];
          this.selected = [this.rows[0]];
          this.accountMasterPagingResponse.TotalItems = this.rows.length;
          await this.viewDetails(this.rows[0]);
          await this.updatePageSize();
        }else{
          this.rows = [];
          this.temp = [];
        }
      }
    }));

    this.subscription.push(this.accountMasterService.disableGrid.subscribe(data=>{
      this.disableGrid = data;
    }));

    this.subscription.push(this.accountMasterService.addRowAfterSave.subscribe(data=>{
      if(data.account_code){
        this.rows.unshift(data);
        this.selected = [this.rows[0]];
      }
    }));

    this.subscription.push(this.accountMasterService.addRowAfterModify.subscribe(data => {
      if (data.account_code) {
        const index = this.rows.findIndex(row => row.account_code === data.account_code);
        if (index !== -1) {
          this.rows.splice(index, 1, data);
        }
        this.selected = [data];
      }
    }));

    this.subscription.push(this.accountMasterService.ControlsEnableAndDisable.subscribe(data=>{
      if(data){
        this.ControlsEnableAndDisable();
      }
    }));

    this.subscription.push(this.accountMasterService.ngOnInit.subscribe(data=>{
      if(data){
        this.ngOnInit();
        this.disableGrid = false;
        this.accountMasterService.btnClick.next('');
        this.accountMasterService.cancelClick.next(true);
      }
    }));
  }

  async ngOnInit() {    
    this.filterAccountMaster = new AccountMasterModel();
    await this.accountMasterService.getAccountMasterList();
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  updateFilter() {
    const f = this.filterAccountMaster;
    this.filteredRows = this.allRows.filter(row =>
      (!f.ac_code || row.ac_code?.toString().includes(f.ac_code.toString())) &&
      (!f.account_name || row.account_name?.toLowerCase().includes(f.account_name.toLowerCase())) &&
      (!f.account_description || row.account_description?.toLowerCase().includes(f.account_description.toLowerCase()))
    );
    this.temp = [...this.filteredRows]; // ✅ Store filtered data for pagination
    this.currPage = 1; // ✅ Reset to first page
    this.updatePage(); // ✅ Apply pagination
    this.accountMasterService.clickedAccount.next(this.rows[0]);
  }


  onRowSelect(event: any) {
   //this.accountMasterService.clickedAccount.next(event.selected[0]);
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
      this.selected = [row];
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
  
    updateGridHeight(): number {
      const rowHeight = 30; // Adjust based on your row styling
      const headerHeight = 60;
      const footerHeight = 80;
      const buffer = 10;
      if(this.rows.length != 0){
        const calculatedHeight =  this.rows.length * rowHeight + headerHeight + footerHeight + buffer;
        const minLen = Math.max(250, calculatedHeight)
        return Math.min(minLen, 400); // ✅ cap at 400px
      }else{
        const calculatedHeight =  1 * rowHeight + headerHeight + footerHeight + buffer;
        return Math.min(calculatedHeight, 400); // ✅ cap at 400px
      }
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

    onActivate(event: any) {
    let rowItem = event.row;
    let rowIndex = this.rows.indexOf(rowItem);

    if(rowIndex+1!=this.controls.pageSize){
      if (event.type === 'keydown' && (event.event.code === 'ArrowDown'))
      {
        // Get Selected Row Index
        this.selectedAccountMaster = 1 + rowIndex;
        this.viewDetails(this.rows[this.selectedAccountMaster]);
        this.accountMasterService.clickedAccount.next(this.rows[this.selectedAccountMaster]);
        let indexv = this.rows.indexOf(rowItem)
        //this.ControlsEnableDisable(1,indexv)
      } 
      else if (event.type === 'keydown' && (event.event.code === 'ArrowUp'))
      {
        this.selectedAccountMaster = rowIndex - 1;
        this.viewDetails(this.rows[this.selectedAccountMaster]);
        this.accountMasterService.clickedAccount.next(this.rows[this.selectedAccountMaster]);
        let indexv = this.rows.indexOf(rowItem)
        //this.ControlsEnableDisable(1,indexv)
      }
      else if (event.type == 'click') 
      {
        let rowItem = event.row;
        this.selectedAccountMaster = this.rows.indexOf(rowItem);
        this.viewDetails(event.row);
        this.accountMasterService.clickedAccount.next(this.rows[this.selectedAccountMaster]);
        let indexv = this.rows.indexOf(rowItem)
        //this.ControlsEnableDisable(1,indexv)
      }
    }
  }

    ControlsEnableAndDisable() {
    // 1. Run user access check first
    this.userAccessService.CheckUserAccess(this.accountMasterService.FormName, this.accountMasterService);

    // 2. Read current disable flags after CheckUserAccess
    const newDisable = this.accountMasterService.newDisabled.getValue();
    const editDisabled = this.accountMasterService.editDisabled.getValue();
    const deleteDisabled = this.accountMasterService.deleteDisabled.getValue();

    // 3. Only if user access allows (enabled), apply period rules
    let period_status = sessionStorage.getItem('period_status') || '';
    let data_entry_status = sessionStorage.getItem('data_entry_status') || ''; 

    const periodAllowed = this.userAccessService.CheckPeriodAccess(
      '',
      period_status,
      data_entry_status
    );

    if(this.commonService.isSystemAdmin.value == true){
      this.accountMasterService.newDisabled.next(false); 
      this.accountMasterService.editDisabled.next(false);
      this.accountMasterService.deleteDisabled.next(false);
      return;
    }
    this.accountMasterService.newDisabled.next(!(periodAllowed && newDisable));
    this.accountMasterService.editDisabled.next(!(periodAllowed  && editDisabled));
    this.accountMasterService.deleteDisabled.next(!(periodAllowed && deleteDisabled)); 
  }
}
