import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { MaintenanceRequestDetail, MaintenanceRequestModel, MaintenanceRequestSave } from '../../../../Model/MaintenanceRequest/maintenance-request.model';
import { DateModelAccounts } from '../../../../Model/CommonModel';
import { Subscription } from 'rxjs';
import { MaintenanceRequestService } from '../../../../Service/MaintenanceRequestService/maintenance-request-service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { EndPointService } from '../../../../Service/end-point.services';
import { DatePipe } from '@angular/common';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';
import { CommonService } from '../../../../Service/CommonService/common-service';
import Swal from 'sweetalert2';
import { PurchaseOrderService } from '../../../../Service/PurchaseOrderService/purchase-order-service';

@Component({
  selector: 'maintenance-request-details',
  standalone: false,
  templateUrl: './maintenance-request-details.html',
  styleUrls: ['./maintenance-request-details.css','../../../common.css'],
  providers: [DatePipe]
})
export class MaintenanceRequestDetails {
  @ViewChild(DatatableComponent) table?: DatatableComponent;
  maintenanceRequestModel: MaintenanceRequestModel;
  maintenanceRequestModelTemp: MaintenanceRequestModel;
  maintenanceRequestSave : MaintenanceRequestSave = new MaintenanceRequestSave();
  maintenanceRequestDetail : MaintenanceRequestDetail [] =[];
  dateModel: DateModelAccounts = new DateModelAccounts();
  itemDisable: boolean = true;
  subscription: Subscription[];
  saveDisable: boolean = true;
  cancelDisable: boolean = true;
  btnType: string="";
  rows: any[] = []; 
  rowTemp: any[] = [];
  scroll: boolean = true;
  gridHeight:number = 350;
  reorderable = true;
  SelectionType = SelectionType;
  selected: any[] = [];
  statusDisable: boolean = true;
  TagList: any[] = [];
  TagListTemp: any[] = [];
  ItemList:any[] = [];
  ItemListTemp: any[] =[];
  controls = {
    pageSize:50 
  };
  isTagNoInvalid: boolean = false;

  constructor(public maintenanceRequestService:MaintenanceRequestService, private alertService: AlertService, public endPointService:EndPointService, private cdRef: ChangeDetectorRef,
    public commonService:CommonService, public userAccessService:UserAccessService, private datePipe: DatePipe, public purchaseOrderService:PurchaseOrderService) {

    this.maintenanceRequestModel = new MaintenanceRequestModel();
    this.maintenanceRequestModelTemp = new MaintenanceRequestModel();
    this.subscription = new Array<Subscription>();

    this.subscription.push(this.maintenanceRequestService.clickedRequest.subscribe(async x=>{
      if(!x){
        this.maintenanceRequestModel =  new MaintenanceRequestModel();
        this.maintenanceRequestModelTemp =  new MaintenanceRequestModel();
        this.rows =[];
        this.rowTemp =[];
        return;
      }
      this.maintenanceRequestService.ControlsEnableAndDisable.next(true);
      this.maintenanceRequestModel = {...x}
      this.maintenanceRequestService.selectedVoucherId = this.maintenanceRequestModel.voucher_id;

      try {
        const items = await this. maintenanceRequestService.GetMaintenanceRequestDetails(this.maintenanceRequestModel.voucher_id);
        if (items && items.length) {
          this.rows = items.slice();
          this.rowTemp = this.clone(this.rows);
          this.AssignItems();
          this.ItemListTemp = this.clone(this.ItemList);
          this.cdRef.markForCheck();
        } else {
          this.rows = [];
          this.rowTemp = [];
        }
      } catch (err) {
        console.error('Error fetching ItemDetails', err);
        this.rows = [];
        this.rowTemp = [];
      }

    }));

    this.subscription.push(this.maintenanceRequestService.btnClick.subscribe(x=>{
      if(x != ''){
        this.btnClickFunction(x);
      }
    }));
    
    this.subscription.push(this.commonService.isSystemAdmin.subscribe(data=>{
      this.statusDisable = !data;
    }));

  }
  
  async ngOnInit() {
    this.TagList = await this.maintenanceRequestService.GetTagItems(1); 
    this.TagListTemp = this.clone(this.TagList);
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
    this.rows = [];           // Original data
    this.rowTemp = [];           // Original data
    this.maintenanceRequestModel =  new MaintenanceRequestModel();
    this.maintenanceRequestModelTemp =  new MaintenanceRequestModel();
  }

  async btnClickFunction(x: string) {
    this.btnType = x;
    this.maintenanceRequestModelTemp = {...this.maintenanceRequestModel};
    this.TagList = await this.maintenanceRequestService.GetTagItems(2); 
    this.ItemList = JSON.parse(localStorage.getItem('ItemListNew')||''); 
    this.ItemList = this.ItemList.filter(item => item.item_category != 'HARDWARE');
    if(x =='N'){
      this.maintenanceRequestModel = new MaintenanceRequestModel();
      this.maintenanceRequestModel.voucherDate = new Date();
      this.maintenanceRequestModel.voucher_date = new Date();
      this.saveDisable = false;
      this.cancelDisable = false;
      this.itemDisable = false;
      this.rows = [];
    }else if(x=='M'){
      this.saveDisable = false;
      this.cancelDisable = false;
      this.itemDisable = false;
    }else if(x=='D'){
      this.onDelete()
    }
  }

  async ItemCodeEnter(item_no: any, row: any) {
    try {
      if(!item_no) return;
      const res = await this.purchaseOrderService.itemCodeEnter(item_no);
      const item = res[0];
      row.item_name_abbr = item.item_name_abbr;
      row.unit_price = item.retail_rate;
      row.order_quantity = 1;
      row.total_price = item.retail_rate;
      row.original_rate = item.retail_rate;
    } catch (error) {
      console.error('ItemCodeEnter error:', error);
    }
  }

  async ModelNameChange(row: any) {
    const [item_code, item_details] = row.item_name_abbr.split('-');
    const item = this.ItemList.find(v => v.item_code == item_code.trim());
    this.ItemCodeEnter(item.item_no,row);
  }

  clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  AssignItems(){
    const rowItemNos = this.rows.map(r => r.item_no);
    const filteredItems = JSON.parse(sessionStorage.getItem('ItemList')||'').filter((item:any) =>
      rowItemNos.includes(item.item_no)
    );
    this.ItemList = filteredItems;
    this.ItemListTemp = this.ItemList;
  }

  formatToDateInput(value: string): void {
    this.maintenanceRequestModel.voucher_date = value;
  }

  onDateSelected(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.maintenanceRequestModel.voucher_date = date;
  }

  getRowIdentity(row: any): any {
    return row.detail_id; // unique identifier
  }

  onSubListActivate(event: any) {
    const rowItem = event.row;
    let rowIndex = this.rows.indexOf(rowItem);

    if (event.type === 'keydown') {
      if (event.event.code === 'ArrowDown' && rowIndex < this.rows.length - 1) {
        rowIndex++;
        this.selected = [this.rows[rowIndex]];
        this.scrollToIndex(rowIndex);
      } else if (event.event.code === 'ArrowUp' && rowIndex > 0) {
        rowIndex--;
        this.selected = [this.rows[rowIndex]];
        this.scrollToIndex(rowIndex);
      }
    }
  }

  scrollToIndex(index: number) {
    const rowHeight = this.rows.length; // same as [rowHeight]
    const bodyElement = this.table?.element.querySelector('.datatable-body');

    if (bodyElement) {
      const maxScroll = bodyElement.scrollHeight - bodyElement.clientHeight;
      const targetScroll = index * rowHeight;

      bodyElement.scrollTop = Math.min(targetScroll, maxScroll);
    }
  }

  cancelClickMethod(){
    this.isTagNoInvalid = false;
    this.ItemList = this.clone(this.ItemListTemp);
    this.TagList= this.clone(this.TagListTemp);
    this.maintenanceRequestService.disableGrid.next(false);
    this.maintenanceRequestModel = {...this.maintenanceRequestModelTemp};
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.maintenanceRequestService.disabledItems.next(false);
    this.maintenanceRequestService.btnClick.next('');
    this.maintenanceRequestService.ControlsEnableAndDisable.next(true);
    this.rows = [...this.rowTemp];
  }

  deleteRow(index: number): void {
    this.rows.splice(index, 1);
    // Reassign seq_no for all rows 
    this.rows.forEach((row, i) => { row.seq_no = i + 1; });
    this.rows = [...this.rows];
  }

  addRow(){
    if (this.rows.length > 0) {
      const lastRow = this.rows[this.rows.length - 1];
      if (!lastRow.item_no || lastRow.item_no == '') {
        alert('Please enter Item Code in the previous row before adding a new one.');
        return; // stop here
      }
    }

    let newRow: Partial<any> = {
      item_no : null,
      item_name_abbr : null,
      quantity: 1
    };
    this.rows = [...this.rows, newRow];
  }

  async onSubmit(Form:any){

    const isValid = await this.validateForm(this.maintenanceRequestModel);
    if (!isValid) {
      this.alertService.triggerAlert('Please fill all required fields.', 4000, 'error');
      return;
    }

    if (this.rows.length == 0) {
      this.alertService.triggerAlert('Please add the row items...', 3000, 'error');
      return ;
    }

    const itemNos = this.rows.map(r => r.item_no?.toString().trim());
    const hasDuplicates = new Set(itemNos).size !== itemNos.length;
    if (hasDuplicates) {
      this.alertService.triggerAlert('Duplicate Item found', 3000, 'error');
      return ;
    } 
    
    const voucher_Date = new Date(this.maintenanceRequestModel.voucher_date); // dd/MM/yyyy
    const periodFrom = new Date(sessionStorage.getItem('period_from')||'');
    const periodTo   = new Date(sessionStorage.getItem('period_to')||'');
    const isBetween = voucher_Date >= periodFrom && voucher_Date <= periodTo;
    if(!isBetween){
      this.alertService.triggerAlert('Entry date must choose within the chosen financial year.', 3000, 'error');
      return ;
    }

    const result =  await this.maintenanceRequestService.CheckTagStatus(this.maintenanceRequestModel.tag_id);
    if(!result){
      this.alertService.triggerAlert('Then Tag status is Pending/Approved...', 3000, 'error');
      return ;
    }

    await this.AssignValues();

    this.maintenanceRequestService.SaveMaintenanceRequest(this.maintenanceRequestSave, this.maintenanceRequestDetail, this.dateModel)
    .subscribe({
      next: async (response: any) => {
        if(this.btnType == 'N'){
          this.alertService.triggerAlert('Row saved successfully...', 4000, 'success');
        }else{
          this.alertService.triggerAlert('Row modified successfully...', 4000, 'success');
        }
        
        await this.maintenanceRequestService.GetMaintenanceRequestList(sessionStorage.getItem('year'),2);
        let item: MaintenanceRequestModel | undefined = this.maintenanceRequestService.mainList.find(item => item.voucher_id === response.maintenanceRequest.voucher_id);
        if (item) {
          await this.maintenanceRequestService.loadList.next(this.maintenanceRequestService.mainList);
          this.maintenanceRequestService.clickedRequest.next(item); // pass single object
        }
        this.maintenanceRequestService.btnClick.next('');
        this.saveDisable = true;
        this.cancelDisable = true;
        this.itemDisable = true;
        this.maintenanceRequestService.disabledItems.next(false);
        this.maintenanceRequestService.disableGrid.next(false);
        this.maintenanceRequestService.ControlsEnableAndDisable.next(true);
      },
      error: (err) => {
        this.alertService.triggerAlert(err.error.message,4000, 'error');
        this.maintenanceRequestService.btnClick.next('');
      }
    });
  }

  convertToSqlDate(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // months are 0-based
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async validateForm(model: MaintenanceRequestModel): Promise<boolean> {
    // Reset validation flags
    this.isTagNoInvalid = !model.tag_id;
    const isValid = !(this.isTagNoInvalid);
    return isValid;
  }

  async AssignValues(){
    // Header Details
    const voucher_id = await this.commonService.GetGuid();
    this.maintenanceRequestSave = { 
      tag_id:this.maintenanceRequestModel.tag_id,
      narration: this.maintenanceRequestModel.narration,
      register_code: this.maintenanceRequestModel.register_code??131,
      period_id: sessionStorage.getItem('year'),
      company_code: this.endPointService.companycode,
      ...(this.btnType === 'N'
      ? {
          voucher_id:voucher_id,
          document_number: '',
          created_by: localStorage.getItem('user_id'),
          modified_by: null,
          modified_on: null,
          approval_status : 'PENDING',
          createdt :null,
          approved_by: null,
          approver_remarks: null,
          voucher_date:this.convertToSqlDate(this.maintenanceRequestModel.voucher_date),
          user_enter_date : new Date()
        }
      : {
          voucher_id:this.maintenanceRequestModel.voucher_id,
          document_number: this.maintenanceRequestModel.document_number,
          created_by: this.maintenanceRequestModel.created_by,
          modified_by: localStorage.getItem('user_id'),
          approved_by: this.maintenanceRequestModel.approved_by,
          approver_remarks: this.maintenanceRequestModel.approver_remarks,
          modified_on: null,
          voucher_date: this.convertToSqlDate(this.maintenanceRequestModel.voucher_date),
          approval_status: this.maintenanceRequestModel.approval_status,
          createdt: this.maintenanceRequestModel.createdt,
          user_enter_date :this.maintenanceRequestModel.user_enter_date
        })
    };

    const voucher_date = this.datePipe.transform(this.maintenanceRequestModel.voucher_date, 'dd/MM/yyyy');
    this.dateModel.voucher_date = voucher_date;

    const user_enter_date = this.datePipe.transform(this.maintenanceRequestModel.user_enter_date, 'dd/MM/yyyy');
    this.dateModel.user_enter_date = user_enter_date;


    this.maintenanceRequestDetail = await this.mapItemsToDetails(this.rows,this.maintenanceRequestSave.voucher_id);
  }

  async mapItemsToDetails(items: any[],voucher_id:any): Promise<MaintenanceRequestDetail[]> {
    const detailsList: MaintenanceRequestDetail[] = [];
    let seq_no = 0;
    for (const item of items) {
      seq_no++;
      const details = new MaintenanceRequestDetail();
      details.detail_id =  null;
      details.voucher_id = voucher_id;
      details.seqno = seq_no;
      details.item_no = item.item_no;
      details.quantity = item.quantity;
      detailsList.push(details);
    }

    return detailsList;
  }

  async onDelete(){
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    this.maintenanceRequestService.DeleteMaintenanceRequest(this.maintenanceRequestModel.voucher_id)
    .subscribe(
      (updatedList: any[]) => {
        this.maintenanceRequestService.GetMaintenanceRequestList(sessionStorage.getItem('year'),1);
        this.maintenanceRequestService.btnClick.next('');
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.maintenanceRequestService.btnClick.next('')
      }
    );
  }
}

export function showconfirm(message: any): Promise<boolean> {
  return Swal.fire({
    title: 'Confirm Delete',
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    customClass: {
      confirmButton: 'btn btn-danger me-2',  // red Bootstrap button
      cancelButton: 'btn btn-secondary'      // grey Bootstrap button
    },
    buttonsStyling: false, // important: use Bootstrap styles instead of SweetAlert defaults
    background: '#ffffff',
    color: '#333333'
  }).then(result => result.isConfirmed);
}

