// Copyright (c) 2026, G2Virtu.com and contributors
// For license information, please see license.txt

frappe.ui.form.on('WhatsBridge Message Log', {
    onload(frm) {
        // if (frappe.session.user !== "Administrator") {
            frm.set_read_only();
        // }
    }
});