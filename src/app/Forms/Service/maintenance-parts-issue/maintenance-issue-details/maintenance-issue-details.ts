import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { MaintenanceDetail, MaintenanceIssueDetail, MaintenanceIssueModel } from '../../../../Model/MaintenanceIssue/maintenance-issue.model';
import { DateModelAccounts, FinancialDataHeader, StockDataDetails } from '../../../../Model/CommonModel';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { MaintenanceIssueService } from '../../../../Service/MaintenanceIssueService/maintenance-issue-service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { EndPointService } from '../../../../Service/end-point.services';
import { PurchaseOrderService } from '../../../../Service/PurchaseOrderService/purchase-order-service';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { MaintenanceRequestService } from '../../../../Service/MaintenanceRequestService/maintenance-request-service';
import { Router } from '@angular/router';
import { DashboardService } from '../../../../Service/DashboardService/dashboard-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'maintenance-issue-details',
  standalone: false,
  templateUrl: './maintenance-issue-details.html',
  styleUrls: ['./maintenance-issue-details.css','../../../common.css'],
  providers: [DatePipe]
})
export class MaintenanceIssueDetails {
  @ViewChild(DatatableComponent) table?: DatatableComponent;
  maintenanceIssueHeader: FinancialDataHeader = new FinancialDataHeader();
  maintenanceGridModel: StockDataDetails[] =[];
  maintenanceIssueModel: MaintenanceIssueModel;
  maintenanceDetail: MaintenanceDetail = new MaintenanceDetail();
  maintenanceIssueModelTemp: MaintenanceIssueModel;
  dateModel: DateModelAccounts = new DateModelAccounts();
  maintenanceIssueDetail : MaintenanceIssueDetail[] = [];
  itemDisable: boolean = true;
  subscription: Subscription[];
  saveDisable: boolean = true;
  cancelDisable: boolean = true;
  btnType: string="";
  rows: any[] = []; 
  rowTemp: any[] = [];
  scroll: boolean = true;
  gridHeight:number = 380;
  reorderable = true;
  SelectionType = SelectionType;
  selected: any[] = [];
  statusDisable: boolean = true;
  TagList: any[] = [];
  ItemList:any[] = [];
  ItemListTemp: any[] =[];
  RequestNoList:any[] = [];
  TagListTemp:any[] = [];
  controls = {
    pageSize:50 
  };
  isReqNoInvalid: boolean = false;
  isGodownInvalid: boolean = false;
  warehouseList: any[] = [];
  warehouseListTemp: any[] = [];
  totalQty:any =0;
  navigatedRow: any;
  navigatedItems: any;

  constructor(public maintenanceIssueService:MaintenanceIssueService,public maintenanceRequestService:MaintenanceRequestService, private alertService: AlertService, 
    public endPointService:EndPointService, private cdRef: ChangeDetectorRef,private router: Router, public dashboardService: DashboardService,
    public commonService:CommonService, public userAccessService:UserAccessService, private datePipe: DatePipe, public purchaseOrderService:PurchaseOrderService) {

    this.maintenanceIssueModel = new MaintenanceIssueModel();
    this.maintenanceIssueModelTemp = new MaintenanceIssueModel();
    this.subscription = new Array<Subscription>();

    this.subscription.push(this.maintenanceIssueService.clickedIssue.subscribe(async x=>{
      if(this.dashboardService.IssueItem == 1){
          return;
        }
      if(!x){
        this.maintenanceIssueModel =  new MaintenanceIssueModel();
        this.rows = [];
        return;
      }
      
      this.maintenanceIssueService.ControlsEnableAndDisable.next(true);
      this.maintenanceIssueModel = {...x}
      this.maintenanceIssueService.selectedVoucherId = this.maintenanceIssueModel.voucher_id;

      try {
        const items = await this. maintenanceIssueService.GetMaintenanceIssueDetails(this.maintenanceIssueModel.voucher_id);
        if(!this.maintenanceIssueModel.voucher_id){
          return;
        }
        if (items && items.length) {
          this.rows = items.slice();
          this.rowTemp = this.clone(this.rows);
          this.totalQty = this.sumRows('issue_quantity');
          this.AssignItems();
          this.ItemListTemp = this.clone(this.ItemList)
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

    this.subscription.push(this.maintenanceIssueService.btnClick.subscribe(x=>{
       if(x != ''){
        this.btnClickFunction(x);  
     }
    }));
    
    this.subscription.push(this.commonService.isSystemAdmin.subscribe(data=>{
      this.statusDisable = !data;
    }));

    this.subscription.push(this.dashboardService.clickedIssueRow.subscribe(async data => {
      if (data?.voucher_id) {
        this.navigatedRow = data
        this.navigatedItems =  this.dashboardService.clickedIssueItems.value;
        this.AssignNavigatedItems();
      }
    }));
  }

  ngOnDestroy(): void {
    this.dashboardService.clickedIssueRow.next(null);
    this.dashboardService.clickedIssueItems.next([]);
    this.subscription.forEach(sub => sub.unsubscribe());
    this.rows = [];           // Original data
    this.rowTemp = [];           // Original data
    this.maintenanceIssueModel =  new MaintenanceIssueModel();
    this.maintenanceIssueModelTemp =  new MaintenanceIssueModel();
    this.navigatedItems = [];
    this.navigatedRow = null;
    this.isGodownInvalid = false;
    this.isReqNoInvalid = false;
    this.dashboardService.IssueItem = 0;
    this.maintenanceIssueService.newDisabled.next(false);
    this.maintenanceIssueService.editDisabled.next(false);
    this.maintenanceIssueService.deleteDisabled.next(false);
    this.maintenanceIssueService.yearDisable.next(false);
    this.maintenanceIssueService.disableGrid.next(false);
  }
  
  async ngOnInit() {
    this.TagList = await this.maintenanceRequestService.GetTagItems(1);
    this.TagListTemp = this.clone(this.TagList)
    this.RequestNoList  = await this.maintenanceIssueService.GetRequestNos();
    this.commonService.getFullWarehouseList(this.endPointService.companycode).then((res: any[]) => {
      this.warehouseList = res;
    });
  }

  async AssignNavigatedItems(){
    this.btnType = 'N'
    this.maintenanceIssueService.disableGrid.next(true);
    this.maintenanceIssueModel.tag_id = this.navigatedRow.tag_id;
    this.maintenanceIssueModel.model_name = this.navigatedRow.model_name;
    this.maintenanceIssueModel.request_id = this.navigatedRow.voucher_id;
    this.maintenanceIssueModel.item_code = this.navigatedRow.item_code;
    this.maintenanceIssueModel.line_amount = this.navigatedRow.line_amount;
    this.maintenanceIssueModel.item_no = this.navigatedRow.item_no;
    this.maintenanceIssueModel.voucherDate = new Date();
    this.maintenanceIssueModel.voucher_date = new Date();
    this.rows = await this.mapItemsToNavigatedDetails(this.navigatedItems);
    this.assignTotals();
    this.itemDisable = false;
    this.saveDisable = false;
    this.cancelDisable = false;
    this.maintenanceIssueService.newDisabled.next(true);
    this.maintenanceIssueService.editDisabled.next(true);
    this.maintenanceIssueService.deleteDisabled.next(true);
    this.maintenanceIssueService.yearDisable.next(true);
  }

  async mapItemsToNavigatedDetails(items: any[]): Promise<MaintenanceIssueDetail[]> {
    const detailsList: any[] = [];
    let seq_no = 0;
    for (const item of items) {
      seq_no++;
      const details = new MaintenanceIssueDetail();
      details.item_no =  item.item_no;
      details.item_name = item.item_name;
      details.issue_quantity = item.quantity;
      details.enter_rate = item.avG_COST;
      details.cost_rate = item.avG_COST;
      details.pamount = (item.quantity * item.avG_COST);
      details.seq_no = seq_no;
      detailsList.push(details);
    }
    return detailsList;
  }

  async btnClickFunction(x: string) {
      this.btnType = x;
      this.maintenanceIssueModelTemp = {...this.maintenanceIssueModel};
      this.TagList = await this.maintenanceRequestService.GetTagItems(2);
      this.ItemList = JSON.parse(localStorage.getItem('ItemListNew')||''); 
      if(x =='N'){
        this.maintenanceIssueModel = new MaintenanceIssueModel();
        this.maintenanceIssueModel.voucherDate = new Date();
        this.maintenanceIssueModel.voucher_date = new Date();
        this.saveDisable = false;
        this.cancelDisable = false;
        this.itemDisable = false;
        this.rows = [];
      }else if(x=='M'){
        this.saveDisable = false;
        this.cancelDisable = false;
        this.itemDisable = false;
      }else if(x=='D'){
        this.onDelete();
      }
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
    this.maintenanceIssueModel.voucher_date = value;
  }

  onDateSelected(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.maintenanceIssueModel.voucher_date = date;
  }

  cancelClickMethod(){
    this.ItemList = this.clone(this.ItemListTemp);
    this.TagList= this.clone(this.TagListTemp);
    this.maintenanceIssueService.disableGrid.next(false);
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.maintenanceIssueService.disabledItems.next(false);
    this.maintenanceIssueService.btnClick.next('');
    this.maintenanceIssueService.ControlsEnableAndDisable.next(true);
    this.isGodownInvalid = false;
    this.isReqNoInvalid = false;
    this.maintenanceIssueModel = {...this.maintenanceIssueModelTemp};
    this.rows = [...this.rowTemp];
    if(this.dashboardService.IssueItem == 1){
      this.dashboardService.IssueItem = 0;
      this.dashboardService.clickedIssueRow.next(null);
      this.dashboardService.clickedIssueItems.next([]);
      this.maintenanceIssueService.clickedIssue.next(this.maintenanceIssueService.mainList[0]);
    }
  }
  async onSubmit(Form:any){}

  async onSubmitForm(){

    const isValid = await this.validateForm(this.maintenanceIssueModel);
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

    const voucher_Date = new Date(this.maintenanceIssueModel.voucher_date); // dd/MM/yyyy
    const periodFrom = new Date(sessionStorage.getItem('period_from')||'');
    const periodTo   = new Date(sessionStorage.getItem('period_to')||'');
    const isBetween = voucher_Date >= periodFrom && voucher_Date <= periodTo;
    if(!isBetween){
      this.alertService.triggerAlert('Entry date must choose within the chosen financial year.', 3000, 'error');
      return ;
    }

    await this.AssignValues();

    this.maintenanceIssueService.SaveMaintenanceIssue(this.maintenanceIssueHeader, this.maintenanceGridModel,this.maintenanceDetail, this.dateModel)
    .subscribe({
      next: async (response: any) => {
        if(this.btnType == 'N'){
          this.alertService.triggerAlert('Row saved successfully...', 4000, 'success');
        }else{
          this.alertService.triggerAlert('Row modified successfully...', 4000, 'success');
        }
        
        await this.maintenanceIssueService.GetMaintenanceIssueList(sessionStorage.getItem('year'),2);
        let item: MaintenanceIssueModel | undefined = this.maintenanceIssueService.mainList.find(item => item.voucher_id === response.maintenanceIssue.voucher_id);
        if (item) {
          await this.maintenanceIssueService.loadList.next(this.maintenanceIssueService.mainList);
          this.dashboardService.IssueItem = 0;
          this.maintenanceIssueService.clickedIssue.next(item); // pass single object
        }
        this.maintenanceIssueService.btnClick.next('');
        this.saveDisable = true;
        this.cancelDisable = true;
        this.itemDisable = true;
        this.maintenanceIssueService.disabledItems.next(false);
        this.maintenanceIssueService.disableGrid.next(false);
        this.maintenanceIssueService.ControlsEnableAndDisable.next(true);
      },
      error: (err) => {
        this.alertService.triggerAlert(err.error.message,4000, 'error');
        this.maintenanceIssueService.btnClick.next('');
      }
    });
  
  }

  async AssignValues(){
    // Header Details
    const voucher_id = await this.commonService.GetGuid();

    this.maintenanceIssueHeader = {
      company_code: this.endPointService.companycode,
      period_id: Number(sessionStorage.getItem('year')),
      register_code: 211,
      voucher_reference: '',
      godown_code: this.maintenanceIssueModel.godown_code,
      account_code: null,
      line_amount: this.maintenanceIssueModel.line_amount,
      enter_amount: 0,
      discount: 0,
      counter_vid: null,
      cst :Number(this.maintenanceIssueModel.cst),
      pay_code :null,
      posted_by : null,
      posted_date: null,
      cash_inv: false,
      returned: false,
      status_code:null,
      salesman_id:0,
      narration: null,
      cust_code: 0,

      ...(this.btnType === 'N'
      ? {
          voucher_id:voucher_id,
          document_number: '',
          created_by: localStorage.getItem('user_id'),
          user_enter_date: new Date(),
          approved_by: null,modified_by: null,modified_on: null,
          approval_status : 'PENDING',
          createdt :null,
          voucher_date: new Date(),
          approver_remarks: '',
        }
      : {
          voucher_id:this.maintenanceIssueModel.voucher_id,
          created_by: this.maintenanceIssueModel.created_by,
          document_number: this.maintenanceIssueModel.document_number,
          modified_by: localStorage.getItem('user_id'),
          modified_on: null,
          user_enter_date: new Date(),
          voucher_date:new Date(),
          approved_by: this.maintenanceIssueModel.approved_by,
          approval_status: this.maintenanceIssueModel.approval_status,
          createdt: this.maintenanceIssueModel.createdt,
          approver_remarks: this.maintenanceIssueModel.approver_remarks,
        })
    };

    const voucher_date = this.datePipe.transform(this.maintenanceIssueModel.voucher_date, 'dd/MM/yyyy');
    this.dateModel.voucher_date = voucher_date;
    if(this.btnType == 'N'){
      const user_enter_date = this.datePipe.transform(new Date(), 'dd/MM/yyyy');
      this.dateModel.user_enter_date = user_enter_date;
    }else{
      const user_enter_date = this.datePipe.transform(this.maintenanceIssueModel.user_enter_date, 'dd/MM/yyyy');
      this.dateModel.user_enter_date = user_enter_date;
    }
    

    this.maintenanceDetail.voucher_id = this.maintenanceIssueHeader.voucher_id;
    this.maintenanceDetail.request_id = this.maintenanceIssueModel.request_id;
    this.maintenanceDetail.tag_id = this.maintenanceIssueModel.tag_id;

    //Grid Details
    this.maintenanceGridModel = await this.mapItemsToDetails(this.rows,this.maintenanceIssueHeader.voucher_id);
  }

  async mapItemsToDetails(items: any[],voucher_id:any): Promise<StockDataDetails[]> {
    const detailsList: StockDataDetails[] = [];
    let num = 0;
    for (const item of items) {
      num = num + 1;
      const details = new StockDataDetails();
      details.rowguid =  await this.commonService.GetGuid();
      details.voucher_id = voucher_id;
      details.seq_no = num;
      details.item_no = item.item_no;
      details.godown_code = this.maintenanceIssueModel.from_godown_code;
      details.receipt_quantity = 0;
      details.issue_quantity = item.issue_quantity;
      details.enter_rate = item.enter_rate;
      details.cost_rate = item.cost_rate;
      details.pamount = item.pamount;
      details.item_discount = 0;
      details.transamount = Number(item.cost_rate * item.issue_quantity).toFixed(3);
      details.line_no = 0;
      details.fgn_rate = 0;
      details.fgn_total = 0;
      details.item_details = '';
      details.tag_item = false;
      details.print_item = false;
      details.warranty = 0;
      details.exch_rate = 0;
      details.ref_row_id = null;
      detailsList.push(details);
    }

    const issueItem = new StockDataDetails();
    issueItem.rowguid =  await this.commonService.GetGuid();
    issueItem.voucher_id = voucher_id;
    issueItem.seq_no = num+1;
    issueItem.item_no = this.maintenanceIssueModel.item_no;
    issueItem.godown_code = this.maintenanceIssueModel.godown_code;
    issueItem.receipt_quantity = 0;
    issueItem.issue_quantity = 1;
    issueItem.enter_rate = this.maintenanceIssueModel.line_amount;
    issueItem.cost_rate = this.maintenanceIssueModel.line_amount;
    issueItem.pamount = this.maintenanceIssueModel.line_amount;
    issueItem.item_discount = 0;
    issueItem.transamount = Number(this.maintenanceIssueModel.line_amount);
    issueItem.line_no = 0;
    issueItem.fgn_rate = 0;
    issueItem.fgn_total = 0;
    issueItem.item_details = '';
    issueItem.tag_item = true;
    issueItem.print_item = false;
    issueItem.warranty = 0;
    issueItem.exch_rate = 0;
    issueItem.ref_row_id = null;
    detailsList.push(issueItem);

    const recieptItem = new StockDataDetails();
    recieptItem.rowguid =  await this.commonService.GetGuid();
    recieptItem.voucher_id = voucher_id;
    recieptItem.seq_no = num+1;
    recieptItem.item_no = this.maintenanceIssueModel.item_no;
    recieptItem.godown_code = this.maintenanceIssueModel.godown_code;
    recieptItem.receipt_quantity = 1;
    recieptItem.issue_quantity = 0;
    recieptItem.enter_rate = this.maintenanceIssueModel.cst;
    recieptItem.cost_rate = this.maintenanceIssueModel.cst;
    recieptItem.pamount = this.maintenanceIssueModel.cst;
    recieptItem.item_discount = 0;
    recieptItem.transamount = Number(this.maintenanceIssueModel.cst);
    recieptItem.line_no = 0;
    recieptItem.fgn_rate = 0;
    recieptItem.fgn_total = 0;
    recieptItem.item_details = '';
    recieptItem.tag_item = true;
    recieptItem.print_item = false;
    recieptItem.warranty = 0;
    recieptItem.exch_rate = 0;
    recieptItem.ref_row_id = null;
    detailsList.push(recieptItem);
    return detailsList;
  }
  
  async validateForm(model: MaintenanceIssueModel): Promise<boolean> {
    // Reset validation flags
    this.isGodownInvalid = !model.godown_code;
    this.isReqNoInvalid = !model.request_id;
    const isValid = !(this.isGodownInvalid || this.isReqNoInvalid);
    return isValid;
  }

  getRowIdentity(row: any): any {
    return row.seq_no; // unique identifier
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

  async ItemCodeEnter(item_no: any, row: any) {
    try {
      if(!item_no) return;
      const res = await this.purchaseOrderService.itemCodeEnter(item_no);
      const item = res[0];
      row.item_name = item.item_name_abbr;
      row.enter_rate = item.avG_COST;
      row.cost_rate = item.avG_COST;
      row.pamount = item.avG_COST;
      this.assignTotals();
    } catch (error) {
      console.error('ItemCodeEnter error:', error);
    }
  }

  async ModelNameChange(row: any) {
    const [item_code, item_details] = row.item_name_abbr.split('-');
    const item = this.ItemList.find(v => v.item_code == item_code.trim());
    this.ItemCodeEnter(item.item_no,row);
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
      issue_quantity: 1,
      enter_rate: 0,
      cost_rate: 0,
      pamount: 0,
      seq_no:null
    };
    this.rows = [...this.rows, newRow];
  }

  deleteRow(index: number): void {
    this.rows.splice(index, 1);
    // Reassign seq_no for all rows 
    this.rows.forEach((row, i) => { row.seq_no = i + 1; });
    this.rows = [...this.rows];
    this.assignTotals();
  }

  private sumRows(field: string): number {
    const total = this.rows.reduce((sum: number, row: any) => {
      const val = Number(row[field]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    return Number(total.toFixed(3));  // round to 4 decimal places
  }
  
  QtyChange(row:any){
    row.pamount = row.issue_quantity * row.enter_rate;
    this.assignTotals();
  }

  TotalChange(row:any){
    row.enter_rate = row.pamount / row.issue_quantity;
    this.assignTotals();
  }

  assignTotals(){
    this.totalQty = this.sumRows('issue_quantity');
    this.maintenanceIssueModel.cst =  (this.maintenanceIssueModel.line_amount + this.sumRows('pamount')).toFixed(3);
  }

  ReqNochanges(request_id:any){
    this.maintenanceIssueService.ReqNochanges(request_id)
    .subscribe(
      (response: any[]) => {
        this.navigatedRow = response[0].updatedList[0];
        this.navigatedItems =  response[0].updatedDetails;
        this.AssignNavigatedItems();
      },
      (error) => {
        this.alertService.triggerAlert('Failed to Fetching request id details the Row...', 4000, 'error');
        this.maintenanceIssueService.btnClick.next('')
      }
    );
  }

  async onDelete(){
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    this.maintenanceIssueService.DeleteMaintenanceIssue(this.maintenanceIssueModel.voucher_id)
    .subscribe(
      (updatedList: any[]) => {
        this.maintenanceIssueService.GetMaintenanceIssueList(sessionStorage.getItem('year'),1);
        this.maintenanceIssueService.btnClick.next('');
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.maintenanceIssueService.btnClick.next('')
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

