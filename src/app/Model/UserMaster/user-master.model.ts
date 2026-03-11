export class UserMasterModel {
    user_id: any;
    user_name: any;
    password: any;
   // last_log_in: any;
   // last_log_out: any;
   // godown_code : any;
    company_code: any = 1;
   // discount: any;
   // salesman_id: any;
    inactive: any = false;
   // invoice_godown_code: any;
}

export class RoleMaster{
    RoleID :any;
    RoleName: any;
    IsActive:any = true;
}


export class RolePermissionMaster{
    RoleID: any;
    PermissionID:any;
    level_of_rights:any;
}

export class PermissionItems{
    PermissionName: any;
    Description: any;
}

export class UserRolesItems{
    UserRoleID: any;
    UserID: any;
    roleID: any;
}