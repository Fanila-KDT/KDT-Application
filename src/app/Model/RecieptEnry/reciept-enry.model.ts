export class RecieptEntryModel {
    voucher_id :any; 
    account_code : any;
    document_number : any;
    voucher_date : any;
    order_no : any;
    voucher_reference : any;
    register_code : any;
    account_name : any;
    voucherDate : any;
}

export class GRNModel {
    voucher_id :any; 
    register_code : any;
    register_name : any;
    document_number : any;
    voucher_date : any;
    voucherDate : any;
    user_enter_date : any;
    account_code : any;
    account_name : any;
    ref_grn_id : any;
    voucher_reference : any;
    counter_vid : any;
    invoice_no : any;
    invoice_date : any;
    invoiceDate : any;
    godown_code : any;
    godown_name : any;
    created_by : any;
    createdt : any;
    created_date : any;
    modified_by : any;
    modified_on : any;
    modified_date : any;
    approved_by : any;
    approval_status : any;
    approver_remarks : any;
    company_code:any;
    po_no:any;
    ref_no:any;
    cur_no:any;
    line_amount :any =0;
    enter_amount :any =0;
    discount :any =0;
    fgn_rate :any =0;
    exch_rate :any =0;
    cons_exch_rate :any =0;
    foreign_line_amount :any =0;
    foreign_enter_amount :any =0;
    foreign_discount_amount :any =0;
    cur_name:any;
    virtual_store:any;
}

export class ItemDetailsModel{
    rowguid :any;
    voucher_id :any;
    seq_no :any;
    item_no :any;
    item_details :any;
    unit_id :any;
    item_category :any;
    item_code :any;
    item_name_abbr :any;
    fgn_rate :any =0;
    receipt_quantity :any;
    retail_rate :any =0;
    fgn_total :any;
    line_no : any;
    enter_rate : any =0
    cost_rate : any = 0
    pamount : any =0
    item_discount :any =0;
    ref_row_id :any;
    exch_rate :any =0;
    transamount :any =0;
    godown_code :any;
}

export class GRNHeaderModel{
    voucher_id :any; 
    company_code:any;
    voucher_date : any;
    document_number : any;
    period_id :any;
    register_code : any;
    voucher_reference : any;
    godown_code : any;
    account_code : any;
    line_amount :any =0;
    discount :any =0;
    enter_amount :any =0;
    cst :any;
    created_by : any;
    user_enter_date : any;
    modified_by : any;
    modified_on : any;
    createdt : any;
    counter_vid : any;
    approval_status : any;
    approved_by : any;
    approver_remarks : any;
}

export class GRNDetailsModel{
    voucher_id :any;
    invoice_no :any;
    invoice_date :any;
    cur_no :any;
    exch_rate :any =0;
    cons_exch_rate :any =0;
    ref_grn_id :any;
    foreign_line_amount :any =0;
    foreign_discount_amount :any =0;
    foreign_enter_amount :any =0;
}

export class GRNGridModel{
    rowguid :any;
    voucher_id :any;
    seq_no :any;
    item_no :any;
    godown_code :any;
    receipt_quantity :any;
    enter_rate :any =0;
    cost_rate :any =0;
    pamount :any =0;
    transamount :any = 0;
    line_no :any;
    fgn_rate :any =0;
    fgn_total :any;
    item_details :any;
    exch_rate :any =0;
    ref_row_id :any;
}

export class GRNModelModalSearch {
    register_code : any;
    document_number : any;
    ref_grn_id  :any;
}