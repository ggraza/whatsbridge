<div align="center">
    <h2>G2 Whats Bridge</h2>
</div>

## G2 Whats Bridge

WhatsBridge is an ERP/Frappe integration that enables you to send **WhatsApp messages** manually or automatically using the built-in **Notification** doctype.


## Features

- ?? Send WhatsApp messages directly from ERP.
- ?? Integrates with ERP Notifications.
- ? Supports real-time events such as **Submit**, **Save**, **Cancel**, and custom triggers.
- ?? Send PDF print formats (Invoices, Quotations, etc.) as WhatsApp attachments.
- ?? Supports Markdown and Jinja templating.
- ?? Secure API token authentication.
- ?? Test WhatsApp messages directly from **WhatsBridge Settings**.

---

# WhatsBridge Overview

WhatsBridge integrates ERP Notifications with WhatsApp messaging.

Using the **Notification** doctype with **Channel = WhatsBridge**, you can automatically send WhatsApp messages whenever a document event occurs.

Supported events include:

- Submit
- Save
- Cancel
- Days Before
- Days After
- Value Change
- Custom Events

> **Note:** Ensure your WhatsApp account is connected before sending messages.

---

# Manual Setup Flow

1. Open **WhatsBridge Settings**.
2. Enter your **API Token**.
3. Click **Get WhatsApp Accounts**.
4. Select an active WhatsApp account (**Connected**).
5. Save the document.
6. Enter a recipient number with country code.
7. Click **Send Test Message** to verify the connection.

---

# Chatbot.Khilony.com Setup

Before using WhatsBridge, configure your WhatsApp account on **chatbot.khilony.com**.

### Step 1 – Create an Account

Create an account or log in to your account.

### Step 2 – Connect WhatsApp

Navigate to:

```
Host ? WhatsApp
```

Click **Add Account** and scan the QR code using your WhatsApp mobile application.

Wait until the account status becomes:

```
Connected
```

### Step 3 – Generate API Key

Navigate to:

```
Tools ? API Keys
```

Click **Add Key**.

Fill in:

- Name
- Permissions

Required permissions:

- `get_wa_accounts`
- `submit`

Copy the generated API Key.

### Step 4 – Configure ERP

Open **WhatsBridge Settings** and paste the API Key into the **Token** field.

After saving the settings, click **Get WhatsApp Accounts** and select your connected account.

Once connected, you can send WhatsApp messages from ERP **free of cost**.

---

# ERP Integration Flow

1. Open **WhatsBridge Settings**.
2. Save your API Token.
3. Click **Get WhatsApp Accounts**.
4. Select your connected WhatsApp account.
5. Save the settings.
6. Send a test message.
7. Create a new **Notification**.
8. Set **Channel = WhatsBridge**.
9. Select the desired DocType.
10. Choose the trigger event.
11. Configure recipients.
12. Write your message using Jinja variables.
13. Save the Notification.

Whenever the selected event occurs, WhatsBridge automatically sends the WhatsApp message.

---

# Send Test Message Workflow

The **Send Test Message** button allows you to verify your configuration.

Workflow:

1. Validate that an Account is selected.
2. Validate the recipient phone number.
3. Enter a custom message.
4. Send the message through the WhatsBridge API.
5. Display the success or error response.

---

# Notification Configuration

Configure an ERP Notification as follows:

| Field | Value |
|-------|-------|
| **Channel** | WhatsBridge |
| **Document Type** | Any ERP DocType |
| **Event** | Submit, Save, Cancel, Days Before, Days After, etc. |
| **Recipients** | Phone number field (e.g. `contact_mobile`) |
| **Message Type** | Markdown |
| **Attach Print** | Optional (Send PDF attachment) |

---

# Example: Sales Invoice Notification

### Notification Configuration

| Field | Value |
|-------|-------|
| Document Type | Sales Invoice |
| Event | Submit |
| Channel | WhatsBridge |
| Recipient | `contact_mobile` |

### Message Template

```text
*Sales Invoice Generated*

Dear {{ doc.customer }},

Your Invoice No: {{ doc.name }} has been generated successfully.

Date: {{ doc.posting_date }}

Grand Total: {{ doc.grand_total }} {{ doc.currency }}

Thank you for your business. We appreciate your trust and look forward to serving you again.

Regards,

{{ frappe.db.get_value("Company", doc.company, "company_name") }}
```

---

# Key Integration Fields

| Field | Description |
|-------|-------------|
| **WhatsBridge Channel** | Enables WhatsApp sending from ERP Notifications |
| **Account** | Selected WhatsApp account used for API requests |
| **Account Name** | Connected WhatsApp phone number |
| **Token** | API authentication token |
| **Message URL** | WhatsBridge API endpoint |

---

# Best Practices

- Keep your API Token secure.
- Do not expose API tokens publicly.
- Always test your configuration before enabling automation.
- Use international phone numbers (e.g. `+923001234567`).
- Keep WhatsApp messages short and readable.
- Use Markdown formatting where appropriate.
- Avoid creating duplicate Notifications for the same event.
- Verify that your WhatsApp account status is **Connected** before sending messages.

---

# Requirements

- ERP / Frappe
- WhatsBridge App
- Active account on **chatbot.khilony.com**
- Connected WhatsApp account
- Valid API Key

---

### Dependencies:

- [Frappe](https://github.com/frappe/frappe)

---

#### Self Hosting:

1. `bench get-app https://github.com/ggraza/whatsbridge.git`
2. `bench setup requirements`
3. `bench build --app whatsbridge`
4. `bench restart`
5. `bench --site [your.site.name] install-app whatsbridge`

---

#### License

MIT