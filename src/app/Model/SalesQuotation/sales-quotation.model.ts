export class SalesQuotationModel {
    voucher_id :any;
    document_number :any;
    voucher_date :any = new Date();
    cust_code :any;
    register_code :any;
    total_amount :any;
    discount :any;
    tradein_discount :any;
    net_amount :any;
    approval_status :any ;
    narration :any;
    reference :any;
    salesman_id :any;
    contact_person :any;
    contact_no :any;
    warranty :any;
    validity :any;
    payterm_id :any;
    delivery :any ;
    subject :any;
    card_holder_name :any;
    email_id :any;
    location :any;
    created_by :any;
    modified_by :any;
    modified_on :any;
    period_id :any;
    company_code :any;
    createdt :any;
    salesman_name :any;
    voucherDate :any;
    name :any;
    modified_date :any;
    created_date :any;
    new:any;
    status_remarks:any;
}

export class SalesQuotationDetails{
    detail_id :any;
    voucher_id :any;
    seq_no :any;
    item_no :any;
    order_quantity :any;
    unit_price :any;
    access_total :any;
    total_price :any;
    master_item :any;
    general_features :any;
    copier_features :any;
    printer_features :any;
    scanner_features :any;
    paper_handling :any;
    item_name :any;
    approved :any;
    item_code:any;
    item_name_abbr:any;
}

export class SalesQuotationDetailModel{
    detail_id :any;
    voucher_id :any;
    seq_no :any;
    item_no :any;
    order_quantity :any;
    unit_price :any;
    access_total :any;
    total_price :any;
    master_item :any;
    general_features :any;
    copier_features :any;
    printer_features :any;
    scanner_features :any;
    paper_handling :any;
    item_name :any;
    approved :any;
}

export class SalesQuotationSave{
    voucher_id :any;
    document_number :any;
    voucher_date :any;
    cust_code :any;
    register_code :any;
    total_amount :any;
    discount :any;
    tradein_discount :any;
    net_amount :any;
    approval_status :any;
    narration :any;
    reference :any;
    salesman_id :any;
    contact_person :any;
    contact_no :any;
    warranty :any;
    validity :any;
    payterm_id :any;
    delivery :any;
    subject :any;
    card_holder_name :any;
    email_id :any;
    location :any;
    created_by :any;
    modified_by :any;
    modified_on :any;
    period_id :any;
    company_code :any;
    createdt :any;
    status_remarks:any;
}

export class SalesQuotationSearch{
    payterm_id :any;
    warranty :any;
    delivery :any;
    new :any = false;
}