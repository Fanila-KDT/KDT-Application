import { Component, ViewChild } from '@angular/core';
import { ItemReorderDetails, ItemReorderRequest, ItemReorderRequestModel } from '../../../../Model/ItemReorderRequest/item-reorder-request.model';
import { EndPointService } from '../../../../Service/end-point.services';
import { ItemReorderRequestService } from '../../../../Service/ItemReorderRequestService/item-reorder-request-service';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';
import { Subscription } from 'rxjs';
import { AlertService } from '../../../../shared/alert/alert.service';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { P } from '@angular/cdk/keycodes';
import { CommonService } from '../../../../Service/CommonService/common-service';
import Swal from 'sweetalert2';
import { DateModelInventory } from '../../../../Model/CommonModel';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'item-reorder-request-details',
  standalone: false,
  templateUrl: './item-reorder-request-details.html',
  styleUrls: ['./item-reorder-request-details.css','../../../common.css'],
  providers: [DatePipe]
})
export class ItemReorderRequestDetails {
  itemReorderRequestModel: ItemReorderRequestModel = new ItemReorderRequestModel();
  itemReorderRequest: ItemReorderRequest = new ItemReorderRequest();
  itemReorderRequestTemp: ItemReorderRequestModel = new ItemReorderRequestModel(); 
  dateModel: DateModelInventory = new DateModelInventory();
  itemReorderDetails:ItemReorderDetails[] = []
  @ViewChild(DatatableComponent) table?: DatatableComponent;
  isEditable: boolean = true;  
  subscription: Subscription[] = new Array<Subscription>();
  saveDisable:boolean = true;
  cancelDisable:boolean = true;
  brandList:any[]=[];
  productTypeList: string[] = [ 'OP', 'RGC'];
  rows: any[] = []; 
  rowTemp:any[] = [];
  scroll: boolean = true;
  gridHeight:number=350;
  reorderable = true;
  controls = {
    pageSize:50 
  };
  SelectionType = SelectionType;
  selected: any[] = [];
  btnType:string = '';
  isOrderDateInvalid: boolean = false;
  isBrandInvalid: boolean = false;
  isPCategoryInvalid: boolean = false
  isPTypeInvalid: boolean = false;
  totalQty:number = 0;
  totalValue:number = 0;
  totalQtyTemp:number = 0;
  totalValueTemp:number = 0;
  statusDisable:boolean = true;

  constructor(private datePipe: DatePipe,public itemReorderRequestService:ItemReorderRequestService,public endPointService:EndPointService,public userAccessService:UserAccessService,
              public commonService:CommonService,private alertService: AlertService ) {

    this.subscription.push(this.itemReorderRequestService.clickedReorderItem.subscribe(async x=>{
      if(!x){
        this.itemReorderRequestModel =  new ItemReorderRequestModel();
        this.rows =[];
        return;
      }
      this.itemReorderRequestService.ControlsEnableAndDisable.next(true);
      this.itemReorderRequestModel = {...x};
      await this.itemReorderRequestService.getItemReorderDetails(this.itemReorderRequestModel.voucher_id).then((res) => {});
    }));

    this.subscription.push(this.itemReorderRequestService.assignReorderItemDetails.subscribe(async (data:any)=>{
      if(data[0]){
        this.rows = [...data];
        this.rows = data.map((row:any) => ({
          ...row,
          approved_qty: (row.approved_qty == null || row.approved_qty < 0) ? 0 : row.approved_qty,
          approved_value: (row.approved_qty == null || row.approved_qty < 0) ? 0 : row.approved_value
        }));
        this.rowTemp = this.clone(this.rows);
        this.totalQty = this.sumRows('approved_qty');
        this.totalValue = this.sumRows('approved_value');
        //this.AssignItems();
      }else{
        this.rows = [];
        this.rowTemp = [];
        //this.totalQty = 0;
      }
    }));

    this.subscription.push(this.itemReorderRequestService.btnClick.subscribe(async x=>{
      if(x != ''){
        this.btnClickFunction(x);
      }
    }));

    this.subscription.push(this.commonService.isSystemAdmin.subscribe(data=>{
      this.statusDisable = !data;
    }));
  }

  async ngOnInit() {
    try {
      this.brandList = await this.itemReorderRequestService.GetBrandList();  
    } catch (error) {
      this.alertService.triggerAlert('Something went wrong ...',4000, 'error');
    }
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
    this.isEditable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.itemReorderRequestService.disableGrid.next(false);
    this.itemReorderRequestService.disabledItems.next(false);
    this.itemReorderRequestService.btnClick.next('');
    this.rows =[];this.rowTemp = []
    this.itemReorderRequestModel = new ItemReorderRequestModel(); 
  }

  async btnClickFunction(x: string) {
    this.btnType = x;
    this.itemReorderRequestTemp = {...this.itemReorderRequestModel};
    this.totalQtyTemp = this.totalQty;
    this.totalValueTemp = this.totalValue;
    if(x =='N'){  
      this.itemReorderRequestModel = new ItemReorderRequestModel();
      this.itemReorderRequestModel.voucher_id = await this.commonService.GetGuid();
      this.saveDisable = false;
      this.cancelDisable = false;
      this.isEditable = false;
      this.totalQty = 0;
      this.totalValue = 0;
      this.rows = [];
      this.itemReorderRequestModel.voucherDate = new Date();
      this.itemReorderRequestModel.voucher_date = new Date();
      this.itemReorderRequestModel.orderDate = new Date();
      this.itemReorderRequestModel.order_date = new Date();
    }else if(x =='M'){
      this.saveDisable = false;
      this.cancelDisable = false;
      this.isEditable = false;
    }else if(x =='D'){
      this.onDelete();
    }
  }
  
  ApprovedQtyChange = this.debounce((qty: number, row: any) => {
     if(qty < 0){
      this.alertService.triggerAlert('Please enter a valid quantity.',3000,'error');
      row.approved_qty = 0;
      return;
    }
    row.approved_value = (row.approved_qty * row.fgn_unit_price).toFixed(3);
    this.totalQty = this.sumRows('approved_qty');
    this.totalValue = this.sumRows('approved_value');
  }, 200);

  ApproveAssign = this.debounce((row: any) => {
    if(!row.approved_qty || row.approved_qty <= 0){
      row.approved_qty = 0;
      row.approved_value= 0;
      return;
    }
  }, 200);
    
  onDateSelected(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.itemReorderRequestModel.voucher_date = date;
  }

  formatToDateInput(value: string): void {
    this.itemReorderRequestModel.voucher_date = value;
  }

  onDateSelected1(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.itemReorderRequestModel.order_date = date;
  }

  formatToDateInput1(value: string): void {
    this.itemReorderRequestModel.order_date = value;
  }


  async onSubmit(ItemReorderRequestForm:any){
    const isValid = await this.validateForm(this.itemReorderRequestModel);
    if (!isValid) {
      this.alertService.triggerAlert('Please fill all required fields.', 4000, 'error');
      return;
    }

    if (this.rows.length == 0) {
      this.alertService.triggerAlert('Please add the row items...', 3000, 'error');
      return ;
    }

    const voucher_Date = new Date(this.itemReorderRequestModel.voucher_date); // dd/MM/yyyy
    const today = new Date();
    const periodFrom = new Date(today.getFullYear(), 0, 1);
    const periodTo = new Date(today.getFullYear(), 11, 31);
    const isBetween = voucher_Date >= periodFrom && voucher_Date <= periodTo;
    if(!isBetween){
      this.alertService.triggerAlert('Entry date must choose within the chosen financial year.', 3000, 'error');
      return ;
    }

   await this.AssignValues();

    this.itemReorderRequestService.saveItemReorderReqModel(this.itemReorderRequest, this.itemReorderDetails,this.dateModel)
      .subscribe({
      next: async (response: any) => {
        if(this.btnType == 'N'){
          this.alertService.triggerAlert('Row saved successfully...', 4000, 'success');
        }else{
          this.alertService.triggerAlert('Row modified successfully...', 4000, 'success');
        }
        await this.itemReorderRequestService.getItemReorderRequestList(sessionStorage.getItem('year'),2);
        let item: ItemReorderRequestModel | undefined = this.itemReorderRequestService.mainList.find(item => item.voucher_id === response.headerModel.voucher_id);
        if (item) {
          await this.itemReorderRequestService.loadListItemReorderRequest.next(this.itemReorderRequestService.mainList);
          this.itemReorderRequestService.clickedReorderItem.next(item); // pass single object
          let temp =[];
          temp.push(item)
          this.itemReorderRequestService.selected.next(temp); // pass single object
        }
        this.itemReorderRequestService.btnClick.next('');
        this.saveDisable = true;
        this.cancelDisable = true;
        this.isEditable = true;
        this.itemReorderRequestService.disabledItems.next(false);
        this.itemReorderRequestService.disableGrid.next(false);
        this.itemReorderRequestService.ControlsEnableAndDisable.next(true);
      },
      error: () => {
        this.alertService.triggerAlert('Failed to save the Row...', 4000, 'error');
        this.itemReorderRequestService.btnClick.next('');
      }
    });
  }

  async AssignValues(){
    this.itemReorderRequest = {
      voucher_id:this.itemReorderRequestModel.voucher_id,
      company_code: this.endPointService.companycode,
      voucher_date: new Date(new Date(this.itemReorderRequestModel.voucher_date).setDate(new Date(this.itemReorderRequestModel.voucher_date).getDate() + 1)),
      voucher_reference: this.itemReorderRequestModel.voucher_reference,
      posted_date: null,
      item_type :this.itemReorderRequestModel.item_type,
      brand_id :this.itemReorderRequestModel.brand_id,
      product_type :this.itemReorderRequestModel.product_type,
      order_date : new Date(new Date(this.itemReorderRequestModel.order_date).setDate(new Date(this.itemReorderRequestModel.order_date).getDate() + 1)),
      modified_on: null,

      ...(this.btnType === 'N'
      ? {
          document_number: '',
          created_by: localStorage.getItem('user_id'),
          user_enter_date: new Date(),
          approved_by: null,modified_by: null,
          status : 'DRAFT',
          createdt :null,
          approver_remarks: null,
        }
      : {
          created_by: this.itemReorderRequestModel.created_by,
          document_number: this.itemReorderRequestModel.document_number,
          modified_by: localStorage.getItem('user_id'),
          user_enter_date: new Date(new Date(this.itemReorderRequestModel.user_enter_date).setDate(new Date(this.itemReorderRequestModel.user_enter_date).getDate() + 1)),
          approved_by: this.itemReorderRequestModel.approved_by,
          status: this.itemReorderRequestModel.status,
          createdt: this.itemReorderRequestModel.createdt,
          approver_remarks: this.itemReorderRequestModel.approver_remarks
        })
    };

    const voucher_date = this.datePipe.transform(this.itemReorderRequestModel.voucher_date, 'dd/MM/yyyy');
    this.dateModel.voucher_date = voucher_date;
    const user_enter_date = this.datePipe.transform(this.itemReorderRequestModel.user_enter_date, 'dd/MM/yyyy');
    this.dateModel.user_enter_date = user_enter_date;
    const order_date = this.datePipe.transform(this.itemReorderRequestModel.order_date, 'dd/MM/yyyy');
    this.dateModel.order_date = order_date;

    this.itemReorderDetails = await this.mapItemsToDetails(this.rows,this.itemReorderRequestModel.voucher_id);

  }

  async mapItemsToDetails(items: any[],voucher_id:any): Promise<ItemReorderDetails[]> {
    const detailsList: ItemReorderDetails[] = [];
    let num = 0;
    for (const item of items) {
      num = num + 1;
      const details = new ItemReorderDetails();
      details.rowguid =  await this.commonService.GetGuid();
      details.voucher_id = voucher_id;
      details.seq_no = num;
      details.item_no = item.item_no;
      details.iss_qty = item.iss_qty;
      details.per_day = item.per_day;
      details.end_stock = item.end_stock;
      details.fgn_unit_price = item.fgn_unit_price;
      details.base_stock = item.base_stock;
      details.suggested_qty = item.suggested_qty;
      details.approved_qty = item.approved_qty;
      details.backorder_qty = item.backorder_qty;
      detailsList.push(details);
    }
    return detailsList;
  }
    
  
  async validateForm(model: ItemReorderRequestModel): Promise<boolean> {
    // Reset validation flags
    this.isOrderDateInvalid = !model.order_date;
    this.isBrandInvalid = !model.brand_id;
    this.isPCategoryInvalid = !model.item_type;
    this.isPTypeInvalid = !model.product_type;

    const isValid = !(this.isOrderDateInvalid || this.isBrandInvalid || this.isPCategoryInvalid || this.isPTypeInvalid);
    return isValid;
  }

  cancelClickMethod(){
    this.isEditable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.itemReorderRequestService.disableGrid.next(false);
    this.itemReorderRequestModel = {...this.itemReorderRequestTemp};
    this.totalQty = this.totalQtyTemp;
    this.totalValue = this.totalValueTemp;
    this.rows = this.clone(this.rowTemp);
    this.itemReorderRequestService.disabledItems.next(false);
    this.itemReorderRequestService.btnClick.next('');
    this.itemReorderRequestService.ControlsEnableAndDisable.next(true);
  }

  clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  getRowIdentity(row: any): any {
    return row.rowguid; // unique identifier
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

  private debounce(func: Function, wait: number) {
    let timeout: any;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  async loadRows(){
    const isValid = await this.validateForm(this.itemReorderRequestModel);
    if (!isValid) {
      this.alertService.triggerAlert('Please fill all required fields.', 4000, 'error');
      return;
    }
    const data = {
      ProductDept:this.itemReorderRequestModel.item_type,
      ProductType:this.itemReorderRequestModel.product_type,
      VoucherID :this.itemReorderRequestModel.voucher_id,
      DateTo  : this.itemReorderRequestModel.order_date,
      BrandID :this.itemReorderRequestModel.brand_id,
    }

    const response = await this.itemReorderRequestService.checkRequestStatus(data);
    if(response.message == 'Exist'){
      this.alertService.triggerAlert('Request already submitted. Please check...',4000, 'error');
      return;
    }
    await this.itemReorderRequestService.getLoadItemDetails(data).then((res) => {});
    console.log(response);
  }

  onSelectChange(){
    this.rows = [];
  }

  private sumRows(field: string): number {
    const total = this.rows.reduce((sum: number, row: any) => {
      const val = Number(row[field]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    return Number(total.toFixed(3));  // round to 4 decimal places
  }

  async onDelete(){
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    this.itemReorderRequestService.deleteItemReorderRequest(this.itemReorderRequestModel.voucher_id)
    .subscribe(
      (updatedList: any[]) => {
        this.itemReorderRequestService.getItemReorderRequestList(sessionStorage.getItem('year'),1);
        this.itemReorderRequestService.btnClick.next('');
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.itemReorderRequestService.btnClick.next('')
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
