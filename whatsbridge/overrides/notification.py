import frappe
from frappe import _
#from frappe.email.doctype.notification.notification import Notification, get_context, json
#from frappe.core.doctype.role.role import get_info_based_on_role, get_user_info
import requests
import json
import io
import base64
from frappe.utils import now
import time
from frappe import enqueue
# to send Whatsapp Message and document using ultramsg
from frappe.email.doctype.notification.notification import (
    Notification,
    json as notification_json
)
from frappe.core.doctype.role.role import (
    get_info_based_on_role,
    get_user_info
)


class G2VirtuNotification(Notification):

    def get_settings(self):
        return frappe.get_single("WhatsBridge Settings")

    def create_pdf_file(self, doc):
        """Generate PDF and return public URL"""

        pdf_content = frappe.get_print(
            doc.doctype,
            doc.name,
            self.print_format,
            as_pdf=True
        )

        file_doc = frappe.get_doc({
            "doctype": "File",
            "file_name": f"{doc.name}.pdf",
            "content": pdf_content,
            "is_private": 0
        })

        file_doc.insert(ignore_permissions=True)

        return frappe.utils.get_url(file_doc.file_url)

    def create_log(
        self,
        doc,
        recipient,
        status,
        message_type,
        message="",
        response="",
        document_url=None,
        document_type=None,
        account=None
    ):

        try:
            frappe.get_doc({
                "doctype": "WhatsBridge Message Log",
                "account": account,
                "recipient": recipient,
                "reference_doctype": doc.doctype,
                "reference_name": doc.name,
                "status": status,
                "message_type": message_type,
                "sent_on": now(),
                "message": message,
                "document_url": document_url,
                "document_type": document_type,
                "response": response
            }).insert(ignore_permissions=True)

        except Exception:
            frappe.log_error(
                frappe.get_traceback(),
                "WhatsBridge Log Creation Error"
            )

    def send_whatsapp_without_pdf(self, doc, context):

        settings = self.get_settings()

        url = settings.message_url.rstrip("/") + "/api/send/whatsapp"

        token = settings.token
        account = settings.account

        message = frappe.render_template(self.message, context)

        recipients = self.get_receiver_list(doc, context)

        for recipient in recipients:

            payload = {
                "secret": token,
                "account": account,
                "recipient": recipient,
                "type": "text",
                "message": message
            }

            try:

                response = requests.post(
                    url,
                    data=payload,
                    timeout=30
                )

                response_text = response.text
                status = "Failed"

                if response.status_code == 200:

                    try:
                        result = response.json()

                        if result.get("status") == 200:
                            status = "Sent"

                    except Exception:
                        pass

                self.create_log(
                    doc=doc,
                    recipient=recipient,
                    status=status,
                    message_type="text",
                    message=message,
                    response=response_text,
                    account=account
                )

            except Exception:

                frappe.log_error(
                    frappe.get_traceback(),
                    "WhatsBridge Text Message Error"
                )

                self.create_log(
                    doc=doc,
                    recipient=recipient,
                    status="Failed",
                    message_type="text",
                    message=message,
                    response=frappe.get_traceback(),
                    account=account
                )

    def send_whatsapp_with_pdf(self, doc, context):

        settings = self.get_settings()

        url = settings.message_url.rstrip("/") + "/api/send/whatsapp"

        token = settings.token
        account = settings.account

        message = frappe.render_template(self.message, context)

        document_url = self.create_pdf_file(doc)

        recipients = self.get_receiver_list(doc, context)

        for recipient in recipients:

            payload = {
                "secret": token,
                "account": account,
                "recipient": recipient,
                "type": "document",
                "document_url": document_url,
                "document_type": "pdf",
                "message": message
            }

            try:

                response = requests.post(
                    url,
                    data=payload,
                    timeout=60
                )

                response_text = response.text
                status = "Failed"

                if response.status_code == 200:

                    try:
                        result = response.json()

                        if result.get("status") == 200:
                            status = "Sent"

                    except Exception:
                        pass

                self.create_log(
                    doc=doc,
                    recipient=recipient,
                    status=status,
                    message_type="document",
                    message=message,
                    response=response_text,
                    document_url=document_url,
                    document_type="pdf",
                    account=account
                )

            except Exception:

                frappe.log_error(
                    frappe.get_traceback(),
                    "WhatsBridge PDF Message Error"
                )

                self.create_log(
                    doc=doc,
                    recipient=recipient,
                    status="Failed",
                    message_type="document",
                    message=message,
                    response=frappe.get_traceback(),
                    document_url=document_url,
                    document_type="pdf",
                    account=account
                )

    def send(self, doc):

        context = {
            "doc": doc,
            "alert": self,
            "comments": None
        }

        if doc.get("_comments"):
            context["comments"] = notification_json.loads(
                doc.get("_comments")
            )

        if self.is_standard:
            self.load_standard_properties(context)

        try:

            if self.channel == "WhatsBridge":

                if self.attach_print or self.print_format:

                    frappe.enqueue(
                        method=self.send_whatsapp_with_pdf,
                        queue="short",
                        timeout=300,
                        doc=doc,
                        context=context
                    )

                else:

                    frappe.enqueue(
                        method=self.send_whatsapp_without_pdf,
                        queue="short",
                        timeout=300,
                        doc=doc,
                        context=context
                    )

        except Exception:

            frappe.log_error(
                frappe.get_traceback(),
                "WhatsBridge Notification Error"
            )

        super(G2VirtuNotification, self).send(doc)

    def get_receiver_list(self, doc, context):
        """Return recipients from Notification"""

        receiver_list = []

        for recipient in self.recipients:

            if recipient.condition:
                if not frappe.safe_eval(
                    recipient.condition,
                    None,
                    context
                ):
                    continue

            if recipient.receiver_by_document_field:

                fields = recipient.receiver_by_document_field.split(",")

                if len(fields) > 1:

                    child_field = fields[0]
                    child_table = fields[1]

                    for row in doc.get(child_table):
                        phone = row.get(child_field)

                        if phone:
                            receiver_list.append(phone)

            if recipient.receiver_by_document_field == "owner":

                receiver_list += get_user_info(
                    [dict(user_name=doc.owner)],
                    "mobile_no"
                )

            elif recipient.receiver_by_document_field:

                phone = doc.get(
                    recipient.receiver_by_document_field
                )

                if phone:
                    receiver_list.append(phone)

            if recipient.receiver_by_role:

                receiver_list += get_info_based_on_role(
                    recipient.receiver_by_role,
                    "mobile_no"
                )

        receiver_list = list(set(receiver_list))

        return [
            d for d in receiver_list
            if d
        ]