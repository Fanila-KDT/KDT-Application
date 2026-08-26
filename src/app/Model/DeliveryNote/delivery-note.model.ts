export class DeliveryNoteModel {
    voucher_id :any;
    document_number :any;
    voucher_date :any;
    voucherDate :any;
    godown_name :any;
    register_code :any;
    approval_status :any;
    order_no :any;
    name :any;
    created_by :any;
    created_date :any;
    modified_by :any;
    modified_date :any;
    approved_by :any;
    approver_remarks :any;
    mobile_no :any;
    customer_id :any;
    godown_code :any;
    invoice_no :any;
    voucher_reference :any;
    total_amount :any;
}

export class DeliveryNoteDetailModel {

}

export class OilAndGasModel{
    voucher_id :any;
    contarct_no :any;
    po_no :any;
    voucherDate :any;
    line_amount :any;
    gross_weight  :any;
    no_pallets  :any;
}

export class DeliveryNoteSearch{
    payterm_id :any;
    warranty :any;
    delivery :any;
    new :any = false;
}