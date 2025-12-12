# Information Gathering Configuration Guide

## Overview

The Sales Assistant test requires two types of information gathering:

1. **Information Gathering Questions** - Company-specific questions (different for Evolved Sound vs QW Direct)
2. **Lead Capture Fields** - Universal fields collected from all callers (name, phone, email)

## Where to Find Each Section

### 1. Information Gathering Questions

**Location**: 
- Open Agent Configuration Dialog
- Scroll to **"Base Receptionist Logic"** section
- Find **"Information Gathering Questions"** (in the middle of Base Receptionist Logic)

**Purpose**: Company-specific questions asked after routing to a company

**Examples for Sales Assistant**:

**Evolved Sound Questions:**
- "What type of service are you enquiring about? (e.g., voice over, audio production)"
- "What is your approximate budget range?"
- "Are you an individual or a business?"

**QW Direct Questions:**
- "What service are you looking for? (e.g., direct marketing, digital campaign)"
- "How large is your company?"
- "What timeframe are you looking at for this service?"

**How to Add**:
1. Click "Add" button in "Information Gathering Questions" section
2. Enter the question text
3. The agent will ask these questions based on which company was selected

### 2. Lead Capture Fields (Universal)

**Location**:
- Open Agent Configuration Dialog
- Scroll down past the FAQs section
- Find **"Lead Capture Fields (Universal)"** section

**Purpose**: Standard fields collected from ALL callers (universal questions)

**Required Fields for Sales Assistant**:

1. **Full Name**
   - Field Name: `fullName`
   - Question: `What is your full name?`
   - Type: `text`
   - Required: ✅ Yes

2. **Phone Number**
   - Field Name: `phoneNumber`
   - Question: `What is your best contact number?`
   - Type: `phone`
   - Required: ✅ Yes

3. **Email Address**
   - Field Name: `email`
   - Question: `What is your email address?`
   - Type: `email`
   - Required: ✅ Yes

**How to Add**:
1. Click "Add Field" button in "Lead Capture Fields (Universal)" section
2. Fill in:
   - Field Name (e.g., `fullName`)
   - Field Type (text, email, phone, or number)
   - Question to Ask (e.g., "What is your full name?")
   - Check "Required field" if needed
3. Click X to remove a field

## Visual Guide

```
Agent Configuration Dialog
├── Basic Information
├── Voice Configuration
├── Base Receptionist Logic
│   ├── Greeting Message
│   ├── Primary Intent Prompts
│   ├── Information Gathering Questions  ← Company-specific questions HERE
│   └── Routing & Response Logic
├── Lead Capture Fields (Universal)  ← Universal fields HERE (name, phone, email)
├── FAQs
├── Intents
└── Notifications
```

## Key Differences

| Feature | Information Gathering Questions | Lead Capture Fields |
|---------|-------------------------------|---------------------|
| **Location** | Base Receptionist Logic section | Separate section (after FAQs) |
| **Purpose** | Company-specific questions | Universal fields for all callers |
| **When Asked** | After routing to a company | After company selection (universal) |
| **Examples** | Service type, budget, company size | Name, phone, email |
| **Format** | Simple text questions | Structured fields with types |

## Complete Flow Example

For Sales Assistant, the flow is:

1. **Greeting**: "Hello! Thank you for calling. Please say the name of the company..."
2. **Routing**: Caller says "Evolved Sound" or "QW Direct"
3. **Information Gathering**: Ask company-specific questions (from Information Gathering Questions)
   - Evolved Sound: service type, budget, individual/business
   - QW Direct: service type, company size, timeframe
4. **Lead Capture**: Ask universal questions (from Lead Capture Fields)
   - Full name
   - Phone number
   - Email address
5. **Summary**: Generate call summary with all collected information

## Tips

1. **Information Gathering Questions**: Add all questions for both companies - the agent will ask the appropriate ones based on routing
2. **Lead Capture Fields**: These are asked to everyone, so make sure they're universal
3. **Field Names**: Use clear, consistent names (e.g., `fullName`, `phoneNumber`, `email`) - these are used in email summaries
4. **Required Fields**: Mark essential fields as required (name, phone, email should all be required)

## Troubleshooting

**Q: I can't find Information Gathering Questions**
- It's in the "Base Receptionist Logic" section
- Scroll down within that section - it's after "Primary Intent Prompts" and before "Routing & Response Logic"

**Q: I can't find Lead Capture Fields**
- Scroll down past the FAQs section
- It's a separate section labeled "Lead Capture Fields (Universal)"
- If you don't see it, make sure you're not in a collapsed section

**Q: Which questions go where?**
- Company-specific questions → Information Gathering Questions
- Universal questions (name, phone, email) → Lead Capture Fields

**Q: Do I need to add questions for both companies?**
- Yes, add all questions in Information Gathering Questions
- The agent will use routing logic to determine which questions to ask
- You can also add notes in the questions like "(for Evolved Sound)" or "(for QW Direct)" to help the agent

