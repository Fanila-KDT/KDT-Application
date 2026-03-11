export class SupplierMasterModel {
    ac_code : any;
    account_code : any;
    account_name : any;
    account_description : any;
    account_status : any;
    main_group_code : any = 51;
    sub_group_code : any;
    group_name : any;
    cur_no : any;
    cur_name : any;
    vendor_customer : any ='VENDOR';	
    company_code : any;
    createdt : any;
    address : any;
    address1 : any;
    address2 : any;
    telephone1 : any;
    telephone2 : any;
    concerned_person : any;
}

export class SupplierAddressModel {
    account_code : any;
    address : any;
    address1 : any;
    address2 : any;
    telephone1 : any;
    telephone2 : any;
    concerned_person : any;
}

export class SupplierMasterModalSearch {
    ac_code : any;
    account_name : any;
    account_description : any;
}

export class SupplierMasterModelSave {
    ac_code : any;
    account_code : any;
    account_name : any;
    account_description : any;
    account_status : any;
    main_group_code  : any = 51;
    sub_group_code : any;
    company_code : any;
    createdt : any;
    cur_no : any;
    vendor_customer : any ='VENDOR';
}
