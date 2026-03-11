import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { GRNGridModel, GRNModel, GRNDetailsModel, GRNHeaderModel, ItemDetailsModel } from '../../../../Model/RecieptEnry/reciept-enry.model';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { EndPointService } from '../../../../Service/end-point.services';
import { ProductMasterService } from '../../../../Service/ProductMasterService/product-master-service';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';
import { Subscription } from 'rxjs';
import { RecieptEntryService } from '../../../../Service/RecieptEntryService/reciept-entry-service';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { PurchaseOrderService } from '../../../../Service/PurchaseOrderService/purchase-order-service';
import { HttpResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { DashboardService } from '../../../../Service/DashboardService/dashboard-service';

@Component({
  selector: 'goods-reciept-note-details',
  standalone: false, 
  templateUrl: './goods-reciept-note-details.html',
  styleUrls: ['./goods-reciept-note-details.css','../../../common.css'],
  providers: [DatePipe]
})
export class GoodsRecieptNoteDetails {
  @ViewChild(DatatableComponent) table?: DatatableComponent;
  registerList: any[] = [];
  vendorList: any[] = [];
  forignVendorList: any[] = [];
  localVendorList: any[] = [];
  warehouseList: any[] = [];
  rows: any[] = []; 
  allRows: any[] = [];
  rowTemp: any[] = [];
  filteredRows: any[] = [];
  refNoList: any[] = [];
  refNoListTemp: any[] = [];
  PoNoList: any[] = [];
  localPoNoList: any[] = [];
  foreignPoNoList: any[] = [];
  itemDisable: boolean = true;
  saveDisable: boolean = true;
  cancelDisable: boolean = true;
  registerDisable: boolean = true;
  isRegisterInvalid: boolean = false;
  isVendorInvalid: boolean = false;
  isWRHouseInvalid: boolean = false;
  isInvoiceInvalid: boolean = false;
  gridHeight:number=350;
  reorderable = true;
  controls = {
    pageSize:50 
  };
  SelectionType = SelectionType;
  isEditable: boolean = true;
  statusDisable: boolean = true;
  isLocalEditable: boolean = true;
  rowCount:number=0;
  scroll: boolean = true;
  selected: any[] = [];
  grnModel: GRNModel = new GRNModel();
  grnheaderModel: GRNHeaderModel = new GRNHeaderModel();
  grnDetailsModel:GRNDetailsModel = new GRNDetailsModel();
  grnGridModel:GRNGridModel[] =[];
  grnModelTemp: GRNModel = new GRNModel();
  subscription: Subscription[] = new Array<Subscription>();
  ItemList: any[] = [];
  ItemListTemp: any[] = [];
  totalQty: any = 0;
  totalQtyTemp: any = 0;
  filterStockDetails = { item_no: '', item_name_abbr: '' };
  LocalPO: boolean = true;
  ForeignPO: boolean = false;
  btnType: string = '';
  exchangeRate:any;
  consExchangeRate:any;
  CounterVid:any;
  private router = inject(Router);

  constructor(private datePipe: DatePipe,private alertService:AlertService,private commonService:CommonService,
    public grnService:RecieptEntryService,public purchaseOrderService:PurchaseOrderService, private dashboardService: DashboardService,
    private cdRef: ChangeDetectorRef,public endPointService:EndPointService,public userAccessService:UserAccessService) {

    this.subscription.push(
      this.grnService.clickedGRN.subscribe(x => {
        this.grnService.ControlsEnableAndDisable.next(true);
        if(this.dashboardService.RecieptEntry == 1){
          return
        } 
        if (!x?.voucher_id) {
          this.grnModel = new GRNModel();
          this.rows = [];
          this.allRows = [];
          return;
        }

        this.LocalPO = x.register_code == '31';
        this.ForeignPO = x.register_code == '151';
        this.exchangeRate = x.exch_rate;
        this.consExchangeRate = x.cons_exch_rate;
        x.invoiceDate = this.datePipe.transform(x.invoice_date, 'dd/MM/yyyy') || '';
        this.grnModel = { ...x };
        this.grnService.selectedGRN = this.grnModel.voucher_id;
        this.CounterVid = this.grnModel.counter_vid;
        this.cdRef.markForCheck();
        // trigger async separately
        this.grnService.getItemDetails(this.grnModel.voucher_id).then(() => {
          this.totalQty = this.sumRows('receipt_quantity').toFixed(3);
          this.cdRef.markForCheck();
        });
      })
    );

    this.subscription.push(this.grnService.assignItemDetails.subscribe( (data:any)=>{
      if(data[0]){
        this.rows = data.slice();
        this.allRows = data.slice();
        this.totalQty = this.sumRows('receipt_quantity').toFixed(3);
        this.AssignItems();
        this.cdRef.markForCheck();
      }else{
        this.rows = [];
        this.totalQty = 0;
      }
    }));

    this.subscription.push(this.grnService.refNoList.subscribe( (data:any)=>{
      this.refNoList = data || [];
      return;
    }));

    this.subscription.push(this.grnService.btnClick.subscribe(async x=>{
      if(x !==''){
        this.ItemListTemp = this.ItemList;
        this.ItemList = this.grnService.ItemList;
        await this.btnClickFunction(x);
      }
    }));

    this.subscription.push(this.dashboardService.clickedRecieptEntry.subscribe(async data => {
      if (data) {
        data.register_code = data.register_code == 182 ? 151:31;
        this.grnService.disableGrid.next(true);
        await this.btnClickFunction('N');
        this.grnModel = data;
        this.grnModel.document_number = null;
        this.grnModel.voucher_reference = null;
        await this.grnService.getVendorList(this.endPointService.companycode).then((res: any[]) => {
            this.vendorList = res;
          });
        this.VendorChange(data.account_code);
        if(data.register_code == 151){
          this.grnModel.discount = 0;
        }else{
          this.grnModel.foreign_discount_amount = 0;
        }
        this.PoNoChange(this.grnModel.po_no);
        this.PoNoList = data.register_code == '151' ? this.foreignPoNoList:this.localPoNoList;
        this.grnModel.voucherDate =  new Date();
        this.grnModel.voucher_date =  new Date();
        this.grnModel.invoice_date =  new Date();
        this.grnModel.invoiceDate =  new Date();
      }
      })
    );

    this.subscription.push(this.grnService.approvalStatus.subscribe(data=>{
      if(data){
        this.grnModel.approval_status = data;
      }
    }));

    this.subscription.push(this.commonService.isSystemAdmin.subscribe(data=>{
      this.statusDisable = !data;
    }));

    this.subscription.push(this.grnService.cancelClick.subscribe(data=>{
      this.cancelClickMethod();
    }));
  }

  async ngOnInit() {
    try {

      const companyCode = this.endPointService.companycode;
      const year = sessionStorage.getItem('year') || '';

      this.grnService.getPoNoList(companyCode,1).then((res: any[]) => {
        if(this.dashboardService.RecieptEntry == 1){
          return
        }
        this.PoNoList = res;
      });

      this.grnService.getRefNoListFull(companyCode, year).then((res: any[]) => {
        this.refNoList = res;
        this.grnService.refNoList.next(res);
      });

      this.grnService.getFullWarehouseList(companyCode).then((res: any[]) => {
        this.warehouseList = res;
      });

      this.grnService.getVendorList(companyCode).then((res: any[]) => {
        this.vendorList = res;
        this.forignVendorList = res.filter((v:any) => v.sub_group_code === 53);
        this.localVendorList = res.filter((v:any) => v.sub_group_code === 64);
      });

      this.grnService.getRegisterList(companyCode).then((res: any[]) => {
        this.registerList = res;
        this.grnService.registerList.next(res);
      });

      this.cdRef.markForCheck();
    } catch (err) {
      console.error('Error loading lists', err);
    }
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  async btnClickFunction(x: string) {
    this.btnType = x;
    this.grnModelTemp = {...this.grnModel};
    this.totalQtyTemp = this.totalQty;
    this.rowTemp = this.rows;
    this.refNoListTemp = this.refNoList;
    this.PoNoList = [];
    if(x =='N'){
      await this.grnService.getPoNoList(this.endPointService.companycode,2).then((res) => {
        this.PoNoList = res;
        this.localPoNoList = res.filter((v:any) => v.register_code == 32);
        this.foreignPoNoList = res.filter((v:any) => v.register_code == 182);
      });
      this.grnModel = new GRNModel();
      this.vendorList = [];
      this.saveDisable = false;
      this.cancelDisable = false;
      this.itemDisable = false;
      this.registerDisable = false;
      this.isEditable =false;
      this.totalQty =0;
      this.rows = [];
      this.refNoList = [];
      this.grnModel.voucherDate =  new Date();
      this.grnModel.voucher_date =  new Date();
      this.grnModel.invoice_date =  new Date();
      this.grnModel.invoiceDate =  new Date();
    }else if(x =='M'){
      this.RefNoList(this.grnModel.register_code);
      this.saveDisable = false;
      this.cancelDisable = false;
      this.isEditable =false;
      this.itemDisable = false;
      this.registerDisable = false;
      this.isLocalEditable = (this.grnModel.register_code === 151);
    }else if(x =='D'){
      this.onDelete();
    }
    this.cdRef.markForCheck();
  }

  cancelClickMethod(){
    this.ItemList = this.ItemListTemp;
    this.grnService.disableGrid.next(false);
    this.totalQty = this.totalQtyTemp;
    this.rows = this.rowTemp;
    this.grnModel = {...this.grnModelTemp};
    this.refNoList = this.refNoListTemp;
    this.itemDisable = true;
    this.saveDisable = true;
    this.registerDisable = true;
    this.cancelDisable = true;
    this.isEditable =true;
    this.isLocalEditable = true;
    this.grnService.disabledItems.next(false);
    this.grnService.btnClick.next('');
    this.isRegisterInvalid = false;
    this.isVendorInvalid = false;
    this.isWRHouseInvalid = false;
    this.isInvoiceInvalid = false;
    this.dashboardService.RecieptEntry = 0;
    this.cdRef.markForCheck();
    this.grnService.ControlsEnableAndDisable.next(true);
  }

  private sumRows(field: string): number {
    const total = this.rows.reduce((sum: number, row: any) => {
      const val = Number(row[field]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    return Number(total);  // round to 4 decimal places
  }

  onDateSelected(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.grnModel.voucher_date = date;
  }

  formatToDateInput(value: string): void {
    this.grnModel.voucher_date = value;
  }

  updateFilter(value: string, field: 'item_no' | 'item_name_abbr') {
    this.filterStockDetails[field] = value;
    const itemNoFilter = (this.filterStockDetails.item_no || '').toLowerCase();
    const itemDetailsFilter = (this.filterStockDetails.item_name_abbr || '').toLowerCase();

    this.rows = this.allRows.filter(row => {
      const matchesItemNo = !itemNoFilter || (row.item_code?.toString().toLowerCase().includes(itemNoFilter));
      const matchesItemDetails = !itemDetailsFilter || (row.item_details?.toString().toLowerCase().includes(itemDetailsFilter));
      return matchesItemNo && matchesItemDetails;
    });
  }

  async onSubmit(GRNForm:any){
    const isValid = await this.validateForm(this.grnModel);
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

    const voucher_Date = new Date(this.grnModel.voucher_date); // dd/MM/yyyy
    const periodFrom = new Date(sessionStorage.getItem('period_from')||'');
    const periodTo   = new Date(sessionStorage.getItem('period_to')||'');
    const isBetween = voucher_Date >= periodFrom && voucher_Date <= periodTo;
    if(!isBetween){
      this.alertService.triggerAlert('Entry date must choose within the chosen financial year.', 3000, 'error');
      return ;
    }

    await this.AssignValues();
    
    this.grnService.saveGoodsRecieptNote(this.grnheaderModel, this.grnGridModel,this.grnDetailsModel)
      .subscribe({
        next: async (response: any) => {
          if(this.btnType == 'N'  || this.btnType == 'C'){
            //this.grnService.addRowAfterSave.next(savedgrn);
            this.alertService.triggerAlert('Row saved successfully...',4000, 'success');
          }
          else if (this.btnType == 'M'){
           // this.grnService.addRowAfterModify.next(savedgrn);
            this.alertService.triggerAlert('Row updated successfully...', 4000, 'success');
          }

          await this.grnService.getGoodsRecieptList(sessionStorage.getItem('year'));
          let MainList = this.grnService.mainList;
          const result =MainList.find(item => item.voucher_id === response.grnheaderModel.voucher_id) ?? new GRNModel(); 
          this.grnService.clickedGRN.next(result);

          
          //this.rows = [ ...savedItems];
          this.AssignItems();
          this.registerDisable = true;
          this.itemDisable = true;
          this.saveDisable = true;
          this.cancelDisable = true;
          this.isEditable = true;
          this.isLocalEditable =true;
          this.grnService.disabledItems.next(false);
          this.grnService.disableGrid.next(false);
          this.grnService.btnClick.next('');
          this.grnService.ControlsEnableAndDisable.next(true);
        },
      error: (err) => {
        this.alertService.triggerAlert('Failed to save the Row...',4000, 'error');
        this.grnService.btnClick.next('');
      }
    });

  }

  async AssignValues(){
    // Header Details
   const voucher_id = await this.commonService.GetGuid();
    this.grnheaderModel = {
      company_code: this.endPointService.companycode,
      voucher_date: new Date(this.grnModel.voucher_date),
      period_id: sessionStorage.getItem('year'),
      register_code: this.grnModel.register_code,
      voucher_reference: this.grnModel.voucher_reference,
      godown_code: this.grnModel.godown_code,
      account_code: this.grnModel.account_code,
      line_amount: this.grnModel.line_amount,
      enter_amount: this.grnModel.enter_amount,
      discount: this.grnModel.discount,
      counter_vid: this.CounterVid,
      approver_remarks: this.grnModel.approver_remarks,
      createdt: this.grnModel.createdt,
      cst :null,

      ...(this.btnType === 'N'
      ? {
          voucher_id:voucher_id,
          document_number: '',
          created_by: localStorage.getItem('user_id'),
          user_enter_date: new Date(),
          approved_by: null,modified_by: null,modified_on: null,
          approval_status : 'DRAFT'
        }
      : {
          voucher_id:this.grnModel.voucher_id,
          created_by: this.grnModel.created_by,
          document_number: this.grnModel.document_number,
          modified_by: localStorage.getItem('user_id'),
          modified_on: new Date(),
          user_enter_date: this.grnModel.user_enter_date,
          approved_by: this.grnModel.approved_by,
          approval_status: this.grnModel.approval_status
        })
    };

    // GRN DEtails
    this.grnDetailsModel.voucher_id = this.grnModel.voucher_id;
    this.grnDetailsModel.invoice_no = this.grnModel.invoice_no;
    this.grnDetailsModel.invoice_date = new Date(this.grnModel.invoiceDate);
    this.grnDetailsModel.cur_no = this.grnModel.cur_no;
    this.grnDetailsModel.exch_rate = this.grnModel.exch_rate;
    this.grnDetailsModel.cons_exch_rate = this.grnModel.cons_exch_rate;
    this.grnDetailsModel.ref_grn_id = this.grnModel.ref_grn_id;
    this.grnDetailsModel.foreign_discount_amount = this.grnModel.foreign_discount_amount;
    this.grnDetailsModel.foreign_enter_amount = this.grnModel.foreign_enter_amount;
    this.grnDetailsModel.foreign_line_amount = this.grnModel.foreign_line_amount;

    //Grid Details
    this.grnGridModel = await this.mapItemsToDetails(this.rows,this.grnModel.voucher_id);
  }

  async mapItemsToDetails(items: any[],voucher_id:any): Promise<GRNGridModel[]> {
    const detailsList: GRNGridModel[] = [];

    for (const item of items) {
      const details = new GRNGridModel();
      details.rowguid = this.btnType === 'N' ? await this.commonService.GetGuid() : item.rowguid;
      details.voucher_id = voucher_id;

      details.seq_no = item.seq_no;
      details.item_no = item.item_no;
      details.item_details = item.item_details;
      details.godown_code = this.grnheaderModel.godown_code;
      details.receipt_quantity = item.receipt_quantity;
      details.enter_rate = item.enter_rate;
      details.cost_rate = item.cost_rate;   
      details.pamount = item.pamount;
      details.transamount = item.transamount ?? 0;
      details.line_no = item.line_no;
      details.fgn_rate = item.fgn_rate;
      details.fgn_total = item.fgn_total;
      details.exch_rate = item.exch_rate;
      details.ref_row_id = item.ref_row_id ?? null;

      detailsList.push(details);
    }

    return detailsList;
  }

  async validateForm(model: GRNModel): Promise<boolean> {
    // Reset validation flags
    this.isRegisterInvalid = !model.register_code;
    this.isVendorInvalid   = !model.account_code;
    this.isWRHouseInvalid   = !model.godown_code;
    this.isInvoiceInvalid   = !model.invoice_no;

    // Overall validity check
    const isValid = !(this.isRegisterInvalid || this.isVendorInvalid || this.isWRHouseInvalid || this.isInvoiceInvalid);

    return isValid;
  }

  getRowIdentity(row: any): any {
    return row.rowguid; // unique identifier
  }

  async addRow() {
    if(this.grnModel.register_code == undefined){
      this.alertService.triggerAlert('Please select Register...',3000,'error');
      return;
    }
    if(this.grnModel.account_code == undefined){
      this.alertService.triggerAlert('Please select Vendor...',3000,'error');
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

    if(this.btnType == 'M'){
      this.VendorChange(this.grnModel.account_code);
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
      cost_rate: null,
      transamount: null,
      receipt_quantity: null,
      retail_rate: null,
      pamount : null,
      item_discount : 0,
      fgn_rate: null,
      fgn_total: null,
      unit_id:'',
      ref_row_id:null
    };

    if (this.LocalPO) {
      newRow.line_no = null;
      newRow.exch_rate = null;
    }

    if (this.ForeignPO) {
      newRow.line_no = this.rows.length + 1;
      newRow.exch_rate = this.exchangeRate;
    }

    this.rows = [...this.rows, newRow];

    this.registerDisable =true;
    this.cdRef.markForCheck();
  }

  async ItemCodeEnter(item_no: any, row: any) {
    try {
      const res = await this.purchaseOrderService.itemCodeEnter(item_no);

      if (res && res.length > 0) {
        const item = res[0]; // assuming API returns an array of item details
        row.exch_rate = (res[0].item_category === 'Consumable' || res[0].item_category === 'CONSUMABLE') ? this.consExchangeRate : this.exchangeRate;
        row.item_category = res[0].item_category;
        // Assign values to the corresponding row
        row.item_details = item.item_name_abbr;
        row.unit_name = item.unit_name;
        row.retail_rate = item.retail_rate;
        row.receipt_quantity = 0;
        row.pamount = 0 ;

        if (this.grnModel.register_code == '31') {
          row.enter_rate = item.last_pur_rate;
          //**********************************************************************************************************************;
          row.cost_rate = ((row.pamount / row.receipt_quantity) * (this.grnModel.enter_amount / this.grnModel.line_amount));
          row.transamount = (row.cost_rate *row. receipt_quantity).toFixed(3);
          this.grnModel.line_amount = this.rows.reduce((sum:any, data:any) => sum + (data.pamount || 0), 0);
          this.grnModel.enter_amount =  this.grnModel.line_amount - this.grnModel.discount;
        }
        else if (this.grnModel.register_code == '151') {
          row.fgn_rate = item.fgn_last_pur_rate;
          this.grnModel.foreign_line_amount = this.rows.reduce((sum:any, data:any) => sum + (data.fgn_total || 0), 0);
          this.grnModel.foreign_enter_amount = this.grnModel.foreign_line_amount - this.grnModel.foreign_discount_amount;
        }
      }
    } catch (error) {
      console.error('ItemCodeEnter error:', error);
    }
    this.cdRef.markForCheck();
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
    this.cdRef.markForCheck();
  }

  registerChange(x:any){
    this.LocalPO = x == '31'; this.ForeignPO = x == '151'; this.rows = [...this.rows];
    this.RefNoList(x);
    if(x =='31'){
      this.grnModel.cur_no = null;
      this.vendorList = this.localVendorList;
      this.PoNoList = this.localPoNoList;
      this.isLocalEditable = false;
    }else{
      const vendor = this.vendorList.find(v => v.account_code == this.grnModel.account_code);
      this.grnModel.cur_no = vendor ? vendor.cur_no : null;
      this.vendorList = this.forignVendorList;  
      this.PoNoList = this.foreignPoNoList;
      
      this.isLocalEditable = true;
    }
    this.PoNoChange(null)
    this.cdRef.markForCheck();
  }

  RefNoList(x :any){
    this.grnService.getRefNoList(x,this.endPointService.companycode,sessionStorage.getItem('year')||'').then((res:any)=>{
      this.refNoList = res;
      this.cdRef.markForCheck();
    });
  }

  VendorChange(account_code :any){
    if(this.grnModel.po_no != null && this.grnModel.po_no != '' && this.btnType != 'M'){
      this.grnModel.discount = null;
      this.grnModel.enter_amount = null;
      this.grnModel.line_amount = null;
      this.grnModel.foreign_discount_amount = null;
      this.grnModel.foreign_enter_amount = null;
      this.grnModel.foreign_line_amount = null;
      this.rows= [];
      this.totalQty = 0; 
    }

    if(this.grnModel.register_code == 151){
      const vendor = this.vendorList.find(v => v.account_code === account_code);

      this.exchangeRate = vendor.ex_rate;
      this.consExchangeRate = vendor.consumable_ex_rate;
      this.grnModel.exch_rate = this.exchangeRate;
      this.grnModel.cur_no =  vendor.cur_no;
      this.grnModel.cur_name = vendor.cur_name;
      this.grnModel.cons_exch_rate = this.consExchangeRate;

      this.rows.forEach(row => {
        // always available
        const fgn_rate = Number(row.fgn_rate);
        const receipt_quantity = Number(row.receipt_quantity);
        const exch_rate = row.item_category?.toUpperCase() === 'CONSUMABLE' ? this.consExchangeRate  : this.exchangeRate;
        row.exch_rate = exch_rate;
        // recalculate dependent values
        row.enter_rate = (fgn_rate * exch_rate).toFixed(3)||0;
        row.fgn_total = (fgn_rate * receipt_quantity).toFixed(4)||0;
        row.pamount = (row.enter_rate * receipt_quantity).toFixed(3)||0;
      });
      const vendor1 = this.forignVendorList.find(v => v.account_code == account_code);
      this.grnModel.cur_no = vendor1 ? vendor1.cur_no : null;
    }else{
      this.grnModel.cur_no = null;
    }
    this.cdRef.markForCheck();
  }

  async PoNoChange(po_no:any){
    if(po_no == null){
        this.rows =[];
        this.grnModel.po_no = '';
        this.totalQty = 0;
        this.grnModel.enter_amount=0;
        this.grnModel.foreign_enter_amount=0;
        this.grnModel.discount=0;
        this.grnModel.foreign_discount_amount=0;
        this.grnModel.line_amount=0;
        this.grnModel.foreign_line_amount=0;
        this.CounterVid = null;
      return
    }
    this.grnService.getPoNoDetails(po_no).then((res:any)=>{
      if(res && res.header.length != 0){
        this.CounterVid = res.header[0]?.voucher_id;

        if(res.header[0]?.register_code == '32'){
          this.grnModel.register_code = 31;
          this.ForeignPO = false;
          this.vendorList = this.localVendorList;
          this.PoNoList = this.localPoNoList;
          
        this.isLocalEditable = false;
        }else{
          this.grnModel.register_code = 151;
          this.ForeignPO = true;
          this.vendorList = this.forignVendorList;
          this.PoNoList = this.foreignPoNoList;
          
          this.isLocalEditable = true;
        }

        this.RefNoList(this.grnModel.register_code);
        this.grnModel.account_code = res.header[0]?.account_code;
        this.grnModel.foreign_discount_amount = res.header[0]?.foreign_discount_amount;
        this.grnModel.discount = res.header[0]?.discount;
        this.grnModel.po_no = res.header[0]?.document_number;

        if(this.grnModel.register_code == '151'){
          this.VendorChange(this.grnModel.account_code);
        }
        this.rows = [...res.details];

        this.totalQty = this.sumRows('receipt_quantity').toFixed(3)||0;
        this.grnModel.line_amount = this.sumRows('pamount').toFixed(3)||0;
        this.grnModel.enter_amount = (this.grnModel.line_amount - this.grnModel.discount).toFixed(3)||0;
        this.grnModel.foreign_line_amount = this.sumRows('fgn_total').toFixed(4)||0;
        this.grnModel.foreign_enter_amount = (this.grnModel.foreign_line_amount - this.grnModel.foreign_discount_amount).toFixed(4)||0;

        res.details.forEach((row: any) => {
          row.ref_row_id = row.rowguid;
          row.rowguid = null;
         const costRate = (row.pamount / row.receipt_quantity) * 
                      (this.grnModel.enter_amount / this.grnModel.line_amount);

        row.cost_rate = costRate.toFixed(3);
        row.transamount = (costRate * row.receipt_quantity).toFixed(3);
        });
      }else{
        this.rows =[];
        this.totalQty = 0;
        this.grnModel.enter_amount=0;
        this.grnModel.foreign_enter_amount=0;
        this.grnModel.discount=0;
        this.grnModel.foreign_discount_amount=0;
        this.grnModel.line_amount=0;
        this.grnModel.foreign_line_amount=0;
        this.CounterVid = null;
      }
      this.cdRef.markForCheck();
    });
  }

  DiscountChange(discount:any){
    if(this.rows.length == 0){
      this.alertService.triggerAlert('Please add the row items...',3000,'error');
      this.grnModel.discount = 0;
      return;
    }
    this.grnModel.enter_amount = (this.grnModel.line_amount - discount).toFixed(3)||0;
    this.rows.forEach(row => {
      const costRate = (row.pamount / row.receipt_quantity) * 
                      (this.grnModel.enter_amount / this.grnModel.line_amount);

      row.cost_rate = costRate.toFixed(3);
      row.transamount = (costRate * row.receipt_quantity).toFixed(3);
    });
    this.cdRef.markForCheck();
  }

  forignDiscountChange(foreign_discount_amount:any){
    if(this.rows.length == 0){
      this.alertService.triggerAlert('Please add the row items...',3000,'error');
      this.grnModel.foreign_discount_amount = 0;
      return;
    }
    this.grnModel.foreign_enter_amount = (this.grnModel.foreign_line_amount - foreign_discount_amount).toFixed(4)||0;
    this.grnModel.discount =(foreign_discount_amount * this.exchangeRate).toFixed(3);
    this.DiscountChange(this.grnModel.discount);
    this.cdRef.markForCheck();
  }

  deleteRow(index: number): void {
    this.rows.splice(index, 1);
    // Reassign seq_no for all rows 
    this.rows.forEach((row, i) => { row.seq_no = i + 1; });
    this.rows = [...this.rows];
    this.updateTotals();

    if (this.rows.length == 0) {
      this.registerDisable = false;
      this.grnModel.enter_amount = 0;
      this.grnModel.foreign_enter_amount = 0;
      this.grnModel.discount = 0;
      this.grnModel.foreign_discount_amount = 0;
    }
    this.cdRef.markForCheck();
  }

  QtyChange = this.debounce((qty: number, row: any) => {
    if(qty>row.original_qty){
      this.alertService.triggerAlert('Received quantity cannot be greater than original quantity.',3000,'error');
      row.receipt_quantity = row.original_qty;
      return;
    }
    if (this.grnModel.register_code == '151') {
      row.fgn_total = (qty * row.fgn_rate).toFixed(4);
      row.enter_rate = (row.fgn_rate * row.exch_rate).toFixed(3);
      row.pamount = (row.enter_rate * qty).toFixed(3);
    } else {
      row.pamount = (qty * row.enter_rate).toFixed(3);
    }

    this.updateTotals();
    row.cost_rate = ((row.pamount / qty) * (this.grnModel.enter_amount / this.grnModel.line_amount)).toFixed(3);
    row.transamount = (row.cost_rate * qty).toFixed(3);
  }, 200);

  RateChange = this.debounce((rate: number, row: any) => {
    if (this.grnModel.register_code == '151') {
      row.fgn_total = (rate * row.receipt_quantity).toFixed(4);
      row.enter_rate = (rate * row.exch_rate).toFixed(3);
      row.pamount = (row.enter_rate * row.receipt_quantity).toFixed(3);
    } else {
      row.pamount = (rate * row.receipt_quantity).toFixed(3);
    }
    
    this.updateTotals();
    row.cost_rate = ((row.pamount / row.receipt_quantity) * (this.grnModel.enter_amount / this.grnModel.line_amount)).toFixed(3);
    row.transamount = (row.cost_rate *row. receipt_quantity).toFixed(3);
  }, 200);

  TotalChange = this.debounce((amount: number, row: any) => {
    if (this.grnModel.register_code == '151') {
      row.fgn_rate = (amount / row.receipt_quantity).toFixed(4);
      row.pamount = (amount * row.exch_rate).toFixed(3);
      row.enter_rate = (row.pamount / row.receipt_quantity).toFixed(3);
    } else {
      row.enter_rate = (amount / row.receipt_quantity).toFixed(3);
    }
    
    this.updateTotals();
    row.cost_rate = ((row.pamount / row.receipt_quantity) * (this.grnModel.enter_amount / this.grnModel.line_amount)).toFixed(3);
    row.transamount = (row.cost_rate *row. receipt_quantity).toFixed(3);
  }, 200);

  // ✅ debounce helper
  private debounce(func: Function, wait: number) {
    let timeout: any;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  LineChange = this.debounce((no: number, row: any) => {
    row.line_no = no;
  }, 200);

  private updateTotals(): void {
    if (this.grnModel.register_code == '151') {
      this.grnModel.foreign_line_amount = this.sumRows('fgn_total').toFixed(3);
      this.grnModel.foreign_enter_amount =
      (this.grnModel.foreign_line_amount - (this.grnModel.foreign_discount_amount || 0)).toFixed(4);
    }
    this.grnModel.line_amount = this.sumRows('pamount').toFixed(3);
    (this.grnModel.enter_amount =
      this.grnModel.line_amount - (this.grnModel.discount || 0)).toFixed(3);
    this.totalQty = this.sumRows('receipt_quantity').toFixed(3);
    this.cdRef.markForCheck();
  }

  async onDelete(){
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    const items ={
      voucher_id : this.grnModel.voucher_id,
      account_code : this.grnModel.account_code,
      godown_code : this.grnModel.godown_code,
      modified_by : localStorage.getItem('user_id')||'',
      voucher_date : this.grnModel.voucher_date,
      enter_amount : this.grnModel.enter_amount,
      discount : this.grnModel.discount,
      approval_status : this.grnModel.approval_status,
      counter_vid : this.grnModel.counter_vid,
      foreign_enter_amount : this.grnModel.foreign_enter_amount,
      foreign_discount_amount : this.grnModel.foreign_discount_amount,
    }

    this.grnService.deleteGRN(this.grnModel.voucher_id,sessionStorage.getItem('year'),items,this.rows)
    .subscribe(
      (updatedList: any[]) => {
        this.grnService.loadListGRN.next(updatedList);
        this.grnService.clickedGRN.next(updatedList[0]);
        this.alertService.triggerAlert('Row deleted successfully...', 4000, 'success');
        this.grnService.btnClick.next('');
        this.cdRef.markForCheck();
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.grnService.btnClick.next('')
      }
    );
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
      this.cdRef.markForCheck();
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
    this.cdRef.markForCheck();
  }

  AssignItems(){
    const rowItemNos = this.rows.map(r => r.item_no);
    const filteredItems = this.grnService.ItemList.filter(item =>
      rowItemNos.includes(item.item_no)
    );
    this.ItemList = filteredItems;
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