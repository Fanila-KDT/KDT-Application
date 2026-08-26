import { Component } from '@angular/core';
import { SelectionType } from '@swimlane/ngx-datatable';
import { Subscription } from 'rxjs';
import { Pagination } from '../../../../Model/pagingResponse';
import { AreaMasterModel } from '../../../../Model/AreaMaster/area-master.model';
import { AreaMasterService } from '../../../../Service/AreaMasterService/area-master-service';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { EndPointService } from '../../../../Service/end-point.services';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';

@Component({
  selector: 'area-master-list',
  standalone: false,
  templateUrl: './area-master-list.html',
  styleUrls: ['./area-master-list.css','../../../common.css']
})
export class AreaMasterList {
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
  selectedAreaMaster: number=0;
  filterAreaMaster = new AreaMasterModel();
  filteredRows: any[] = [];  
  areaMasterPagingResponse: Pagination = new Pagination();
  startCount:any = 0;
  totalPages : number = 0;
  totalPages_pager: number =1;
  allRows: any[] = []; 
  userAccessList: any[] = [];
  chunkSize: number = 50;
  leftArrwDisable: boolean = true;
  rightArrwDisable: boolean = false;
  endCount: number=0;

   constructor(public areaMasterService:AreaMasterService,public commonService:CommonService,public endPointService:EndPointService,public userAccessService:UserAccessService) {
    this.gridHeight = this.endPointService.GridHeight;

    this.subscription.push(this.areaMasterService.loadList.subscribe(async data => {
      if(data){
        if (data.length !== 0 ) {
          this.allRows = [...data]; // Save full dataset
          this.rows = [...data];    // Initial display
          this.temp = [...data];
          this.selected = [this.rows[0]];
          this.areaMasterPagingResponse.TotalItems = this.rows.length;
          await this.viewDetails(this.rows[0]);
          await this.updatePageSize();
        }else{
          this.rows = [];
          this.temp = [];
        }
      }
    }));

    this.subscription.push(this.areaMasterService.disableGrid.subscribe(data=>{
      this.disableGrid = data;
    }));

    this.subscription.push(this.areaMasterService.ControlsEnableAndDisable.subscribe(data=>{
      if(data){
        this.ControlsEnableAndDisable();
      }
    }));

    this.subscription.push(this.areaMasterService.ngOnInit.subscribe(data=>{
      if(data){
        this.areaMasterService.getAreaMasterList(1);
        this.disableGrid = false;
        this.areaMasterService.btnClick.next('');
        this.areaMasterService.cancelClick.next(true);
      }
    }));

    this.subscription.push(this.areaMasterService.clickedArea.subscribe(async x=>{
      if(x.area_id){
        this.selected = [x];
      }
    }));
  }

  async ngOnInit() {
    this.filterAreaMaster = new AreaMasterModel();
    await this.areaMasterService.getAreaMasterList(1);
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
        this.selectedAreaMaster = 1 + rowIndex;
        this.viewDetails(this.rows[this.selectedAreaMaster]);
        this.areaMasterService.clickedArea.next(this.rows[this.selectedAreaMaster]);
      } 
      else if (event.type === 'keydown' && (event.event.code === 'ArrowUp'))
      {
        this.selectedAreaMaster = rowIndex - 1;
        this.viewDetails(this.rows[this.selectedAreaMaster]);
        this.areaMasterService.clickedArea.next(this.rows[this.selectedAreaMaster]);
      }
      else if (event.type == 'click') 
      {
        let rowItem = event.row;
        this.selectedAreaMaster = this.rows.indexOf(rowItem);
        this.viewDetails(event.row);
        this.areaMasterService.clickedArea.next(this.rows[this.selectedAreaMaster]);
      }
    }
  }

  leftAlignCell(): string {
    return 'text-left';
  }

  updateFilter() {
    const f = this.filterAreaMaster;
    this.filteredRows = this.allRows.filter(row =>
      (!f.area_code || row.area_code?.toLowerCase().includes(f.area_code.toLowerCase()))&&
      (!f.area_name || row.area_name?.toLowerCase().includes(f.area_name.toLowerCase()))
    );
    this.temp = [...this.filteredRows]; // ✅ Store filtered data for pagination
    this.currPage = 1; // ✅ Reset to first page
    this.updatePage(); // ✅ Apply pagination
    this.areaMasterService.clickedArea.next(this.rows[0]);
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
    this.userAccessService.CheckUserAccess(this.areaMasterService.FormName, this.areaMasterService);

    // 2. Read current disable flags after CheckUserAccess
    const newDisable = this.areaMasterService.newDisabled.getValue();
    const editDisabled = this.areaMasterService.editDisabled.getValue();
    const deleteDisabled = this.areaMasterService.deleteDisabled.getValue();

    if(this.commonService.isSystemAdmin.value == true){
      this.areaMasterService.newDisabled.next(false); 
      this.areaMasterService.editDisabled.next(false);
      this.areaMasterService.deleteDisabled.next(false);
      return;
    }

    this.areaMasterService.newDisabled.next(!newDisable);
    this.areaMasterService.editDisabled.next(!editDisabled);
    this.areaMasterService.deleteDisabled.next(!deleteDisabled);
  }

}
