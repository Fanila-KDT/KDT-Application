export class ExpenseEntryModel {
    voucher_id: any;
    counter_vid: any;
    company_code: any;
    document_number: any;
    voucher_date: any;
    voucherDate: any;
    register_code: any;
    approval_status: any;
    ref_grn: any;
    created_by: any;
    modified_by: any;
    approved_by: any;
    modified_on: any;
    modified_date: any;
    approver_remarks: any;
    createdt: any;
    created_date: any;
    centername: any;
    centercode: any;
    voucher_reference: any;
    discount: any;
    exch_rate: any;
    godown_code: any;
    user_enter_date:any;
    line_amount: number = 0;
    est_landed_exp: number = 0;
    enter_amount: number = 0;
    foriegn_total: number = 0;
    percentage: any;
}

export class ExpenseEntrySearch {
    document_number: any;
    ref_grn: any;
}

export class ExpenseDetailsModel{
    rowguid: any;
    document_number: any;
    item_code: any;
    item_name_abbr: any;
    enter_rate: any;
    pamount: any;
    fgn_rate: any;
    fgn_total: any;
    receipt_quantity: any;   
    godown_code: any;
    enter_amount: any;
}

export class ExpenseAccountModel{
    detail_id: any;
    voucher_id: any;
    seq_no: any;
    credit_amount : any;
    debit_amount : any;
    fgn_debit_amount : any;
    fgn_credit_amount : any;
    account_code: any;
    counter_account_code: any;
    rOW_REF: any;
    dOCUMENT_NUMBER :any;
    counter_vid: any;
    profitcenterid: any;
}

export class ExpenseHeaderModel{
    voucher_id :any; 
    company_code: any; 
    voucher_date: any; 
    period_id: any; 
    register_code: any; 
    voucher_reference: any; 
    godown_code: any; 
    account_code: any; 
    line_amount: any; 
    enter_amount: any; 
    discount: any; 
    counter_vid: any; 
    approver_remarks: any; 
    createdt: any; 
    cst :any; 
    document_number :any;
    created_by :any;
    user_enter_date: any;
    approved_by:any;
    modified_by: any;
    modified_on: any;
    approval_status :any;
}



