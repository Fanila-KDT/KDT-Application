export class PurchaseOrderModel {
    voucher_id:any
    document_number :any;
    register_code :any;
    register_name : any;
    account_code :any;
    account_name :any;
    approval_status : any;
    voucher_date : any;
    voucherDate: any;
    order_no : any;
    //request_no :any;
    payterm_id: any;
    mode_shipment :any;
    voucher_reference :any;
    narration :any;
    line_amount :any;
    discount :any = 0;
    enter_amount :any;
    approver_remarks :any;
    cur_no :any;
    foreign_line_amount :any;
    foreign_discount_amount :any = 0;
    foreign_enter_amount :any;
    created_by :any;
    modified_by :any;
    created_date :any;
    modified_date :any;
    approved_by :any;
    company_code :any;
    period_id :any;
}

export class ItemDetailsModel{
    rowguid :any;
    voucher_id :any;
    seq_no :any;
    item_no :any;
    item_details :any;
    unit_id :any;
    item_code :any;
    item_name_abbr :any;
    fgn_rate :any;
    receipt_quantity :any;
    retail_rate :any;
    fgn_total :any;
    line_no : any
    enter_rate : any
    pamount : any
    item_discount :any;
}

export class PurchaseOrderModalSearch {
    register_code : any = 0 ;
    account_code: any = 0;
    document_number :any ='';
    approval_status : any ='';
}