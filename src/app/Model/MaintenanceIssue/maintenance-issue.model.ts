export class MaintenanceIssueModel {
    voucher_id :any;
    company_code :any;
    document_number :any;
    voucher_date :any;
    period_id :any;
    register_code :any;
    godown_code :any;
    line_amount :any;
    cst :any;
    created_by :any;
    user_enter_date :any;
    modified_by :any;
    modified_on :any;
    createdt :any;
    approval_status :any;
    approved_by :any;
    approver_remarks :any;
    voucherDate :any;
    modified_date :any;
    created_date :any;
    godown_name :any;
    tag_id :any;
    tag_no :any;
    model_name :any;
    item_code :any;
    request_id :any;
    from_godown_code :any = 'B1BEB649-B992-4F26-A859-22CE96DEC7EE';
    item_no :any;
}

export class MaintenanceIssueDetail{
    item_no :any;
    item_name :any;
    issue_quantity :any;
    enter_rate :any;
    cost_rate :any;
    pamount :any;
    seq_no :any;
}

export class MaintenanceDetail{
    voucher_id :any;
    request_id :any;
    tag_id :any;
}


