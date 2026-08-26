export class EngineerMasterModel {
    engineer_id: any;
    id: any;
    engineer: any;
    email_id: any;
    docuware_active: any = true;
    inactive: any = false;
    createdt: any;
    salesman_name: any;
    orig_user: any;
}

export class EngineerMasterSave{
    engineer_id: any;
    id: any;
    engineer: any;
    email_id: any;
    docuware_active: any;
    inactive: any;
    createdt: any;
    companycode: any;
}

export class EngineerMasterSearch{
    docuware_active: any;
    inactive: any;
    active: any;
}