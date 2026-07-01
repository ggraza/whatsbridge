// Copyright (c) 2026, G2Virtu.com and contributors
// For license information, please see license.txt

frappe.ui.form.on('WhatsBridge Settings', {
    onload: function(frm) {
        // Bind the keydown event when the form is loaded
        $(document)
            .off('keydown.whatsbridge')
            .on('keydown.whatsbridge', function (e) {
                if (e.altKey && e.code === 'PageUp') {
                    e.preventDefault();
                    navigate_to_tab('previous');
                } else if (e.altKey && e.code === 'PageDown') {
                    e.preventDefault();
                    navigate_to_tab('next');
                }
            });
        // $(document).on('keydown', function(e) {
        //     if (e.altKey && e.code === 'PageUp') {
        //         e.preventDefault();
        //         navigate_to_tab('previous');
        //     } else if (e.altKey && e.code === 'PageDown') {
        //         e.preventDefault();
        //         navigate_to_tab('next');
        //     }
        // });
    },
    refresh: function (frm) {
        frm.add_custom_button(__("Get WhatsApp Accounts"), function () {

            frappe.call({
                method: "whatsbridge.api.get_whatsapp_accounts",
                freeze: true,
                freeze_message: __("Fetching Accounts..."),
                callback: function (r) {

                    let account_map = {};
                    let options = [];

                    r.message.forEach(acc => {
                        let label = `${acc.phone} (${acc.status})`;
                        account_map[label] = acc.unique;
                        options.push(label);
                    });

                    frappe.prompt(
                        [{
                            fieldname: "account",
                            fieldtype: "Select",
                            label: "Account",
                            options: options.join("\n"),
                            reqd: 1
                        }],
                        function (values) {

                            frm.set_value("account", account_map[values.account]);
                            frm.set_value("account_name", values.account);

                            frm.save();
                        },
                        __("Select WhatsApp Account")
                    );
                }
            });

        }, __("Actions"));

        frm.add_custom_button(__("Send Test Message"), function () {

            if (!frm.doc.account) {
                frappe.msgprint(__("Please select an Account first."));
                return;
            }

            if (!frm.doc.to) {
                frappe.msgprint(__("Please enter recipient number in To field."));
                return;
            }

            frappe.prompt(
                [{
                    fieldname: "message",
                    label: "Message",
                    fieldtype: "Small Text",
                    reqd: 1,
                    default: "Hello from WhatsBridge"
                }],
                function (values) {

                    frappe.call({
                        method: "whatsbridge.api.send_test_message",
                        freeze: true,
                        freeze_message: __("Sending WhatsApp Message..."),
                        args: {
                            account: frm.doc.account,
                            recipient: frm.doc.to,
                            message: values.message
                        },
                        callback: function (r) {

                            if (r.message && r.message.status == 200) {
                                frappe.show_alert({
                                    message: __("Message Sent Successfully"),
                                    indicator: "green"
                                });
                            } else {
                                frappe.msgprint({
                                    title: __("Response"),
                                    message: JSON.stringify(r.message, null, 2),
                                    indicator: "orange"
                                });
                            }
                        }
                    });

                },
                __("Send Test Message"),
                __("Send")
            );

        }, __("Actions"));
        var help_content = `<table class="table table-bordered" style="background-color: var(--scrollbar-track-color);">
            <!-- OVERVIEW -->
            <tr>
                <td>
                    <h4><i class="fa fa-whatsapp"></i> {{__('WhatsBridge Overview')}}</h4>
                    <ul>
                        <li>{{__("WhatsBridge integrates ERP Notifications with WhatsApp messaging.")}}</li>
                        <li>{{__("You can send messages using Notification Doctype with Channel = WhatsBridge.")}}</li>
                        <li>{{__("Supports real-time events like Submit, Cancel, Save, and Custom triggers.")}}</li>
                        <li>{{__("Make sure your account is connected before sending any messages.")}}</li>
                        <li>{{__("Message sending uses API token authentication defined in settings.")}}</li>
                    </ul>
                </td>
            </tr>

            <tr>
                <td>
                    <h4><i class="fa fa-plug"></i> {{__('Setup Flow')}}</h4>
                    <ol>
                        <li>{{__("Click 'Get WhatsApp Accounts' to fetch available connected accounts.")}}</li>
                        <li>{{__("Select an active account (status must be connected).")}}</li>
                        <li>{{__("Ensure 'Account' and 'Account Name' fields are saved.")}}</li>
                        <li>{{__("Enter recipient number in 'To' field with country code.")}}</li>
                        <li>{{__("Use 'Send Test Message' to verify API connection.")}}</li>
                    </ol>
                </td>
            </tr>
            <tr>
                <td>
                    <h4><i class="fa fa-cloud"></i> {{__('Chatbot.Khilony.com Setup')}}</h4>
                    <ol>
                        <li>{{__("Create an account or log in to chatbot.khilony.com.")}}</li>
                        <li>{{__("Navigate to Host ? WhatsApp.")}}</li>
                        <li>{{__("Click 'Add Account' and scan the QR code using your WhatsApp mobile application.")}}</li>
                        <li>{{__("Wait until the account status changes to Connected.")}}</li>
                        <li>{{__("Go to Tools ? API Keys.")}}</li>
                        <li>{{__("Click 'Add Key', enter a name for the API key, and another Permissions like get_wa_accounts and submit.")}}</li>
                        <li>{{__("Copy the generated API Key and paste it into the 'Token' field in WhatsBridge Settings.")}}</li>
                        <li>{{__("Once connected, you can send WhatsApp messages from ERP free of cost.")}}</li>
                    </ol>
                </td>
            </tr>
            
            <tr>
                <td>
                    <h4><i class="fa fa-sitemap"></i> {{__('ERP Integration Flow')}}</h4>
                    <ol>
                        <li>{{__("Open WhatsBridge Settings and save your API Token.")}}</li>
                        <li>{{__("Click 'Get WhatsApp Accounts' and select your connected WhatsApp account.")}}</li>
                        <li>{{__("Save the settings and use 'Send Test Message' to verify the connection.")}}</li>
                        <li>{{__("Create a Notification in ERP.")}}</li>
                        <li>{{__("Set Channel to 'WhatsBridge'.")}}</li>
                        <li>{{__("Select the Document Type (e.g. Sales Invoice, Sales Order).")}}</li>
                        <li>{{__("Choose the Event (Submit, Save, Cancel, etc.).")}}</li>
                        <li>{{__("Configure recipients and write the message using Jinja variables (doc.*).")}}</li>
                        <li>{{__("When the event is triggered, WhatsBridge automatically sends the WhatsApp message.")}}</li>
                    </ol>
                </td>
            </tr>

            <tr>
                <td>
                    <h4><i class="fa fa-paper-plane"></i> {{__('Send Test Message Workflow')}}</h4>
                    <ul>
                        <li>{{__("System validates that Account and Recipient (To) are provided.")}}</li>
                        <li>{{__("You enter a custom test message via popup dialog.")}}</li>
                        <li>{{__("Message is sent using WhatsBridge API endpoint.")}}</li>
                        <li>{{__("Success or error response is displayed instantly.")}}</li>
                    </ul>
                </td>
            </tr>
            <!-- NOTIFICATION CONFIG -->
            <tr>
                <td>
                    <h4><i class="fa fa-bell"></i> {{__('Notification Configuration')}}</h4>
                    <ul>
                        <li><b>{{__("Channel")}}</b> - {{__("Must be set to 'WhatsBridge' to enable WhatsApp sending.")}}</li>
                        <li><b>{{__("Document Type")}}</b> - {{__("Any ERP DocType (e.g. Sales Invoice).")}}</li>
                        <li><b>{{__("Event")}}</b> - {{__("Trigger type (Submit, Save, Cancel, Days After/Before).")}}</li>
                        <li><b>{{__("Recipients")}}</b> - {{__("Phone number field like contact_mobile or custom field.")}}</li>
                        <li><b>{{__("Message Type")}}</b> - {{__("Markdown supported for formatting.")}}</li>
                        <li><b>{{__("Attach Print")}}</b> - {{__("Send PDF invoice with WhatsApp message.")}}</li>
                    </ul>
                </td>
            </tr>

            <!-- SALES INVOICE EXAMPLE -->
            <tr>
                <td>
                    <h4><i class="fa fa-file-text"></i> {{__('Example: Sales Invoice Notification')}}</h4>
                    <ul>
                        <li>{{__("Document Type: Sales Invoice")}}</li>
                        <li>{{__("Event: Submit")}}</li>
                        <li>{{__("Channel: WhatsBridge")}}</li>
                        <li>{{__("Recipient: contact_mobile or customer phone field")}}</li>
                        <li>{{__("Message Example:")}}</li>
                    </ul>

                    <pre style="background:#f8f9fa;padding:10px;border-radius:5px;">
Sales Invoice Generated
<p></p>
Dear &#123;&#123; doc.customer &#125;&#125;,
<p></p>
Your Invoice No: &#123;&#123; doc.name &#125;&#125; has been generated successfully.
<p></p>
Date: &#123;&#123; doc.posting_date &#125;&#125;
<p></p>
Grand Total: &#123;&#123; doc.grand_total &#125;&#125; &#123;&#123; doc.currency &#125;&#125;
<p></p>
Thank you for your business. We look forward to serving you again.
<p></p>
Regards,
<p></p>
&#123;&#123; frappe.db.get_value("Company", doc.company, "company_name") &#125;&#125;

                    </pre>

                </td>

            </tr>

            <!-- IMPORTANT FIELDS -->
            <tr>
                <td>
                    <h4><i class="fa fa-cogs"></i> {{__('Key Integration Fields')}}</h4>
                    <ul>
                        <li><b>{{__("WhatsBridge Channel")}}</b> - {{__("Enables WhatsApp sending from Notification system.")}}</li>
                        <li><b>{{__("Account")}}</b> - {{__("Selected WhatsApp account used for API calls.")}}</li>
                        <li><b>{{__("Token")}}</b> - {{__("Authentication token for WhatsApp API.")}}</li>
                        <li><b>{{__("Message URL")}}</b> - {{__("API endpoint for sending messages.")}}</li>
                    </ul>
                </td>
            </tr>

            <!-- BEST PRACTICES -->
            <tr>
                <td>
                    <h4><i class="fa fa-lightbulb-o"></i> {{__('Best Practices')}}</h4>
                    <ul>
                        <li>{{__("Do not expose API tokens publicly.")}}</li>
                        <li>{{__("Always test notifications using Send Test Message before enabling automation.")}}</li>
                        <li>{{__("Ensure phone number fields are in international format (+92...).")}}</li>
                        <li>{{__("Use concise Markdown messages for better WhatsApp readability.")}}</li>
                        <li>{{__("Avoid duplicate notifications for same event triggers.")}}</li>
                    </ul>
                </td>
            </tr>

        </table>`;

        frm.set_df_property("whatsbridge_settings_help", "options", help_content);
    },
    token: function(frm) {

        // Clear account information when token changes
        frm.set_value({
            account: "",
            account_name: ""
        });

        frappe.show_alert({
            message: __("Token changed. Please fetch WhatsApp Accounts again."),
            indicator: "orange"
        });
    }
});

function navigate_to_tab(direction) {
    // Find the currently active tab
    let current_tab = $('.nav-link.active');
    let tabs = $('.nav-link');
    let current_index = tabs.index(current_tab);

    let target_index = null;

    if (direction === 'next') {
        target_index = current_index + 1 < tabs.length ? current_index + 1 : 0;
    } else if (direction === 'previous') {
        target_index = current_index - 1 >= 0 ? current_index - 1 : tabs.length - 1;
    }

    if (target_index !== null) {
        let target_tab = $(tabs[target_index]);
        target_tab.tab('show');
    }
}
