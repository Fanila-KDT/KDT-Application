import { Component, ViewChild } from '@angular/core';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { DeliveryNoteService } from '../../../../Service/DeliveryNoteService/delivery-note-service';
import { PurchaseOrderService } from '../../../../Service/PurchaseOrderService/purchase-order-service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { EndPointService } from '../../../../Service/end-point.services';
import { DatePipe } from '@angular/common';
import { DeliveryNoteDetailModel, DeliveryNoteModel, OilAndGasModel } from '../../../../Model/DeliveryNote/delivery-note.model';
import { DateModelSales } from '../../../../Model/CommonModel';
import { Subscription } from 'rxjs';
import { TagMasterService } from '../../../../Service/TagMasterService/tag-master-service';

@Component({
  selector: 'delivery-note-details',
  standalone: false,
  templateUrl: './delivery-note-details.html',
  styleUrls: ['./delivery-note-details.css','../../../common.css'],
  providers: [DatePipe]
})
export class DeliveryNoteDetails {
  @ViewChild(DatatableComponent) table?: DatatableComponent;
  @ViewChild(DatatableComponent) tableTags?: DatatableComponent;
  deliveryNoteModel: DeliveryNoteModel = new DeliveryNoteModel();
  oilAndGasModel : OilAndGasModel = new OilAndGasModel();
  deliveryNoteTemp: DeliveryNoteModel = new DeliveryNoteModel();
  deliveryNoteDetailModel: DeliveryNoteDetailModel[] = [];
  dateModel: DateModelSales = new DateModelSales();
  subscription: Subscription[] = new Array<Subscription>();
  itemDisable: boolean = true;
  saveDisable: boolean = true;
  cancelDisable: boolean = true;
  btnType: string = '';
  statusDisable: boolean = true;
  ItemList:any[] = [];
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
  CustomerList:any[] = [];
  CustomerListTemp:any[] = [];
  warehouseList:any[] = [];
  showModalTags: boolean = false;
  selectedRow: any;
  selectedIndex: any;
  rowsTags: any[] = []; 
  rowsTagsTemp: any[] = [];
  allTagsItems: any[] = [];
  selectedTags: any[] = [];
  TagList:any[] = [];
  
  constructor(private deliveryNoteService: DeliveryNoteService,public alertService: AlertService, public commonService: CommonService, public purchaseOrderService:PurchaseOrderService,
    public endPointService: EndPointService,private datePipe: DatePipe,private tagMasterService:TagMasterService) {

    this.subscription.push(this.deliveryNoteService.clickedDeliveryNote.subscribe(async x=>{
      if(!x?.voucher_id){
        this.deliveryNoteModel =  new DeliveryNoteModel();
        this.rows = [];
        this.rowsTemp = [];
        return;
      }
      this.deliveryNoteModel = {...x};
      this.deliveryNoteService.voucher_id = x.voucher_id;
      this.deliveryNoteService.approval_status = x.approval_status;
      this.deliveryNoteService.ControlsEnableAndDisable.next(true);

      try {
        const items = await this.deliveryNoteService.GetDeliveryNoteDetails(this.deliveryNoteModel.voucher_id);
        if (items && items.length) {
          this.oilAndGasModel = items[0].oilAndGasModel[0];
          this.rows = this.clone(items[0].deliveryNoteDetailModel);
          this.allTagsItems = [];
          let length = items[0].tagDetails.length;
          if(length != 0){
            let item = items[0].tagDetails;
            const grouped: [ [key: string], typeof item ] = item.reduce((acc:any, row:any) => {
              if (!acc[row.item_no]) {
                acc[row.item_no] = [];
              }
              acc[row.item_no].push(row);
              return acc;
            }, {} as { [key: string]: typeof item });
            this.allTagsItems = grouped;

            this.rows.forEach(row => {
              const tags = grouped[row.item_no];
              row.hasTags = tags && tags.length > 0;
            });
          }
          this.deliveryNoteModel.total_amount = this.sumRows('issue_quantity');

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

    this.subscription.push(this.deliveryNoteService.btnClick.subscribe(async x=>{
      if(x !==''){
        //await this.btnClickFunction(x);
      }
    }));

  }

  async ngOnInit(){
    try {
      this.TagList = await this.deliveryNoteService.GetTagDetails(); 
      this.CustomerList = await this.tagMasterService.GetCustomerList(1); 
      this.commonService.getFullWarehouseList(this.endPointService.companycode).then((res: any[]) => {
      this.warehouseList = res;
    });
    } catch (error) {
      console.error('Error while fetching Product Class List:', error);
      this.alertService.triggerAlert('Something went wrong ...',4000, 'error');
    }
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

  async onSubmit(Form:any){}

  cancelClickMethod(){
    this.rows = [...this.rowsTemp];
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.deliveryNoteService.disableGrid.next(false);
    this.deliveryNoteModel = {...this.deliveryNoteTemp};
    this.deliveryNoteService.disabledItems.next(false);
    this.deliveryNoteService.btnClick.next('');
    this.deliveryNoteService.approval_status = this.deliveryNoteModel.approval_status;
    this.deliveryNoteService.ControlsEnableAndDisable.next(true);
  }

  onDateSelected(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.deliveryNoteModel.voucher_date = date;
  }

  formatToDateInput(value: string): void {
    this.deliveryNoteModel.voucher_date = value;
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
    else if (event.type == 'click') 
      {
        this.selected = [this.rows[rowIndex]];
        this.scrollToIndex(rowIndex);
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
      row.item_name_abbr = item.item_name_abbr;
      row.issue_quantity = 1;
      row.receipt_quantity = 0;
      row.unit_name = item.unit_name;
    } catch (error) {
      console.error('ItemCodeEnter error:', error);
    }
  }

  async ModelNameChange(item_name_abbr: any, row: any) {
    const [item_code, item_details] = row.item_name_abbr.split('-');
    const item = this.ItemList.find(v => v.item_code == item_code.trim());
    this.ItemCodeEnter(item.item_no,row);
  }

  private sumRows(field: string): number {
    const total = this.rows.reduce((sum: number, row: any) => {
      const val = Number(row[field]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    return Number(total.toFixed(3));  // round to 4 decimal places
  }

  addRow(){

  }

  deleteRow(index: number,row:any): void {
    const indexAcc = this.rowsTags.findIndex(r => r.item_no === row.item_no);
    this.deleteRowTags(indexAcc);
    this.rows.splice(index, 1);
    this.rows.forEach((row, i) => { row.seq_no = i + 1; });
    this.rows = [...this.rows];
  }

  openTag(row:any,rowIndex:any){
   if(!row.item_no){
      this.alertService.triggerAlert('Please select an item', 5000, 'error');
      return;
    }
    this.selectedIndex = rowIndex;
    this.selectedRow = row;
    this.showModalTags = true;
    this.rowsTags = [];
    let rows= this.allTagsItems[this.selectedRow?.item_no];
    if(rows){
      this.rowsTags = [...this.rowsTags,...rows];
      this.rowsTagsTemp = rows;
    }
  }
//c50d81a1-7e12-420f-86f5-5e2cd9a48218
  modalCancel(){
    this.showModalTags = false;
    this.rowsTags = this.rowsTagsTemp;
  }

  getRowIdentityTags(row: any): any {
    return row.id; // unique identifier
  }

  onSubListActivateTags(event: any) {
    this.onSubListActivateGeneric(
      event,
      this.rowsTags,
      (sel) => (this.selectedTags = sel),
      (i) => this.scrollToIndexGeneric(i, this.rowsTags, this.tableTags)
    );
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

  addRowTags(){
    if (this.rowsTags.length > 0) {
      const lastRow = this.rowsTags[this.rowsTags.length - 1];
      if (!lastRow.tag_no || lastRow.tag_no == '') {
        this.alertService.triggerAlert('Please enter Tag No in the previous row before adding a new one.', 3000, 'error');
        return; // stop here
      }
    }

    let newRow: Partial<any> = {
      Id:null,
      voucher_id:this.deliveryNoteModel.voucher_id,
      item_no:this.selectedRow?.item_no,
      seq_no:null,
      tag_id:null,
      serial_no:null,
      tag_no:null,
      new_check:false
    };
    this.rowsTags = [...this.rowsTags, newRow];
  }

  deleteRowTags(index: number): void {
    this.rowsTags.splice(index, 1);
    this.rowsTags.forEach((row, i) => { row.seq_no = i + 1; });
    this.rowsTags = [...this.rowsTags];
  }

  modalSave(){
    this.showModalTags = false;
    this.allTagsItems[this.selectedRow?.item_no] = this.rowsTags;

    const index = this.rows.findIndex(r => r.item_no === this.selectedRow?.item_no);
  }
  
  getRowClass(row: any) {
    return {
      'highlight-row': !!row.hasTags
    };
  }


}
