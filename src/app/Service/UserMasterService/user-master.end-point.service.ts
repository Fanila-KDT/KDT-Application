import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class UserMasterEndpointService {
  getList: string = "";
  saveUserMaster: string = "";
  deleteUserMaster: string = ""; 
  getSearchList: string = "";   
  getCompanyCode: string = "";   
  GetRoles: string = ""; 
  GetPermissions: string = ""; 
  GetPermissionsbyRoleName: string = "";
  GetPermissionsbyRoleId: string = "";
  saveRoleMaster: string = ""; 
  AddPermission: string = ""; 
  DeleteRole: string = "";
  GetUserRoleById: string = "";
  GetPermissionList: string = "";


  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/UserMaster";
    
    this.getList = apiHostingURL;
    this.saveUserMaster = apiHostingURL + "/saveUserMaster";
    this.deleteUserMaster = apiHostingURL + "/deleteUserMaster";
    this.getSearchList = apiHostingURL + "/getSearchList";
    this.getCompanyCode = apiHostingURL + "/getCompanyCode";
    this.GetRoles = apiHostingURL + "/getRoles";
    this.GetPermissions = apiHostingURL + "/getPermissions";
    this.saveRoleMaster = apiHostingURL + "/saveRoleMaster";
    this.AddPermission = apiHostingURL + "/addPermission";
    this.GetPermissionsbyRoleName = apiHostingURL + "/getPermissionsbyRoleName";
    this.DeleteRole = apiHostingURL + "/deleteRole";
    this.GetPermissionsbyRoleId = apiHostingURL + "/getPermissionsbyRoleId";
    this.GetUserRoleById = apiHostingURL + "/getUserRoleById";
    this.GetPermissionList = apiHostingURL + "/getPermissionList";
  }
}