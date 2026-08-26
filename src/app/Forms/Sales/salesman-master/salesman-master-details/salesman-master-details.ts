import { Component, ViewChild } from '@angular/core';
import { SalesmanMasterModel, SalesmanMasterSave, SalesmanTarget } from '../../../../Model/SalesmanMaster/salesman-master.model';
import { SalesmanMasterService } from '../../../../Service/SalesmanMasterService/salesman-master-service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { EndPointService } from '../../../../Service/end-point.services';
import { Subscription } from 'rxjs';
import { SupplierMasterService } from '../../../../Service/SupplierMasterService/supplier-master-service';
import Swal from 'sweetalert2';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

@Component({
  selector: 'salesman-master-details',
  standalone: false,
  templateUrl: './salesman-master-details.html',
  styleUrls: ['./salesman-master-details.css','../../../common.css']
})
export class SalesmanMasterDetails {
  @ViewChild(DatatableComponent) table?: DatatableComponent;
  salesmanMasterModel: SalesmanMasterModel = new SalesmanMasterModel();
  salesmanMasterTemp: SalesmanMasterModel = new SalesmanMasterModel();
  salesmanMasterSave: SalesmanMasterSave = new SalesmanMasterSave();
  salesmanTarget: SalesmanTarget = new SalesmanTarget();
  subscription: Subscription[] = new Array<Subscription>();
  itemDisable: boolean = true;
  saveDisable: boolean = true;
  cancelDisable: boolean = true;
  saveMcDisable: boolean = true;
  modifyDisable: boolean = true;
  cancelMcDisable: boolean = true;
  AreaList : any[] = [];
  btnType: string = '';
  public activeTabName: string = 'SalesMan Details';
  AreaRows: any[] = []; 
  AreaRowsTemp: any[] = [];
  CustomerRows: any[] = []; 
  CustomerRowsTemp: any[] = []; 
  scroll: boolean = true;
  gridHeight:number=350;
  reorderable = true;
  reorderableCust = true;
  SelectionType = SelectionType;
  selected: any[] = [];
  selectedCust: any[] =[];
  filterArea = { area_code: '', area_name: '' };
  CategoryList : string[] = [ 'OP', 'RGC'];
  filterCustomer: FilterCustomer = { name: '', major_customer: false, area_code: '' };
  allAreaRows: any[] = [];
  allcustomerRows: any[] = [];
  EngnrList: any[] = [];
  AreaGropList: any[] = [];
  selectedAreas: any[] = [];
  selectedAreasTemp: any[] = [];
  areaGroupRows: any[] = [];
  isNameInvalid: boolean = false;
  iscategoryInvalid: boolean = false;
  MajorCustomerList: any[] = [];
  SalesCustomerList: any[] = [];
  MajorCustomerListTemp: any[] = [];
  AllCustomerList: any[] = [];
  isEditable: boolean = true;

  constructor( private salesmanMasterService: SalesmanMasterService, public alertService: AlertService, public commonService: CommonService, public endPointService: EndPointService) {

    this.subscription.push(this.salesmanMasterService.clickedSalesman.subscribe(async x=>{
      this.salesmanMasterService.ControlsEnableAndDisable.next(true);
      if(!x.salesman_id){
        this.salesmanMasterModel =  new SalesmanMasterModel();
        return;
      }
      this.salesmanMasterModel = {...x};
      this.GetAreaGroupList(x.salesman_id);
      try {
        const items = await this.salesmanMasterService.getSalesmanAreaDetails(this.salesmanMasterModel.salesman_id);
        if (items && items.length) {
          this.AreaRows = items.slice(); 
          this.AreaRowsTemp = this.clone(this.AreaRows);
          this.allAreaRows = this.clone(this.AreaRows);
        } else {
          this.AreaRows = [];
          this.AreaRowsTemp = [];
          this.allAreaRows = [];
        }
      } catch (err) {
        console.error('Error fetching Area Details', err);
        this.AreaRows = [];
        this.AreaRowsTemp = [];
        this.allAreaRows = [];
      }

      try {
        const items = await this.salesmanMasterService.getSalesmanCustomerDetails(this.salesmanMasterModel.salesman_id);
        if (items && items.length) {
          this.CustomerRows = items.slice(); 
          this.CustomerRowsTemp = this.clone(this.CustomerRows);
          this.allcustomerRows = this.clone(this.CustomerRows);
        } else {
          this.CustomerRows = [];
          this.CustomerRowsTemp = [];
          this.allcustomerRows = [];
        }
      } catch (err) {
        console.error('Error fetching CustomerDetails', err);
        this.CustomerRows = [];
        this.CustomerRowsTemp = [];
        this.allcustomerRows = [];
      }
    }));

    this.subscription.push(this.salesmanMasterService.btnClick.subscribe(async x=>{
        if(x != ''){
        this.btnClickFunction(x);
     }
    }));
  }

  ngOnInit(): void {
    this.salesmanMasterService.getEngineerList().then((res: any[]) => {
      this.EngnrList = res;
    });

    this.salesmanMasterService.GetAreaGroupList(2147483647).then((res: any[]) => {
      this.AreaGropList = res;
      this.salesmanMasterService.AreaGropList = res;
    });

    this.salesmanMasterService.GetCustomerList().then((res: any[]) => {
      this.AllCustomerList = res;
    });
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
    this.itemDisable = true;
    this.saveDisable = true;
    this.saveMcDisable = true;
    this.cancelMcDisable= true;
    this.cancelDisable = true;
    this.areaGroupRows=[];
    this.AreaRows =[];
    this.areaGroupRows=[];
    this.AreaRowsTemp =[];
    this,this.CustomerRowsTemp =[];
    this.salesmanMasterService.disableGrid.next(false);
    this.salesmanMasterService.disabledItems.next(false);
    this.salesmanMasterService.btnClick.next('');
    this.salesmanMasterModel = new SalesmanMasterModel(); 
    this.salesmanMasterTemp = new SalesmanMasterModel();
  }

  clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  async btnClickFunction(x: string) {
    this.btnType = x;
    this.salesmanMasterTemp = {...this.salesmanMasterModel};
    this.selectedAreasTemp = this.clone(this.selectedAreas);
    if(x =='N'){
      this.salesmanMasterModel = new SalesmanMasterModel();
      this.selectedAreas = [];
      this.AreaRows = [];
      this.CustomerRows = [];
      this.saveDisable = false;
      this.cancelDisable = false;
      this.itemDisable =false;
    }else if(x =='M'){
      this.saveDisable = false;
      this.cancelDisable = false;
      this.cancelMcDisable = false;
      this.itemDisable =false;
      this.modifyDisable =false;
    }else if(x =='D'){
      this.onDelete();
    }
  }

  setActiveTab(name: string) {
    this.activeTabName = name;
  }

  getRowIdentity(row: any): any {
    return row.id; // unique identifier
  }

  getRowIdentityCust(row: any): any {
    return row.id; // unique identifier
  }

  onSubListActivate(event: any) {
    const rowItem = event.row;
    let rowIndex = this.AreaRows.indexOf(rowItem);

    if (event.type === 'keydown') {
      if (event.event.code === 'ArrowDown' && rowIndex < this.AreaRows.length - 1) {
        rowIndex++;
        this.selected = [this.AreaRows[rowIndex]];
        this.scrollToIndex(rowIndex);
      } else if (event.event.code === 'ArrowUp' && rowIndex > 0) {
        rowIndex--;
        this.selected = [this.AreaRows[rowIndex]];
        this.scrollToIndex(rowIndex);
      }
    }
  }

  scrollToIndex(index: number) {
    const rowHeight = this.AreaRows.length; // same as [rowHeight]
    const bodyElement = this.table?.element.querySelector('.datatable-body');

    if (bodyElement) {
      const maxScroll = bodyElement.scrollHeight - bodyElement.clientHeight;
      const targetScroll = index * rowHeight;

      bodyElement.scrollTop = Math.min(targetScroll, maxScroll);
    }
  }

  onSubListActivateCust(event: any) {
    const rowItem = event.row;
    let rowIndex = this.CustomerRows.indexOf(rowItem);

    if (event.type === 'keydown') {
      if (event.event.code === 'ArrowDown' && rowIndex < this.CustomerRows.length - 1) {
        rowIndex++;
        this.selectedCust = [this.CustomerRows[rowIndex]];
        this.scrollToIndexCust(rowIndex);
      } else if (event.event.code === 'ArrowUp' && rowIndex > 0) {
        rowIndex--;
        this.selectedCust = [this.CustomerRows[rowIndex]];
        this.scrollToIndexCust(rowIndex);
      }
    }
  }

  scrollToIndexCust(index: number) {
    const rowHeight = this.CustomerRows.length; // same as [rowHeight]
    const bodyElement = this.table?.element.querySelector('.datatable-body');

    if (bodyElement) {
      const maxScroll = bodyElement.scrollHeight - bodyElement.clientHeight;
      const targetScroll = index * rowHeight;

      bodyElement.scrollTop = Math.min(targetScroll, maxScroll);
    }
  }

  updateFilter(value: string, field: 'area_code' | 'area_name') {
    this.filterArea[field] = value;
    const areaCode = (this.filterArea.area_code || '').toLowerCase();
    const AreaName = (this.filterArea.area_name || '').toLowerCase();

    this.AreaRows = this.allAreaRows.filter(row => {
      const matchesAreaCode = !areaCode || (row.area_code?.toString().toLowerCase().includes(areaCode));
      const matchesAreaName = !AreaName || (row.area_name?.toString().toLowerCase().includes(AreaName));
      return matchesAreaCode && matchesAreaName;
    });
  }

  updateFilterCustomer<K extends keyof FilterCustomer>(
    value: FilterCustomer[K], 
    field: K
  ) {
    this.filterCustomer[field] = value;

    const Name = (this.filterCustomer.name || '').toLowerCase();
    const majorArea = (this.filterCustomer.area_code || '').toLowerCase();
    const majorCustomer = this.filterCustomer.major_customer;

    this.CustomerRows = this.allcustomerRows.filter(row => {
      const matchesName = !Name || (row.name?.toString().toLowerCase().includes(Name));
      const matchesArea = !majorArea || (row.area_code?.toString().toLowerCase().includes(majorArea));
      const matchesMC = !majorCustomer || row.major_customer === true;
      return matchesName && matchesMC && matchesArea; 
    });
  }

  getRowClass = (row: any) => {
    return row.major_customer ? 'highlight-row' : '';
  };

  cancelClickMethod(){
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.salesmanMasterService.disableGrid.next(false);
    this.AreaRows = [...this.AreaRowsTemp];
    this.CustomerRows = this.clone(this.CustomerRowsTemp);
    this.selectedAreas = this.clone(this.selectedAreasTemp);
    this.salesmanMasterModel = {...this.salesmanMasterTemp};
    this.salesmanMasterService.disabledItems.next(false);
    this.salesmanMasterService.btnClick.next('');
    this.salesmanMasterService.ControlsEnableAndDisable.next(true);
    this.isNameInvalid = false;
    this.iscategoryInvalid = false;
    this.saveMcDisable = true;
    this.cancelMcDisable= true;
    this.modifyDisable =true
  }

  GetAreaGroupList(salesman_id:any){
    this.salesmanMasterService.GetAreaGroupList(salesman_id).then((data: any) => {
      this.selectedAreas = data.map((item:any) => item.group_id);
    });
  }

  OnCategorySelect(event:any){
    this.areaGroupRows.forEach(item => {
      item.product_type = this.salesmanMasterModel.product_type; 
      console.log(item);
    })
  }

  OnAreaGroupChange(){
    this.areaGroupRows = [];
    if(this.selectedAreas.length == 0){
      this.salesmanMasterModel.product_type = null;
      return;
    }else{
      this.selectedAreas.forEach(areaId => {
        const areaGroup = {
          group_id: areaId,
          salesman_id: this.salesmanMasterModel.salesman_id,
          product_type: this.salesmanMasterModel.product_type
        };
        this.areaGroupRows.push(areaGroup);
      });
    }
  }

  async onSubmit(Form:any){
    const isValid = await this.validateForm(this.salesmanMasterModel);
    if (!isValid) {
      this.alertService.triggerAlert('Please fill all required fields.', 4000, 'error');
      return;
    }
    await this.AssignValues();

    this.salesmanMasterService.SaveSalesmanMaster(this.salesmanMasterSave, this.areaGroupRows,this.salesmanTarget)
    .subscribe({
      next: async (response: any) => {
        if(this.btnType == 'N'){
          this.alertService.triggerAlert('Row saved successfully...', 4000, 'success');
        }else{
          this.alertService.triggerAlert('Row modified successfully...', 4000, 'success');
        }
        await this.salesmanMasterService.getSalesmanMasterList(2);
        let item: SalesmanMasterModel | undefined = this.salesmanMasterService.mainList.find(item => item.salesman_id === response.salesmanMasterSave.salesman_id);
        if (item) {
          await this.salesmanMasterService.loadList.next(this.salesmanMasterService.mainList);
          this.salesmanMasterService.clickedSalesman.next(item); // pass single object
        }
        this.salesmanMasterService.btnClick.next('');
        this.saveDisable = true;
        this.cancelDisable = true;
        this.itemDisable = true;
        this.areaGroupRows=[];
        this.salesmanMasterService.disabledItems.next(false);
        this.salesmanMasterService.disableGrid.next(false);
        this.salesmanMasterService.ControlsEnableAndDisable.next(true);
      },
      error: (err) => {
        this.alertService.triggerAlert(err.error.message,4000, 'error');
        this.salesmanMasterService.btnClick.next('');
      }
    });
  }

  async validateForm(model: SalesmanMasterModel): Promise<boolean> {
    this.isNameInvalid = !model.salesman_name;
    if(this.selectedAreas.length != 0){
      this.iscategoryInvalid = !model.product_type;
    }
    const isValid = !(this.isNameInvalid || this.iscategoryInvalid);
    return isValid;
  }

  async AssignValues(){
    this.salesmanMasterSave= {
      salesman_id: this.salesmanMasterModel.salesman_id,
      company_code: this.endPointService.companycode,
      salesman_name: this.salesmanMasterModel.salesman_name,
      active: this.salesmanMasterModel.active,
      short_name: this.salesmanMasterModel.short_name,
      job_title: this.salesmanMasterModel.job_title,
      mobile_no: this.salesmanMasterModel.mobile_no,
      telephone: this.salesmanMasterModel.telephone,
      email: this.salesmanMasterModel.email,
      sales_engineer_id: this.salesmanMasterModel.sales_engineer_id,
      cash_invoice: this.salesmanMasterModel.cash_invoice,
      sales_dept: this.salesmanMasterModel.sales_dept,
      service_dept: this.salesmanMasterModel.service_dept,
      callcenter_agent: this.salesmanMasterModel.callcenter_agent,
      manager: this.salesmanMasterModel.manager,
      ...(this.btnType === 'N'
      ? {
          salesman_code: '',
          createdt :null
        }
      : {
          salesman_code: this.salesmanMasterModel.salesman_code,
          createdt: this.salesmanMasterModel.createdt
        })
    };

    this.salesmanTarget.salesman_id = this.salesmanMasterModel.salesman_id??0;
    this.salesmanTarget.hw_Bw_sales_target = this.salesmanMasterModel.hw_Bw_sales_target??0;
    this.salesmanTarget.hw_Clr_sales_target = this.salesmanMasterModel.hw_Clr_sales_target??0;
    this.salesmanTarget.rental_Bw_sales_target = this.salesmanMasterModel.rental_Bw_sales_target??0;
    this.salesmanTarget.rental_Clr_sales_target = this.salesmanMasterModel.rental_Clr_sales_target??0;
    this.salesmanTarget.rental_Bw_sales_op = this.salesmanMasterModel.rental_Bw_sales_op??0;
    this.salesmanTarget.rental_Clr_sales_op = this.salesmanMasterModel.rental_Clr_sales_op??0;

  }

  async onDelete(){
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    this.salesmanMasterService.DeleteSalesman(this.salesmanMasterModel.salesman_id)
    .subscribe(
      (updatedList: any[]) => {
        this.salesmanMasterService.getSalesmanMasterList(1);
        this.salesmanMasterService.btnClick.next('');
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.salesmanMasterService.btnClick.next('')
      }
    );
  }

  AddMajorCustomer(){
    const newMc ={
      name : null,
      area_code : null,
      major_customer : true
    }
    this.CustomerRows.unshift(newMc);
    this.MajorCustomerListTemp.push(newMc);
  }

  SaveMajorCustomer(){
     this.salesmanMasterService.SaveMajorCustomer(this.MajorCustomerList,this.SalesCustomerList)
    .subscribe({
      next: async (response: any) => {
        const items = await this.salesmanMasterService.getSalesmanCustomerDetails(this.salesmanMasterModel.salesman_id);
        if (items && items.length) {
          this.CustomerRows = items.slice(); 
          this.CustomerRowsTemp = this.clone(this.CustomerRows);
          this.allcustomerRows = this.clone(this.CustomerRows);
        } else {
          this.CustomerRows = [];
          this.CustomerRowsTemp = [];
          this.allcustomerRows = [];
        }
        this.MajorCustomerListTemp = [];
        this.MajorCustomerList = [];
        this.SalesCustomerList = [];
        this.saveMcDisable = true;
        this.cancelMcDisable = true; 
      },
      error: (err) => {
        this.alertService.triggerAlert(err.error.message,4000, 'error');
        this.salesmanMasterService.btnClick.next('');
      }
    });
  }

  getDisableState(rowIndex: number): boolean {
    if (this.MajorCustomerListTemp && this.MajorCustomerListTemp.length > 0) {
      const lastRowIndex = 0;
      return rowIndex !== lastRowIndex;
    }else{
      if (this.isEditable) {
        return true;
      }
    }
    return false;
  }

  cancelMCClickMethod(){
    this.CustomerRows = [...this.CustomerRowsTemp];
    this.MajorCustomerListTemp = [];
    this.MajorCustomerList = [];
    this.SalesCustomerList = [];
    this.saveMcDisable = true;
    this.cancelMcDisable = true; 
    this.cancelClickMethod();
  }

  ModifyMCbtn(){
    this.saveMcDisable = false;
    this.cancelMcDisable= false;
  }

  deleteRow(row: any): void {
    const creditItem = this.CustomerRows.find(cust => cust.creditcustomerid === row.creditcustomerid);
    const majorItem = this.MajorCustomerListTemp.find(cust => cust.creditcustomerid === row.creditcustomerid);

    if(creditItem && majorItem){
      const indexMajor = this.MajorCustomerListTemp.findIndex(item => item.creditcustomerid === row.creditcustomerid);
      if (indexMajor > -1) {
        this.MajorCustomerListTemp.splice(indexMajor, 1);
      }
      const indexCredit = this.CustomerRows.findIndex(item => item.creditcustomerid === row.creditcustomerid);
      if (indexCredit > -1) {
        this.CustomerRows.splice(indexCredit, 1);
      }
      const indexMajorOr = this.MajorCustomerList.findIndex(item => item.customer_id === row.creditcustomerid);
      if (indexMajorOr > -1) {
        this.MajorCustomerList.splice(indexMajorOr, 1);
      }
      const indexMajorSale = this.SalesCustomerList.findIndex(item => item.customer_id === row.creditcustomerid);
      if (indexMajorSale > -1) {
        this.SalesCustomerList.splice(indexMajorSale, 1);
      }
    }else{
      const indexCredit = this.CustomerRows.findIndex(item => item.creditcustomerid === row.creditcustomerid);
      if (indexCredit > -1) {
        this.CustomerRows.splice(indexCredit, 1);
      }
      this.salesmanMasterService.deleteMajorCutomer(row.creditcustomerid,this.salesmanMasterModel.salesman_id)
      .subscribe(
        (updatedList: any[]) => {
          this.alertService.triggerAlert('Custome removed the Row...', 4000, 'success');
        },
        (error) => {
        
        }
      );
    }
  }

  CustomerChange(row:any){
    const item = this.AllCustomerList.find(cust => cust.creditcustomerid === row.creditcustomerid);
    if (item) {
      row.area_code = item.area_code;
    }else{
      row.area_code = null;
    }

    const newMcSave ={
      id : null,
      customer_id : row.creditcustomerid,
      salesman_id : this.salesmanMasterModel.salesman_id,
      entry_date :null
    }
    this.MajorCustomerList.push(newMcSave);

    const newMcSales ={
      id : null,
      customer_id : row.creditcustomerid,
      salesman_id : this.salesmanMasterModel.salesman_id,
      user_id: localStorage.getItem('user_id'),
      entry_date :null
    }
    this.SalesCustomerList.push(newMcSales);

    // Keep only items in MajorCustomerList that are also present in CustomerRows
    this.MajorCustomerList = this.MajorCustomerList.filter(mc =>
      this.CustomerRows.some(cr => cr.creditcustomerid === mc.customer_id)
    );

    this.SalesCustomerList = this.SalesCustomerList.filter(mc =>
      this.CustomerRows.some(cr => cr.creditcustomerid === mc.customer_id)
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

interface FilterCustomer {
  name: string;
  area_code: string;
  major_customer: boolean;
}