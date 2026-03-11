import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserMasterService } from '../../../Service/UserMasterService/user-master-service';
import { AlertService } from '../../../shared/alert/alert.service';
import { PermissionItems, RoleMaster, RolePermissionMaster, UserMasterModel, UserRolesItems } from '../../../Model/UserMaster/user-master.model';
import { Pipe, PipeTransform } from '@angular/core';
import { App } from '../../../app';

@Component({
  selector: 'app-user-master',
  standalone: false,
  templateUrl: './user-master.html',
  styleUrls: ['./user-master.css','../../common.css']
})
export class UserMaster {
  subscription: Subscription[];
  outletList: any[] = [];
  roleList: any[] = [];
  permList: any[] = [];
  selectedPermissions: any[] = [];
  userMasterModalSearch:UserMasterModel = new UserMasterModel();
  roleMaster:RoleMaster = new RoleMaster();
  permissionItems:PermissionItems = new PermissionItems();
  rolePermissionMaster:RolePermissionMaster= new RolePermissionMaster();
  userRolesItems:UserRolesItems = new UserRolesItems();
  newDisable: boolean = false;
  modifyDisable: boolean = false;
  deleteDisable: boolean = false;
  searchDisable: boolean = false;
  refreshDisable: boolean = false;
  showModalSearch: boolean = false;
  isRoleInvalid: boolean = false;
  ShowAddPermission: boolean = false;
  NewDivVisible: boolean = true;
  ModifyDivVisible: boolean = false;
  DeleteVisible: boolean = false;
  showModal = false;
  filterText : any;
  errorMessage: string = '';
  errorMessageRole: string = '';
  SuccessMessage: string = '';
  btnType: string = 'N';
  flags: { [key: string]: boolean } = {
  newDisable: true,
  modifyDisable: true,
  deleteDisable: true
};

  constructor(public app:App,public userMasterService:UserMasterService,private alertService:AlertService) {
    this.subscription = new Array<Subscription>();

    this.subscription.push(this.userMasterService.disabledItems.subscribe(data=>{
      this.newDisable = data;
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.searchDisable = data;
    }));
    
    this.subscription.push(this.userMasterService.GetRolesList.subscribe((roles: UserRolesItems[]) => {
      this.roleList = roles;
    }));

    const subs = [
      { obs: this.userMasterService.newDisabled, setter: (val: boolean) => this.newDisable = val },
      { obs: this.userMasterService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.userMasterService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val }
    ];

    subs.forEach(s => {
      this.subscription.push(s.obs.subscribe(s.setter));
    });

  }

  ngOnInit(): void {
   
  }

  buttonClick(type: 'N' | 'M' | 'D') {
    if(type != 'D'){
      this.newDisable = true;
      this.modifyDisable = true;
      this.deleteDisable = true;
      this.searchDisable = true;
      this.userMasterService.disableGrid.next(true);
    }
    this.userMasterService.btnClick.next(type);
  }

  Search(){
    this.showModalSearch = true;
  }

  modalCancel(){
    this.showModalSearch = false;
    this.userMasterModalSearch.user_name = null; 
    this.userMasterModalSearch.user_id = null; 
    //this.userMasterModalSearch.godown_code = null; 
  }

  modalSearch(){
    const model = {
      user_id: this.userMasterModalSearch.user_id?.toString().trim() || '',
      //godown_code: this.userMasterModalSearch.godown_code || '',
      user_name: this.userMasterModalSearch.user_name?.trim() || ''
    };
    this.userMasterService.isLoading.next(true);
    this.userMasterService.SearchList(model)
    .then(() => {
      this.showModalSearch = false;
      this.userMasterModalSearch.user_id = null;
      //this.userMasterModalSearch.godown_code = null;
      this.userMasterModalSearch.user_name = null;
      this.userMasterService.isLoading.next(false);
    })
    .catch(error => {
      console.error('Error while searching:', error);
    });
  }

  Refresh(){
    this.userMasterService.ngOnInit.next(true);
  }

  addRoles() {
    this.showModal = true;
    this.userMasterService.GetPermissions().then((res:any)=>{
      this.permList = res;
    });
  }

  closeModal() {
    this.ModifyDivVisible = false;
    this.NewDivVisible = true;
    this.roleMaster.RoleName = '';
    this.showModal = false;
    this.isRoleInvalid = false;
    this.selectedPermissions = [];
    this.btnType = 'N';
    this.rolePermissionMaster.RoleID = null;
    this.DeleteVisible = false;
  }

  onCheckboxChangePerm(perm: any) {
    if (perm.selected) {
      const exists = this.selectedPermissions.find(
        p => p.PermissionID === perm.permissionID || p.permissionID === perm.permissionID
      );
      if (!exists) {
        if(this.btnType === 'N'){
          const model: RolePermissionMaster = {
            RoleID:  null,          
            PermissionID: perm.permissionID,
            level_of_rights: perm.inputValue ? perm.inputValue : 0
          };
          this.selectedPermissions.push(model);
        }else{
          const model: RolePermissionMaster = {
            RoleID:  this.rolePermissionMaster.RoleID,          
            PermissionID: perm.permissionID,
            level_of_rights: perm.inputValue ? perm.inputValue : 0
          };
          this.selectedPermissions.push(model);
        }
      } else {
        exists.level_of_rights = perm.inputValue ? perm.inputValue : 0;
      }
    } else {
      this.selectedPermissions = this.selectedPermissions.filter(
        p => p.PermissionID !== perm.permissionID && p.permissionID !== perm.permissionID
      );
      perm.inputValue = ''; 
    }
    console.log('Selected Permissions:', this.selectedPermissions);
  }
  
  async saveModal(){
    if(this.btnType === 'N'){
      const isValid = await this.validateForm(this.roleMaster);
      if (!isValid) {
        this.errorMessageRole = '⚠️ Please fill Role Name';
        setTimeout(() => {
          this.errorMessageRole = '';
        }, 3000);
        return;
      }
    }else{
      this.roleMaster.RoleID= this.rolePermissionMaster.RoleID;
    }
   
    this.errorMessageRole = '';
    
    const hasZeroRights = this.selectedPermissions.some(
      p => Number(p.level_of_rights) === 0
    );

    if (hasZeroRights) {
      this.errorMessage = '⚠️ Please assign a valid level of rights for all selected permissions.';
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);
      return;
    }
    this.errorMessage = '';

    this.selectedPermissions = this.selectedPermissions.map(({ rolePermissionID, ...rest }) => rest);
    if(this.selectedPermissions.length === 0){
      this.errorMessage = '⚠️ Please select at least one permission.';
      this.errorMessage = '⚠️ Please assign a valid level of rights for all selected permissions.';
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);
      return;
    }

    (await this.userMasterService.saveRoleMaster(this.roleMaster, this.selectedPermissions))
      .subscribe({
        next:async (response: any)  => {
         if (this.btnType === 'N'){
          this.SuccessMessage='✅ Role added successfully...';
          this.selectedPermissions =[];
          this.roleMaster = new RoleMaster();
          this.permList.forEach(perm => {
            perm.selected = false;
            perm.inputValue = '';
          });
         }else{
            this.SuccessMessage='✅ Role Midified successfully...';
          }
          this.userMasterService.GetRoles().then((res:any)=>{
            this.roleList = res;
          });
          setTimeout(() => {
            this.SuccessMessage = '';
          }, 3000);
        },
      error: (err) => {
        this.alertService.triggerAlert('Failed to add the Row...',4000, 'error');
      }
    });
  }

  async validateForm(model: RoleMaster): Promise<boolean> {
    // Reset all flags
    this.isRoleInvalid = !model.RoleName?.trim();
    const isValid = !(
      this.isRoleInvalid 
    );
    return isValid;
  }

  async addPermission(){
    this.ShowAddPermission = true;
  }

  addPermissionCancel(){
    this.ShowAddPermission = false;
    this.permissionItems.PermissionName='';
    this.permissionItems.Description='';
  }

  addPermissionOk() {
    this.permissionItems.PermissionName = this.permissionItems.PermissionName.trim();
    this.userMasterService.AddPermission(this.permissionItems).subscribe({
      next: (response: any) => {
        // ✅ Handle success response from API
        this.permList.push(response);

        this.ShowAddPermission = false;
        this.permissionItems.PermissionName = '';
        this.permissionItems.Description = '';

        this.SuccessMessage = 'New Permission added successfully';
        setTimeout(() => {
          this.SuccessMessage = '';
        }, 3000);
      },
      error: (err) => {
        // ✅ Handle error response
        console.error('Error while Adding New Permission:', err);
        this.alertService.triggerAlert('Error while Adding New Permission', 4000, 'error');
      }
    });
  }

  updateRole() {
    this.btnType = 'M';
    this.NewDivVisible = false;
    this.DeleteVisible = false;
    this.ModifyDivVisible = true;
  }

  onRoleNameChange(){
    this.userMasterService.GetPermissionsbyRoleName(this.rolePermissionMaster.RoleID).then((res:any)=>{
      this.selectedPermissions = res;
      // Update permList based on res
      this.permList.forEach(perm => {
        const match = res.find((r:any) => r.permissionID === perm.permissionID);
        if (match) {
          perm.selected = true;
          perm.inputValue = match.level_of_rights; // set rights level if available
        } else {
          perm.selected = false;
          perm.inputValue = '';
        }
      });
    });
  }

  deleteRoleBtn() {
    this.btnType = 'D';
    this.NewDivVisible = false;
    this.DeleteVisible = true;
    this.ModifyDivVisible = false;
  } 

  deleteRole() {
    this.userMasterService.deleteRole(this.rolePermissionMaster.RoleID)
    .subscribe(
      (updatedList: any) => {
        this.alertService.triggerAlert('Row deleted successfully...', 4000, 'error');
        this.rolePermissionMaster.RoleID = null;
        this.closeModal();
        this.userMasterService.GetRoles().then((res:any)=>{
          this.roleList = res;
        });
        setTimeout(() => {
          this.errorMessageRole = '';
        }, 3000);
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.userMasterService.btnClick.next('')
      }
    );
  } 
}

@Pipe({ name: 'filter' })
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;
    searchText = searchText.toLowerCase();
    return items.filter(it =>
      it.permissionName.toLowerCase().includes(searchText) ||
      it.permissionID.toString().includes(searchText)
    );
  }
}