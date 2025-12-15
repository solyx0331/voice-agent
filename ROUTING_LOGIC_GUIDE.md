# Routing Logic Configuration Guide

## Where to Find Routing Logic

The **Routing & Response Logic** section is located in the **Base Receptionist Logic** area of the Agent Configuration Dialog.

### Step-by-Step Location:

1. Open the Agent Configuration Dialog (Create or Edit an agent)
2. Scroll down to the **"Base Receptionist Logic"** section
3. Look for **"Routing & Response Logic"** (it's the last section in Base Receptionist Logic, right before FAQs)
4. Click **"Add Rule"** to create routing rules

## Visual Guide

```
Agent Configuration Dialog
├── Basic Information (Name, Description, Status)
├── Voice Configuration
├── Base Receptionist Logic  ← Look here!
│   ├── Greeting Message
│   ├── Primary Intent Prompts
│   ├── Lead Capture Questions
│   └── Routing & Response Logic  ← HERE! (Click "Add Rule")
├── FAQs
├── Intents
└── Notifications
```

## How to Configure Routing Rules

Each routing rule has 3 fields:

### 1. Condition (When this happens)
**Example**: `caller says "Evolved Sound"`

This is the trigger condition. The agent will check if this condition is met during the conversation.

### 2. Action (What to do)
**Example**: `Route to Evolved Sound logic tree`

This describes what action the agent should take when the condition is met.

### 3. Response (What to say)
**Example**: `Thank you for choosing Evolved Sound. What type of service are you enquiring about? (e.g., voice over, audio production)`

This is the actual message the agent will say to the caller.

## Example: Sales Assistant Routing Rules

### Rule 1: Evolved Sound Routing
- **Condition**: `caller says "Evolved Sound"`
- **Action**: `Route to Evolved Sound logic tree`
- **Response**: `Thank you for choosing Evolved Sound. What type of service are you enquiring about? (e.g., voice over, audio production)`

### Rule 2: QW Direct Routing
- **Condition**: `caller says "QW Direct"`
- **Action**: `Route to QW Direct logic tree`
- **Response**: `Thank you for choosing QW Direct. What service are you looking for? (e.g., direct marketing, digital campaign)`

### Rule 3: Unclear Response
- **Condition**: `caller response is not understood`
- **Action**: `Ask for clarification`
- **Response**: `I didn't catch that. Could you repeat the name of the company you are calling?`

### Rule 4: Fallback After Two Attempts
- **Condition**: `caller's response is not understood twice`
- **Action**: `Offer human representative`
- **Response**: `I'm sorry, I'm having trouble understanding you. Would you like to speak to a human representative instead?`

## Tips

1. **Order Matters**: Rules are processed in order. Put more specific rules first.
2. **Be Specific**: Use clear, specific conditions (e.g., `caller says "Evolved Sound"` not just `"Evolved Sound"`)
3. **Test Thoroughly**: After adding rules, test with different phrasings to ensure they work
4. **Use Natural Language**: The condition should describe what the caller does/says in natural language

## Troubleshooting

**Q: I can't see the Routing & Response Logic section**
- Make sure you're in the "Base Receptionist Logic" section
- Scroll down - it's at the bottom of that section
- If you still don't see it, try refreshing the page

**Q: My routing rules aren't working**
- Check that conditions are written clearly
- Verify the greeting message asks the right question first
- Test with exact phrases from your conditions
- Check the call logs to see what the agent actually heard

**Q: How do I delete a rule?**
- Click the X button in the top-right corner of each rule card


