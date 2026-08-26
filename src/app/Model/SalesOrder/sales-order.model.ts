export class SalesOrderModel {
    voucher_id :any;
    document_number :any;
    voucher_date :any;
    approval_status :any;
    salesman_id :any;
    salesman_name :any;
    name :any;
    voucherDate :any;
    modified_date :any;
    created_date :any;
    engineer :any;
    customer_id :any;
    created_by :any;
    modified_by :any;
    order_type_id : any;
    Quote_id : any;
    quote_no : any;
    quoteDate : any;
    pO_Number : any;
    warranty : any;
    click_contract_verified : any;
    narration : any;
    engineer_id : any;
    area_id : any;
    contact_person : any;
    floor : any;
    building_no : any;
    street : any;
    mobile_no : any;
    telephone_no : any;
    block : any;
    pACI : any;
    installation_id : any = 1;
    discount : any;
    tradein_discount : any;
    total_amount : any;
    net_amount : any;
    approved_by : any;
    approver_remarks : any;
    contract_id : any;
    payterm_id : any;
    payment_type : any;
    down_payment : any;
    receipt_id : any;
    verified : any;
    createdt : any;
    trade_in : any;
    flat : any;
}

export class SalesOrderSave{
    voucher_id :any;
    voucher_date :any;
    register_code :any;
    customer_id :any;
    document_number :any;
    approval_status :any;
    created_by :any;
    total_amount :any;
    discount :any;
    tradein_discount :any;
    net_amount :any;
    narration :any;
    contact_person :any;
    mobile_no :any;
    telephone_no :any;
    area_id :any;
    street :any;
    block :any;
    building_no :any;
    floor :any;
    flat :any;
    PACI :any;
    Quote_id :any;
    PO_Number :any;
    salesman_id :any;
    engineer_id :any;
    contract_id :any;
    warranty :any;
    order_type_id :any;
    period_id :any;
    payterm_id :any;
    receipt_id :any;
    click_contract_verified :any;
    trade_in :any;
    installation_id :any;
    down_payment :any;
    payment_type :any;
    approved_by :any;
    approver_remarks :any;
    modified_by :any;
    modified_on :any;
    company_code :any;
    createdt :any;
}

export class SalesOrderDetailModel{
    detail_id :any;
    voucher_id :any;
    voucher_no :any;
    item_no :any;
    order_quantity :any;
    unit_price :any;
    total_price :any;
    tag_item :any;
}

export class SalesOrderTradeModel{
    voucher_id :any;
    model_name :any;
    seq_no :any;
    brand_name :any;
    bw_reading :any;
    clr_reading :any;
    replace_model :any;
    received :any;
    received_date :any;
    remarks :any;
    received_by :any;
    tag_no :any;
}

export class SalesOrderAccessories{
    Id :any;
    voucher_id :any;
    m_item_no :any;
    item_no :any;
    order_quantity :any;
    unit_price :any;
    total_price :any;
    compulsory :any;
}

export class SalesOrderPayTerm{
    row_id :any;
    voucher_id :any;
    register_code :any;
    installment_no :any;
    installment_amount :any;
    due_date :any;
    paid :any;
    receipt_id :any;
    payment_entry_date :any;
}

export class SalesOrderSearch{

}