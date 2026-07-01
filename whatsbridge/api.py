import frappe
import requests

@frappe.whitelist()
def get_whatsapp_accounts():

    settings = frappe.get_single("WhatsBridge Settings")

    response = requests.get(
        f"{settings.message_url.rstrip('/')}/api/get/wa.accounts",
        params={
            "secret": settings.token,
            "limit": 100,
            "page": 1
        }
    )

    data = response.json()

    return data.get("data", [])


@frappe.whitelist()
def send_test_message(account, recipient, message):

    settings = frappe.get_single("WhatsBridge Settings")

    url = f"{settings.message_url.rstrip('/')}/api/send/whatsapp"

    payload = {
        "secret": settings.token,
        "account": account,
        "recipient": recipient,
        "type": "text",
        "message": message
    }

    response = requests.post(
        url,
        data=payload,
        timeout=30
    )

    result = response.json()

    frappe.logger().info({
        "request": payload,
        "response": result
    })

    return result