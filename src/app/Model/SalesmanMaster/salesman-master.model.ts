export class SalesmanMasterModel {
    salesman_id: any;
    salesman_name: any;
    salesman_code: any;
    short_name: any;
    job_title: any;

    mobile_no: any;
    telephone: any;
    email: any;
    sales_engineer_id: any;
    engineer: any;
    active: any = true;
    cash_invoice: any;
    service_dept: any;
    sales_dept: any;
    callcenter_agent: any;
    manager: any;
    createdt: any;
    product_type: any;

    hw_Bw_sales_target: any;
    hw_Clr_sales_target: any;
    rental_Bw_sales_target: any;
    rental_Clr_sales_target: any;
    rental_Bw_sales_op: any;
    rental_Clr_sales_op: any;
}

export class SalesmanMasterSave{
    salesman_id: any;
    company_code: any;
    salesman_code: any;
    salesman_name: any;
    active: any;
    short_name: any;
    job_title: any;
    mobile_no: any;
    telephone: any;
    email: any;
    sales_engineer_id: any;
    cash_invoice: any;
    sales_dept: any;
    service_dept: any;
    callcenter_agent: any;
    manager: any;
    createdt: any;
}

export class SalesmanMasterSearch{
    group_id : any;
    area_code : any;
    active: any;
    cash_invoice: any;
    sales_dept: any;
    service_dept: any;
    callcenter_agent: any;
    manager: any;
}

export class SalesmanTarget{
    salesman_id: any;
    hw_Bw_sales_target: any;
    hw_Clr_sales_target: any;
    rental_Bw_sales_target: any;
    rental_Clr_sales_target: any;
    rental_Bw_sales_op: any;
    rental_Clr_sales_op: any;
}