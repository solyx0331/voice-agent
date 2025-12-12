# Conversation Design Intake Form

This document provides a structured template for configuring voice agents, matching the commercial-ready UI structure.

## 1. Initial Logic / Greeting

**Purpose**: The exact welcome script and routing menu options for callers to choose between different options (e.g., Evolved Sound and QW Direct).

### Required Information:
- Exact welcome script text
- Routing menu options (what callers can choose)
- Instructions for how the agent should present options

**Example for Sales Assistant**:
```
Hello! Thank you for calling. This is the virtual assistant for Evolved Sound and QW Direct. To help you better, please say the name of the company you're trying to reach. You can say 'Evolved Sound' or 'QW Direct'.
```

---

## 2. Routing Logic 1

**Purpose**: Define how the agent routes callers based on their initial response.

### Required Information:
- Condition: What the caller says/does
- Action: What the agent should do
- Response: What the agent should say

**Example Rules**:

**Rule 1: Evolved Sound Routing**
- Condition: `caller says "Evolved Sound"`
- Action: `Route to Evolved Sound logic tree`
- Response: `Thank you for choosing Evolved Sound. What type of service are you enquiring about? (e.g., voice over, audio production)`

**Rule 2: QW Direct Routing**
- Condition: `caller says "QW Direct"`
- Action: `Route to QW Direct logic tree`
- Response: `Thank you for choosing QW Direct. What service are you looking for? (e.g., direct marketing, digital campaign)`

---

## 3. Information Gathering (Including Lead Capturing)

**Purpose**: List all critical data points the agent must capture for each business/route.

### Required Information:

#### Company-Specific Questions:

**For Evolved Sound:**
- Inquiry type (e.g., voice over, audio production)
- Budget range
- Individual or business

**For QW Direct:**
- Service needed (e.g., direct marketing, digital campaign)
- Company size
- Timeframe/timeline

#### Universal Lead Capture Fields:
- Full name (required)
- Phone number (required)
- Email address (required)

**Additional Fields** (if needed):
- Service type
- Budget
- Business type
- Company size
- Timeline

---

## 4. Summary / Email Template

**Purpose**: Define the required format and fields for the final Automated Email Summary.

### Required Information:

#### Email Configuration:
- **Recipient Email**: Where to send summaries (e.g., reception@evolvedsound.com)
- **Subject Line Format**: Template for email subject (e.g., "New Inquiry - {{CompanyName}} - {{CallerName}}")

#### Email Template Fields:
Define which fields should appear in the email summary:

- Company Name
- Caller Name
- Phone Number
- Email Address
- Service Interested In
- Budget (if provided)
- Business Type (if provided)
- Company Size (for QW Direct)
- Timeline
- Call Summary (agent-generated)

**Example Email Format**:
```
Subject: New Inquiry - {{CompanyName}} - {{CallerName}}

Body:
Company: {{CompanyName}}
Name: {{CallerName}}
Phone: {{PhoneNumber}}
Email: {{Email}}
Service Interested In: {{ServiceType}}
Budget (if provided): {{Budget}}
Business Type (if provided): {{BusinessType}}
Company Size (QW Direct): {{CompanySize}}
Timeline: {{Timeline}}

Call Summary:
{{AgentGeneratedSummary}}
```

---

## 5. Fallback / Escalation Rules

**Purpose**: Define what the agent should say or do if it cannot understand the caller after 1-2 attempts.

### Required Information:

**First Attempt (Unclear Response)**:
- Message: `I didn't catch that. Could you repeat the name of the company you are calling?`
- Action: Ask for clarification

**Second Attempt (Still Unclear)**:
- Message: `I'm sorry, I'm having trouble understanding you. Would you like to speak to a human representative instead?`
- Action: Offer human representative or callback

**Additional Escalation** (if needed):
- Transfer to human
- Offer callback
- Leave voicemail option

---

## 6. Routing Logic 2 (Optional)

**Purpose**: Additional routing rules for complex scenarios or secondary routing decisions.

### Required Information:
- Condition: What triggers this routing
- Action: What the agent should do
- Response: What the agent should say

**Note**: This section may be empty for simple routing scenarios.

---

## Testing Requirements

After configuration, the agent must pass:

1. **Routing Accuracy Test**: Agent successfully runs the full routing logic (e.g., QW Direct / Evolved Sound)
2. **Data Collection Test**: Agent captures all critical data points accurately
3. **Email Summary Accuracy Test**: Automated email summary is accurate and commercially usable
4. **Latency Test**: Agent provides required log data and meets latency requirements
5. **Fallback Test**: Agent handles unclear responses appropriately

---

## Notes

- All fields marked as "required" must be collected before ending the call
- Email summaries are sent automatically after each call
- Routing logic is processed in order - put more specific rules first
- Fallback rules should be clear and professional
- Test thoroughly with different phrasings and scenarios

