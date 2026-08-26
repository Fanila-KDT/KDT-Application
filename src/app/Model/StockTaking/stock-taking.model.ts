export class StockTakingModel {
    stock_taking_id: any;
    document_number: any;
    stock_date: any;
    godown_code: any;
    godown_name: any;
    created_by: any;
    createdt: any;
    approved_by: any;
    approver_remarks: any;
    period_id: any;
    created_date: any;
    stockDate:any;
    modified_by: any;
    modified_date: any;
    modified_on: any;
    approval_status: any;
    voucher_reference: any;
}

export class StockTakingDetail {
    detail_id: any;
    stock_taking_id: any;
    item_no: any;
    system_qty: any;
    physical_qty: any;
    variance_qty: any;
    remarks: any;
}

export class StockTakingHeader {
    stock_taking_id: any;
    document_number: any;
    period_id: any;
    stock_date: any;
    godown_code: any;
    approval_status: any;
    created_by: any;
    createdt: any;
    modified_by: any;
    modified_on: any;
    approved_by: any;
    approver_remarks: any;
    voucher_reference: any;
}



export class StockTakingSearch {
    document_number :any;
    approval_status :any;
}


