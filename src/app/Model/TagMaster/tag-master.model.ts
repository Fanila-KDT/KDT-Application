export class TagMasterModel {
    tag_id  :any;
    tag_no  :any;
    serial_no  :any;
    item_no  :any;
    model_name  :any;
    customer_id  :any;
    other_company  :any = false;
    user_id  :any;
    inactive  :any = false;
    status_type  :any;
    warranty_startdate  :any;
    warranty_enddate  :any;
    installation_date  :any;
    title  :any;
    contact_person  :any;
    department  :any;
    mobile_no  :any;
    telephone_no  :any;
    area_id  :any;
    engineer_id  :any;
    brand_id  :any;
    invoice_id  :any;
    salesman_id  :any;
    salesman_id_area  :any;
    contract_id  :any;
    pm_duration  :any;
    pm_hold  :any = false;
    pm_day  :any;
    narration  :any;
    cost_rate  :any;
    dead  :any = false;;
    special_tag  :any = false;
    verified  :any = false;
    companycode  :any;
    createdt  :any;
    item_name  :any;
    //cardno  :any;
    name  :any;
    area_code  :any;
    area_name  :any;
    group_code  :any;
   // id  :any;
    engineer  :any;
    document_number  :any;
    voucher_date  :any;
    salesman_code  :any;
    salesman_name  :any;
    o_CustID  :any;
    o_CustName  :any;
   // salesmanCode_Area  :any;
    salesmanName_Area  :any;
    icode  :any;
    warrantyStartdate  :any;
    warrantyEnddate  :any;
    installationDate  :any;
    category_name  :any;
    active_managment  :any;
    aM_Remarks  :any;
    paci  :any;
    fax_no  :any;
    flat_no  :any;
    house_no  :any;
    building_no  :any;
    floor_no  :any;
    block_no  :any;
    street  :any;
    building_name  :any;

    // future add columns

    last_submit_cont  :any;
}

export class TagMasterSave{
    tag_id :any;
    tag_no :any;
    serial_no :any;
    item_no :any;
    model_name :any;
    customer_id :any;
    other_company :any;
    user_id :any;
    inactive :any;
    status_type :any;
    warranty_startdate :any;
    warranty_enddate :any;
    installation_date :any;
    title :any;
    contact_person :any;
    department :any;
    mobile_no :any;
    telephone_no :any;
    area_id :any;
    engineer_id :any;
    brand_id :any;
    invoice_id :any;
    salesman_id :any;
    salesman_id_area :any;
    contract_id :any;
    pm_duration :any;
    pm_hold :any;
    pm_day :any;
    narration :any;
    cost_rate :any;
    dead :any;
    special_tag :any;
    verified :any;
    companycode :any;
    createdt :any;
}

export class TagMasterDetailsSave{
    tag_id :any;
    block_no :any;
    street :any;
    house_no :any;
    building_no :any;
    building_name :any;
    floor_no :any;
    flat_no :any; 
    address :any;
    fax_no :any;
    paci :any;
    active_managment :any;
    AM_Remarks :any;
}

export class TagMasterSearch{
   area_id:any;
   inactive:any;
   dead:any;
   verified:any
}