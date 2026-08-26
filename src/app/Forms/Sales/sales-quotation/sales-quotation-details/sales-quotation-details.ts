import { Component, ViewChild } from '@angular/core';
import { SalesQuotationDetailModel, SalesQuotationModel, SalesQuotationSave } from '../../../../Model/SalesQuotation/sales-quotation.model';
import { DateModelInventory, DateModelSales } from '../../../../Model/CommonModel';
import { Subscription } from 'rxjs';
import { SalesQuotationService } from '../../../../Service/SalesQuotationService/sales-quotation-service';
import { ProductMasterService } from '../../../../Service/ProductMasterService/product-master-service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { EndPointService } from '../../../../Service/end-point.services';
import { DatePipe } from '@angular/common';
import { TagMasterService } from '../../../../Service/TagMasterService/tag-master-service';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { PurchaseOrderService } from '../../../../Service/PurchaseOrderService/purchase-order-service';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'sales-quotation-details',
  standalone: false,
  templateUrl: './sales-quotation-details.html',
  styleUrls: ['./sales-quotation-details.css','../../../common.css'],
  providers: [DatePipe]
})
export class SalesQuotationDetails {
  @ViewChild(DatatableComponent) table?: DatatableComponent;
  salesQuotationModel: SalesQuotationModel = new SalesQuotationModel();
  salesQuotationTemp: SalesQuotationModel = new SalesQuotationModel();
  salesQuotationSave: SalesQuotationSave = new SalesQuotationSave ();
  salesQuotationDetailModel: SalesQuotationDetailModel[] =[];
  dateModel: DateModelSales = new DateModelSales();
  subscription: Subscription[] = new Array<Subscription>();
  itemDisable: boolean = true;
  saveDisable: boolean = true;
  cancelDisable: boolean = true;
  btnType: string = '';
  isCustomer: boolean = false;
  isSalesman: boolean = false;
  isSubject: boolean = false;
  isDelivery: boolean = false;
  isWarranty: boolean = false;
  isValidity: boolean = false;
  isPayTerm: boolean = false;
  ItemList:any[] = [];
  CustomerDisable:boolean =true;
  CustomerList:any[] = [];
  CustomerListTemp:any[] = [];
  SalesManList:any[] = [];
  SalesManListTemp:any[] = [];
  PaymentTypeList:any[] = [];
  PaymentTypeListTemp:any[] = [];
  statusDisable: boolean = true;
  selectedRow: any;
  selectedRowTemp: any;
  selectedIndex: any;
  rows: any[] = []; 
  rowsTemp: any[] = [];
  isEditable: boolean = true;
  scroll: boolean = true;
  gridHeight: number = 450;
  reorderable = true;
  controls = {
    pageSize:50 
  };
  SelectionType = SelectionType;
  selected: any[] = [];
  ItemListTemp: any[] =[];
  showModalFeatures: boolean = false;

  constructor(private salesQuotationService: SalesQuotationService,private purchaseOrderService: PurchaseOrderService, private tagMasterService:TagMasterService, 
     public alertService: AlertService, public commonService: CommonService, public endPointService: EndPointService,private datePipe: DatePipe) {

    this.subscription.push(this.salesQuotationService.clickedSalesQuotation.subscribe(async x=>{
      if(!x?.voucher_id){
        this.salesQuotationModel =  new SalesQuotationModel();
        this.rows = [];
        this.rowsTemp = [];
        return;
      }
      this.salesQuotationModel = {...x};
      this.salesQuotationService.voucher_id = x.voucher_id;
      this.salesQuotationService.approval_status = x.approval_status;
      this.salesQuotationService.ControlsEnableAndDisable.next(true);
      if(this.salesQuotationModel.cust_code == null){
        this.salesQuotationModel.new =true;
        this.CustomerDisable = false;
      }else{
        this.salesQuotationModel.new = false;
        this.CustomerDisable = true; 
      }

      try {
        const items = await this.salesQuotationService.GetSalesQuotationDetails(this.salesQuotationModel.voucher_id);
        if (items && items.length) {
          this.rows = items.slice();
          this.salesQuotationService.Approved = this.rows.some(r => r.approved);
          this.AssignItems();
        } else {
          this.rows = [];
          this.rowsTemp = [];
        }
      } catch (err) {
        console.error('Error fetching ItemDetails', err);
        this.rows = [];
        this.rowsTemp = [];
      }
    }));

    this.subscription.push(this.commonService.isSystemAdmin.subscribe(data=>{
      this.statusDisable = !data;
    }));

    this.subscription.push(this.salesQuotationService.btnClick.subscribe(async x=>{
        if(x != ''){
        this.btnClickFunction(x);
     }
    }));

    this.subscription.push(this.salesQuotationService.Status.subscribe(async ([status, status_remarks])=>{
      if(status != ''){
        this.salesQuotationModel.approval_status = status;
        this.salesQuotationModel.status_remarks = status_remarks;
      }
    }));
  }

  async btnClickFunction(x: string) {
    this.btnType = x;
    this.salesQuotationTemp = {...this.salesQuotationModel};
    this.SalesManListTemp = [...this.SalesManList];
    this.CustomerListTemp = [...this.CustomerList];
    this.PaymentTypeListTemp = [...this.PaymentTypeList];
    this.rowsTemp = this.clone(this.rows);
    this.CustomerDisable =  true;
    this.SalesManList = await this.tagMasterService.GetSalesManList(3); 
    this.CustomerList = await this.tagMasterService.GetCustomerList(2); 
    this.PaymentTypeList = await this.salesQuotationService.GetPaymentTypeList(2); 
    this.ItemList = JSON.parse(localStorage.getItem('ItemListNew')||'');
    if(x =='N'){
      this.salesQuotationModel = new SalesQuotationModel();
      this.rows = [];
      this.saveDisable = false;
      this.cancelDisable = false;
      this.itemDisable = false;
      this.salesQuotationModel.voucherDate =  new Date();
      this.salesQuotationModel.voucher_date =  new Date();
      this.salesQuotationModel.approval_status = 'PENDING';
      this.salesQuotationModel.warranty  = '12';
      this.salesQuotationModel.validity =  '2 Weeks';
      this.salesQuotationModel.delivery =  'Ex Stock';

    }else if(x =='M'){
      this.saveDisable = false;
      this.cancelDisable = false;
      this.itemDisable =false;
      if(this.salesQuotationModel.cust_code == null){
        this.salesQuotationModel.new =true;
        this.CustomerDisable = false;
      }else{
        this.salesQuotationModel.new = false;
        this.CustomerDisable = true; 
      }
    }else if(x =='D'){
      this.onDelete();
    }
  }

  async ngOnInit() {
    try {
      this.SalesManList = await this.tagMasterService.GetSalesManList(1); 
      this.CustomerList = await this.tagMasterService.GetCustomerList(1); 
      this.PaymentTypeList = await this.salesQuotationService.GetPaymentTypeList(2); 
      this.salesQuotationService.PaymentTypeList = this.PaymentTypeList; 
    } catch (error) {
      console.error('Error while fetching Product Class List:', error);
      this.alertService.triggerAlert('Something went wrong ...',4000, 'error');
    }
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.salesQuotationService.disableGrid.next(false);
    this.salesQuotationModel = new SalesQuotationModel();
    this.salesQuotationService.disabledItems.next(false);
    this.salesQuotationService.btnClick.next('');
    this.salesQuotationService.approval_status = this.salesQuotationModel.approval_status;
    this.salesQuotationService.ControlsEnableAndDisable.next(true);
    this.isCustomer = false;
    this.isSalesman = false;
    this.isSubject = false;
    this.isDelivery = false;
    this.isWarranty = false;
    this.isValidity = false;
    this.isPayTerm = false;
  }

  AssignItems(){
    const rowItemNos = this.rows.map(r => r.item_no);
    const list = JSON.parse(sessionStorage.getItem('ItemList')||'');
    const filteredItems = list.filter((item:any) =>
      rowItemNos.includes(item.item_no)
    );
    this.ItemList = filteredItems;
    this.ItemListTemp = this.ItemList;
  }

  clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  getRowIdentity(row: any): any {
    return row.detail_id; // unique identifier
  }

  onDateSelected(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.salesQuotationModel.voucher_date = date;
  }

  formatToDateInput(value: string): void {
    this.salesQuotationModel.voucher_date = value;
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
    else if (event.type == 'click') 
      {
        let rowItem = event.row;
      }
    
  }

  CustomerChange(cust_code :any,type:any){
    if(cust_code == null){
      this.salesQuotationModel.cust_code = null;
      this.salesQuotationModel.card_holder_name = null;
      this.salesQuotationModel.contact_person = null; 
      this.salesQuotationModel.email_id = null; 
      this.salesQuotationModel.contact_no = null; 
      return;
    }

    var match;
    if(type == 'name'){
      match = this.CustomerList.find(y => y.name == cust_code);
      this.salesQuotationModel.cust_code = match.creditcustomerid;
    }else if(type == 'code'){
      match = this.CustomerList.find(y => y.creditcustomerid == cust_code);
      this.salesQuotationModel.card_holder_name = match.name;
    }
    
    if (match) {
      this.salesQuotationModel.contact_person = match.contact_person; 
      this.salesQuotationModel.email_id = match.email_id; 
      this.salesQuotationModel.contact_no = match.mobileno; 
    }else{
      this.salesQuotationModel.card_holder_name = null;
      this.salesQuotationModel.contact_person = null; 
      this.salesQuotationModel.email_id = null; 
      this.salesQuotationModel.contact_no = null; 
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

  deleteRow(index: number): void {
    this.rows.splice(index, 1);
    // Reassign seq_no for all rows 
    this.assignTotals();
    this.rows.forEach((row, i) => { row.seq_no = i + 1; });
    this.rows = [...this.rows];
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
      this.assignTotals();
    } catch (error) {
      console.error('ItemCodeEnter error:', error);
    }
  }

  async ModelNameChange(item_name_abbr: any, row: any) {
    const [item_code, item_details] = row.item_name_abbr.split('-');
    const item = this.ItemList.find(v => v.item_code == item_code.trim());
    this.ItemCodeEnter(item.item_no,row);
  }

  QtyChange(row:any){
    row.total_price = row.unit_price * row.order_quantity;
    this.assignTotals();
  }

  MachinePriceChange(row:any){
    if(row.unit_price <row.original_rate){
      this.alertService.triggerAlert('The Machine Price cannot be less than the Actual Rate.', 5000, 'error');
      row.unit_price = row.original_rate;
      this.QtyChange(row);
      return ;
    }
  }

  TotalAmountChange(amount:any,row:any){
    row.unit_price = row.total_price / row.order_quantity;
    this.assignTotals();
  }

  openFeatures(row: any, index :any) {
    this.selectedIndex = index;
    this.selectedRow = row;
    this.selectedRowTemp = this.clone(row);
    this.showModalFeatures = true;
  }

  assignTotals(){
    this.salesQuotationModel.total_amount = this.rows.reduce((sum, row) => sum + (row.total_price || 0), 0);
    this.salesQuotationModel.net_amount = this.salesQuotationModel.total_amount - (this.salesQuotationModel.discount || 0) - (this.salesQuotationModel.tradein_discount || 0);
  }

  modalCancel(){
    this.showModalFeatures = false;
    this.selectedRow = this.selectedRowTemp;
    this.rows[this.selectedIndex].general_features = this.selectedRowTemp.general_features;
    this.rows[this.selectedIndex].copier_features = this.selectedRowTemp.copier_features;
    this.rows[this.selectedIndex].printer_features = this.selectedRowTemp.printer_features;
    this.rows[this.selectedIndex].scanner_features = this.selectedRowTemp.scanner_features;
    this.rows[this.selectedIndex].paper_handling = this.selectedRowTemp.paper_handling;
  }

  modalSave(){
    this.rows[this.selectedIndex].general_features = this.selectedRow.general_features;
    this.rows[this.selectedIndex].copier_features = this.selectedRow.copier_features;
    this.rows[this.selectedIndex].printer_features = this.selectedRow.printer_features;
    this.rows[this.selectedIndex].scanner_features = this.selectedRow.scanner_features;
    this.rows[this.selectedIndex].paper_handling = this.selectedRow.paper_handling;
    this.showModalFeatures = false;
    console.log('Selected Row:', this.selectedRow);
   
  }

  addRow(){
    if (this.rows.length > 0) {
      const lastRow = this.rows[this.rows.length - 1];
      if (!lastRow.item_no || lastRow.item_no == '') {
        this.alertService.triggerAlert('Please enter Item Code in the previous row before adding a new one.', 3000, 'error');
        return; // stop here
      }
    }

    let newRow: Partial<any> = {
      detail_id :null,
      voucher_id :null,
      seq_no :null,
      item_no :null,
      order_quantity :1,
      unit_price :null,
      access_total :null,
      total_price :null,
      master_item :null,
      general_features :null,
      copier_features :null,
      printer_features :null,
      scanner_features :null,
      paper_handling :null,
      item_name :null,
      approved :false,
      original_rate :null,
    };
    this.rows = [...this.rows, newRow];
  }

  NewChange(event:any){
    if(event.target.checked){
      this.CustomerDisable = false;
      this.salesQuotationModel.cust_code = null;
      this.salesQuotationModel.card_holder_name = null;
      this.salesQuotationModel.contact_person = null; 
      this.salesQuotationModel.email_id = null; 
      this.salesQuotationModel.contact_no = null; 
    }else{
      this.CustomerDisable = true;
      this.salesQuotationModel.card_holder_name = null;
    }
  }

  cancelClickMethod(){
    this.SalesManList= [...this.SalesManListTemp];
    this.CustomerList = [...this.CustomerListTemp];
    this.PaymentTypeList = [...this.PaymentTypeListTemp];
    this.rows = [...this.rowsTemp];
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.salesQuotationService.disableGrid.next(false);
    this.salesQuotationModel = {...this.salesQuotationTemp};
    this.salesQuotationService.disabledItems.next(false);
    this.salesQuotationService.btnClick.next('');
    this.salesQuotationService.approval_status = this.salesQuotationModel.approval_status;
    this.salesQuotationService.ControlsEnableAndDisable.next(true);
    this.isCustomer = false;
    this.isSalesman = false;
    this.isSubject = false;
    this.isDelivery = false;
    this.isWarranty = false;
    this.isValidity = false;
    this.isPayTerm = false;
    if(this.salesQuotationModel.cust_code == null){
      this.salesQuotationModel.new =true;
      this.CustomerDisable = false;
    }else{
      this.salesQuotationModel.new = false;
      this.CustomerDisable = true; 
    }
  }

  async onSubmit(Form:any){

    const isValid = await this.validateForm(this.salesQuotationModel);
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

    const itemEmpty = this.rows.some(row => !row.item_no);
    if (itemEmpty) {
      this.alertService.triggerAlert('Please select Item Code', 3000, 'error');
      return ;
    }

    const quantityEmpty = this.rows.some(row => !row.order_quantity || row.order_quantity == 0);
    if (quantityEmpty) {
      this.alertService.triggerAlert('The column quantity cannot be empty', 3000, 'error');
      return ;
    }

    const negetiveQty = this.rows.some(row => row.order_quantity < 0);
    if (negetiveQty) {
      this.alertService.triggerAlert('The column quantity should be greater than zero ', 3000, 'error');
      return ;
    }

    const approve = this.rows.some(row => row.approved == true);
    if (approve && this.salesQuotationModel.cust_code == null) {
      this.alertService.triggerAlert('Select Customer Code when items are approved', 3000, 'error');
      return ;
    }

    const voucher_Date = new Date(this.salesQuotationModel.voucher_date); // dd/MM/yyyy
    const periodFrom = new Date(sessionStorage.getItem('period_from')||'');
    const periodTo   = new Date(sessionStorage.getItem('period_to')||'');
    const isBetween = voucher_Date >= periodFrom && voucher_Date <= periodTo;
    if(!isBetween){
      this.alertService.triggerAlert('Order date must choose within the chosen financial year.', 3000, 'error');
      return ;
    }

    await this.AssignValues();

    console.log('Sales Quotation Save:', this.salesQuotationSave);
    console.log('Sales Quotation Details:', this.salesQuotationDetailModel);

    this.salesQuotationService.SaveSalesQuotation(this.salesQuotationSave,this.salesQuotationDetailModel,this.dateModel)
    .subscribe({
      next: async (response: any) => {
        if(this.btnType == 'N'){
          this.alertService.triggerAlert('Row saved successfully...', 4000, 'success');
        }else{
          this.alertService.triggerAlert('Row modified successfully...', 4000, 'success');
        }
        await this.salesQuotationService.getSalesQuotationList(sessionStorage.getItem('year'),2);
        let item: SalesQuotationModel | undefined = this.salesQuotationService.mainList.find(item => item.voucher_id === response.salesQuotation.voucher_id);
        if (item) {
          await this.salesQuotationService.loadList.next(this.salesQuotationService.mainList);
          this.salesQuotationService.clickedSalesQuotation.next(item); // pass single object
        }
        this.salesQuotationService.btnClick.next('');
        this.salesQuotationService.approval_status = response.salesQuotation.approval_status;
        this.saveDisable = true;
        this.cancelDisable = true;
        this.isEditable = true;
        this.salesQuotationService.disabledItems.next(false);
        this.salesQuotationService.disableGrid.next(false);
        this.salesQuotationService.ControlsEnableAndDisable.next(true);
      },
      error: (err) => {
        this.alertService.triggerAlert(err.error.message,4000, 'error');
        this.salesQuotationService.btnClick.next('');
      }
    });
  }

  async validateForm(model: SalesQuotationModel): Promise<boolean> {
    // Reset validation flags
    this.isCustomer = !model.card_holder_name;
    this.isSalesman   = !model.salesman_id;
    this.isSubject   = !model.subject;
    this.isDelivery   = !model.delivery;
    this.isWarranty   = !model.warranty;
    this.isValidity   = !model.validity;
    this.isPayTerm   = !model.payterm_id;
    const isValid = !(this.isCustomer || this.isSalesman || this.isSubject || this.isDelivery || this.isWarranty || this.isValidity || this.isPayTerm);
    return isValid;
  }

  async AssignValues(){
    // Header Details
    const voucher_id = await this.commonService.GetGuid();
    this.salesQuotationSave = {
      cust_code:this.salesQuotationModel.cust_code,
      register_code: this.salesQuotationModel.register_code??72,
      total_amount: this.salesQuotationModel.total_amount??0,
      discount: this.salesQuotationModel.discount??0,
      tradein_discount: this.salesQuotationModel.tradein_discount??0,
      net_amount: this.salesQuotationModel.net_amount??0,
      narration: this.salesQuotationModel.narration,
      reference: this.salesQuotationModel.reference,
      salesman_id: this.salesQuotationModel.salesman_id,
      contact_person: this.salesQuotationModel.contact_person,
      contact_no: this.salesQuotationModel.contact_no,
      warranty: this.salesQuotationModel.warranty,
      validity: this.salesQuotationModel.validity,
      payterm_id: this.salesQuotationModel.payterm_id,
      delivery: this.salesQuotationModel.delivery,
      subject: this.salesQuotationModel.subject,
      card_holder_name: this.salesQuotationModel.card_holder_name,
      email_id: this.salesQuotationModel.email_id,
      location: this.salesQuotationModel.location,
      company_code: this.endPointService.companycode,
      period_id: Number(sessionStorage.getItem('year')),
      status_remarks: this.salesQuotationModel.status_remarks,
      ...(this.btnType === 'N'
      ? {
          voucher_id:voucher_id,
          document_number: '',
          created_by: localStorage.getItem('user_id'),
          modified_by: null,
          modified_on: null,
          approval_status : 'PENDING',
          createdt :null,
          voucher_date: this.salesQuotationModel.voucher_date
        }
      : {
          voucher_id:this.salesQuotationModel.voucher_id,
          document_number: this.salesQuotationModel.document_number,
          created_by: this.salesQuotationModel.created_by,
          modified_by: localStorage.getItem('user_id'),
          modified_on: null,
          voucher_date: new Date(this.salesQuotationModel.voucher_date),
          approval_status: this.salesQuotationModel.approval_status,
          createdt: this.salesQuotationModel.createdt,
        })
    };

    const voucher_date = this.datePipe.transform(this.salesQuotationModel.voucher_date, 'dd/MM/yyyy');
    this.dateModel.voucher_date = voucher_date;

    this.salesQuotationDetailModel = await this.mapItemsToDetails(this.rows,this.salesQuotationSave.voucher_id);
  }
  
  async mapItemsToDetails(items: any[],voucher_id:any): Promise<SalesQuotationDetailModel[]> {
    const detailsList: SalesQuotationDetailModel[] = [];
    let seq_no = 0;
    for (const item of items) {
      seq_no++;
      const details = new SalesQuotationDetailModel();
      details.detail_id = null;
      details.voucher_id = voucher_id;
      details.seq_no = seq_no;
      details.item_no = item.item_no;
      details.order_quantity = item.order_quantity;
      details.unit_price = item.unit_price;
      details.access_total = null;
      details.total_price = item.total_price;
      details.master_item = null;
      details.general_features = item.general_features;
      details.copier_features = item.copier_features;
      details.printer_features = item.printer_features;
      details.scanner_features = item.scanner_features;
      details.paper_handling = item.paper_handling;
      details.item_name = item.item_name_abbr;
      details.approved = item.approved;
      detailsList.push(details);
    }

    return detailsList;
  }
  
  async onDelete(){
      const confirmed = await showconfirm("Are you sure you want to delete this item?");
      if(!confirmed)return;
  
      this.salesQuotationService.DeleteSalesQuotation(this.salesQuotationModel.voucher_id)
      .subscribe(
        (updatedList: any[]) => {
          this.salesQuotationService.getSalesQuotationList(sessionStorage.getItem('year'),1);
          this.salesQuotationService.btnClick.next('');
        },
        (error) => {
          this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
          this.salesQuotationService.btnClick.next('')
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
  