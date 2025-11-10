# n8n Occupational Health Workflow - Setup & Implementation Guide

## Overview
This n8n workflow implements an intelligent occupational health automation system with two primary paths:
1. **Invoice Analysis Path**: Monitors incoming emails, analyzes occupational health invoices using Claude AI, and alerts on discrepancies
2. **Substitute Work Process Path**: Manages substitute work initiation through manual triggers (webhook) and coordinates communication with employees and managers

---

## Workflow Architecture - 6 Key Components

### **Component 1: Email Trigger (IMAP)**
- **Node**: `Email Trigger - Invoice`
- **Functionality**: Listens to `[email protected]` via IMAP protocol
- **Configuration**:
  - Mailbox: INBOX
  - Automatic reading of emails
  - Captures sender, subject, body, and attachments
- **Triggers**: Any email containing "Lasku" (Invoice) in subject or invoice-related content

### **Component 2: Email Type Classification (IF Node)**
- **Node**: `IF: Is Invoice?`
- **Functionality**: Routes emails to appropriate path based on subject content
- **Condition**: Checks if `{{ $json.subject }}` contains "Lasku"
- **Branches**: True → Invoice Analysis | False → Other paths

### **Component 3: Claude AI Analysis**
- **Node**: `Claude: Analyze Invoice`
- **Functionality**: Sends invoice text to Claude Sonnet 3.5 API for intelligent analysis
- **System Prompt** (in Finnish):
  - Acts as occupational health invoice analyst
  - Validates against contract terms (K1=Mandatory, K2=Optional, base visit fee=50€)
  - Returns structured JSON with line items, discrepancies, and summary
- **Credential Required**: `anthropic_api_key` (Claude API Key from Anthropic)

### **Component 4: Response Parsing & Validation**
- **Node**: `Extract: Claude Response`
- **Functionality**: Parses Claude's JSON response and structures data for downstream processing
- **Data Structure**:
  ```json
  {
    "laskun_loppusumma": 0.00,
    "erittely": [],
    "poikkeamat": [],
    "yhteenveto_poikkeamista": ""
  }
  ```

### **Component 5: Alert Mechanism (Conditional Alerts)**
- **Nodes**:
  - `IF: Has Discrepancies?` → Decision point
  - `Email: Alert on Discrepancy` → SMTP email notification
  - `Slack: Optional Alert` → Slack notification (optional, continues on error)
- **Functionality**:
  - Triggers only if discrepancies are found
  - Sends detailed email to company contact
  - Posts alert to Slack #occupational-health channel
- **Credentials Required**:
  - `smtp_occupational_health` (SMTP server for outgoing emails)
  - `slack_occupational_health` (Slack bot token - optional)

### **Component 6: Substitute Work Process**
- **Trigger**: `Webhook: Substitute Work Trigger`
  - Endpoint: `/webhook/substitute-work`
  - Manual trigger or integration with HR systems
  - Accepts JSON payload with employee/manager details
- **Workflow Steps**:
  - **Path Check**: `IF: Substitute Work?` verifies request type
  - **Employee Notification**: `Email: Send Form to Employee`
    - Sends planning form and instructions
    - Recipient: `{{ $json.employeeEmail }}`
  - **Manager Notification**: `Email: Notify Manager`
    - Notifies manager of process initiation
    - Recipient: `{{ $json.managerEmail }}`
  - **Completion**: `Set: Process Complete` + `Respond to Webhook`
    - Finalizes workflow execution
    - Returns status to webhook caller

---

## Required Credentials

### **1. IMAP Email Credentials**
**Credential Name**: `imap_occupational_health`
- **Type**: IMAP Email
- **Settings**:
  - Host: `imap.example.com` (your mail provider's IMAP server)
  - Port: `993` (SSL)
  - Email: `[email protected]`
  - Password: Application-specific password (recommended)
- **Providers**: Gmail, Outlook, Proton Mail, or corporate email server

### **2. Claude/Anthropic API Key**
**Credential Name**: `anthropic_api_key`
- **Type**: Generic Credential Type (HTTP Header Auth)
- **Settings**:
  - API Key: Obtain from [api.anthropic.com](https://api.anthropic.com)
  - Required: X-API-Key header
  - Model: claude-3-5-sonnet-20241022 (latest stable)
- **Cost**: Pay-as-you-go pricing (~$3 per 1M input tokens)

### **3. SMTP Email Server Credentials**
**Credential Name**: `smtp_occupational_health`
- **Type**: SMTP
- **Settings**:
  - Host: `smtp.example.com`
  - Port: `587` or `465` (TLS/SSL)
  - Email: `[email protected]`
  - Password: Application-specific password
  - From Name: "Occupational Health Assistant" (customizable)
- **Providers**: Gmail, Outlook, SendGrid, or corporate mail server

### **4. Slack Bot Token (Optional)**
**Credential Name**: `slack_occupational_health`
- **Type**: Slack
- **Settings**:
  - Bot Token: `xoxb-...` (from Slack App settings)
  - Default Channel: `#occupational-health`
- **Note**: If not configured, the alert step will continue without error

---

## Setup Instructions

### **Step 1: Import Workflow into n8n**
```bash
# Copy the JSON from n8n-occupational-health-workflow.json
# In n8n UI: Create New Workflow → Import from JSON → Paste content
```

### **Step 2: Add Credentials in n8n**
1. Go to **Credentials** section in n8n admin panel
2. Add credentials for:
   - IMAP Email (for monitoring inbox)
   - Anthropic Claude API (for invoice analysis)
   - SMTP Email (for sending alerts)
   - Slack (optional, for notifications)

### **Step 3: Test Email Trigger**
- Send test email to `[email protected]` with subject containing "Lasku"
- Verify email appears in n8n logs
- Check if Claude analysis executes correctly

### **Step 4: Test Substitute Work Webhook**
```bash
curl -X POST http://your-n8n-instance/webhook/substitute-work \
  -H "Content-Type: application/json" \
  -d '{
    "employeeName": "John Doe",
    "employeeEmail": "[email protected]",
    "managerEmail": "[email protected]",
    "department": "Engineering"
  }'
```

### **Step 5: Configure Email Addresses**
Update hardcoded email addresses in nodes:
- `[email protected]` → Your company contact email
- `[email protected]` → Default employee email fallback
- `[email protected]` → Default manager email fallback

---

## Workflow Data Flow Diagram

```
INVOICE ANALYSIS PATH:
Email (IMAP)
    → Type Check (IF)
    → Claude API (Analyze)
    → Parse Response
    → Check Discrepancies (IF)
    → Alert via Email + Slack

SUBSTITUTE WORK PATH:
Webhook Trigger
    → Type Check (IF)
    → Send to Employee
    → Notify Manager
    → Complete & Respond
```

---

## Error Handling & Resilience

1. **Claude API Failures**: Continues with error output (onError: continueErrorOutput)
2. **Slack Optional**: Marked to continue on error if Slack unavailable
3. **Email Delivery**: SMTP retries configurable in n8n settings
4. **Webhook Response**: Always returns response regardless of internal errors

---

## Customization Options

### **Modify Invoice Contract Terms**
Edit the Claude system prompt in the `Claude: Analyze Invoice` node to reflect your actual contract:
```
- Käyntimaksu (GP visit): 50 EUR
- K1 (Mandatory): Include in contract
- K2 (Optional): Exclude from contract
- Additional services: Define as needed
```

### **Add Additional Alerts**
- Duplicate the email/Slack nodes
- Connect to the discrepancy check node
- Add Teams, PagerDuty, or other notification services

### **Expand Employee Data**
The webhook payload can include:
- `employeeName`: Full name
- `employeeEmail`: Work email
- `managerEmail`: Manager's email
- `department`: Employee's department
- `startDate`: Date of substitute work
- `reason`: Medical reason code (optional)

---

## Security Considerations

1. **Credential Management**:
   - Never hardcode API keys in workflow JSON
   - Use n8n Credentials management
   - Rotate API keys quarterly

2. **Email Security**:
   - Use TLS/SSL for IMAP and SMTP connections
   - Enable 2FA on email accounts
   - Use app-specific passwords, not main account passwords

3. **Data Protection**:
   - GDPR compliance: Invoice PDFs contain employee health data
   - Ensure email archiving complies with data retention policies
   - Consider encryption for sensitive invoice details

4. **Webhook Security**:
   - Implement webhook authentication (basic auth or JWT)
   - Rate limiting on webhook endpoint
   - Validate all incoming webhook data

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Email not triggering | Check IMAP credentials, verify email filters, check inbox rules |
| Claude API error (401) | Verify API key in credentials, check API key permissions |
| SMTP delivery failures | Verify from-email matches credential account, check SMTP port |
| Webhook not responding | Ensure n8n webhook is active, verify firewall/port forwarding |
| Claude returns invalid JSON | Check system prompt formatting, verify email content encoding |

---

## Support & Monitoring

- **n8n Logs**: Check execution history for each workflow run
- **Webhook Logs**: Monitor incoming requests in n8n UI
- **Email Test**: Send test invoice with known discrepancies to verify pipeline
- **API Monitoring**: Use Anthropic dashboard to track Claude API usage

