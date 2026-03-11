import { Component } from '@angular/core';
import { SelectionType } from '@swimlane/ngx-datatable';
import { Pagination } from '../../../../Model/pagingResponse';
import { Subscription } from 'rxjs';
import { UserMasterService } from '../../../../Service/UserMasterService/user-master-service';
import { UserMasterModel } from '../../../../Model/UserMaster/user-master.model';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';

@Component({
  selector: 'user-master-list',
  standalone: false,
  templateUrl: './user-master-list.html',
  styleUrls: ['./user-master-list.css','../../../common.css']
})
export class UserMasterList {

  userMasterPagingResponse: Pagination = new Pagination();
  filterUserMaster = new UserMasterModel();
  rows: any[] = [];           // Original data
  temp:any[] = [];     
  subscription: Subscription[];
  selected: any[] = [];
  allRows: any[] = []; // full dataset
  filteredRows: any[] = []; // current visible chunk
  userAccessList: any[] = [];
  SelectionType = SelectionType;
  controls = {
    pageSize:50
  };
  startCount:any =0;
  totalPages : number = 0;
  totalPages_pager: number =1;
  currPage: number = 1;
  chunkSize: number = 50;
  selectedUserMaster: number=0;
  prevPage: number = 0;
  start: number=0;
  end: number=0;
  leftArrwDisable: boolean = true;
  rightArrwDisable: boolean = false;
  totRowCounts: number=0;
  endCount: number=0;
  gridHeight:number=384;
  scroll: boolean = true;
  clrFilterDisable = false;
  disableGrid: boolean =false;
  isLoading: boolean = false;
  reorderable = true;

  constructor(public userMasterService:UserMasterService,public userAccessService:UserAccessService) {
    this.subscription = new Array<Subscription>();

    this.subscription.push(this.userMasterService.loadList.subscribe(async data => {
      if(data){
        if (data.length !== 0 ) {
          this.allRows = [...data]; // Save full dataset
          this.rows = [...data];    // Initial display
          this.temp = [...data];
          this.selected = [this.rows[0]];
          this.userMasterPagingResponse.TotalItems = this.rows.length;
          await this.viewDetails(this.rows[0]);
          await this.updatePageSize();
        }else{
          this.rows = [];
          this.temp = [];
        }
      }
    }));

    this.subscription.push(this.userMasterService.disableGrid.subscribe(data=>{
      this.disableGrid = data;
    }));

    this.subscription.push(this.userMasterService.addRowAfterSave.subscribe(data=>{
      if(data.user_id){
        this.rows.unshift(data);
        this.selected = [this.rows[0]];
      }
    }));
    
    this.subscription.push(this.userMasterService.addRowAfterModify.subscribe(data => {
      if (data.user_id) {
        const index = this.rows.findIndex(row => row.user_id === data.user_id);
        if (index !== -1) {
          this.rows.splice(index, 1, data);
        }
        this.selected = [data];
      }
    }));
    
    this.subscription.push(this.userMasterService.isLoading.subscribe(data=>{
      this.isLoading = data;
    }));

    this.subscription.push(this.userMasterService.ngOnInit.subscribe(data=>{
      if(data){
        this.ngOnInit();
        this.disableGrid = false;
        this.userMasterService.btnClick.next('');
        this.userMasterService.cancelClick.next(true);
      }
    }));
  }    

  async ngOnInit() {
    this.userMasterService.isLoading.next(true);
    await this.userMasterService.getUserMasterList();
    this.userMasterService.isLoading.next(false);
    this.userAccessService.CheckUserAccess(this.userMasterService.FormName,this.userMasterService);
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  updateFilter() {
    const f = this.filterUserMaster;

    this.filteredRows = this.allRows.filter(row =>
      (!f.user_id || row.user_id?.toLowerCase().includes(f.user_id.toLowerCase())) &&
      (!f.user_name || row.user_name?.toLowerCase().includes(f.user_name.toLowerCase()))// &&
      // (!f.godown_code || row.godown_code?.toString().toLowerCase().includes(f.godown_code.toString().toLowerCase())) &&
      // (!f.invoice_godown_code || row.invoice_godown_code?.toString().toLowerCase().includes(f.invoice_godown_code.toString().toLowerCase())) 
    );

    this.temp = [...this.filteredRows]; // ✅ Store filtered data for pagination
    this.currPage = 1; // ✅ Reset to first page
    this.updatePage(); // ✅ Apply pagination
    this.userMasterService.clickedUser.next(this.rows[0]);
  }


  onRowSelect(event: any) {
   this.userMasterService.clickedUser.next(event.selected[0]);
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
        this.selectedUserMaster = 1 + rowIndex;
        this.viewDetails(this.rows[this.selectedUserMaster]);
        this.userMasterService.clickedUser.next(this.rows[this.selectedUserMaster]);
        let indexv = this.rows.indexOf(rowItem)
        //this.ControlsEnableDisable(1,indexv)
      } 
      else if (event.type === 'keydown' && (event.event.code === 'ArrowUp'))
      {
        this.selectedUserMaster = rowIndex - 1;
        this.viewDetails(this.rows[this.selectedUserMaster]);
        this.userMasterService.clickedUser.next(this.rows[this.selectedUserMaster]);
        let indexv = this.rows.indexOf(rowItem)
        //this.ControlsEnableDisable(1,indexv)
      }
      else if (event.type == 'click') 
      {
        let rowItem = event.row;
        this.selectedUserMaster = this.rows.indexOf(rowItem);
        this.viewDetails(event.row);
        this.userMasterService.clickedUser.next(this.rows[this.selectedUserMaster]);
        let indexv = this.rows.indexOf(rowItem)
        //this.ControlsEnableDisable(1,indexv)
      }
    }
  }

  // CheckUserAccess(){
  //   const cached = localStorage.getItem('userAccessList');
  //   if (cached) {
  //     this.userAccessList = JSON.parse(cached);
  //   }

  //   const Permissions = this.userAccessList.filter(
  //     p => p.permissionName.trim().toUpperCase() === this.userMasterService.FormName
  //   );

  //   // Pick the one with max level_of_rights
  //   const LargestPermissions = Permissions.reduce((prev:any, current:any) =>
  //     current.level_of_rights > prev.level_of_rights ? current : prev
  //   );
  //   let level = LargestPermissions ? LargestPermissions.level_of_rights : 0;
  //   this.userMasterService.newDisabled.next(level < 2);    // enabled from level 2+
  //   this.userMasterService.editDisabled.next(level < 3);   // enabled from level 3+
  //   this.userMasterService.deleteDisabled.next(level < 4); // enabled from level 4+
  // }
}
