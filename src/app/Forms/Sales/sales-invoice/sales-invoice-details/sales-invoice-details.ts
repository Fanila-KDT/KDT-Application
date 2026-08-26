import { Component, ViewChild } from '@angular/core';
import { SalesInvoiceService } from '../../../../Service/SalesInvoiceService/sales-invoice-service';
import { TagMasterService } from '../../../../Service/TagMasterService/tag-master-service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { EndPointService } from '../../../../Service/end-point.services';
import { CustomerMasterService } from '../../../../Service/CustomerMasterService/customer-master-service';
import { SalesInvoiceModel, SalesInvoiceSave } from '../../../../Model/SalesInvoice/sales-invoice.model';
import { Subscription } from 'rxjs';
import { MaintenanceRequestService } from '../../../../Service/MaintenanceRequestService/maintenance-request-service';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { PurchaseOrderService } from '../../../../Service/PurchaseOrderService/purchase-order-service';
import { SalesQuotationService } from '../../../../Service/SalesQuotationService/sales-quotation-service';

@Component({
  selector: 'sales-invoice-details',
  standalone: false,
  templateUrl: './sales-invoice-details.html',
  styleUrls: ['./sales-invoice-details.css','../../../common.css']
})

export class SalesInvoiceDetails {
  @ViewChild(DatatableComponent) table?: DatatableComponent;
  salesInvoiceModel: SalesInvoiceModel = new SalesInvoiceModel();
  salesInvoiceTemp: SalesInvoiceModel = new SalesInvoiceModel();
  salesInvoiceSaveModel: SalesInvoiceSave = new SalesInvoiceSave();
  subscription: Subscription[] = new Array<Subscription>();
  itemDisable: boolean = true;
  saveDisable: boolean = true;
  cancelDisable: boolean = true;
  CustomerList:any[] = [];
  CustomerListTemp:any[] = [];
  btnType: string = '';
  AreaList:any[] = [];
  TagList:any[] = [];
  TagListTemp:any[] = [];
  DriverList:any[] = [];
  warehouseList:any[] = [];
  warehouseListTemp:any[] = [];
  SalesManList:any[] = [];
  SalesManListTemp:any[] = [];
  statusDisable: boolean = true;
  EngineerList:any[] = []; 
  PaymentTypeList:any[] = []; 
  payCodeList = [
    { pay_code: 3, pay_name: 'Credit' },
    { pay_code: 5, pay_name: 'Free' }
  ];
  public activeTabName: string = 'Sales';
  totalQty: any = 0;
  ItemList:any[] = [];
  ItemListTemp: any[] =[];
  rows: any[] = []; 
  rowTemp: any[] = [];
  rowsDel: any[] = []; 
  rowTempDel: any[] = [];
  rowsEst: any[] = []; 
  rowTempEst: any[] = [];
  scroll: boolean = true;
  gridHeight:number = 380;
  reorderable = true;
  SelectionType = SelectionType;
  selected: any[] = [];
    controls = {
    pageSize:50 
  };

  constructor( private salesInvoiceService: SalesInvoiceService,public tagMasterService:TagMasterService, public alertService: AlertService, public commonService: CommonService, 
    public endPointService: EndPointService,public customerMasterService:CustomerMasterService,public maintenanceRequestService:MaintenanceRequestService,
    public purchaseOrderService:PurchaseOrderService,public salesQuotationService:SalesQuotationService) {
  
    this.subscription.push(this.salesInvoiceService.clickedSalesInvoice.subscribe(async x=>{
      if(!x){
        this.salesInvoiceModel =  new SalesInvoiceModel();
        this.rows =[];
        this.rowsDel =[];
        this.rowsEst =[];
        return;
      }
      this.salesInvoiceService.ControlsEnableAndDisable.next(true);
      this.salesInvoiceModel = {...x};
      this.clearAll();
      try {
        const voucherId = this.salesInvoiceModel?.voucher_id;
        if (!voucherId) return;

        const items = await this.salesInvoiceService.GetSalesInvoiceDetails(voucherId);
        const data = items?.[0];

        if (!data) {
          this.clearAll();
          return;
        }

        // ✅ Direct assignment (no double clone)
        this.rows = data.salesInvoiceDetails ? [...data.salesInvoiceDetails] : [];
        this.rowTemp = [...this.rows];

        // ✅ Delivery details (safe + fast)
        if (data.salesDeliveryDetails[0]?.voucher_id) {
          this.rowsDel = [...data.salesDeliveryDetails];
          this.rowTempDel = [...this.rowsDel];
        } else {
          this.rowsDel = [];
          this.rowTempDel = [];
        }

        // ✅ Calculations
        this.totalQty = this.sumRows('issue_quantity');

        // ✅ Other logic
        this.AssignItems();
        this.ItemListTemp = [...this.ItemList];

      } catch (err) {
        console.error('Error fetching ItemDetails', err);
        this.clearAll();
      }
    }));

    this.subscription.push(this.salesInvoiceService.btnClick.subscribe(async x=>{
        if(x != ''){
        //this.btnClickFunction(x);
     }
    }));

    this.subscription.push(this.commonService.isSystemAdmin.subscribe(data=>{
      this.statusDisable = !data;
    }));
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.salesInvoiceService.disableGrid.next(false);
    this.salesInvoiceModel = new SalesInvoiceModel();
    this.salesInvoiceService.disabledItems.next(false);
    this.salesInvoiceService.btnClick.next('');
    this.salesInvoiceService.ControlsEnableAndDisable.next(true);
  }

  clearAll() {
    this.rows = [];
    this.rowTemp = [];
    this.rowsEst = [];
    this.rowTempEst = [];
    this.rowsDel = [];
    this.rowTempDel = [];
  }
  
  setActiveTab(name: string) {
    this.activeTabName = name;
    this.rows = this.clone(this.rowTemp);
    this.rowsDel = this.clone(this.rowTempDel);
  }

  async ngOnInit() {
    this.customerMasterService.getAreaList().then((res: any[]) => {
      this.AreaList = res;
    });
    this.CustomerList = await this.tagMasterService.GetCustomerList(1); 
    this.SalesManList = await this.tagMasterService.GetSalesManList(1); 
    this.TagList = await this.maintenanceRequestService.GetTagItems(1);
    this.PaymentTypeList = await this.salesQuotationService.GetPaymentTypeList(1); 
    this.TagListTemp = this.clone(this.TagList)
    this.EngineerList = await this.tagMasterService.GetEngineerList(1);  
    this.DriverList = await this.salesInvoiceService.GetDriverList(1);  
     this.commonService.getFullWarehouseList(this.endPointService.companycode).then((res: any[]) => {
      this.warehouseList = res;
    });
  }

  onSubmit(form:any){

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
  }

  private sumRows(field: string): number {
    const total = this.rows.reduce((sum: number, row: any) => {
      const val = Number(row[field]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    return Number(total.toFixed(3));  // round to 4 decimal places
  }
  

  getRowIdentity(row: any): any {
    return row.seq_no; // unique identifier
  }

  getRowIdentityDel(row: any): any {
    return row.voucher_id; // unique identifier
  }

  getRowIdentityEst(row: any): any {
    return row.voucher_id; // unique identifier
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

  onSubListActivateDel(event: any) {
    const rowItem = event.row;
    let rowIndex = this.rowsDel.indexOf(rowItem);

    if (event.type === 'keydown') {
      if (event.event.code === 'ArrowDown' && rowIndex < this.rowsDel.length - 1) {
        rowIndex++;
        this.selected = [this.rowsDel[rowIndex]];
        this.scrollToIndexDel(rowIndex);
      } else if (event.event.code === 'ArrowUp' && rowIndex > 0) {
        rowIndex--;
        this.selected = [this.rowsDel[rowIndex]];
        this.scrollToIndexDel(rowIndex);
      }
    }
  }

  scrollToIndexDel(index: number) {
    const rowHeight = this.rowsDel.length; // same as [rowHeight]
    const bodyElement = this.table?.element.querySelector('.datatable-body');

    if (bodyElement) {
      const maxScroll = bodyElement.scrollHeight - bodyElement.clientHeight;
      const targetScroll = index * rowHeight;

      bodyElement.scrollTop = Math.min(targetScroll, maxScroll);
    }
  }

  onSubListActivateEst(event: any) {
    const rowItem = event.row;
    let rowIndex = this.rowsEst.indexOf(rowItem);

    if (event.type === 'keydown') {
      if (event.event.code === 'ArrowDown' && rowIndex < this.rowsEst.length - 1) {
        rowIndex++;
        this.selected = [this.rowsEst[rowIndex]];
        this.scrollToIndexEst(rowIndex);
      } else if (event.event.code === 'ArrowUp' && rowIndex > 0) {
        rowIndex--;
        this.selected = [this.rowsEst[rowIndex]];
        this.scrollToIndexEst(rowIndex);
      }
    }
  }

  scrollToIndexEst(index: number) {
    const rowHeight = this.rowsEst.length; // same as [rowHeight]
    const bodyElement = this.table?.element.querySelector('.datatable-body');

    if (bodyElement) {
      const maxScroll = bodyElement.scrollHeight - bodyElement.clientHeight;
      const targetScroll = index * rowHeight;

      bodyElement.scrollTop = Math.min(targetScroll, maxScroll);
    }
  }

  onDateSelected(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.salesInvoiceModel.voucher_date = date;
  }

  formatToDateInput(value: string): void {
    this.salesInvoiceModel.voucher_date = value;
  }

  cancelClickMethod(){
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.salesInvoiceService.disableGrid.next(false);
    this.salesInvoiceModel = {...this.salesInvoiceTemp};
    this.salesInvoiceService.disabledItems.next(false);
    this.salesInvoiceService.btnClick.next('');
    this.salesInvoiceService.ControlsEnableAndDisable.next(true);
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
      //this.assignTotals();
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
    //this.assignTotals();
  }

  addRowDel(){
    if (this.rowsDel.length > 0) {
      const lastRow = this.rowsDel[this.rowsDel.length - 1];
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
    this.rowsDel = [...this.rowsDel, newRow];
  }

  deleteRowDel(index: number): void {
    this.rowsDel.splice(index, 1);
    // Reassign seq_no for all rows 
    this.rowsDel.forEach((row, i) => { row.seq_no = i + 1; });
    this.rowsDel = [...this.rowsDel];
  }

  addRowEst(){
    if (this.rowsEst.length > 0) {
      const lastRow = this.rowsEst[this.rowsEst.length - 1];
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
    this.rowsEst = [...this.rowsEst, newRow];
  }

  deleteRowEst(index: number): void {
    this.rowsEst.splice(index, 1);
    // Reassign seq_no for all rows 
    this.rowsEst.forEach((row, i) => { row.seq_no = i + 1; });
    this.rowsEst = [...this.rowsEst];
    //this.assignTotals();
  }

  QtyChange(row:any){
    row.pamount = row.issue_quantity * row.enter_rate;
    //this.assignTotals();
  }

  TotalChange(row:any){
    row.enter_rate = row.pamount / row.issue_quantity;
    //this.assignTotals();
  }
}