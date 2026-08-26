import { Component } from '@angular/core';
import { AreaMasterModel } from '../../../../Model/AreaMaster/area-master.model';
import { Subscription } from 'rxjs';
import { AreaMasterService } from '../../../../Service/AreaMasterService/area-master-service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { EndPointService } from '../../../../Service/end-point.services';
import Swal from 'sweetalert2';

@Component({
  selector: 'area-master-details',
  standalone: false,
  templateUrl: './area-master-details.html',
  styleUrls: ['./area-master-details.css','../../../common.css']
})
export class AreaMasterDetails {
  areaMasterModel: AreaMasterModel = new AreaMasterModel();
  areaMasterTemp: AreaMasterModel = new AreaMasterModel();
  subscription: Subscription[] = new Array<Subscription>();
  itemDisable: boolean = true;
  saveDisable: boolean = true;
  cancelDisable: boolean = true;
  btnType: string = '';
  isAreaCodeInvalid: boolean = false;
  isAreaGroupInvalid: boolean = false;
  isDescriptionInvalid: boolean = false;
  AreaList:any[] = [];

  constructor( private areaMasterService: AreaMasterService, public alertService: AlertService, public commonService: CommonService, public endPointService: EndPointService) {
  
    this.subscription.push(this.areaMasterService.clickedArea.subscribe(async x=>{
      if(!x){
        this.areaMasterModel =  new AreaMasterModel();
        return;
      }
      this.areaMasterService.ControlsEnableAndDisable.next(true);
      this.areaMasterModel = {...x};
    }));

    this.subscription.push(this.areaMasterService.btnClick.subscribe(async x=>{
        if(x != ''){
        this.btnClickFunction(x);
     }
    }));
  }

  ngOnInit(): void {
  this.areaMasterService.GetAreaGroupList().then((res: any[]) => {
      this.AreaList = res;
      this.areaMasterService.AreaList =res;
    });
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.areaMasterService.disableGrid.next(false);
    this.areaMasterModel = new AreaMasterModel();
    this.areaMasterService.disabledItems.next(false);
    this.areaMasterService.btnClick.next('');
    this.areaMasterService.ControlsEnableAndDisable.next(true);
  }

  async btnClickFunction(x: string) {
    this.btnType = x;
    this.areaMasterTemp = {...this.areaMasterModel};
    if(x =='N'){
      this.areaMasterModel = new AreaMasterModel();
      this.saveDisable = false;
      this.cancelDisable = false;
      this.itemDisable =false;
    }else if(x =='M'){
      this.saveDisable = false;
      this.cancelDisable = false;
      this.itemDisable =false;
    }else if(x =='D'){
      this.onDelete();
    }
  }

  async onSubmit(Form:any){
    const isValid = await this.validateForm(this.areaMasterModel);
    if (!isValid) {
      this.alertService.triggerAlert('Please fill all required fields.', 4000, 'error');
      return;
    }
    this.areaMasterModel.companycode = this .endPointService.companycode;
    this.areaMasterService.SaveAreaMaster(this.areaMasterModel)
    .subscribe({
      next: async (response: any) => {
        if(this.btnType == 'N'){
          this.alertService.triggerAlert('Row saved successfully...', 4000, 'success');
        }else{
          this.alertService.triggerAlert('Row modified successfully...', 4000, 'success');
        }
        await this.areaMasterService.getAreaMasterList(2);
        let item: AreaMasterModel | undefined = this.areaMasterService.mainList.find(item => item.area_id === response.area_id);
        if (item) {
          await this.areaMasterService.loadList.next(this.areaMasterService.mainList);
          this.areaMasterService.clickedArea.next(item); // pass single object
        }
        this.areaMasterService.btnClick.next('');
        this.saveDisable = true;
        this.cancelDisable = true;
        this.itemDisable = true;
        this.areaMasterService.disabledItems.next(false);
        this.areaMasterService.disableGrid.next(false);
        this.areaMasterService.ControlsEnableAndDisable.next(true);
      },
      error: (err) => {
        this.alertService.triggerAlert(err.error.message,4000, 'error');
        this.areaMasterService.btnClick.next('');
      }
    });
  }

  async validateForm(model: AreaMasterModel): Promise<boolean> {
    // Reset validation flags
    this.isAreaCodeInvalid = !model.area_code;
    this.isAreaGroupInvalid = !model.group_id;
    this.isDescriptionInvalid = !model.area_name;
    const isValid = !(this.isAreaCodeInvalid || this.isAreaGroupInvalid || this.isDescriptionInvalid );
    return isValid;
  }

  cancelClickMethod(){
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.areaMasterService.disableGrid.next(false);
    this.areaMasterModel = {...this.areaMasterTemp};
    this.areaMasterService.disabledItems.next(false);
    this.areaMasterService.btnClick.next('');
    this.areaMasterService.ControlsEnableAndDisable.next(true);
    this.isAreaCodeInvalid = false;
    this.isAreaGroupInvalid = false;
    this.isDescriptionInvalid = false;
  }

  async onDelete(){
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    this.areaMasterService.DeleteAreaMaster(this.areaMasterModel.area_id)
    .subscribe(
      (updatedList: any[]) => {
        this.areaMasterService.getAreaMasterList(1);
        this.areaMasterService.btnClick.next('');
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.areaMasterService.btnClick.next('')
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

