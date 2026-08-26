export class CustomerMasterModel {
    creditcustomerid:any;
    cardno:any;
    name:any;
    market_channel_name:any;
    mobileno:any;
    area_code:any;
    collector_name:any;
    arabic_name :any;
    contract_cust :any;
    accrued_rev :any;
    major_customer :any;
    area_id :any;
    telephone :any;
    fax_no :any;
    contact_person :any;
    title :any;
    department :any;
    house_no :any;
    street :any;
    building_no :any;
    building_name :any;
    block_no :any;
    floor_no :any;
    flat_no :any;
    email_id :any;
    paci_no :any;
    address :any;
    main_group_code :any = 83;
    sub_group_code :any;
    collector_id :any;
    accountcode :any;
    blacklist :any;
    blacklist_reason :any;
    ac_code :any;
    salesman_name :any;
    major_cust :any;
    createdt : any;
}

export class CustomerMasterSave{
    creditcustomerid:any;
    cardno :any;
    name :any;
    arabic_name :any;
    market_channel_name :any;
    accountcode :any;
    main_group_code :any;
    sub_group_code :any;
    mobileno :any;
    telephone :any;
    contact_person :any;
    title :any;
    department :any;
    area_id :any;
    house_no :any;
    street :any;
    building_no :any;
    building_name :any;
    block_no :any;
    floor_no :any;
    flat_no :any;
    email_id :any;
    address :any;
    fax_no :any;
    paci_no :any;
    collector_id :any;
    contract_cust :any=0;
    accrued_rev :any=0;
    major_customer :any=0;
    blacklist :any=0;
    blacklist_reason :any="";
    companycode :any;
    user_id :any;
    createdt:any;
}

export class CustomerMasterSearch{
    cardno :any;
    name :any;
    market_channel_name :any;
    blacklist :any;
    major_customer :any;
    collector_id :any;
}