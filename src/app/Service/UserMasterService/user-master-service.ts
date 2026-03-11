import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../../shared/alert/alert.service';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { UserMasterEndpointService } from './user-master.end-point.service';
import { PermissionItems, RoleMaster, UserMasterModel, UserRolesItems } from '../../Model/UserMaster/user-master.model';

@Injectable({
  providedIn: 'root'
})
export class UserMasterService {
  public mainList:UserMasterModel[]=[];  
  public loadList = new BehaviorSubject<UserMasterModel[]>([]);
  GetRolesList = new BehaviorSubject<UserRolesItems[]>([]);

  public clickedUser = new BehaviorSubject<UserMasterModel>(new UserMasterModel()) ;
  public addRowAfterSave = new BehaviorSubject<UserMasterModel>(new UserMasterModel()) ;
  public addRowAfterModify = new BehaviorSubject<UserMasterModel>(new UserMasterModel()) ;

  public disableGrid = new BehaviorSubject<boolean>(false);
  public disabledItems = new BehaviorSubject<boolean>(false);
  public isLoading = new BehaviorSubject<boolean>(false);
  public newDisabled = new BehaviorSubject<boolean>(false);
  public editDisabled = new BehaviorSubject<boolean>(false);
  public deleteDisabled = new BehaviorSubject<boolean>(false);
  public ngOnInit = new BehaviorSubject<boolean>(false);
  public cancelClick = new BehaviorSubject<boolean>(false);
  public btnClick = new BehaviorSubject<string>('');

  FormName='USER_MASTER';
  public selectedUserId : string =""
  
  constructor(private httpClient:HttpClient, private endpointService: UserMasterEndpointService,private alertService:AlertService) { }

  async getUserMasterList(){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<UserMasterModel[]>(this.endpointService.getList)
      );
      this.mainList = res;
      this.loadList.next(res);
      this.clickedUser.next(res[0]);

      return res; // ✅ Return the response
    } catch (error) {
      console.error('getUserMasterList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  async SaveuserMaster(userMaster: UserMasterModel,UserRoles:any[]): Promise<any> {  
    try {
       const payload = {
        userMaster: userMaster,
        UserRoles: UserRoles
      };
      const res = await firstValueFrom(
        this.httpClient.post<any>(this.endpointService.saveUserMaster, payload)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('SaveuserMaster : ', error);
      const message = 'Something went wrong while Saving user. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return null; // Return null on error
    }   
  }

  deleteUserMaster(user_id: string): Observable<UserMasterModel[]> {
    return this.httpClient.delete<UserMasterModel[]>(this.endpointService.deleteUserMaster + '/' + user_id);
  }

  async SearchList(searchList: any): Promise<void> {
    const params = new HttpParams({ fromObject: { ...searchList } });

    try {
      const res = await firstValueFrom(
        this.httpClient.get<UserMasterModel[]>(await this.endpointService.getSearchList, { params })
      );

      if (Array.isArray(res)) {
        this.mainList = res;
        this.loadList.next(res);
        this.clickedUser.next(res[0]);
      } else {
        console.warn('Unexpected response format:', res);
        this.mainList = [];
      }
    } catch (error) {
      console.error('SearchList error:', error);
      this.alertService.triggerAlert('Something went wrong while fetching search items.', 4000, 'error');
    }
  }

  async GetCompanyCode(){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.getCompanyCode)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetCompanyCode : ', error);
      const message = 'Something went wrong while Fetching Foreign Company Code. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  async GetRoles(){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetRoles)
      );
      this.GetRolesList.next(res);
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetRoles : ', error);
      const message = 'Something went wrong while Fetching Roles Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  async GetPermissions(){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetPermissions)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetPermissions : ', error);
      const message = 'Something went wrong while Fetching Permissions Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  async GetPermissionsbyRoleName(roleName:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetPermissionsbyRoleName + '/' + roleName)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetPermissionsbyRoleName : ', error);
      const message = 'Something went wrong while Fetching Permissions Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  async saveRoleMaster(roleMaster: RoleMaster, permissions: any[]) {
    const payload = {
      roleMaster: roleMaster,
      permissions: permissions
    };
    return this.httpClient.post(`${this.endpointService.saveRoleMaster}`, payload);
  }

  AddPermission(permission: any): Observable<any> {
    return this.httpClient.post(this.endpointService.AddPermission, permission);
  }

  deleteRole(roleID: string): Observable<any> {
    return this.httpClient.delete<any>(this.endpointService.DeleteRole + '/' + roleID);
  }

  async GetPermissionsbyRoleId(roleName:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetPermissionsbyRoleId + '/' + roleName)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetPermissionsbyRoleId : ', error);
      const message = 'Something went wrong while Fetching Permissions Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

   async GetUserRoleById(userId: number): Promise<any> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any>(`${this.endpointService.GetUserRoleById}/${userId}`)
      );
      return res;
    } catch (error) {
      console.error('GetUserById error:', error);
      throw error;
    }
  }

   async GetPermissionList(user_id: any): Promise<any[]> {
      try {
        const params = new HttpParams().set('user_id', user_id);  
        const res = await firstValueFrom(
          this.httpClient.get<any[]>(this.endpointService.GetPermissionList, { params })
        );
        return res; // ✅ Return the response
      } catch (error) {
        console.error('GetSubListByMainCode : ', error);
        const message = 'Something went wrong while Fetching Sub Group List. Please try again.';
        this.alertService.triggerAlert(message, 4000, 'error');
        return []; // Return empty array on error
      } 
    }
}
