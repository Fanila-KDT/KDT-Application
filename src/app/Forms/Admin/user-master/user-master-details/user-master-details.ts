import { Component, Pipe, PipeTransform } from '@angular/core';
import { UserMasterModel, UserRolesItems } from '../../../../Model/UserMaster/user-master.model';
import { Subscription } from 'rxjs';
import { AlertService } from '../../../../shared/alert/alert.service';
import { UserMasterService } from '../../../../Service/UserMasterService/user-master-service';
import Swal from 'sweetalert2';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';

@Component({
  selector: 'user-master-details',
  standalone: false,
  templateUrl: './user-master-details.html',
  styleUrls: ['./user-master-details.css','../../../common.css'],
})
export class UserMasterDetails {

  subscription: Subscription[] = new Array<Subscription>();
  userMasterModel: UserMasterModel = new UserMasterModel();
  userMasterModelTemp: UserMasterModel = new UserMasterModel();
  userRolesItems:UserRolesItems[]= [];
  outletList: any[] = [];
  companyList: any[] = [];
  invList: any[] = [];
  saleList: any[] = [];
  roleList: any[] = [];
  previousRoles: number[] = [];
  ShoePermissionList: any[] = [];
  ShoePermissionListTemp: any[] = []; 
  selectedRoles: number[] = [];
  selectedRolesTemp: number[] = [];
  isUserIdInvalid: boolean = false;
  isCompanyInvalid: boolean = false;
  isPasswordInvalid: boolean = false;
  isRoleInvalid: boolean = false;
  isUserNameInvalid: boolean = false;
  isOutletInvalid: boolean = false;
  itemDisable: boolean = true;
  saveDisable: boolean = true;
  cancelDisable: boolean = true;
  btnType: string="";
  sortField: string = 'roleName';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(public userMasterService:UserMasterService,private alertService: AlertService,public userAccessService:UserAccessService) {
     this.subscription.push(this.userMasterService.clickedUser.subscribe(x=>{
      if(!x){
        this.userMasterModel =  new UserMasterModel();
        this.ShoePermissionList = [];
        return;
      }
      this.userMasterModel={...x};
      this.Fetchvalues();
    }));

    this.subscription.push(this.userMasterService.btnClick.subscribe(x=>{
      this.btnClickFunction(x);
    }));

    this.subscription.push(this.userMasterService.cancelClick.subscribe(x=>{
      if(x){
        this.cancelClickMethod();
      }
    }));
  }

  ngOnInit() {
    this.userMasterService.GetCompanyCode().then((res:any)=>{
      this.companyList = res;
    });

    this.userMasterService.GetRoles().then((res:any)=>{
      this.roleList = res;
    });
  }

  btnClickFunction(x: string) {
    this.btnType = x;
    this.userMasterModelTemp = {...this.userMasterModel};
    if(x =='N'){
      this.selectedRolesTemp = [...this.selectedRoles];
      this.ShoePermissionListTemp = [...this.ShoePermissionList];
      this.userMasterModel = new UserMasterModel();
      this.selectedRoles = [];
      this.ShoePermissionList = [];
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

  async onSubmit(userForm: any) {
    const isValid = await this.validateForm(this.userMasterModel);
    if (!isValid) {
      this.alertService.triggerAlert('Please fill all required fields.', 4000, 'error');
      return;
    }
    if(this.btnType === 'M'){
      const userRolesItems = this.ShoePermissionList.map(p => ({
        UserRoleID: p.UserRoleID,
        roleID: p.roleID,
        UserID: p.UserID
      }));
    }

    this.userMasterService.SaveuserMaster(this.userMasterModel, this.userRolesItems)
    .then((res: any) => {
      if (this.btnType === 'N') {
        this.userMasterService.addRowAfterSave.next(res.userMaster);
        this.alertService.triggerAlert('Saved Successfully...', 4000, 'success');
      }
      if (this.btnType === 'M') {
        this.userMasterService.addRowAfterModify.next(res.userMaster);
        this.alertService.triggerAlert('Modified Successfully...', 4000, 'success');
      }
      this.userMasterModel = { ...res.userMaster };
      this.itemDisable = true;
      this.saveDisable = true;
      this.cancelDisable = true;
      this.userMasterService.disableGrid.next(false);
      this.userMasterService.disabledItems.next(false);
      this.userMasterService.btnClick.next('');
      this.userAccessService.CheckUserAccess(this.userMasterService.FormName,this.userMasterService);
    })
    .catch(error => {
      console.error('SaveuserMaster error:', error);
      this.alertService.triggerAlert('Failed to save user. Please try again.', 4000, 'error');
      this.userMasterService.btnClick.next('');
    });
  }

  cancelClickMethod(){
    this.userMasterService.disableGrid.next(false);
    this.userMasterModel = {...this.userMasterModelTemp};
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.userMasterService.disabledItems.next(false);
    this.userMasterService.btnClick.next('');
    this.isUserIdInvalid = false;
    this.isUserNameInvalid = false;
    this.isPasswordInvalid = false;
    this.isRoleInvalid = false;
    this.ShoePermissionList  = [...this.ShoePermissionListTemp];
    this.selectedRoles = [...this.selectedRolesTemp];
    this.userAccessService.CheckUserAccess(this.userMasterService.FormName,this.userMasterService);
  }

  async onDelete(){
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    this.userMasterService.deleteUserMaster(this.userMasterModel.user_id)
    .subscribe(
      (updatedList: any[]) => {
        this.userMasterService.loadList.next(updatedList);
        this.userMasterService.clickedUser.next(updatedList[0]);
        this.alertService.triggerAlert('Row deleted successfully...', 4000, 'success');
        this.userMasterService.btnClick.next('');
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.userMasterService.btnClick.next('');
      }
    );
  }

  async validateForm(model: UserMasterModel): Promise<boolean> {
    // Reset all flags
    this.isUserIdInvalid = !model.user_id?.trim();
    this.isUserNameInvalid = !model.user_name?.trim();
    this.isPasswordInvalid = !model.password?.trim();
    this.isRoleInvalid = this.selectedRoles.length === 0;
    // Password is mandatory only when btnType === 'N'
    if (this.btnType === 'N') {
      this.isPasswordInvalid = !model.password?.trim();
    } else {
      this.isPasswordInvalid = false; // ignore password for edit/update
    }
    //this.isOutletInvalid = !model.godown_code;
    // Final validity check
    const isValid = !(
      this.isUserIdInvalid ||
      this.isUserNameInvalid ||
      this.isPasswordInvalid ||
      this.isRoleInvalid
      //this.isOutletInvalid ||
      //this.isCompanyInvalid
    );
    return isValid;
  }

  async onRoleNameChange() {
    const currentRoles: number[] = (this.selectedRoles || []).map(r => +r);
    const previousRoles: number[] = (this.previousRoles || []).map(r => +r);
    // Find newly added roles
    const newRoles = currentRoles.filter(id => !previousRoles.includes(id));
    for (const roleID of newRoles) {
      const res: any[] = await this.userMasterService.GetPermissionsbyRoleId(roleID);
      this.ShoePermissionList = [...this.ShoePermissionList, ...res];
    }
    // Find removed roles
    const removedRoles = previousRoles.filter(id => !currentRoles.includes(id));
    if (removedRoles.length) {
      this.ShoePermissionList = this.ShoePermissionList.filter(p => !removedRoles.includes(+p.roleID));
    }
    // Deduplicate
    this.ShoePermissionList = this.ShoePermissionList.filter(
      (item, index, self) =>
        index === self.findIndex(p => p.permissionID === item.permissionID && +p.roleID === +item.roleID)
    );
    // Sort
    this.ShoePermissionList.sort((a, b) => a.permissionName.localeCompare(b.permissionName));
    // ✅ Rebuild userRolesItems from currentRoles
    this.userRolesItems = currentRoles.map(roleID => ({
      UserRoleID: null,
      roleID: roleID,
      UserID: this.userMasterModel.user_id,
    }));
    // Update tracker AFTER processing
    this.previousRoles = [...currentRoles];
  }


  Fetchvalues(){
    this.userMasterService.selectedUserId = this.userMasterModel.user_id;
    this.userMasterService.GetUserRoleById(this.userMasterModel.user_id).then((roles: any) => {
      if (Array.isArray(roles)) {
        this.selectedRoles = roles.map((r: any) => r.roleID);
      } else if (roles) {
        this.selectedRoles = [roles.roleID];
      } else {
        this.selectedRoles = [];
      }
      // ✅ Initialize previousRoles here
      this.previousRoles = [...this.selectedRoles];
      // ✅ Now fetch permissions for all selected roles
      const promises = this.selectedRoles.map(roleID =>
        this.userMasterService.GetPermissionsbyRoleId(roleID)
      );
      Promise.all(promises).then(results => {
        // results is an array of arrays → flatten it
        this.ShoePermissionList = results.flat();

        // ✅ Deduplicate by permissionID + roleID
        this.ShoePermissionList = this.ShoePermissionList.filter(
          (item, index, self) =>
            index === self.findIndex(p => p.permissionID === item.permissionID && p.roleID === item.roleID)
        );
        // ✅ Sort once by permissionName
        //this.ShoePermissionList.sort((a, b) => a.permissionName.localeCompare(b.permissionName));
      });
    });
  }

  setSort(field: string) {
  if (this.sortField === field) {
    // toggle direction if same field clicked
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    // new field → reset to ascending
    this.sortField = field;
    this.sortDirection = 'asc';
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

@Pipe({ name: 'orderBy',standalone: false })
export class OrderByPipe implements PipeTransform {
  transform(array: any[], field: string, direction: 'asc' | 'desc' = 'asc'): any[] {
    if (!Array.isArray(array) || !field) return array;

    return [...array].sort((a, b) => {
      const valA = a[field];
      const valB = b[field];

      const strA = typeof valA === 'string' ? valA.toLowerCase() : valA;
      const strB = typeof valB === 'string' ? valB.toLowerCase() : valB;

      if (strA < strB) return direction === 'asc' ? -1 : 1;
      if (strA > strB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }
}

