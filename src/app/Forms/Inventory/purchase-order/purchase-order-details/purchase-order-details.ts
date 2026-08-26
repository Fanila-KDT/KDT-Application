import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { PurchaseOrderService } from '../../../../Service/PurchaseOrderService/purchase-order-service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { EndPointService } from '../../../../Service/end-point.services';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';
import { Subscription } from 'rxjs';
import { ItemDetailsModel, PurchaseOrderModel} from '../../../../Model/PurchaseOrder/purchase-order.model';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { ProductMasterService } from '../../../../Service/ProductMasterService/product-master-service';
import { DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { CommonService } from '../../../../Service/CommonService/common-service';
import Swal from 'sweetalert2';
import { DashboardService } from '../../../../Service/DashboardService/dashboard-service';
import { DateModelInventory } from '../../../../Model/CommonModel';

@Component({
  selector: 'purchase-order-details',
  standalone: false,
  templateUrl: './purchase-order-details.html',
  styleUrls: ['./purchase-order-details.css', '../../../common.css'],
  providers: [DatePipe],
})
export class PurchaseOrderDetails {
  @ViewChild(DatatableComponent) table?: DatatableComponent;
  registerList: any[] = [];
  vendorList: any[] = [];
  paymentList: any[] = [];
  unitList: any[] = [];
  ItemList: any[] = [];
  ItemListtemp: any[] = [];
  rows: any[] = []; 
  rowTemp: any[] = []; 
  rowSaveTemp: any[] = [];
  refNoList: any[] = [];
  subscription: Subscription[] = new Array<Subscription>();
  purchaseOrderModel: PurchaseOrderModel = new PurchaseOrderModel();
  dateModel: DateModelInventory = new DateModelInventory();
  purchaseOrderModelTemp: PurchaseOrderModel = new PurchaseOrderModel();
  itemDetailsModel: ItemDetailsModel = new ItemDetailsModel();
  itemDisable: boolean = true;
  saveDisable: boolean = true;
  cancelDisable: boolean = true; 
  gridHeight:number=350;
  reorderable = true;
  controls = {
    pageSize:500
  };
   SelectionType = SelectionType;
  isEditable: boolean = true;
  rowCount:number=0;
  scroll: boolean = true;
  selected: any[] = [];
  LocalPO: boolean = true;
  ForeignPO: boolean = false;
  registerDisable: boolean = true;
  isRegisterInvalid: boolean = false;
  isVendorInvalid: boolean = false;
  totalQty: any = 0;
  totalQtyTemp: any = 0;
  btnType: any;
  statusDisable: boolean = true;

  constructor(private alertService:AlertService,private commonService:CommonService,
    public purchaseOrderService:PurchaseOrderService,private productMasterService: ProductMasterService,private datePipe: DatePipe,
    private cdRef: ChangeDetectorRef,public endPointService:EndPointService,public userAccessService:UserAccessService, public dashboardService: DashboardService) {
     
    this.subscription.push(
      this.purchaseOrderService.clickedPO.subscribe(async x => {
        if(this.dashboardService.PurchaseOrder == 1){
          return;
        }
        if (!x) {
          // x is undefined or null → reset model
          this.purchaseOrderModel = new PurchaseOrderModel();
          this.LocalPO = false;
          this.ForeignPO = false;
          this.rows = []; 
          return;
        }
        this.purchaseOrderService.ControlsEnableAndDisable.next(true);
        this.purchaseOrderModel = { ...x };
        this.purchaseOrderService.item = this.purchaseOrderModel;
        this.purchaseOrderService.selectedDocNo = this.purchaseOrderModel.document_number;
        
        try {
          const items =await this.purchaseOrderService.getItemDetails(this.purchaseOrderModel.voucher_id);
          if (items && items.length) {
            this.rows = items.slice();
            this.LocalPO = this.purchaseOrderModel.register_code == '32';
            this.ForeignPO = this.purchaseOrderModel.register_code == '182';
            this.AssignItems();
          } else {
            this.rows = [];
            this.LocalPO = false;
            this.ForeignPO = false;
          }
        } catch (err) {
          console.error('Error fetching ItemDetails', err);
          this.rows = [];
          this.totalQty = '0.000';
        }
        this.totalQty = this.sumRows('receipt_quantity');
      })
    );

    this.subscription.push(this.commonService.isSystemAdmin.subscribe(data=>{
      this.statusDisable = !data;
    })); 

    this.subscription.push(this.purchaseOrderService.btnClick.subscribe(async x=>{
      if(x != ''){
          this.btnClickFunction(x);
      }
    }));

    this.subscription.push(this.dashboardService.clickedPurchaseOrder.subscribe(async data => {
      if (data) {
        this.purchaseOrderBtnClick(data);
      }
    }));
  }
 
  async ngOnInit() {
    try {
      const [
        registerList,
        vendorList,
        paymentList,
        unitList,
      ] = await Promise.all([
        this.purchaseOrderService.getRegisterList(this.endPointService.companycode),
        this.purchaseOrderService.getVendorList(this.endPointService.companycode),
        this.purchaseOrderService.getPaymentList(this.endPointService.companycode),
        this.productMasterService.GetUnitList(),
      ]);

      // assign results
      this.registerList = registerList;
      this.vendorList   = vendorList;
      this.paymentList  = paymentList;
      this.unitList     = unitList;

      // push to subjects if needed
      this.purchaseOrderService.registerList.next(registerList);
      this.purchaseOrderService.vendorList.next(vendorList);

    } catch (err) {
      console.error('Error loading lists', err);
    }
  }

  AssignItems(){
    const rowItemNos = this.rows.map(r => r.item_no);
    const list = JSON.parse(sessionStorage.getItem('ItemList')||'');
    const filteredItems = list.filter((item:any) =>
      rowItemNos.includes(item.item_no)
    );
    this.ItemList = filteredItems;
    this.ItemListtemp = this.ItemList;
  }

  ngOnDestroy(): void {
    this.dashboardService.clickedPurchaseOrder.next(null); 
    this.subscription.forEach(sub => sub.unsubscribe());
    this.isEditable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.purchaseOrderService.disableGrid.next(false);
    this.purchaseOrderService.disabledItems.next(false);
    this.purchaseOrderService.btnClick.next('');
    this.rows =[];
    this.purchaseOrderModel = new PurchaseOrderModel();
    this.dashboardService.PurchaseOrder = 0;
  }

  getRowIdentity(row: any): any {
    return row.rowguid; // unique identifier
  }


  private sumRows(field: string): number {
    return this.rows.reduce((sum: any, row: any) => sum + (row[field] || 0), 0);
  }

  private updateTotals(): void {
    if (this.purchaseOrderModel.register_code == '182') {
      this.purchaseOrderModel.foreign_line_amount = this.sumRows('fgn_total').toFixed(4);
      this.purchaseOrderModel.foreign_enter_amount =
      +((this.purchaseOrderModel.foreign_line_amount - (this.purchaseOrderModel.foreign_discount_amount || 0)).toFixed(4));
    } else {
      this.purchaseOrderModel.line_amount = this.sumRows('pamount').toFixed(3);
      this.purchaseOrderModel.enter_amount =
      +(this.purchaseOrderModel.line_amount - (this.purchaseOrderModel.discount || 0)).toFixed(3);
    }
    this.totalQty = this.sumRows('receipt_quantity');
  }

  onDateSelected(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.purchaseOrderModel.voucher_date = date;
  }

  formatToDateInput(value: string): void {
    this.purchaseOrderModel.voucher_date = value;
  }

  displayUnit = (unitId: number) => {
    const unit = this.unitList.find(u => u.unit_id == unitId);
    return unit ? unit.unit_name : '';
  };

  clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  async btnClickFunction(x: string) {
    this.btnType = x;
    this.purchaseOrderModelTemp = {...this.purchaseOrderModel};
    this.totalQtyTemp = this.totalQty;
    this.rowTemp = this.clone(this.rows);
    this.ItemList = JSON.parse(localStorage.getItem('ItemListNew')||'');
    if(x =='N'){
      this.purchaseOrderModel = new PurchaseOrderModel();
      this.saveDisable = false;
      this.cancelDisable = false;
      this.itemDisable = false;
      this.registerDisable = false;
      this.isEditable =false;
      this.totalQty =0;
      this.rows = [];
      this.purchaseOrderModel.voucherDate =  new Date();
      this.purchaseOrderModel.voucher_date =  new Date();
    }else if(x =='M'){
      this.saveDisable = false;
      this.cancelDisable = false;
      this.isEditable =false;
      this.itemDisable = false;
      this.registerDisable = true;
    }else if(x =='D'){
      this.onDelete();
    }else if(x == 'C'){
      this.saveDisable = false;
      this.cancelDisable = false;
      this.isEditable =false;
      this.itemDisable = false;
      this.registerDisable = false;
      this.copyClick();
    }
  }

  cancelClickMethod(){
    this.purchaseOrderService.disableGrid.next(false);
    //this.totalQty = this.totalQtyTemp;
    //this.rows = this.rowTemp;
    //this.purchaseOrderModel = {...this.purchaseOrderModelTemp};
    this.ItemList = [...this.ItemListtemp];
    this.itemDisable = true;
    this.saveDisable = true;
    this.registerDisable = true;
    this.cancelDisable = true;
    this.isEditable =true;
    this.purchaseOrderService.disabledItems.next(false);
    this.purchaseOrderService.btnClick.next('');
    this.isRegisterInvalid = false;
    this.isVendorInvalid = false;
    this.purchaseOrderService.ControlsEnableAndDisable.next(true);
    if(this.dashboardService.PurchaseOrder == 1){
      this.dashboardService.PurchaseOrder = 0;
      this.dashboardService.clickedPurchaseOrder.next(null);
    }
    this.purchaseOrderService.clickedPO.next(this.purchaseOrderService.mainList[0]);
  }

  async addRow() {
    if(this.purchaseOrderModel.register_code == undefined){
      this.alertService.triggerAlert('Please select Register...',3000,'error');
      return;
    }
    // If there are rows already, check the last one
    if (this.rows.length > 0) {
      const lastRow = this.rows[this.rows.length - 1];
      if (!lastRow.item_no || lastRow.item_no == '') {
        alert('Please enter Item Code in the previous row before adding a new one.');
        return; // stop here
      }
    }

    // Build new row depending on LocalPO / ForeignPO
    const rowguid = <HttpResponse<any>>await this.commonService.GetGuid();
    let seq_no = this.rows.length +1;
    let newRow: Partial<ItemDetailsModel> = {
      rowguid : rowguid,
      voucher_id: null,
      seq_no: seq_no,
      item_no: null,
      item_details: '',
      enter_rate : null,
      receipt_quantity: null,
      retail_rate: null,
      pamount : null,
      item_discount : 0,
      fgn_rate: null,
      fgn_total: null,
      unit_id:'',
    };

    if (this.LocalPO) {
      newRow.line_no = null;
    }

    if (this.ForeignPO) {
      newRow.line_no = this.rows.length + 1;
    }

    this.rows = [...this.rows, newRow];

    this.registerDisable =true;
  }

  deleteRow(index: number): void {
    this.rows.splice(index, 1);
    // Reassign seq_no for all rows 
    this.rows.forEach((row, i) => { row.seq_no = i + 1; });
    this.rows = [...this.rows];
    this.updateTotals();

    if (this.rows.length == 0) {
      this.registerDisable = false;
      this.purchaseOrderModel.enter_amount = 0;
      this.purchaseOrderModel.foreign_enter_amount = 0;
      this.purchaseOrderModel.discount = 0;
      this.purchaseOrderModel.foreign_discount_amount = 0;
    }
  }

  QtyChange = this.debounce((qty: number, row: any) => {
    if(row.receipt_quantity < 0){
      this.alertService.triggerAlert('Please enter a valid quantity.',3000,'error');
      row.receipt_quantity = 1;
    }
    if (this.purchaseOrderModel.register_code == '182') {
      row.fgn_total =+(row.receipt_quantity * row.fgn_rate).toFixed(4);
    } else {
      row.pamount = +(row.receipt_quantity * row.enter_rate).toFixed(3);
    }
    this.updateTotals();
  }, 200);

  RateChange = this.debounce((rate: number, row: any) => {
    if (this.purchaseOrderModel.register_code == '182') {
      row.fgn_total = +(rate * row.receipt_quantity).toFixed(4);
    } else {
      row.pamount = +(rate * row.receipt_quantity).toFixed(3);
    }
    this.updateTotals();
  }, 200);

  TotalChange = this.debounce((amount: number, row: any) => {
    if (this.purchaseOrderModel.register_code == '182') {
      row.fgn_rate = +(amount / row.receipt_quantity).toFixed(4);
    } else {
      row.enter_rate = +(amount / row.receipt_quantity).toFixed(3);
    }
    this.updateTotals();
  }, 200);

  // ✅ debounce helper
  private debounce(func: Function, wait: number) {
    let timeout: any;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  async ItemCodeEnter(item_no: any, row: any) {
    try {
      if(!item_no) return;
      const res = await this.purchaseOrderService.itemCodeEnter(item_no);
      
      if (res && res.length > 0) {
        if(res[0].retail_rate == 0){
          row.item_no = null;
          this.alertService.triggerAlert('please update the List price of the item in master.',3000,'error');
          return;
        }
        const item = res[0]; // assuming API returns an array of item details

        // Assign values to the corresponding row
        row.item_details = item.item_name_abbr;
        row.unit_name = item.unit_name;
        row.retail_rate = item.retail_rate;
        row.receipt_quantity = 0;
        row.pamount = 0 ;

        if (this.purchaseOrderModel.register_code == '32') {
          row.enter_rate = item.last_pur_rate;
          this.purchaseOrderModel.line_amount = this.rows.reduce((sum:any, data:any) => sum + (data.pamount || 0), 0);
          this.purchaseOrderModel.enter_amount =  this.purchaseOrderModel.line_amount - this.purchaseOrderModel.discount;
        }
        else if (this.purchaseOrderModel.register_code == '182') {
          row.fgn_rate = item.fgn_last_pur_rate;
          this.purchaseOrderModel.foreign_line_amount = this.rows.reduce((sum:any, data:any) => sum + (data.fgn_total || 0), 0);
          this.purchaseOrderModel.foreign_enter_amount = this.purchaseOrderModel.foreign_line_amount - this.purchaseOrderModel.foreign_discount_amount;
        }
      }
    } catch (error) {
      console.error('ItemCodeEnter error:', error);
    }
  }

  async ModelNameChange( row: any) {
    try {
     const [item_code, item_details] = row.item_details.split('-');
      row.item_code = item_code; 
      row.item_details = item_details;
      const item = this.ItemList.find(v => v.item_code == item_code.trim());
      this.ItemCodeEnter(item.item_no,row);
      row.item_no = item.item_no
    } catch (error) {
      console.error('ModelNameEnter error:', error);
    }
  }

  registerChange(x:any){
    this.rowTemp =  this.clone(this.rows);
    this.rows = [];
    if(x =='32'){
      this.LocalPO = true; this.ForeignPO = false;
      this.purchaseOrderModel.cur_no = null;
    }else{
      this.LocalPO = false; this.ForeignPO = true;
      const vendor = this.vendorList.find(v => v.account_code == this.purchaseOrderModel.account_code);
      this.purchaseOrderModel.cur_no = vendor ? vendor.cur_no : null;
    }
    this.rows =  this.clone(this.rowTemp);
    if(this.dashboardService.PurchaseOrder == 1){
      this.updateTotals();
    }
  }

  VendorChange(account_code :any){
    if(this.purchaseOrderModel.register_code == undefined){
      this.alertService.triggerAlert('Please select register...',3000,'error');
      this.purchaseOrderModel.account_code = null;
      return;
    }
    if(this.purchaseOrderModel.register_code == '182'){
      const vendor = this.vendorList.find(v => v.account_code == account_code);
      this.purchaseOrderModel.cur_no = vendor ? vendor.cur_no : null;
    }
  }

  DiscountChange(discount:any){
    if(this.rows.length == 0){
      this.alertService.triggerAlert('Please add the row items...',3000,'error');
      this.purchaseOrderModel.discount = 0;
      this.purchaseOrderModel.foreign_discount_amount = 0;
      return;
    }

    const itemEmpty = this.rows.some(row =>
      row.item_no == null ||
      row.item_no == undefined ||
      row.item_no == ''
    );

    if (itemEmpty) {
      this.alertService.triggerAlert('please select  Item Code',3000,'error');
      this.purchaseOrderModel.discount = 0;
      this.purchaseOrderModel.foreign_discount_amount = 0;
      return;
    }

    if(this.purchaseOrderModel.register_code == '182'){
      this.purchaseOrderModel.foreign_enter_amount = this.purchaseOrderModel.foreign_line_amount - discount;
    }else{
      this.purchaseOrderModel.enter_amount =  this.purchaseOrderModel.line_amount - discount;
    }
  }

  async onSubmit(POForm: any) {
    const isValid = await  this.validateForm(this.purchaseOrderModel);
    if (!isValid) {
      this.alertService.triggerAlert('Please fill all required fields.', 4000, 'error');
      return;
    }

    if (this.rows.length == 0) {
      this.alertService.triggerAlert('Please add the row items...', 3000, 'error');
      return ;
    }

    const itemEmpty = this.rows.some(row => !row.item_no);
    if (itemEmpty) {
      this.alertService.triggerAlert('Please select Item Code', 3000, 'error');
      return ;
    }

    const quantityEmpty = this.rows.some(row => !row.receipt_quantity);
    if (quantityEmpty) {
      this.alertService.triggerAlert('The column quantity cannot be empty', 3000, 'error');
      return ;
    }

    // var rateEmpty = false;
    // if(this.purchaseOrderModel.register_code == '182'){
    //    rateEmpty = this.rows.some(row => !row.fgn_total);
    // }else{
    //     rateEmpty = this.rows.some(row => !row.pamount);
    // }
    // if (rateEmpty) {
    //   this.alertService.triggerAlert('The column Amount/F.total cannot be empty', 3000, 'error');
    //   return ;
    // }

    const voucher_Date = new Date(this.purchaseOrderModel.voucher_date); // dd/MM/yyyy
    const periodFrom = new Date(sessionStorage.getItem('period_from')||'');
    const periodTo   = new Date(sessionStorage.getItem('period_to')||'');
    const isBetween = voucher_Date >= periodFrom && voucher_Date <= periodTo;
    if(!isBetween){
      this.alertService.triggerAlert('Entry date must choose within the chosen financial year.', 3000, 'error');
      return ;
    }

    if(this.btnType == 'N' || this.btnType == 'C'){
      const Voucher_id = <HttpResponse<any>>await this.commonService.GetGuid();
      this.purchaseOrderModel.voucher_id = Voucher_id;
      this.rows.forEach(row => {
        row.voucher_id = Voucher_id;
      }); 
      this.purchaseOrderModel.created_by = localStorage.getItem('user_id');
      this.purchaseOrderModel.approval_status = 'DRAFT';
    }else if(this.btnType == 'M'){
      this.rows.forEach(row => {
        row.voucher_id = this.purchaseOrderModel.voucher_id;
      });
      this.purchaseOrderModel.modified_by = localStorage.getItem('user_id');
    }
    
    this.purchaseOrderModel.period_id = sessionStorage.getItem('year');
    this.purchaseOrderModel.company_code = this.endPointService.companycode;
    const temp = this.purchaseOrderModel;
    const { register_name,account_name,voucherDate, ...rest } = this.purchaseOrderModel;
    this.purchaseOrderModel = rest as PurchaseOrderModel;
    this.rowSaveTemp = this.rows;
    this.rows = this.rows.map(({ unit_id,unit_name, ...rest }) => rest);
    const voucher_date = this.datePipe.transform(this.purchaseOrderModel.voucher_date, 'dd/MM/yyyy');
    this.dateModel.voucher_date = voucher_date;

    this.purchaseOrderService.savePurchaseOrder(this.purchaseOrderModel, this.rows,temp, this.dateModel)
      .subscribe({
        next: async (response: any) => {

          if(this.btnType == 'N'  || this.btnType == 'C'){
            this.alertService.triggerAlert('Row saved successfully...',4000, 'success');
          }
          else if (this.btnType == 'M'){
            this.alertService.triggerAlert('Row updated successfully...', 4000, 'success');
          }
          await this.purchaseOrderService.getPurchaseOrderList(sessionStorage.getItem('year'),2);
          let item: PurchaseOrderModel | undefined = this.purchaseOrderService.mainList.find(item => item.voucher_id === response.poSave.voucher_id);
          if (item) {
            this.purchaseOrderService.loadList.next(this.purchaseOrderService.mainList);
            this.dashboardService.PurchaseOrder = 0;
            this.purchaseOrderService.clickedPO.next(item); // pass single object
          }

          this.registerDisable = true;
          this.itemDisable = true;
          this.saveDisable = true;
          this.cancelDisable = true;
          this.isEditable = true;
          this.purchaseOrderService.disabledItems.next(false);
          this.purchaseOrderService.disableGrid.next(false);
          this.purchaseOrderService.btnClick.next('');
          this.purchaseOrderService.ControlsEnableAndDisable.next(true);
        },
      error: (err) => {
        this.alertService.triggerAlert('Failed to save the Row...',4000, 'error');
        this.purchaseOrderService.btnClick.next('');
      }
    });
  }

  async validateForm(model: PurchaseOrderModel): Promise<boolean> {
    // Reset validation flags
    this.isRegisterInvalid = !model.register_code;
    this.isVendorInvalid   = !model.account_code;

    // Overall validity check
    const isValid = !(this.isRegisterInvalid || this.isVendorInvalid);

    return isValid;
  }

  async onDelete(){
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    let amount,discount;
    if(this.purchaseOrderModel.register_code == 182){
      amount = this.purchaseOrderModel.foreign_enter_amount;
      discount = this.purchaseOrderModel.foreign_discount_amount
    }else{
      amount = this.purchaseOrderModel.enter_amount;
      discount = this.purchaseOrderModel.discount
    }

    const items ={
      year : sessionStorage.getItem('year')||'',
      account_code : this.purchaseOrderModel.account_code,
      modified_by : localStorage.getItem('user_id')||'',
      voucher_date : this.purchaseOrderModel.voucher_date,
      enter_amount : amount,
      discount : discount,
      approval_status : this.purchaseOrderModel.approval_status,
      register_code : this.purchaseOrderModel.register_code,
    }

    this.purchaseOrderService.deletePurchaseOrder(this.purchaseOrderModel.voucher_id,items,this.rows)
    .subscribe(
      (updatedList: any[]) => {
        this.purchaseOrderService.loadList.next(updatedList);
        this.purchaseOrderService.clickedPO.next(updatedList[0]);
        this.alertService.triggerAlert('Row deleted successfully...', 4000, 'success');
        this.purchaseOrderService.btnClick.next('');
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.purchaseOrderService.btnClick.next('')
      }
    );
  }

  copyClick(){
    this.purchaseOrderModel.document_number = null;
    this.purchaseOrderModel.order_no = null;
    this.purchaseOrderModel.voucherDate =new Date(new Date);
    this.purchaseOrderModel.voucher_date =  new Date();
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
    if (bodyElement) { bodyElement.scrollTop = index * rowHeight; }
  }

  async purchaseOrderBtnClick(data:any){
    this.purchaseOrderService.disableGrid.next(true);
    this.purchaseOrderModelTemp = {...this.purchaseOrderModel};
    this.totalQtyTemp = this.totalQty;
    this.rowTemp =  this.clone(this.rows);
    this.purchaseOrderService.btnClick.next('N');
    this.btnType ='N';
    this.ItemListtemp = [...this.ItemList];
    this.ItemList = JSON.parse(localStorage.getItem('ItemListNew')||'');
    this.purchaseOrderModel = new PurchaseOrderModel();
    this.purchaseOrderModel.counter_vid = data.voucher_id;
    this.purchaseOrderModel.request_no = data.document_number;
    this.purchaseOrderModel.register_code = 182;
    this.purchaseOrderModel.voucher_date = new Date();
    this.purchaseOrderModel.voucherDate = new Date();
    try {
      const items =await this.purchaseOrderService.getItemDetailsFromReorder(this.purchaseOrderModel.counter_vid);
      if (items && items.length) {
        this.rows = items.slice();
        this.LocalPO = false;
        this.ForeignPO = true;
        this.AssignItems();
        this.updateTotals();
      } else {
        this.rows = [];
        this.LocalPO = false;
        this.ForeignPO = false;
      }
    } catch (err) {
      console.error('Error fetching ItemDetails', err);
      this.rows = [];
      this.totalQty = '0.000';
    }
    this.totalQty = this.sumRows('receipt_quantity');
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