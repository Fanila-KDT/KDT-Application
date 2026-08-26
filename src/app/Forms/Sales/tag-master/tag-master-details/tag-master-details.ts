import { Component } from '@angular/core';
import { TagMasterDetailsSave, TagMasterModel, TagMasterSave } from '../../../../Model/TagMaster/tag-master.model';
import { Subscription } from 'rxjs';
import { TagMasterService } from '../../../../Service/TagMasterService/tag-master-service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { EndPointService } from '../../../../Service/end-point.services';
import { ProductMasterService } from '../../../../Service/ProductMasterService/product-master-service';
import { EngineerMasterService } from '../../../../Service/EngineerMasterService/engineer-master-service';
import { DateModelSales } from '../../../../Model/CommonModel';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'tag-master-details',
  standalone: false,
  templateUrl: './tag-master-details.html',
  styleUrls: ['./tag-master-details.css','../../../common.css'],
  providers: [DatePipe]
})
export class TagMasterDetails {
  tagMasterModel: TagMasterModel = new TagMasterModel();
  tagMasterTemp: TagMasterModel = new TagMasterModel();
  tagMasterSave: TagMasterSave = new TagMasterSave ();
  tagMasterDetailsSave: TagMasterDetailsSave = new TagMasterDetailsSave ();
  dateModel: DateModelSales = new DateModelSales();
  subscription: Subscription[] = new Array<Subscription>();
  itemDisable: boolean = true;
  sysAdDisable: boolean = true;
  serialDisable: boolean = true;
  tagAdDisable: boolean = true;
  saveDisable: boolean = true;
  cancelDisable: boolean = true;
  btnType: string = '';
  isTagIdlInvalid: boolean = false;
  isSerialInvalid: boolean = false;
  isModelNameInvalid: boolean = false;
  isEngineerInvalid: boolean = false;
  isCustomerInvalid: boolean = false;
  isMobileInvalid: boolean = false;
  isTelephoneInvalid: boolean = false;
  isAreaInvalid: boolean = false;
  isStreetInvalid: boolean = false;
  BrandList:any[] = [];
  AreaList:any[] = [];
  ItemList:any[] = [];
  EngineerList:any[] = []; 
  SalesManList:any[] = [];
  SalesManListTemp:any[] = [];
  CustomerList:any[] = [];
  CustomerListTemp:any[] = [];
  ModelDisable:boolean =true;
  ActiveMngmtList : string[] = [ 'Pending', 'Installed', 'Not Installed', 'Not Interested'];
  MachineStatList : string[] = [ 'Under Warranty', 'Non Guarantee', 'Dead', 'STANDBY MACHINE','Leased To Back', 'Leased To Own', 'Leased to KDT', 'SERVICE CONTRACT','CLICK CONTRACT'];

  constructor(private engineerMasterService: EngineerMasterService,private productMasterService:ProductMasterService, private tagMasterService: TagMasterService,
     public alertService: AlertService, public commonService: CommonService, public endPointService: EndPointService,private datePipe: DatePipe) {

    this.subscription.push(this.tagMasterService.clickedTag.subscribe(async x=>{
      if(!x.tag_id){
        this.tagMasterModel =  new TagMasterModel();
        return;
      }
      this.tagMasterService.ControlsEnableAndDisable.next(true);
      this.tagMasterModel = {...x};
      if(this.tagMasterModel.other_company){
        this.ModelDisable = false;
      }else{
        this.ModelDisable = true;
      }
    }));

    this.subscription.push(this.tagMasterService.btnClick.subscribe(async x=>{
        if(x != ''){
        this.btnClickFunction(x);
     }
    }));
  }

  async btnClickFunction(x: string) {
    this.btnType = x;
    this.tagMasterTemp = {...this.tagMasterModel};
    this.SalesManListTemp = [...this.SalesManList];
    this.CustomerListTemp = [...this.CustomerList];
    this.ModelDisable =  true;
    this.SalesManList = await this.tagMasterService.GetSalesManList(2);
    this.CustomerList = await this.tagMasterService.GetCustomerList(2);  
    if(x =='N'){
      this.tagMasterModel = new TagMasterModel();
      this.saveDisable = false;
      this.cancelDisable = false;
      this.itemDisable = false;
      this.sysAdDisable = true;
      this.tagAdDisable = true;
      this.serialDisable = false;
    }else if(x =='M'){
      this.saveDisable = false;
      this.cancelDisable = false;
      this.itemDisable =false;
      this.sysAdDisable = !this.commonService.isSystemAdmin.value;
      this.serialDisable = !this.commonService.isSystemAdmin.value;
      this.tagAdDisable = !this.commonService.isTagAdmin.value;
    }else if(x =='D'){
      this.onDelete();
    }
  }

  async ngOnInit() {
    try {
      this.ItemList = JSON.parse(sessionStorage.getItem('ItemList')||'');  
      this.BrandList = await this.productMasterService.GetBrandList(); 
      this.AreaList = await this.tagMasterService.GetAreaList();  
      this.tagMasterService.AreaList = [...this.AreaList];  
      this.EngineerList = await this.tagMasterService.GetEngineerList(1);  
      this.SalesManList = await this.tagMasterService.GetSalesManList(1); 
      this.CustomerList = await this.tagMasterService.GetCustomerList(1); 
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
    this.tagMasterService.disableGrid.next(false);
    this.tagMasterModel = new TagMasterModel();
    this.tagMasterService.disabledItems.next(false);
    this.tagMasterService.btnClick.next('');
    this.tagMasterService.ControlsEnableAndDisable.next(true);
    this.isTagIdlInvalid = false;
    this.isModelNameInvalid = false;
    this.isSerialInvalid = false;
    this.isEngineerInvalid = false;
    this.isCustomerInvalid = false;
    this.isMobileInvalid = false;
    this.isTelephoneInvalid = false;
    this.isAreaInvalid = false;
    this.isStreetInvalid = false;
    this.sysAdDisable = true;
    this.tagAdDisable = true;
    this.serialDisable = true;
    if(this.tagMasterModel.other_company){
      this.ModelDisable = false;
    }else{
      this.ModelDisable = true;
    }
  }

  onDateSelected(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.tagMasterModel.warranty_startdate = date;
  }

  formatToDateInput(value: string): void {
    this.tagMasterModel.warranty_startdate = value;
  }

  onDateSelected1(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.tagMasterModel.warranty_enddate = date;
  }

  formatToDateInput1(value: string): void {
    this.tagMasterModel.warranty_enddate = value;
  }

  async ItemCodeEnter(item_no:any){
    if(!this.tagMasterModel.other_company){
      this.tagMasterModel.model_name = this.ItemList.find(x => x.item_no === item_no)?.item_name_abbr;
      const response  = await this.tagMasterService.GetBrandAndPT(item_no); 
      this.tagMasterModel.brand_id = response[0].brand_id;
      this.tagMasterModel.category_name = response[0].category_name;
    }
  }

  OtherCompanyChange(event:any){
    if(event.target.checked){
      this.ModelDisable = false;
      this.tagMasterModel.item_no = null;
      this.tagMasterModel.model_name = null;
    }else{
      this.ModelDisable = true;
      this.tagMasterModel.model_name = null;
    }
  }

  async onSubmit(Form:any){
    const isValid = await this.validateForm(this.tagMasterModel);
    if (!isValid) {
      this.alertService.triggerAlert('Please fill all required fields.', 4000, 'error');
      return;
    }

    await this.AssignValues();

    this.tagMasterService.SaveTagMaster(this.tagMasterSave, this.tagMasterDetailsSave,this.dateModel)
    .subscribe({
      next: async (response: any) => {
        if(this.btnType == 'N'){
          this.alertService.triggerAlert('Row saved successfully...', 4000, 'success');
        }else{
          this.alertService.triggerAlert('Row modified successfully...', 4000, 'success');
        }
        await this.tagMasterService.getTagMasterList(2);
        let item: TagMasterModel | undefined = this.tagMasterService.mainList.find(item => item.tag_id === response.tagMasterSave.tag_id);
        if (item) {
          await this.tagMasterService.loadList.next(this.tagMasterService.mainList);
          this.tagMasterService.clickedTag.next(item); // pass single object
        }
        this.tagMasterService.btnClick.next('');
        this.saveDisable = true;
        this.cancelDisable = true;
        this.itemDisable = true;
        this.sysAdDisable = true;
        this.tagAdDisable = true;
        this.serialDisable = true;
        this.tagMasterService.disabledItems.next(false);
        this.tagMasterService.disableGrid.next(false);
        this.tagMasterService.ControlsEnableAndDisable.next(true);
      },
      error: (err) => {
        this.alertService.triggerAlert(err.error,4000, 'error');
        this.tagMasterService.btnClick.next('');
      }
    });
  }

  async validateForm(model: TagMasterModel): Promise<boolean> {
    this.isTagIdlInvalid = !model.tag_no;
    this.isSerialInvalid = !model.serial_no;
    this.isModelNameInvalid = !model.model_name;
    this.isEngineerInvalid = !model.engineer_id;
    this.isCustomerInvalid = !model.customer_id;
    this.isMobileInvalid = !model.mobile_no;
    this.isTelephoneInvalid = !model.telephone_no;
    this.isAreaInvalid = !model.area_id;
    this.isStreetInvalid = !model.street;
    
    const isValid = !(this.isTagIdlInvalid || this.isSerialInvalid || this.isModelNameInvalid || this.isEngineerInvalid || this.isCustomerInvalid || 
                      this.isMobileInvalid || this.isTelephoneInvalid || this.isAreaInvalid || this.isStreetInvalid);
    return isValid;
  }

    async AssignValues(){
    var newTagId = await this.commonService.GetGuid();
    this.tagMasterSave= {
      companycode: this.endPointService.companycode,
      tag_no: this.tagMasterModel.tag_no,
      serial_no: this.tagMasterModel.serial_no,
      item_no: this.tagMasterModel.item_no,
      model_name: this.tagMasterModel.model_name,
      customer_id: this.tagMasterModel.customer_id??null,
      other_company: this.tagMasterModel.other_company,
      user_id: localStorage.getItem('user_id'),
      inactive:this.tagMasterModel.inactive,
      status_type:this.tagMasterModel.status_type??null,
      warranty_startdate:this.tagMasterModel.warranty_startdate??null,
      warranty_enddate:this.tagMasterModel.warranty_enddate??null,
      installation_date:this.tagMasterModel.installation_date??null,
      title:this.tagMasterModel.title??null,
      contact_person:this.tagMasterModel.contact_person??null,
      department:this.tagMasterModel.department??null,
      mobile_no:this.tagMasterModel.mobile_no,
      telephone_no:this.tagMasterModel.telephone_no,
      area_id:this.tagMasterModel.area_id,
      engineer_id:this.tagMasterModel.engineer_id,
      brand_id:this.tagMasterModel.brand_id,
      invoice_id:this.tagMasterModel.invoice_id??null,
      salesman_id:this.tagMasterModel.salesman_id??null,
      salesman_id_area:this.tagMasterModel.salesman_id_area,
      contract_id:this.tagMasterModel.contract_id??null,
      pm_duration:this.tagMasterModel.pm_duration??null,
      pm_hold:this.tagMasterModel.pm_hold,
      pm_day:this.tagMasterModel.pm_day??null,
      narration:this.tagMasterModel.narration??null,
      cost_rate:this.tagMasterModel.cost_rate??null,
      dead:this.tagMasterModel.dead,
      special_tag:this.tagMasterModel.special_tag,
      verified:this.tagMasterModel.verified,
      ...(this.btnType === 'N'
      ? {
          tag_id: newTagId,
          createdt :null,

        }
      : {
          tag_id: this.tagMasterModel.tag_id,
          createdt: this.tagMasterModel.createdt
        })
    };

    this.tagMasterDetailsSave= {
      tag_id : this.tagMasterModel.tag_id??newTagId,
      block_no : this.tagMasterModel.block_no??null,
      street : this.tagMasterModel.street??null,
      house_no : this.tagMasterModel.house_no??null,
      building_no : this.tagMasterModel.building_no??null,
      building_name : this.tagMasterModel.building_name??null,
      floor_no : this.tagMasterModel.floor_no??null,
      flat_no : this.tagMasterModel.flat_no??null,
      address : null,
      fax_no : this.tagMasterModel.fax_no??null,
      paci : this.tagMasterModel.paci??null,
      active_managment : this.tagMasterModel.active_managment??null,
      AM_Remarks : this.tagMasterModel.aM_Remarks??null,
    };

    if(this.btnType === 'M'){
      const warranty_enddate = this.datePipe.transform(this.tagMasterModel.warranty_enddate, 'dd/MM/yyyy');
      this.dateModel.warranty_enddate = warranty_enddate;
      const warranty_startdate = this.datePipe.transform(this.tagMasterModel.warranty_startdate, 'dd/MM/yyyy');
      this.dateModel.warranty_startdate = warranty_startdate;
    }
    
  }

  cancelClickMethod(){
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.SalesManList= [...this.SalesManListTemp];
    this.CustomerList = [...this.CustomerListTemp];
    this.tagMasterService.disableGrid.next(false);
    this.tagMasterModel = {...this.tagMasterTemp};
    this.tagMasterService.disabledItems.next(false);
    this.tagMasterService.btnClick.next('');
    this.tagMasterService.ControlsEnableAndDisable.next(true);
    this.isTagIdlInvalid = false;
    this.isModelNameInvalid = false;
    this.isSerialInvalid = false;
    this.isEngineerInvalid = false;
    this.isCustomerInvalid = false;
    this.isMobileInvalid = false;
    this.isTelephoneInvalid = false;
    this.isAreaInvalid = false;
    this.isStreetInvalid = false;
    this.sysAdDisable = true;
    this.tagAdDisable = true;
    this.serialDisable = true;
    if(this.tagMasterModel.other_company){
      this.ModelDisable = false;
    }else{
      this.ModelDisable = true;
    }
  }

  async onDelete(){
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    this.tagMasterService.DeleteTagMaster(this.tagMasterModel.tag_id)
    .subscribe(
      (updatedList: any[]) => {
        this.tagMasterService.getTagMasterList(1);
        this.tagMasterService.btnClick.next('');
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.tagMasterService.btnClick.next('')
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

