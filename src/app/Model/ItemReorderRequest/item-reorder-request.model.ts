export class ItemReorderRequestModel {
    voucher_id :any;
    document_number :any;
    status :any;
    voucher_date :any;
    order_date :any;
    brand_id :any;
    item_type :any;
    product_type :any;
    voucher_reference :any;
    created_by :any;
    user_enter_date :any;
    posted_date :any;
    modified_by :any;
    approved_by :any;
    approver_remarks :any;
    createdt :any;
    company_code :any;
    created_date :any;
    voucherDate :any;
    orderDate :any;
    modified_date :any;
    po_no :any;
}

export class ItemReorderDetails {
    rowguid	 :any;
    voucher_id	 :any;
    seq_no	 :any;
    item_no	 :any;
    iss_qty	 :any;
    per_day	 :any;
    end_stock	 :any;
    fgn_unit_price	 :any;
    base_stock	 :any;
    suggested_qty	 :any;
    approved_qty	 :any;
    backorder_qty	 :any;
}

export class ItemReorderRequest {
    voucher_id :any;
    company_code :any;
    document_number :any;
    voucher_date :any;
    item_type :any;
    brand_id :any;
    product_type :any;
    order_date :any;
    voucher_reference :any;
    created_by :any;
    user_enter_date :any;
    modified_by :any;
    modified_on :any;
    createdt :any;
    status :any;
    approved_by :any;
    approver_remarks :any;
    posted_date :any;
}

export class ItemReorderRequestSearch{
    status :any;
    document_number :any
}