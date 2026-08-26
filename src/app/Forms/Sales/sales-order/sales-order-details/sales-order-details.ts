import { Component, ViewChild } from '@angular/core';
import { SalesOrderAccessories, SalesOrderDetailModel, SalesOrderModel, SalesOrderPayTerm, SalesOrderSave, SalesOrderTradeModel } from '../../../../Model/SalesOrder/sales-order.model';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { DateModelSales } from '../../../../Model/CommonModel';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { SalesOrderService } from '../../../../Service/SalesOrderService/sales-order-service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { EndPointService } from '../../../../Service/end-point.services';
import { TagMasterService } from '../../../../Service/TagMasterService/tag-master-service';
import { EngineerMasterService } from '../../../../Service/EngineerMasterService/engineer-master-service';
import { PurchaseOrderService } from '../../../../Service/PurchaseOrderService/purchase-order-service';
import { SalesQuotationService } from '../../../../Service/SalesQuotationService/sales-quotation-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'sales-order-details',
  standalone: false,
  templateUrl: './sales-order-details.html',
  styleUrls: ['./sales-order-details.css','../../../common.css'],
  providers: [DatePipe]
})
export class SalesOrderDetails {
  @ViewChild(DatatableComponent) table?: DatatableComponent;
  @ViewChild(DatatableComponent) tableAcc?: DatatableComponent;
  @ViewChild(DatatableComponent) tableTrade?: DatatableComponent;
  @ViewChild(DatatableComponent) tablePayTerm?: DatatableComponent;
  salesOrderModel: SalesOrderModel = new SalesOrderModel();
  salesOrderTemp: SalesOrderModel = new SalesOrderModel();
  salesOrderSave: SalesOrderSave = new SalesOrderSave ();
  salesOrderDetailModel: SalesOrderDetailModel[] =[];
  salesOrderTradeModel: SalesOrderTradeModel[] =[];
  salesOrderAccessories: SalesOrderAccessories[] =[];
  salesOrderPayTerm: SalesOrderPayTerm[]=[];
  dateModel: DateModelSales = new DateModelSales();
  subscription: Subscription[] = new Array<Subscription>();
  itemDisable: boolean = true;
  itemDisableM: boolean = true;
  saveDisable: boolean = true;
  cancelDisable: boolean = true;
  btnType: string = '';
  ItemList:any[] = [];
  ItemListTemp: any[] =[];
  ItemListAcc: any[] =[];
  ItemListAccTemp: any[] =[];
  CustomerList:any[] = [];
  CustomerListTemp:any[] = [];
  SalesManList:any[] = [];
  SalesManListTemp:any[] = [];
  EngineerList:any[] = [];
  OrderTypeList:any[] = [];
  PaymentTypeList:any[] = [];
  PaymentTypeListTemp:any[] = [];
  AreaList:any[] = [];
  RecieptList: any[] =[];
  statusDisable: boolean = true;
  selectedIndex: any;
  rows: any[] = []; 
  rowsTemp: any[] = [];
  showAll: boolean = false;
  scroll: boolean = true;
  gridHeight: number = 350;
  reorderable = true;
  controls = {
    pageSize:50 
  };
  SelectionType = SelectionType;
  selected: any[] = [];
  selectedAcc: any[] = [];
  selectedTrade: any[] = [];
  selectedPayTerm: any[] = [];
  allAccessoryItems: any[] = [];
  PDCTypeList: string[] = [ 'PDC', 'Kambiala'];
  public activeTabName: string = 'SalesOrder';
  
  rowsPayTerm: any[] = []; 
  rowsPayTermTemp: any[] = [];
  rowsAccessories: any[] = []; 
  rowsAccessoriesTemp: any[] = [];
  rowsTrade: any[] = [];
  rowsTradeTemp: any[] = [];
  allocatedAmt: any = 0;
  balanceAmt: any = 0;
  recievedAmt: any = 0;
  selectedRow: any;
  showModalAccessories: boolean = false;
  SelectedCustomer: any;
  accessoriesTotal: number = 0;
  grandTotal: number = 0;
  length: number = 0;

  isCustomer: boolean = false;
  isSalesman: boolean = false;
  isOrderType: boolean = false;
  isRefno: boolean = false;
  isContractNo: boolean = false;
  isArea: boolean = false;
  isBuilding: boolean = false;
  isStreet: boolean = false;
  isBlock: boolean = false;
  isTelephone: boolean = false;
  isPACI: boolean = false;
  isPaymentType: boolean = false;
  isWarranty: boolean = false;
  isMobileNo: boolean = false;
  
  constructor(private purchaseOrderService:PurchaseOrderService,private salesOrderService: SalesOrderService, private engineerMasterService:EngineerMasterService, private tagMasterService:TagMasterService,public alertService: AlertService, public commonService: CommonService, public endPointService: EndPointService,
            private  salesQuotationService:SalesQuotationService,private datePipe: DatePipe) {
    this.subscription.push(this.salesOrderService.clickedSalesOrder.subscribe(async x=>{
      if(!x?.voucher_id){
        this.salesOrderModel =  new SalesOrderModel();
        this.rows = [];
        this.rowsTemp = [];
        this.rowsAccessories= []; 
        this.rowsAccessoriesTemp = [];
        this.rowsPayTerm = [];
        this.rowsPayTermTemp = [];
        this.rowsTrade= []; 
        this.rowsTradeTemp = [];
        this.allocatedAmt = 0;
        this.balanceAmt = 0;
        this.recievedAmt = 0;
        return;
      }
      this.salesOrderModel = {...x};
      const cust = this.CustomerList.filter(v => v.creditcustomerid === this.salesOrderModel.customer_id);
      this.SelectedCustomer = cust[0].market_channel_name; 
      this.salesOrderService.voucher_id = x.voucher_id;
      this.salesOrderService.approval_status = x.approval_status;
      this.salesOrderService.ControlsEnableAndDisable.next(true);
      try {
        
        const items  = await this.salesOrderService.GetSalesOrderDetails(this.salesOrderModel.voucher_id);
        if (items) {
          this.rows = items[0].salesOrderDetailModel.slice();
          this.salesOrderService.Approved = this.rows.some(r => r.approved);
          this.rowsTrade = items[0].salesOrderTradeModel.slice();
          this.rowsTradeTemp = items[0].salesOrderTradeModel.slice();
          this.rowsPayTerm =items[0].paymentScheduleModel;
          this.calculatePayterm();
          let length = items[0].salesOrderAccessoryModel.length;
          this.allAccessoryItems = [];
          if(length != 0){
            let item = items[0].salesOrderAccessoryModel;

            const grouped: [ [key: string], typeof item ] = item.reduce((acc:any, row:any) => {
              if (!acc[row.m_item_no]) {
                acc[row.m_item_no] = [];
              }
              acc[row.m_item_no].push(row);
              return acc;
            }, {} as { [key: string]: typeof item });
            this.allAccessoryItems = grouped;
          }
           this.AssignItems();
        } else {
          this.rows = [];
          this.rowsTemp = [];
          this.rowsTrade= []; 
          this.rowsTradeTemp = [];
          this.rowsAccessories = [];
          this.rowsAccessoriesTemp = [];
          this.rowsPayTerm = [];
          this.rowsPayTermTemp = [];
          this.allocatedAmt = 0;
          this.recievedAmt = 0;
          this.balanceAmt = 0;
        }

      } catch (err) {
        console.error('Error fetching Details', err);
        this.rows = [];
        this.rowsTemp = [];
        this.rowsPayTerm = [];
        this.rowsPayTermTemp = [];
      }
    }));

    this.subscription.push(this.commonService.isSystemAdmin.subscribe(data=>{
      this.statusDisable = !data;
    }));

    this.subscription.push(this.salesOrderService.btnClick.subscribe(async x=>{
        if(x != ''){
        this.btnClickFunction(x);
     }
    }));
  }

  async ngOnInit() {
    try {
      this.SalesManList = await this.tagMasterService.GetSalesManList(1); 
      this.CustomerList = await this.tagMasterService.GetCustomerList(1); 
      this.EngineerList = await this.engineerMasterService.getEngineerMasterList(1);
      this.OrderTypeList = await this.salesOrderService.GetOrderTypeList();
      this.AreaList = await this.tagMasterService.GetAreaList(); 
      this.PaymentTypeList = await this.salesQuotationService.GetPaymentTypeList(2); 
    } catch (error) {
      console.error('Error happening..', error);
      this.alertService.triggerAlert('Something went wrong ...',4000, 'error');
    }
  }

  async btnClickFunction(x: string) {
    this.btnType = x;
    this.salesOrderTemp = {...this.salesOrderModel};
    this.SalesManListTemp = [...this.SalesManList];
    this.CustomerListTemp = [...this.CustomerList];
    this.PaymentTypeListTemp = [...this.PaymentTypeList];
    this.rowsTemp = this.clone(this.rows);
    this.rowsTradeTemp = this.clone(this.rowsTrade);
    this.rowsPayTermTemp = this.clone(this.rowsPayTerm);
    this.SalesManList = await this.tagMasterService.GetSalesManList(3); 
    this.CustomerList = await this.tagMasterService.GetCustomerList(2);
    this.ItemList = JSON.parse(localStorage.getItem('ItemListNew')||''); 
    this.ItemListAcc = this.ItemList.filter(item => item.item_category != 'HARDWARE');
    if(x =='N'){
      this.salesOrderModel = new SalesOrderModel();
      this.salesOrderModel.installation_id = 1;
      this.rows = [];
      this.rowsAccessories = [];
      this.rowsPayTerm = [];
      this.rowsTrade = [];
      this.saveDisable = false;
      this.cancelDisable = false;
      this.itemDisable = false;
      this.salesOrderModel.voucherDate =  new Date();
      this.salesOrderModel.voucher_date =  new Date();
    }else if(x =='M'){
      this.saveDisable = false;
      this.cancelDisable = false;
      this.itemDisable = false;
      this.itemDisableM = false;
    }else if(x =='D'){
      this.onDelete();
    }
  }


  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.salesOrderService.disableGrid.next(false);
    this.salesOrderModel = new SalesOrderModel();
    this.salesOrderService.disabledItems.next(false);
    this.salesOrderService.btnClick.next('');
    this.salesOrderService.approval_status = this.salesOrderModel.approval_status;
    this.salesOrderService.ControlsEnableAndDisable.next(true);
  }

  clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  AssignItems(){
    const rowItemNos = this.rows.map(r => r.item_no);
    const list = JSON.parse(sessionStorage.getItem('ItemList')||'');
    const filteredItems = list.filter((item:any) =>
      rowItemNos.includes(item.item_no)
    );
    this.ItemList = filteredItems;
    this.ItemListTemp = this.ItemList;

    const rowACCItemNos = this.rowsAccessories.map(r => r.item_no);
    const listAcc = JSON.parse(sessionStorage.getItem('ItemList')||'');
    const filteredItemsAcc = listAcc.filter((item:any) =>
      rowACCItemNos.includes(item.item_no)
    );

    this.ItemListAcc = filteredItemsAcc;
    this.ItemListAccTemp = this.ItemListAcc;

  }

  getRowIdentity(row: any): any {
    return row.detail_id; // unique identifier
  }

  getRowIdentityAcc(row: any): any {
    return row.id; // unique identifier
  }

  onDateSelected(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.salesOrderModel.voucher_date = date;
  }

  formatToDateInput(value: string): void {
    this.salesOrderModel.voucher_date = value;
  }

  onSubListActivateGeneric(
    event: any,
    rows: any[],
    setSelected: (row: any[]) => void,
    scrollFn: (index: number) => void
  ) {
    const rowItem = event.row;
    let rowIndex = rows.indexOf(rowItem);

    if (event.type === 'keydown') {
      if (event.event.code === 'ArrowDown' && rowIndex < rows.length - 1) {
        rowIndex++;
        setSelected([rows[rowIndex]]);
        scrollFn(rowIndex);
      } else if (event.event.code === 'ArrowUp' && rowIndex > 0) {
        rowIndex--;
        setSelected([rows[rowIndex]]);
        scrollFn(rowIndex);
      }
    }
  }

  scrollToIndexGeneric(index: number, rows: any[], table: any) {
    const rowHeight = rows.length; // replace with actual rowHeight if fixed
    const bodyElement = table?.element.querySelector('.datatable-body');

    if (bodyElement) {
      const maxScroll = bodyElement.scrollHeight - bodyElement.clientHeight;
      const targetScroll = index * rowHeight;
      bodyElement.scrollTop = Math.min(targetScroll, maxScroll);
    }
  }

  onSubListActivate(event: any) {
  this.onSubListActivateGeneric(
      event,
      this.rows,
      (sel) => (this.selected = sel),
      (i) => this.scrollToIndexGeneric(i, this.rows, this.table)
    );
  }

  onSubListActivateAcc(event: any) {
    this.onSubListActivateGeneric(
      event,
      this.rowsAccessories,
      (sel) => (this.selectedAcc = sel),
      (i) => this.scrollToIndexGeneric(i, this.rowsAccessories, this.tableAcc)
    );
  }

  onSubListActivateTrade(event: any) {
    this.onSubListActivateGeneric(
      event,
      this.rowsTrade,
      (sel) => (this.selectedTrade = sel),
      (i) => this.scrollToIndexGeneric(i, this.rowsTrade, this.tableTrade)
    );
  }

  onSubListActivatePayTerm(event: any) {
    this.onSubListActivateGeneric(
      event,
      this.rowsPayTerm,
      (sel) => (this.selectedPayTerm = sel),
      (i) => this.scrollToIndexGeneric(i, this.rowsPayTerm, this.tablePayTerm)
    );
  }

  formatDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    return `${year}-${month}-${day}`;
  }

  async onSubmit(Form:any){
    const isValid = this.validateForm();
    if (!isValid) {
      return; 
    }

    await this.AssignValues();

    this.salesOrderPayTerm.forEach(item => {
      item.due_date = this.formatDateOnly(new Date(item.due_date));
    });

    this.salesOrderService.SaveSalesOrder(this.salesOrderSave,this.salesOrderDetailModel,this.salesOrderAccessories,
          this.salesOrderPayTerm,this.salesOrderTradeModel,this.dateModel)
        .subscribe({
          next: async (response: any) => {
            if(this.btnType == 'N'){
              this.alertService.triggerAlert('Row saved successfully...', 4000, 'success');
            }else{
              this.alertService.triggerAlert('Row modified successfully...', 4000, 'success');
            }
            await this.salesOrderService.getSalesOrderList(sessionStorage.getItem('year'),2);
            let item: SalesOrderModel | undefined = this.salesOrderService.mainList.find(item => item.voucher_id === response.salesOrder.voucher_id);
            if (item) {
              await this.salesOrderService.loadList.next(this.salesOrderService.mainList);
              this.salesOrderService.clickedSalesOrder.next(item); // pass single object
            }
            this.salesOrderService.btnClick.next('');
            this.salesOrderService.approval_status = response.salesOrder.approval_status;
            this.itemDisable = true;
            this.itemDisableM = true;
            this.saveDisable = true;
            this.cancelDisable = true;
            this.salesOrderService.disabledItems.next(false);
            this.salesOrderService.disableGrid.next(false);
            this.salesOrderService.ControlsEnableAndDisable.next(true);
          },
          error: (err) => {
            this.alertService.triggerAlert(err.error.message,4000, 'error');
            this.salesOrderService.btnClick.next('');
          }
        });
    // item_cod != actual code // replace actual code
  }

  private setFlag(condition: boolean, value: boolean): boolean {
    return condition ? value : false;
  }

  private validateForm(): boolean {

    this.isCustomer = !this.salesOrderModel.salesman_id;
    this.isSalesman   = !this.salesOrderModel.salesman_id;
    this.isMobileNo   = !this.salesOrderModel.mobile_no;
    this.isArea   = !this.salesOrderModel.area_id;
    this.isBuilding   = !this.salesOrderModel.building_no;
    this.isBlock   = !this.salesOrderModel.block;
    this.isStreet   = !this.salesOrderModel.street;
    this.isPACI   = !this.salesOrderModel.pACI;
    this.isTelephone   = !this.salesOrderModel.telephone_no;
    this.isRefno  = !this.salesOrderModel.pO_Number;
    this.isOrderType  = !this.salesOrderModel.order_type_id;

    // Usage
    this.isPaymentType = this.setFlag(this.salesOrderModel.net_amount > 0, !this.salesOrderModel.payterm_id);
    this.isContractNo  = this.setFlag(this.salesOrderModel.order_type_id === 4, !this.salesOrderModel.contract_id);
    this.isWarranty    = this.setFlag(this.SelectedCustomer.includes('GOVT'), !this.salesOrderModel.warranty);

    const isValid = !(this.isCustomer || this.isSalesman || this.isContractNo || this.isArea || this.isBuilding || this.isBlock || this.isStreet
      || this.isPACI || this.isTelephone || this.isRefno || this.isOrderType || this.isPaymentType || this.isWarranty || this.isMobileNo
    );
    if(!isValid){
       this.alertService.triggerAlert('Please fill all required fields...', 3000, 'error');
      return false;
    }

    var paci =this.salesOrderModel.pACI.length;
    if(paci != 8){
      this.alertService.triggerAlert('Paci number should be 8 digit', 3000, 'error');
      return false;
    }

    if (this.salesOrderModel.mobile_no === this.salesOrderModel.telephone_no) {
      this.alertService.triggerAlert('The Mobile no and Telephone should not be same...', 3000, 'error');
      return false;
    }

    const voucher_Date = new Date(this.salesOrderModel.voucher_date);
    const periodFrom = new Date(sessionStorage.getItem('period_from') || '');
    const periodTo   = new Date(sessionStorage.getItem('period_to') || '');
    if (!(voucher_Date >= periodFrom && voucher_Date <= periodTo)) {
      this.alertService.triggerAlert('Order date must choose within the chosen financial year.', 3000, 'error');
      return false;
    }

    if (this.salesOrderModel.order_type_id != 1 && this.salesOrderModel.net_amount > 0) {
      this.alertService.triggerAlert('The Net amount should be Zero', 3000, 'error');
      return false;
    }

    if (this.rows.length === 0) {
      this.alertService.triggerAlert('Please add the row items...', 3000, 'error');
      return false;
    }

    if (this.rows.some(row => !row.item_no)) {
      this.alertService.triggerAlert('Please select Item Code', 3000, 'error');
      return false;
    }


    if (this.rows.some(row => !row.order_quantity || row.order_quantity === 0)) {
      this.alertService.triggerAlert('The column quantity cannot be empty', 3000, 'error');
      return false;
    }

    if (this.rows.some(row => row.order_quantity < 0)) {
      this.alertService.triggerAlert('The column quantity should be greater than zero', 3000, 'error');
      return false;
    }

    if (this.salesOrderModel.tradein_discount && this.salesOrderModel.tradein_discount !== 0) {
      if (this.rowsTrade.length === 0) {
        this.alertService.triggerAlert('Please enter the Trade-in Machines', 3000, 'error');
        return false;
      }
    }

    if(this.salesOrderModel.net_amount != 0){
      if (this.salesOrderModel.payterm_id !== 4 && this.salesOrderModel.payterm_id !== 16) {
        if (this.allocatedAmt !== this.salesOrderModel.net_amount) {
          this.alertService.triggerAlert('Installment amount is not matching with the Net Amount', 3000, 'error');
          return false;
        }
        // Pay term date ordering check
        const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
        for (let i = 1; i < this.rowsPayTerm.length; i++) {
          var prevRaw = this.rowsPayTerm[i - 1].due_date;
          var currRaw = this.rowsPayTerm[i].due_date;
          if(typeof prevRaw == 'string'){
            if(prevRaw.includes('/')){
              prevRaw = this.convertToSqlDate(prevRaw);
            }
          }
          if(typeof currRaw == 'string'){
            if(currRaw.includes('/')){
              currRaw = this.convertToSqlDate(currRaw);
            }
          }
          const prevDate = new Date(prevRaw);
          const currDate = new Date(currRaw);
          const voucher_date = new Date(this.salesOrderModel.voucher_date);

          // ✅ Check for invalid dates
          if (isNaN(prevDate.getTime()) || isNaN(currDate.getTime())) {
            this.alertService.triggerAlert('Invalid date present in pay term rows', 3000, 'error');
            return false;
            
          }

          if (currDate <= prevDate) {
            this.alertService.triggerAlert(`The follow-up date in row ${i + 1} must be greater than row ${i}. Please check...`,7000,'error');
            return false;
          }
          
          if(prevDate<voucher_date || currDate<voucher_date){
            this.alertService.triggerAlert(`The selected date must greater than the Entry date`,7000,'error');
            return false;
          }
        }

        for (let i = 1; i < this.rowsPayTerm.length; i++) {
          const prevAmt = this.rowsPayTerm[i - 1].installment_amount;
          const currAmt = this.rowsPayTerm[i].installment_amount;
          if(prevAmt =='' || currAmt ==''){
            this.alertService.triggerAlert(`Invalid amount present, Please check...`,7000,'error');
            return false;
          }
        }

        const lastRow = this.rowsPayTerm[this.rowsPayTerm.length - 1];
        if (!lastRow.due_date || lastRow.due_date == '') {
          this.alertService.triggerAlert('Please select the date.', 3000, 'error');
          return false; // stop here
        }
      }
    }

    if(!this.SelectedCustomer.includes('GOVT'))
    { 
      if(this.salesOrderModel.order_type_id == 1){
        var totalHardwareQty = this.rows
        .filter(row => row.item_category === 'HARDWARE')
        .reduce((sum, row) => sum + Number(row.order_quantity), 0);

        const exists = this.rows.some(row => row.item_no === '5aee9d0f-a175-4e6a-ad12-c51b2d5c093a');

        if (exists) {
           const ActiveManagementQty = this.rows
            .filter(row => row.item_no === '5aee9d0f-a175-4e6a-ad12-c51b2d5c093a')
            .reduce((sum, row) => sum + Number(row.order_quantity), 0);
            if(ActiveManagementQty != totalHardwareQty){
              this.alertService.triggerAlert('Active Management count is not matching with Machine count.', 4000, 'error');
              return false;
            }
        } else {
          this.alertService.triggerAlert('Please select the Active Management.', 3000, 'error');
          return false;
        }
      }
    }

    return true; // ✅ all checks passed
  }

  async AssignValues(){
    const voucher_id = await this.commonService.GetGuid();
    var tadein = this.rowsTrade.length == 0 ? false:true;
    this.salesOrderSave = {
      register_code: 71,
      customer_id:this.salesOrderModel.customer_id,
      total_amount: this.salesOrderModel.total_amount??0,
      discount: this.salesOrderModel.discount??0,
      tradein_discount: this.salesOrderModel.tradein_discount??0,
      net_amount: this.salesOrderModel.net_amount??0,
      narration: this.salesOrderModel.narration,
      contact_person: this.salesOrderModel.contact_person,
      mobile_no: this.salesOrderModel.mobile_no,
      telephone_no: this.salesOrderModel.telephone_no,
      area_id: this.salesOrderModel.area_id,
      street: this.salesOrderModel.street,
      block: this.salesOrderModel.block,
      building_no: this.salesOrderModel.building_no,
      floor: this.salesOrderModel.floor,
      flat: this.salesOrderModel.flat,
      PACI: this.salesOrderModel.pACI,
      Quote_id: this.salesOrderModel.Quote_id??null,
      PO_Number: this.salesOrderModel.pO_Number,
      salesman_id: this.salesOrderModel.salesman_id,
      contract_id: this.salesOrderModel.contract_id??null,
      engineer_id: this.salesOrderModel.engineer_id,
      warranty: this.salesOrderModel.warranty,
      order_type_id: this.salesOrderModel.order_type_id,
      period_id: Number(sessionStorage.getItem('year')),
      payterm_id: this.salesOrderModel.payterm_id,
      receipt_id: this.salesOrderModel.receipt_id,
      click_contract_verified: this.salesOrderModel.click_contract_verified,
      trade_in: tadein,
      installation_id: this.salesOrderModel.installation_id,
      down_payment: this.salesOrderModel.down_payment,
      payment_type: this.salesOrderModel.payment_type,
      company_code: this.endPointService.companycode,
      ...(this.btnType === 'N'
      ? {
          voucher_id:voucher_id,
          document_number: '',
          created_by: localStorage.getItem('user_id'),
          modified_by: null,
          modified_on: null,
          approval_status : 'DRAFT',
          createdt :null,
          approved_by:null,
          voucher_date: this.salesOrderModel.voucher_date,
          approver_remarks: null,
        }
      : {
          voucher_id:this.salesOrderModel.voucher_id,
          document_number: this.salesOrderModel.document_number,
          created_by: this.salesOrderModel.created_by,
          modified_by: localStorage.getItem('user_id'),
          modified_on: null,
          voucher_date: new Date(this.salesOrderModel.voucher_date),
          approval_status: this.salesOrderModel.approval_status,
          approved_by: this.salesOrderModel.approved_by,
          createdt: this.salesOrderModel.createdt,
          approver_remarks: this.salesOrderModel.approver_remarks,
        })
    };

    const voucher_date = this.datePipe.transform(this.salesOrderModel.voucher_date, 'dd/MM/yyyy');
    this.dateModel.voucher_date = voucher_date;

    this.salesOrderDetailModel = await this.mapItemsToDetails(this.rows,this.salesOrderSave.voucher_id);
    this.salesOrderTradeModel = await this.mapItemsToTrade(this.rowsTrade,this.salesOrderSave.voucher_id);
    this.salesOrderAccessories = await this.mapItemsToAccessories(this.allAccessoryItems,this.salesOrderSave.voucher_id);
    this.salesOrderPayTerm = await this.mapItemsToPayTerm(this.rowsPayTerm,this.salesOrderSave.voucher_id);
  }

  async mapItemsToDetails(items: any[],voucher_id:any): Promise<SalesOrderDetailModel[]> {
    const detailsList: SalesOrderDetailModel[] = [];
    let seq_no = 0;
    for (const item of items) {
      seq_no++;
      const details = new SalesOrderDetailModel();
      details.detail_id = null;
      details.voucher_id = voucher_id;
      details.voucher_no = seq_no;
      details.item_no = item.item_no;
      details.order_quantity = item.order_quantity;
      details.unit_price = item.unit_price;
      details.total_price = item.total_price;
      details.tag_item = item.item_category=='HARDWARE'?true:false;
      detailsList.push(details);
    }

    return detailsList;
  }

  async mapItemsToTrade(items: any[],voucher_id:any): Promise<SalesOrderTradeModel[]> {
    const tardeList: SalesOrderTradeModel[] = [];
    let seq_no = 0;
    for (const item of items) {
      seq_no++;
      const trade = new SalesOrderTradeModel();
      trade.voucher_id = voucher_id;
      trade.model_name = item.model_name;
      trade.seq_no = seq_no;
      trade.brand_name = item.brand_name;
      trade.bw_reading = item.bw_reading;
      trade.clr_reading = item.clr_reading;
      trade.replace_model = item.replace_model;
      trade.received = item.received;
      trade.received_date = item.received_date;
      trade.remarks = item.remarks;
      trade.received_by = item.received_by;
      trade.tag_no = item.tag_no;
      tardeList.push(trade);
    }
    return tardeList;
  }

  async mapItemsToAccessories(items: any[],voucher_id:any): Promise<SalesOrderAccessories[]> {

    // allAccessoryItems is your object
    const allChildItems = Object.values(items)
    .flat()   // merges all arrays into one
    .filter(item => item && Object.keys(item).length > 0); // optional: remove empty/null

    const AccList: SalesOrderAccessories[] = [];
    for (const item of allChildItems) {
      const Acc = new SalesOrderAccessories();
      Acc.Id = null;
      Acc.voucher_id = voucher_id;
      Acc.m_item_no = item.m_item_no;
      Acc.item_no = item.item_no;
      Acc.order_quantity = item.order_quantity;
      Acc.unit_price = item.unit_price;
      Acc.total_price = item.total_price;
      Acc.compulsory = item.compulsory;
      AccList.push(Acc);
    }
    return AccList;
  }

  async mapItemsToPayTerm(items: any[],voucher_id:any): Promise<SalesOrderPayTerm[]> {
    const PayTermList: SalesOrderPayTerm[] = [];
    let seq_no = 0;
    for (const item of items) {
      var due_date = item.due_date;
      if(typeof due_date == 'string'){
        if(due_date.includes('/')){
          due_date = this.convertToSqlDate(due_date);
        }
      }
      seq_no++;
      const pay = new SalesOrderPayTerm();
      pay.row_id = null;
      pay.voucher_id = voucher_id;
      pay.register_code = 71;
      pay.installment_no = seq_no;
      pay.installment_amount = item.installment_amount;
      pay.due_date = new Date(due_date);
      pay.paid = item.paid;
      pay.receipt_id = item.receipt_id;
      pay.payment_entry_date = item.payment_entry_date;
      PayTermList.push(pay);
    }
    return PayTermList;
  }

  cancelClickMethod(){
    this.ItemList= this.ItemListTemp;
    this.SalesManList= [...this.SalesManListTemp];
    this.CustomerList = [...this.CustomerListTemp];
    this.rows = [...this.rowsTemp];
    this.rowsTrade = [...this.rowsTradeTemp];
    this.rowsPayTerm = [...this.rowsPayTermTemp];
    this.rowsAccessories = [...this.rowsAccessoriesTemp];
    this.allAccessoryItems = [];
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.salesOrderService.disableGrid.next(false);
    this.salesOrderModel = {...this.salesOrderTemp};
    this.salesOrderService.disabledItems.next(false);
    this.salesOrderService.btnClick.next('');
    this.salesOrderService.approval_status = this.salesOrderModel.approval_status;
    this.salesOrderService.ControlsEnableAndDisable.next(true);
    this.ItemListAccTemp = [...this.ItemListAcc];
    this.itemDisableM = true;
  }

  assignTotals(){
    this.salesOrderModel.total_amount =  this.sumRows('total_price') + this.sumRows('accessories_total') ;
    this.salesOrderModel.net_amount = this.salesOrderModel.total_amount - (this.salesOrderModel.discount || 0) - (this.salesOrderModel.tradein_discount || 0);
    this.calculatePayterm();
  }

  async ItemCodeEnter(item_no: any, row: any,type:any) {
    try {
      var duplicate;
      var length;
      if(type == 'main'){
        duplicate  = this.rows.find(v => v.item_no == item_no.trim());
        let res = this.rows.filter(v => v.item_no === item_no.trim());
        length = res.length;
      }else{
        duplicate  = this.rowsAccessories.find(v => v.item_no == item_no.trim());
        let res =this.rowsAccessories.filter(v => v.item_no === item_no.trim());
        length = res.length;
      }
      if(duplicate?.item_name_abbr && length > 1){
        this.alertService.triggerAlert('The Item Code is alredy Present...', 3000, 'error');
        row.item_no = null;
        row.item_name_abbr = null;
        row.total_price = null;
        row.original_rate = null;
        row.market_channel_name = null;
        return;
      }
      if(!item_no) return;
      const res = await this.purchaseOrderService.itemCodeEnter(item_no);
      const item = res[0];
      row.item_name_abbr = item.item_name_abbr;
      row.unit_price = item.retail_rate;
      row.order_quantity = 1;
      row.total_price = item.retail_rate;
      row.original_rate = item.retail_rate;
      row.item_category = item.item_category;
      this.assignTotals();
      if(this.showModalAccessories){
        this.calculateAccessories();
      }else{
        const items  = await this.salesOrderService.GetAccFromItemCodes(item_no);
        if (items) {
          this.allAccessoryItems[item_no] = items;
          const index = this.rows.findIndex(r => r.item_no === item_no);
          if (index !== -1) {
            this.rowsAccessories = this.allAccessoryItems[item_no];
            this.accessoriesTotal = this.sumAccessories('total_price');
            this.rows[index].accessories_total = this.accessoriesTotal;
            if(this.rowsAccessories.length != 0){
              this.rows[index].available = 'Yes'
            }else{
              this.rows[index].available = 'No'
            }
          }
          this.salesOrderModel.total_amount = this.salesOrderModel.total_amount + this.accessoriesTotal;
          this.calculatePayterm();
        }

      }
    } catch (error) {
      console.error('ItemCodeEnter error:', error);
    }
  }

  convertToSqlDate(dateStr: string): string {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  async ModelNameChange(item_name_abbr: any, row: any,type:any) {
    const [item_code, item_details] = row.item_name_abbr.split('-');
    const item = this.ItemList.find(v => v.item_code == item_code.trim());
    row.item_no = item.item_no;
    this.ItemCodeEnter(item.item_no,row,type);
  }

  QtyChange(row:any){
    row.total_price = row.unit_price * row.order_quantity;
    this.assignTotals();
  }

  MachinePriceChange(row:any){
   if(!this.SelectedCustomer.includes('GOVT'))
   {
    if(row.unit_price <row.original_rate){
      this.alertService.triggerAlert('The Entered Machine Price cannot be less than the Actual Rate.', 5000, 'error');
      row.unit_price = row.original_rate;
      this.QtyChange(row);
      return ;
    }
   }
  }

  TotalAmountChange(amount:any,row:any){
    row.unit_price = row.total_price / row.order_quantity;
    this.assignTotals();

  }
  
  addRowMain(){
    if(!this.salesOrderModel.customer_id){
      this.alertService.triggerAlert('Please Select a Customer', 3000, 'error');
        return; // stop here
    }

    if (this.rows.length > 0) {
      const lastRow = this.rows[this.rows.length - 1];
      if (!lastRow.item_no || lastRow.item_no == '') {
        this.alertService.triggerAlert('Please enter Item Code in the previous row before adding a new one.', 3000, 'error');
        return; // stop here
      }
    }

    let newRow: Partial<any> = {
      voucher_id :null,
      item_no :null,
      order_quantity :1,
      unit_price :null,
      total_price :null,
      available :'No',
      accessories_total:0,
      original_rate :null,
      market_channel_name :null,
    };
    this.rows = [...this.rows, newRow];
  }

  addRowAccessories(){
    if (this.rowsAccessories.length > 0) {
      const lastRow = this.rowsAccessories[this.rowsAccessories.length - 1];
      if (!lastRow.item_no || lastRow.item_no == '') {
        this.alertService.triggerAlert('Please enter Item Code in the previous row before adding a new one.', 3000, 'error');
        return; // stop here
      }
    }

    let newRow: Partial<any> = {
      Id:null,
      voucher_id:null,
      m_item_no:this.selectedRow?.item_no,
      detail_id:this.selectedRow?.detail_id,
      item_no:null,
      order_quantity:null,
      unit_price:null,
      total_price:null,
      compulsory:null,
    };
    this.rowsAccessories = [...this.rowsAccessories, newRow];
  }

  addRowPayTerm(){
    if (this.rowsPayTerm.length > 0) {
      const lastRow = this.rowsPayTerm[this.rowsPayTerm.length - 1];

      if (!lastRow.installment_amount || lastRow.installment_amount == '') {
        this.alertService.triggerAlert('Please select the Amount.', 3000, 'error');
        return; // stop here
      }

      if (!lastRow.due_date || lastRow.due_date == '') {
        this.alertService.triggerAlert('Please select the date.', 3000, 'error');
        return; // stop here
      }

      const prevRow = this.rowsPayTerm[this.rowsPayTerm.length-2];
      const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (prevRow && lastRow) {
        const prevDate = stripTime(new Date(prevRow.due_date));
        const lastDate = stripTime(new Date(lastRow.due_date));
        if (prevDate > lastDate) {
          this.alertService.triggerAlert('Please select a valid date.', 3000, 'error');
          return;
        }
      }
    }

    let newRow: Partial<any> = {
      row_id:null,
      voucher_id:null,
      register_code:null,
      installment_no:null,
      installment_amount:null,
      due_date:null,
      paid:null,
      receipt_id:null,
      payment_entry_date:null
    };
    this.rowsPayTerm = [...this.rowsPayTerm, newRow];
  }

  addRowTrade(){
    let newRow: Partial<any> = {
      row_id:null,
      voucher_id:null,
      model_name:null,
      seq_no:null,
      brand_name:null,
      bw_reading:null,
      clr_reading:null,
      replace_model:null,
      received:null,
      received_date:null,
      remarks:null,
      received_by:null,
      tag_no:null,
    };
    this.rowsTrade = [...this.rowsTrade, newRow];
  }

  InstalAmtChange(row:any){
    let total = this.sumPayTermRows('installment_amount'); 
    if(total>this.salesOrderModel.net_amount){
      this.alertService.triggerAlert('Installment Amount not matching with Total amount.', 3000, 'error');
      row.installment_amount = null;
      return;
    }
    this.calculatePayterm();
  }

  calculateAccessories(){
    this.accessoriesTotal = this.sumAccessories('total_price');
  }

  deleteRowMain(index: number,row:any): void {
    const indexAcc = this.rowsAccessories.findIndex(r => r.m_item_no === row.item_no);
    this.deleteRowAccessories(indexAcc);
    this.rows.splice(index, 1);
    // Reassign seq_no for all rows
    this.calculateAccessories(); 
    this.assignTotals();
    this.rows.forEach((row, i) => { row.seq_no = i + 1; });
    this.rows = [...this.rows];
  }

  deleteRowPayTerm(index: number): void {
   this.rowsPayTerm.splice(index, 1);
    // Reassign seq_no for all rows 
    this.rowsPayTerm.forEach((row, i) => { row.seq_no = i + 1; });
    this.rowsPayTerm = [...this.rowsPayTerm];
  }

  deleteRowTrade(index: number): void {
   this.rowsTrade.splice(index, 1);
    // Reassign seq_no for all rows 
    this.rowsTrade.forEach((row, i) => { row.seq_no = i + 1; });
    this.rowsTrade = [...this.rowsTrade];
  }

  deleteRowAccessories(index: number): void {
    this.rowsAccessories.splice(index, 1);
    this.rowsAccessories.forEach((row, i) => { row.seq_no = i + 1; });
    this.calculateAccessories();
    this.rowsAccessories = [...this.rowsAccessories];
  }

  setActiveTab(name: string) {
    this.activeTabName = name;
  }

  onDateSelectedGrid(row: any): void {
    if (!row.due_date) return;
    if(row.due_date.includes('/'))return; 
    let parsedDate: Date;
    var date = new Date(row.due_date);

    if (date instanceof Date) {
      parsedDate = date;
    } else {
      return;
    }
    if (isNaN(parsedDate.getTime())) {
      console.warn('Parsed date is invalid:', parsedDate);
      return;
    }
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const year = parsedDate.getFullYear();
    row.due_date = `${day}/${month}/${year}`;
  }


  formatToDateInputGrid(value: string, row: any): void {
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }
    row.due_date = formatted;
  }

  onDateSelectedGridRec(row: any): void {
    if (!row.received_date) return;
    if(row.received_date.includes('/'))return;
    let parsedDate: Date;
    var date = new Date(row.received_date);

    if (date instanceof Date) {
      parsedDate = date;
    } else {
      return;
    }
    if (isNaN(parsedDate.getTime())) {
      console.warn('Parsed date is invalid:', parsedDate);
      return;
    }
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const year = parsedDate.getFullYear();
    row.received_date = `${day}/${month}/${year}`;
  }

  formatToDateInputGridRec(value: string, row: any): void {
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }
    row.received_date = formatted;
  }


  private sumPayTermRows(field: string): number {
    const total = this.rowsPayTerm.reduce((sum: number, row: any) => {
      const val = Number(row[field]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    return Number(total.toFixed(3));  // round to 4 decimal places
  }

  private sumRows(field: string): number {
    const total = this.rows.reduce((sum: number, row: any) => {
      const val = Number(row[field]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    return Number(total.toFixed(3));  // round to 4 decimal places
  }

  private sumAccessories(field: string): number {
    const total = this.rowsAccessories.reduce((sum: number, row: any) => {
      const val = Number(row[field]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    return Number(total.toFixed(3));  // round to 4 decimal places
  }

  calculatePayterm(){
    this.allocatedAmt = this.sumPayTermRows('installment_amount')??0;
    this.recievedAmt = this.sumPayTermRows('recieved_amt')??0;
    this.balanceAmt = this.salesOrderModel.net_amount - this.allocatedAmt;
  }

  async openAssessories(row: any, index :any) {
    if(!row.item_no){
      this.alertService.triggerAlert('Please select an item', 5000, 'error');
      return;
    }
    this.selectedIndex = index;
    this.selectedRow = row;
    this.showModalAccessories = true;
    this.rowsAccessories = [];
    let rows= this.allAccessoryItems[this.selectedRow?.item_no];
    if(rows){
      this.rowsAccessories = [...this.rowsAccessories,...rows];
      this.rowsAccessoriesTemp = rows;
    }
    this.calculateAccessories();
  }


  modalCancel(){
    this.showModalAccessories = false;
    this.rowsAccessories = this.rowsAccessoriesTemp;
  }

  modalSave(){
     if (this.rowsAccessories.length > 0) {
      const lastRow = this.rowsAccessories[this.rowsAccessories.length - 1];
      if (!lastRow.item_no || lastRow.item_no == '') {
        this.alertService.triggerAlert('Please enter Item Code in the previous row before Save', 3000, 'error');
        return; // stop here
      }
    }

    const negetiveQty = this.rowsAccessories.some(row => row.order_quantity < 0);
    if (negetiveQty) {
      this.alertService.triggerAlert('The column quantity should be greater than zero ', 3000, 'error');
      return ;
    }

    const quantityEmpty = this.rowsAccessories.some(row => !row.order_quantity || row.order_quantity == 0);
    if (quantityEmpty) {
      this.alertService.triggerAlert('The column quantity cannot be empty', 3000, 'error');
      return ;
    }
    this.showModalAccessories = false;
    this.allAccessoryItems[this.selectedRow?.item_no] = this.rowsAccessories;

    const index = this.rows.findIndex(r => r.item_no === this.selectedRow?.item_no);
    if (index !== -1) {
      this.rows[index].accessories_total = this.accessoriesTotal;
      if(this.rowsAccessories.length != 0){
        this.rows[index].available = 'Yes'
      }else{
        this.rows[index].available = 'No'
      }
    }
    this.assignTotals();
    this.calculatePayterm();
  }

  customerChange(customer_id:any){
    const cust = this.CustomerList.filter(v => v.creditcustomerid === customer_id);
    this.SelectedCustomer = cust[0].market_channel_name;
    if(!this.SelectedCustomer.includes('GOVT')){
      this.rows.forEach(row => {
        row.unit_price = row.original_rate;
        row.total_price = row.unit_price * row.order_quantity;
        this.alertService.triggerAlert('The Entered Machine Price cannot be less than the Actual Rate.', 5000, 'error');
        this.assignTotals();
        return;
      });
    }
  }

  async onDelete(){
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    this.salesOrderService.DeleteSalesOrder(this.salesOrderModel.voucher_id)
    .subscribe(
      (updatedList: any[]) => {
        this.salesOrderService.getSalesOrderList(sessionStorage.getItem('year'),1);
        this.salesOrderService.btnClick.next('');
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.salesOrderService.btnClick.next('')
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
