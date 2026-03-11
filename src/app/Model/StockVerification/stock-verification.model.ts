export class StockVerificationModel {
    voucher_id :any; 
    godown_name : any;
    document_number : any;
    verified_date : any;
    po_no : any;
    account_name : any;
    verifiedDate : any;
    approval_status : any;
    remarks : any;
}

export class StockVerificationMSearch {
    po_no: any;
    approval_status: any;
    document_number: any;
}

export class StockDetailsModel {
    verification_id  : any;
    voucher_id  : any;
    grn_voucher_id  : any;
    grn_row_id  : any;
    item_name  : any;
    item_code  : any;
    bin_location  : any;
    verified_qty  : any;
    receipt_quantity  : any;
    verified_by  : any;
    remarks  : any;
    rowguid  : any;
    verified_date  : any;
    received  : any;
}
