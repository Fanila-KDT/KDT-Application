import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { UserMasterService } from "../UserMasterService/user-master-service";
import { CommonService } from "../CommonService/common-service";

@Injectable({
  providedIn: 'root'
})
export class UserAccessService {
  HeaderName: BehaviorSubject<string>;
  username =new BehaviorSubject<string>('');
  logout = new BehaviorSubject<boolean>(false);
  userAccessList: any[] = [];
  
  constructor(private http: HttpClient,public userMasterService:UserMasterService,public commonService: CommonService) {
    const storedHeader = localStorage.getItem('HeaderName') || 'dashboard';
    this.HeaderName = new BehaviorSubject<string>(storedHeader);
  }

  ngOnInit() {
    let user_id = sessionStorage.getItem('user_id');
    let Logi =  localStorage.setItem('LoginUser','IN');
    this.userMasterService.GetPermissionList(user_id).then((res:any)=>{
       this.userAccessList = res.map((p: any) => ({
        ...p,
        permissionName: p.permissionName.trim() // clean trailing spaces
      }));
      localStorage.setItem('userAccessList', JSON.stringify(this.userAccessList));
      // Re‑emit header so NavigationComponent updates
      //const storedHeader = localStorage.getItem('HeaderName') || 'dashboard';
      //this.setHeader(storedHeader);
    });
  }

  getLevel(permissionName: string): number {
    const perm = this.userAccessList.find(
      p => p.permissionName.trim().toUpperCase() === permissionName.trim().toUpperCase()
    );
    return perm ? perm.level_of_rights : 0; // default 0 if no permission
  }


  CheckUserAccess(PageName: string, Service:any){
    const cached = localStorage.getItem('userAccessList');
    if (cached) {
      this.userAccessList = JSON.parse(cached);
    }

    const Permissions = this.userAccessList.filter(
      p => p.permissionName.trim().toUpperCase() === PageName.trim().toUpperCase()
    );

    // Pick the one with max level_of_rights
    const LargestPermissions = Permissions.reduce((prev:any, current:any) =>
      current.level_of_rights > prev.level_of_rights ? current : prev
    );
    let level = LargestPermissions ? LargestPermissions.level_of_rights : 0;
    Service.newDisabled?.next(level < 2);    // enabled from level 2+
    Service.editDisabled?.next(level < 3);   // enabled from level 3+
    Service.deleteDisabled?.next(level < 4); // enabled from level 4+
  }

  CheckPeriodAccess(approval_status:string,period_status: string, data_entry_status: string): boolean {
    const cached = localStorage.getItem('userAccessList');
    if (cached) {
      this.userAccessList = JSON.parse(cached);
    }

    // Rule 1: Block if period is closed
    if (period_status === 'Closed') {
      return false;
    }

    // Rule 2: Period open but data entry closed without permission
    const hasAdjustmentPermission = this.userAccessList?.some( (u: any) => u.permissionName === 'PERIOD_POST_ADJUSTMENT' );
    if (period_status === 'Open' && data_entry_status === 'Closed' && !hasAdjustmentPermission) {
      return false;
    }

    // Rule 3: Allow modify only if Draft 
    const isSystemAdmin = this.userAccessList?.some( (u: any) => u.permissionName === 'SYSTEM_ADMIN' );
    if (!isSystemAdmin ) {
      return false;
    }else{
      this.commonService.isSystemAdmin.next(true);
    }
    // ✅ Passed all checks
    return true;
  }


}
