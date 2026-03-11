export class StockTransferModel {

    voucher_id: any;
    godown_code: any;
    document_number: any;
    period_id: any;
    voucher_reference: any;
    cst: any;
    created_by: any;
    user_enter_date: any;
    modified_by: any;
    voucherDate: any;
    voucher_date: any;
    modified_date: any;
    created_date: any;
    approval_status: any;
    transfer_godown_code: any;
    from_godown: any;
    to_godown: any;
    approver_remarks: any;
    approved_by: any;
    register_code: any;
    createdt: any;

}

export class StockTransferDetailModel {
    rowguid: any;
    voucher_id: any;
    seq_no: any;
    item_no: any;
    item_code: any;
    item_name_abbr: any;
    receipt_quantity: any;
    cost_rate: any;
    transamount: any;
    unit_name: any;
    stock_qty: any;
    item_details:any;
}

export class StockTransferSearch {
    document_number: any;
    approval_status: any;

}


