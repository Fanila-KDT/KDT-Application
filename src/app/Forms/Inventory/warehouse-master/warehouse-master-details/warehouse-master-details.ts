import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { AccountList, WarehouseDeatailsModel, WarehouseMasterModel, WarehouseMasterModelSave } from '../../../../Model/WarehouseMaster/warehouse-master.model';
import { WarehouseMasterService } from '../../../../Service/WarehouseMasterService/warehouse-master-service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { EndPointService } from '../../../../Service/end-point.services';
import Swal from 'sweetalert2';
import { SelectionType } from '@swimlane/ngx-datatable';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';

@Component({
  selector: 'warehouse-master-details',
  standalone: false,
  templateUrl: './warehouse-master-details.html',
  styleUrls: ['./warehouse-master-details.css','../../../common.css']
})
export class WarehouseMasterDetails {
  SelectionType = SelectionType;
  profitList: any[] = [];
  paycodeList: any[] = [];
  acccodeList:  any[]= [];
  salAcList:  any[]= [];
  CostSalAcList:  any[]= [];
  InvAccList: any[]= [];
  SalesDisList: any[]= [];
  GiftAccList:  any[]= [];
  StockAdjList:  any[]= [];
  ServiceAccList:  any[]= [];
  WarExpList:  any[]= [];
  rows: any[] = []; 
  rowsTemp: any[] = []; 
  selected: any[] = [];
  subscription: Subscription[];
  warehouseMasterModel: WarehouseMasterModel = new WarehouseMasterModel();
  warehouseMasterModelTemp: WarehouseMasterModel = new WarehouseMasterModel();
  warehouseMasterModelSave: WarehouseMasterModelSave = new WarehouseMasterModelSave();
  warehouseDeatailsModal:WarehouseDeatailsModel= new WarehouseDeatailsModel();
  saveDisable: boolean = true;
  itemDisable: boolean = true;
  cancelDisable: boolean = true;
  scroll: boolean = true;
  reorderable = true;
  isEditable: boolean = true;
  isWHNameInvalid: boolean = false;
  isPrefixInvalid: boolean = false;
  isAcctNameInvalid : boolean = false;
  isSalAcInvalid = false;
  isCostSalAcInvalid = false;
  isInvAccInvalid = false;
  isSalesDisInvalid = false;
  isGiftAccInvalid = false;
  isStockAdjInvalid = false;
  isServiceAccInvalid = false;
  isWarExpInvalid = false;
  btnType: string="";
  rowCount:number=0;
  controls = {
    pageSize:50
  };
  [key: string]: any;

  constructor(public warehouseMasterService:WarehouseMasterService,private alertService: AlertService, public endPointService:EndPointService,public userAccessService:UserAccessService) {
    this.subscription = new Array<Subscription>();
       this.subscription.push(this.warehouseMasterService.clickedWarehouse.subscribe(async x=>{
      if(!x){
        this.warehouseMasterModel =  new WarehouseMasterModel();
        this.rows =[];
        return;
      }
      this.warehouseMasterModel = {...x};
      this.warehouseMasterModelTemp = {...x};
      this.warehouseMasterService.selectedWerNo = x.godown_code;
      this.warehouseMasterService.selectedWerName = x.godown_name;
      this.warehouseMasterService.getAccLinkingList(x.godown_code);
    }));

    this.subscription.push(this.warehouseMasterService.assignAccLinkingList.subscribe( (data:any)=>{
      if(data[0]){
        this.rows = data.filter((item:any) => item.paY_CODE === 3 || item.paY_CODE === 5);
      }else{
        this.rows = [];
      }
    }));

    this.subscription.push(this.warehouseMasterService.btnClick.subscribe(x=>{
     this.btnClickFunction(x);
    }));

    this.subscription.push(this.warehouseMasterService.cancelClick.subscribe(x=>{
      if(x){
        this.CancelclickMethod();
      }
    }));
  }

  ngOnInit(): void {  
    this.AssignDrpdowns()
    
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  onRowSelect(event: any) {
    //this.productMasterService.clickedProduct.next(event.selected[0]);
  }

  AssignDrpdowns(){
    this.warehouseMasterService.GetProfitList().then((res:any)=>{
      this.profitList = res;
    });

    const dropdownMap = {
      Account: 'acccodeList',
      SalesAccount: 'salAcList',
      CostSalesAccount: 'CostSalAcList',
      InventoryAccount: 'InvAccList',
      SalesDiscount: 'SalesDisList',
      GiftAccount: 'GiftAccList',
      StockAdjustment: 'StockAdjList',
      Service: 'ServiceAccList',
      WarrantyExpense: 'WarExpList',
      PayCode:'paycodeList'
    };

    for (const [accType, targetList] of Object.entries(dropdownMap)) {
      this.warehouseMasterService.GetAccountList(accType).then((res: any[]) => {
        this[targetList] = res;
      });
    }
    
  }

  btnClickFunction(x: string) {
    this.btnType = x;
    if(x =='N'){
      this.warehouseMasterModel = new WarehouseMasterModel();
      this.rowsTemp = [...this.rows];
      this.rows =[];
      this.onInsertRow();
      this.saveDisable = false;
      this.cancelDisable = false;
      this.itemDisable = false;
    }else if(x=='M'){
      this.saveDisable = false;
      this.cancelDisable = false;
      this.itemDisable = false;
    }else if(x=='D'){
      this.onDelete()
    }
  }

  onInsertRow() {
  const fixedRows = [
    {
      paY_CODE: this.paycodeList[0]?.pay_code || null,
      accounT_CODE:  null,
      saleS_AC_CODE: null,
      cS_AC_CODE: null,
      inventorY_AC_CODE: null,
      saleS_DISC_CODE: null,
      gifT_AC_CODE: null,
      adjustmenT_CODE: null,
      servicE_AC_CODE: null,
      WARR_EXP_AC_CODE: null
    },
    {
      paY_CODE: this.paycodeList[1]?.pay_code || null,
      accounT_CODE: null,
      saleS_AC_CODE: null,
      cS_AC_CODE: null,
      inventorY_AC_CODE: null,
      saleS_DISC_CODE: null,
      gifT_AC_CODE: null,
      adjustmenT_CODE: null,
      servicE_AC_CODE: null,
      WARR_EXP_AC_CODE: null
    }
  ];

  this.rows = [...this.rows, ...fixedRows];
}

  async onSubmit(form:any){
    const { centername, ...rest } = this.warehouseMasterModel;
    this.warehouseMasterModelSave = { ...rest };

    var response = false;
    if(this.btnType === 'N'){
      response = await this.warehouseMasterService.wHNameCheck(this.warehouseMasterModel.godown_name);
      this.warehouseMasterModelSave.company_code = this.endPointService.companycode;
    }
    else{
      if(this.warehouseMasterModel.godown_name != this.warehouseMasterService.selectedWerName){
       response = await this.warehouseMasterService.wHNameCheck(this.warehouseMasterModel.godown_name);
      }
    }
    const isValid = await this.validateForm(this.warehouseMasterModel);
    if (!isValid) {
      this.alertService.triggerAlert('Please fill all required fields.', 4000, 'error');
      return;
    }

    const invalidRows = this.rows.filter(row => !this.validateRow(row));
    if (invalidRows.length > 0) {
        this.alertService.triggerAlert('Please fill all mandatory fields in the grid.', 4000, 'error');
      return;
    }

    
    if(response == false){
      this.warehouseMasterService.SavewarehouseMaster(this.warehouseMasterModelSave,this.rows).subscribe({next: (response: any) => {
        if(this.btnType === 'N'){
          this.warehouseMasterService.addRowAfterSave.next(response.warehouseMaster);
          this.alertService.triggerAlert('Saved Successfully...', 4000, 'success');
        }
        if(this.btnType === 'M'){
          this.warehouseMasterService.addRowAfterModify.next(response.warehouseMaster);
          this.alertService.triggerAlert('Modified Successfully...', 4000, 'success');
        }
        this.warehouseMasterModel = {...response.warehouseMaster};
        this.itemDisable = true;
        this.saveDisable = true;
        this.cancelDisable = true;
        this.warehouseMasterService.disableGrid.next(false);
        this.warehouseMasterService.disabledItems.next(false);
        this.warehouseMasterService.btnClick.next('');
        this.userAccessService.CheckUserAccess(this.warehouseMasterService.FormName,this.warehouseMasterService);
      },
        error: (err) => {
          this.alertService.triggerAlert('Failed to save the Row...',4000, 'error');
          this.warehouseMasterService.btnClick.next('');
        }
      });
    }else{
      this.alertService.triggerAlert('Warehouse Name is already exists. Please try again.', 4000, 'error');
    }
  }

  async onDelete() {
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    this.warehouseMasterService.deleteWarehouseMaster(this.warehouseMasterModel.godown_code)
    .subscribe(
      (updatedList: any[]) => {
        this.warehouseMasterService.loadList.next(updatedList);
        this.warehouseMasterService.clickedWarehouse.next(updatedList[0]);
        this.alertService.triggerAlert('Row deleted successfully...', 4000, 'success');
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
      }
    );
    this.warehouseMasterService.btnClick.next('')
  }
  
  CancelclickMethod(){
    this.warehouseMasterService.disableGrid.next(false);
    this.warehouseMasterModel = {...this.warehouseMasterModelTemp};
    this.rows = [...this.rowsTemp];
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.warehouseMasterService.disabledItems.next(false);
    this.warehouseMasterService.btnClick.next('');
    this.isWHNameInvalid = false;
    this.isPrefixInvalid = false;
    this.userAccessService.CheckUserAccess(this.warehouseMasterService.FormName,this.warehouseMasterService);
  } 

  async validateForm(model: WarehouseMasterModel): Promise<boolean> {
    // Reset all flags
    this.isWHNameInvalid = !model.godown_name?.trim();
    this.isPrefixInvalid = !model.godown_name_abbr?.trim();
    
        // Final validity check
    const isValid = !(
      this.isWHNameInvalid ||
      this.isPrefixInvalid 
    );

    return isValid;
  }

  validateRow(row: any): boolean {
    this.isAcctNameInvalid = !row.accounT_CODE? true : false;
    this.isSalAcInvalid = !row.saleS_AC_CODE? true : false;
    this.isCostSalAcInvalid = !row.cS_AC_CODE? true : false;
    this.isInvAccInvalid = !row.inventorY_AC_CODE? true : false;
    this.isSalesDisInvalid = !row.saleS_DISC_CODE? true : false;
    this.isGiftAccInvalid = !row.gifT_AC_CODE? true : false;
    this.isStockAdjInvalid = !row.adjustmenT_CODE? true : false;
    this.isServiceAccInvalid = !row.servicE_AC_CODE? true : false;
    this.isWarExpInvalid = !row.warR_EXP_AC_CODE? true : false;
    const isValid = !(
       this.isAcctNameInvalid
    );

    return isValid;
  }

  onAccNAmeChange(event: any, row: any, field: any) {
    const accountCode = event?.account_code || event; // handle both object and primitive cases
    if (row && field) {
      this.rows[1][field] = accountCode;
    }
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
