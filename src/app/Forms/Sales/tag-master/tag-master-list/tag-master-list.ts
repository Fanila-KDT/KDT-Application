import { Component } from '@angular/core';
import { SelectionType } from '@swimlane/ngx-datatable';
import { Subscription } from 'rxjs';
import { TagMasterModel } from '../../../../Model/TagMaster/tag-master.model';
import { Pagination } from '../../../../Model/pagingResponse';
import { TagMasterService } from '../../../../Service/TagMasterService/tag-master-service';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { EndPointService } from '../../../../Service/end-point.services';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';

@Component({
  selector: 'tag-master-list',
  standalone: false,
  templateUrl: './tag-master-list.html',
  styleUrls: ['./tag-master-list.css','../../../common.css']
})
export class TagMasterList {
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
  selectedTagMaster: number=0;
  filterTagMaster = new TagMasterModel();
  filteredRows: any[] = [];  
  tagMasterPagingResponse: Pagination = new Pagination();
  startCount:any = 0;
  totalPages : number = 0;
  totalPages_pager: number =1;
  allRows: any[] = []; 
  userAccessList: any[] = [];
  chunkSize: number = 50;
  leftArrwDisable: boolean = true;
  rightArrwDisable: boolean = false;
  endCount: number=0;

   constructor(public tagMasterService:TagMasterService,public commonService:CommonService,public endPointService:EndPointService,public userAccessService:UserAccessService) {
    this.gridHeight = this.endPointService.GridHeight;

    this.subscription.push(this.tagMasterService.loadList.subscribe(async data => {
      if(data){
        if (data.length !== 0 ) {
          this.allRows = [...data]; // Save full dataset
          this.rows = [...data];    // Initial display
          this.temp = [...data];
          this.selected = [this.rows[0]];
          this.tagMasterPagingResponse.TotalItems = this.rows.length;
          await this.viewDetails(this.rows[0]);
          await this.updatePageSize();
        }else{
          this.rows = [];
          this.temp = [];
        }
      }
    }));

    this.subscription.push(this.tagMasterService.disableGrid.subscribe(data=>{
      this.disableGrid = data;
    }));

    this.subscription.push(this.tagMasterService.ControlsEnableAndDisable.subscribe(data=>{
      if(data){
        this.ControlsEnableAndDisable();
      }
    }));

    this.subscription.push(this.tagMasterService.ngOnInit.subscribe(data=>{
      if(data){
        this.tagMasterService.getTagMasterList(1);
        this.disableGrid = false;
        this.tagMasterService.btnClick.next('');
        this.tagMasterService.cancelClick.next(true);
      }
    }));

    this.subscription.push(this.tagMasterService.clickedTag.subscribe(async x=>{
      if(x.tag_id){
        this.selected = [x];
      }
    }));
  }

  async ngOnInit() {
    this.filterTagMaster = new TagMasterModel();
    await this.tagMasterService.getTagMasterList(1);
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
        this.selectedTagMaster = 1 + rowIndex;
        this.viewDetails(this.rows[this.selectedTagMaster]);
        this.tagMasterService.clickedTag.next(this.rows[this.selectedTagMaster]);
      } 
      else if (event.type === 'keydown' && (event.event.code === 'ArrowUp'))
      {
        this.selectedTagMaster = rowIndex - 1;
        this.viewDetails(this.rows[this.selectedTagMaster]);
        this.tagMasterService.clickedTag.next(this.rows[this.selectedTagMaster]);
      }
      else if (event.type == 'click') 
      {
        let rowItem = event.row;
        this.selectedTagMaster = this.rows.indexOf(rowItem);
        this.viewDetails(event.row);
        this.tagMasterService.clickedTag.next(this.rows[this.selectedTagMaster]);
      }
    }
  }

  leftAlignCell(): string {
    return 'text-left';
  }

  updateFilter() {
    const f = this.filterTagMaster;
    this.filteredRows = this.allRows.filter(row =>
      (!f.tag_no || row.tag_no?.toLowerCase().includes(f.tag_no.toLowerCase()))&&
      (!f.model_name || row.model_name?.toLowerCase().includes(f.model_name.toLowerCase()))&&
      (!f.name || row.name?.toLowerCase().includes(f.name.toLowerCase()))&&
      (!f.warrantyStartdate || row.warrantyStartdate?.toLowerCase().includes(f.warrantyStartdate.toLowerCase()))&&
      (!f.warrantyEnddate || row.warrantyEnddate?.toLowerCase().includes(f.warrantyEnddate.toLowerCase()))&&
      (!f.status_type || row.status_type?.toLowerCase().includes(f.status_type.toLowerCase()))&&
      (!f.area_code || row.area_code?.toLowerCase().includes(f.area_code.toLowerCase()))&&
      (!f.area_name || row.area_name?.toLowerCase().includes(f.area_name.toLowerCase()))&&
       (!f.engineer || row.engineer?.toLowerCase().includes(f.engineer.toLowerCase()))&&
      (!f.salesmanName_Area || row.salesmanName_Area?.toLowerCase().includes(f.salesmanName_Area.toLowerCase()))
    );
    this.temp = [...this.filteredRows]; // ✅ Store filtered data for pagination
    this.currPage = 1; // ✅ Reset to first page
    this.updatePage(); // ✅ Apply pagination
    this.tagMasterService.clickedTag.next(this.rows[0]);
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
    this.userAccessService.CheckUserAccess(this.tagMasterService.FormName, this.tagMasterService);

    // 2. Read current disable flags after CheckUserAccess
    const newDisable = this.tagMasterService.newDisabled.getValue();
    const editDisabled = this.tagMasterService.editDisabled.getValue();
    const deleteDisabled = this.tagMasterService.deleteDisabled.getValue();

    if(this.commonService.isSystemAdmin.value == true){
      this.tagMasterService.newDisabled.next(false); 
      this.tagMasterService.editDisabled.next(false);
      this.tagMasterService.deleteDisabled.next(false);
      return;
    }

    this.tagMasterService.newDisabled.next(!newDisable);
    this.tagMasterService.editDisabled.next(!editDisabled);
    this.tagMasterService.deleteDisabled.next(!deleteDisabled);

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
