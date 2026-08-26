import { Component } from '@angular/core';
import { EngineerMasterModel, EngineerMasterSave } from '../../../../Model/EngineerMaster/engineer-master.model';
import { Subscription } from 'rxjs';
import { EngineerMasterService } from '../../../../Service/EngineerMasterService/engineer-master-service';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { EndPointService } from '../../../../Service/end-point.services';
import { SalesmanMasterSave } from '../../../../Model/SalesmanMaster/salesman-master.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'engineer-master-details',
  standalone: false,
  templateUrl: './engineer-master-details.html',
  styleUrls: ['./engineer-master-details.css','../../../common.css']
})
export class EngineerMasterDetails {
  engineerMasterModel: EngineerMasterModel = new EngineerMasterModel();
  engineerMasterTemp: EngineerMasterModel = new EngineerMasterModel();
  engineerMasterSave: EngineerMasterSave = new EngineerMasterSave();
  salesmanMasterSave: SalesmanMasterSave = new SalesmanMasterSave();
  subscription: Subscription[] = new Array<Subscription>();
  itemDisable: boolean = true;
  saveDisable: boolean = true;
  cancelDisable: boolean = true;
  btnType: string = '';
  isNameInvalid: boolean = false;

  constructor( private engineerMasterService: EngineerMasterService, public alertService: AlertService, public commonService: CommonService, public endPointService: EndPointService) {
  
    this.subscription.push(this.engineerMasterService.clickedEngineer.subscribe(async x=>{
      if(!x){
        this.engineerMasterModel =  new EngineerMasterModel();
        return;
      }
      this.engineerMasterService.ControlsEnableAndDisable.next(true);
      this.engineerMasterModel = {...x};
    }));

    this.subscription.push(this.engineerMasterService.btnClick.subscribe(async x=>{
        if(x != ''){
        this.btnClickFunction(x);
     }
    }));
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.engineerMasterService.disableGrid.next(false);
    this.engineerMasterModel = new EngineerMasterModel();
    this.engineerMasterService.disabledItems.next(false);
    this.engineerMasterService.btnClick.next('');
    this.engineerMasterService.ControlsEnableAndDisable.next(true);
  }

  async btnClickFunction(x: string) {
    this.btnType = x;
    this.engineerMasterTemp = {...this.engineerMasterModel};
    if(x =='N'){
      this.engineerMasterModel = new EngineerMasterModel();
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
    const isValid = await this.validateForm(this.engineerMasterModel);
    if (!isValid) {
      this.alertService.triggerAlert('Please fill all required fields.', 4000, 'error');
      return;
    }

    await this.AssignValues();

    this.engineerMasterService.SaveEngineerMaster(this.engineerMasterSave,this.salesmanMasterSave)
    .subscribe({
      next: async (response: any) => {
        if(this.btnType == 'N'){
          this.alertService.triggerAlert('Row saved successfully...', 4000, 'success');
        }else{
          this.alertService.triggerAlert('Row modified successfully...', 4000, 'success');
        }
        await this.engineerMasterService.getEngineerMasterList(2);
        let item: EngineerMasterModel | undefined = this.engineerMasterService.mainList.find(item => item.engineer_id === response.engineerMasterSave.engineer_id);
        if (item) {
          await this.engineerMasterService.loadList.next(this.engineerMasterService.mainList);
          this.engineerMasterService.clickedEngineer.next(item); // pass single object
        }
        this.engineerMasterService.btnClick.next('');
        this.saveDisable = true;
        this.cancelDisable = true;
        this.itemDisable = true;
        this.engineerMasterService.disabledItems.next(false);
        this.engineerMasterService.disableGrid.next(false);
        this.engineerMasterService.ControlsEnableAndDisable.next(true);
      },
      error: (err) => {
        this.alertService.triggerAlert(err.error.message,4000, 'error');
        this.engineerMasterService.btnClick.next('');
      }
    });
  }

  async validateForm(model: EngineerMasterModel): Promise<boolean> {
    // Reset validation flags
    this.isNameInvalid = !model.engineer;
    const isValid = !(this.isNameInvalid );
    return isValid;
  }
  
  cancelClickMethod(){
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.engineerMasterService.disableGrid.next(false);
    this.engineerMasterModel = {...this.engineerMasterTemp};
    this.engineerMasterService.disabledItems.next(false);
    this.engineerMasterService.btnClick.next('');
    this.engineerMasterService.ControlsEnableAndDisable.next(true);
    this.isNameInvalid = false;
  }

  async AssignValues(){
    const engineer_id = await this.commonService.GetGuid();
    this.engineerMasterSave = {
      engineer_id:this.engineerMasterModel.engineer_id??engineer_id,
      id: this.engineerMasterModel.id,
      engineer: this.engineerMasterModel.engineer,
      email_id: this.engineerMasterModel.email_id,
      docuware_active: this.engineerMasterModel.docuware_active,
      inactive: this.engineerMasterModel.inactive,
      companycode: this.endPointService.companycode,
      ...(this.btnType === 'N'
      ? {
          createdt :null
        }
      : {
          createdt: this.engineerMasterModel.createdt
        })
    };

    this.salesmanMasterSave= {
      salesman_id: 0,
      company_code: this.endPointService.companycode,
      salesman_name: this.engineerMasterModel.engineer,
      active: !this.engineerMasterModel.inactive,
      short_name: null,
      job_title: null,
      mobile_no: null,
      telephone: null,
      email: this.engineerMasterModel.email_id,
      sales_engineer_id: engineer_id,
      cash_invoice: false,
      sales_dept: true,
      service_dept: false,
      callcenter_agent: false,
      manager: false,
      salesman_code: '',
      createdt :null
    };
  }

  async onDelete(){
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    this.engineerMasterService.DeleteEngineer(this.engineerMasterModel.engineer_id)
    .subscribe(
      (updatedList: any[]) => {
        this.engineerMasterService.getEngineerMasterList(1);
        this.engineerMasterService.btnClick.next('');
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.engineerMasterService.btnClick.next('')
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
