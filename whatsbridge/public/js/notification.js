// Copyright (c) 2026, G2Virtu.com and contributors
// For license information, please see license.txt

frappe.ui.form.on('Notification', {
    refresh: function(frm) {
        extendNotificationForWhatsBridge(frm);
    },
    channel: function(frm) {
        extendNotificationForWhatsBridge(frm);
    },
    document_type: function(frm) {
        extendNotificationForWhatsBridge(frm);
    }
});

function extendNotificationForWhatsBridge(frm) {
    if (frm.doc.channel !== "WhatsBridge") return;
    if (!frm.doc.document_type) return;

    frappe.model.with_doctype(frm.doc.document_type, function() {
        let fields = frappe.get_doc("DocType", frm.doc.document_type).fields;

        let receiver_fields = $.map(fields, function(d) {
            // Include all common mobile/phone fields
            if (["Phone", "Mobile", "Data", "Contact"].includes(d.fieldtype) || 
                ["mobile_no", "phone", "mobile", "cell_number", "whatsapp", "contact_phone", "contact_mobile"]
                .includes(d.fieldname)) {
                return {
                    value: d.fieldname,
                    label: d.fieldname + " (" + __(d.label || d.fieldname) + ")"
                };
            }
            return null;
        });

        // Add common fields even if not explicitly marked as Phone type
        // const extra_fields = ["mobile_no", "phone", "mobile", "whatsapp", "cell_number"];
        // extra_fields.forEach(field => {
        //     if (!receiver_fields.some(item => item.value === field)) {
        //         receiver_fields.push({
        //             value: field,
        //             label: field + " (Mobile/WhatsApp)"
        //         });
        //     }
        // });

        // Update the receiver field options
        frm.fields_dict.recipients.grid.update_docfield_property(
            "receiver_by_document_field",
            "options",
            ["", "owner"].concat(receiver_fields)
        );

        // Auto-set the best field if row exists and field is empty
        let recipients = frm.doc.recipients || [];
        if (recipients.length > 0 && !recipients[0].receiver_by_document_field) {
            recipients[0].receiver_by_document_field = "mobile_no";
            frm.refresh_field("recipients");
        }

        frm.refresh_field("recipients");
    });
}