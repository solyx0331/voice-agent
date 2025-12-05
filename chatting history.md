

**Steven Freeman**

**11:17 AM**



Hi Maksym R.

We are reviewing the option of launching a white-labelled, high-margin SaaS product by leveraging our audio expertise, focused on recurring revenue from two specialized, integrated services (AI Receptionist and Audio Restoration). The technical core involves integrating a Custom Voice (ElevenLabs/Vapi) with our client management portal (SuiteDash). Please outline your specific experience in building a full end-to-end integration and software solution for the AU/NZ market. Thanks



**Monday, Nov 10**

**Maksym Rekhniuk**

**9:56 AM**

HI Steven

I found that your idea is great, combining AI voice and audio restoration into a white-labelled SaaS is exactly where the market’s heading.

I recently built a system that connected custom AI voices (ElevenLabs + Vapi) with a client portal to handle inbound calls, transcriptions, and automated lead capture. It also included Stripe recurring billing and a white-label dashboard so resellers could onboard clients under their own brand.

Additionally, I have exp of SuiteDash’s API to automate user setup, project linking, and invoicing. I believe that that experience fits with the type of integration you’re planning for the AU/NZ market.

Just to confirm, Would you like the AI Receptionist to handle live calls through Twilio/Vapi, or only process inbound voice messages?



Should each SuiteDash client have their own branded AI workspace with separate Stripe billing, or would everyone share one backend with role-based access?



I would appreciate it if you could confirm these questions and share the doc of your project



Hope to discuss more soon

Best

Maksym



**Steven Freeman**

**10:25 AM**

Hi Maksym,, thanks for the fast response, sounds like you have some good experience. Please review the critical details below along with the requirements attached. Then please provide a response to the following questions.

\- Cost Predictability and Fixed-Price MVPOur priority is a predictable budget that covers the entire working solution.

Fixed-Price Quote: What is your best-estimated fixed price and timeline (in weeks) for completing the core MVP deliverables outlined in the brief (Vapi/Synthflow setup, SuiteDash billing logic, and initial Zapier flows)?

Payment Security: Can we structure the final payment for the build as: 80% upon completion, with the final 20% contingent on a successful, continuous 1-week data synchronization between the new AI platform and the required Zapier hooks? (This ties payment directly to proven reliability).



\- Technical Vetting (Focus on Quality)We need confidence that the high-quality product will work flawlessly in our market.

Latency Strategy: What is your specific plan for maintaining the Sub-200ms RTT latency required for natural-sounding AI in the AU/NZ region, given the need for local Points of Presence (PoPs)?

Data Governance: Given we are keeping our core client data in SuiteCRM and billing in SuiteDash, what mechanisms would you implement to ensure data integrity and prevent errors during the two-way sync?



\- Partnership and Support (Long-Term Alignment)We are committed to growing this service and need a reliable partner for maintenance.

Go-Live Performance Bonus: We prefer to compensate partners for success. Would you be open to a significant, one-time lump sum bonus paid immediately upon the successful onboarding and billing of the first 5 paying clients.

Ongoing Maintenance: How much time is estimated to maintain / monitor such a system.

Your detailed response to these points will confirm your suitability as our technical partner. Thanks, Steven



brief-261025.docx 

brief-261025.docx

18 kB



**Maksym Rekhniuk**

**10:26 AM**

Thanks for sendng docs and confimration



I will check it soon, and am interested in MVP



**Maksym Rekhniuk**

**11:01 AM**

Going through the description and requirements of this MVP, I would propose 2 milestones to clarify the project development



Milestone 1: Core Integration Setup (Vapi + SuiteDash) - 3 weeks

\- Configure Vapi for the AI Receptionist (inbound call handling and routing).

\- Deploy and test ElevenLabs custom voice model using the Sydney PoP for low latency.

\- Set up SuiteDash as a white-label client portal with full branding and billing.

\- Implement subscription and usage-based rebilling for AI voice minutes.

Establish secure data flow between Vapi - SuiteDash - CRM.



Milestone 2: Automation \& Reliability Layer (Zapier/make) - 2 weeks

\- Build 5–7 automation workflows in Zapier, such as:

AI - HubSpot lead creation

SuiteDash - Auphonic trigger (audio restoration)

Audio upload - Processing - Result sync

\- Define and document the data schema for SuiteCRM / Saasu integration.

\- Add logging, error-handling, and retry logic for reliable two-way sync.



M3: Run a 1-week stability test to confirm continuous, error-free operation.



Hopefully it makes sense to you



**Maksym Rekhniuk**

**11:07 AM**

I totally accpet your payment security - 80 + 20



FYI: I found that you have lots of exp on Upwork, and I fully understand what you are worried. However, if that's possible, I would appreciate it if you could divide the payments M1-40%, M2-40% and M3-20%

I believe that it will encourage me to develop MVP successfully, you know

I also think that is more important is to accomplish the goal of the project rather than others



I kindly propose $3500 (USD) for this MVP, which is fair for you.

I want to know your budget of this MVP



Please view these answers regarding of your technical questions



Latency Strategy:

I’ll host Vapi and API services in Sydney (AWS) so data stays local and latency remains under 200 ms. Vapi will route calls through Sydney or Singapore Points of Presence, with small buffering and live latency monitoring to keep the voice smooth and responsive.



Data Governance:

I’ll ensure reliable SuiteCRM - SuiteDash synchronization using verified API calls, retry logic, and detailed logging. Each update will be validated to avoid duplicates or data loss, keeping client and billing records accurate and automatically in sync.



**Steven Freeman**

**11:13 AM**

Thanks Maksym, please also provide:

Working Voice Demo (Live Number)

A live, active dial-in number (preferably Australian) showcasing the quality of the AI voice and latency. This verifies your low latency strategy.

--

Monitoring Dashboard Screenshot

A screenshot of the Health Monitoring Dashboard from a similar project. This must show error logs, API uptime, or call latency metrics.

--

Automation Workflow View

A screenshot of a Zapier or Make.com/n8n workflow used for lead sync, showing the general complexity and clarity of your logic flow.

--

White-Label Portal Demo

Login and dashboard access (or high-resolution screenshots/video) of a similar client-facing portal that you built to manage customer settings and subscriptions.



Usage Billing Screenshot

A screenshot showing how the system meters usage (e.g., minutes spoken) and how that usage data is converted into a recurring invoice in a billing system (Stripe, etc.).





Customer Setup Interface

A screenshot of the backend interface used to configure a new client (i.e., where you input their phone number, set their lead flow rules, and assign the ElevenLabs voice ID). Thanks, Steven



**Maksym Rekhniuk**

**11:15 AM**

For Go live performance and Ongoing maintenence, Yes, I’m open to the bonus structure.



Once the first five paying clients are onboarded and billing correctly, I’d be happy to receive a one-time success bonus.



After launch, I think the system should only need light monitoring, around 2- 4 hours per week for checking API connections, reviewing Zapier runs, and minor updates, covered by a simple monthly maintenance retainer.



Hopefully it makes sense to you

Thanks a lot



**Maksym Rekhniuk**

**11:23 AM**

I have USA number for my project, however, I am not in a position to share it, as it was built under a private agreement.

Further more, Once I share the number, the Upwork team recognize it as a phone number

Sharing contact info before making a contract is prohibited by the terms and policy of Upwork team

I think you can understand it as you have rich exp on Upwork



However, once we make a contract, I am willing to share the number



**Steven Freeman**

**Nov 10, 2025 | 11:13 AM**

Thanks Maksym, please also provide:

Working Voice Demo (Live Number)

A live, active dial-in number (preferably Australian) showcasing the quality of the AI voice and latency. This verifies your low latency strategy.

--

Monitoring Dashboard Screenshot

A screenshot of the Health Monitoring Dashboard from a similar project. This must show error logs, API uptime, or call latency metrics.

--

Automation Workflow View

A screenshot of a Zapier or Make.com/n8n workflow used for lead sync, showing the general complexity and clarity of your logic flow.

--

White-Label Portal Demo

Login and dashboard access (or high-resolution screenshots/video) of a similar client-facing portal that you built to manage customer settings and subscriptions.



Usage Billing Screenshot

A screenshot showing how the system meters usage (e.g., minutes spoken) and how that usage data is converted into a recurring invoice in a billing system (Stripe, etc.).



Customer Setup Interface

A screenshot of the backend interface used to configure a new client (i.e., where you input their phone number, set their lead flow rules, and assign the ElevenLabs voice ID). Thanks, Steven



Show more

**Steven Freeman**

**11:32 AM**

OK will review more



**Steven Freeman**

**11:40 AM**

OK see if you can share the other points mentioned so your working solution that does not compromise your private agreement



**Maksym Rekhniuk**

**11:46 AM**

And I am not in a position to share white label Portal demo with detailed info

However, I can send these screenshots



2 files 

monitoring dashboard.png

zapier.png

And I can't share the billing screenshot due to the terms of private



FYI: I am willing to build the MVP with my best practice

If you aren't able to understand this private terms of my recent project, I think we won't be albe to collaborate for your MVP and it is better that find another candidate



Thanks for your understanding in advance 🙂



**Steven Freeman**

**11:50 AM**

Ok sure will review everything



Favorited

**Maksym Rekhniuk**

**11:50 AM**

I thisnk you can understand it as you have rich exprience on Upwork



Thanks for your understanding



**Steven Freeman**

**Nov 10, 2025 | 11:50 AM**

Ok sure will review everything



Hope to hear from you soon



Please build the MVP live soon

I think Chance favors the prepared mind!



**Maksym Rekhniuk**

**11:44 PM**

Hey Steven



Just wnated to check in if you checked everything including milestones, and so on



**Steven Freeman**

**11:46 PM**

Yes doing detailed review thanks



**Maksym Rekhniuk**

**11:49 PM**

Sounds good



I am really excited to this MVP, and want to build the MVP with my best practices



Are you agree with the milestones that I proposed for MVP?



I would appreciate it if you could share the budget and timeline of the MVP



Tuesday, Nov 11

**Steven Freeman**

**8:45 AM**

Thanks Maksym, and what is your minimum monthly time to manage the full system covering: API Failure Response, Data Integrity Check, Feature Maintenance once everything is setup and is running smoothly



**Maksym Rekhniuk**

**9:55 AM**

Hi Steven

Hope you are having a nice day!



Once the system is stable, it should require about 8-10 hours per month for ongoing maintenance. This time will be used to monitor API performance, check data integrity, and apply small updates or fixes as needed.



I believe this amount of time is sufficient to keep the system safe and running smoothly.



**Maksym Rekhniuk**

**10:12 AM**

Just wondering, after the MVP goes live, would you like me to include proactive system checks each month (API health, data sync validation, Zapier run reviews), or should I only step in when an issue is reported?



**Steven Freeman**

**10:34 AM**

We would assiistance to keep everything running smoothly any issues if they arise



**Maksym Rekhniuk**

**10:46 AM**

Sounds good



Let's start the working of this MVP and make a contract here



Chance favors prepared mind 🙂



**Maksym Rekhniuk**

**10:59 AM**

I am ready to start working immediately



Wednesday, Nov 12

**Maksym Rekhniuk**

**8:57 PM**

HI Steven

Just wanted to check in and see if everything is going well



Thursday, Nov 13

**Steven Freeman**

**3:52 AM**

How fluent is your English if we have a call to go through some more questions.



**Maksym Rekhniuk**

**8:51 AM**

Hey Steven



I want to be honest with you, my spoken English isn’t very strong, so sometimes my pronunciation and accent might be a bit hard to follow.

However, my written English is clear and fully suitable for discussing all project details.





If you have any more questions, feel free to send them here. I’m happy to answer everything before we move forward with a contract.



Thanks for your understanding in advance 🙂



**Maksym Rekhniuk**

**9:58 AM**

I am always thinking what is more important is to accomplish the goal of the project rather than othes



I would appreciate it if you could text the questions you wanted to go thorugh



**Steven Freeman**

**10:39 AM**

Thanks Maksym: How can you accurately test the ‘good English’ metrics of a custom voice agent build for a client if your English isn’t that strong yourself?



--

Just to confirm, Would you like the AI Receptionist to handle live calls through Twilio/Vapi, or only process inbound voice messages?  – does using https://www.retellai.com/ instead of VAPI have any advantages in our plan in terms of premium low latency product, and less time / risk in managing everything?

Objective is to process inbound calls, such lead qualification, live answer instead of voicemail etc and an entry level sevice we can package to suit a broad reach.

Then second level would be higher level customisation.



Should each SuiteDash client have their own branded AI workspace with separate Stripe billing, or would everyone share one backend with role-based access?  We just need one main branded workspace for Australian business billing in AUD. If goes well to plan, we would need a sub-work space for our NZ division, with main difference being choice of voices, billing in NZD and different formatted invoices / invoice address for customer corresponded its. Same trading name, just different regions. Future opening to another reseller could be considered in future but not part of the current objective which is to test market.



I’ll host Vapi and API services in Sydney (AWS)  Does mean we would need to run our own AWS instance?



Based on your design idea what would be estimated minimum monthly cost we would need to pay for all the various vendor subscriptions and services to run the the voice agent system as a total solution



We aren't selling a full white label platform. We are just using Suitedash to brand the voice agent service to our existing business. My company simply wants to sell voice agent services to end customers.





Please detail exactly how we onboard a new client. How do we gather the information so we can build the custom logic in the back end. I need to know exactly what the customer will need to do, what we do, and what you do in this entire end to and process so I can understand this process as a total onboarding workflow.

How do we manage setting up new agent client, process, revision?



What the level of document and clarity will have on your total setup if we need to engage another developer in future to help us manage system, fix bug, or build a voice agent. If you are away or unavailable for assistance.



Wil the connection with SuiteDash be built for flexibility and resilience allowing us to easily swap in and out tools later.



AI Voice Agent Platform for Phone Call Automation

Build, test, deploy, and monitor production-ready AI voice agents at scale with ease, boosting efficiency and performance across your operations.



**Maksym Rekhniuk**

**11:07 AM**

I completely understand your concern.

Even though my spoken English isn’t good , that actually helps with testing because your AI voice agent needs to work well with a wide range of accents and imperfect speech. I can test it thoroughly using both my spoken English and standard test scripts to ensure clarity



FYI: Google Translator can recognize my spoken English well enough for a communication



**Maksym Rekhniuk**

**11:35 AM**

I recommend handling live inbound calls rather than only processing voice messages, because it gives a smoother experience for lead qualification and real-time responses.



Retell can reduce setup time and ongoing risk because it handles more of the call flow and streaming logic internally. It’s also very strong in maintaining low latency without much backend management.



So for a fast, stable MVP, Retell is simpler and lower-risk, and for higher-level customisation later, Vapi is more customizable.



**Maksym Rekhniuk**

**11:42 AM**

For the MVP, we will use one main branded SuiteDash workspace for the Australian business with billing in AUD. That will keep the setup simple and aligned with your current testing goals.







If the MVP goes well, I can add a second workspace for New Zealand with its own voice settings, NZD billing, and invoice format, while keeping the same trading name. Additional reseller workspaces can be added later



Regarind of AWS instance, No, you won’t need to run or manage your own AWS instance.

I handle the hosting setup on my side, and it’s only used to keep latency low for AU/NZ users.



**Maksym Rekhniuk**

**11:54 AM**

Regraing of monthly cost, we need to use Vapi/Retell, Elevenlabs, Twilio, AWS hosting and zapier, it would take 110-125 monthly at minimum



Here’s the simple onboarding process for each new client so you can see the full workflow clearly:







\- You collect the basic business information (services, FAQs, call rules, hours, voice preference).

\- You review and approve the call flow.

\- I build the agent based on the approved details and set up the logic, voice prompts, SuiteDash connection, and Zapier automation.

\- You test the agent by making a call.

\- I apply any revisions you need.

\- Once approved, we go live on the client’s number.



FYI:I will also provide clear documentation of the whole setup so any future developer can understand how the system works and maintain it if needed.

However, i want to work with you long term



Regarding flexibility and resilience, Yes, the SuiteDash connection will be built so the system is not locked to one platform. You’ll be able to switch to another CRM or billing tool later without needing to rebuild the entire setup.







Hopefully it makes sense to you

Thanks



**Maksym Rekhniuk**

**12:21 PM**

One question



Just to confirm the core MVP logic, should the AI Receptionist send structured lead data directly into SuiteDash (name, phone, intent, call outcome), or should we also store the full call transcript so you can review calls and improve the agent’s behaviour for different regions and clients later on?



**Maksym Rekhniuk**

**6:41 PM**

Hey Steven



Just wondering, do you have any other questions?



If you don't have any other questions, I think we can move to forward with making the contract here



Hope to hear from you soon

Thanks



**Friday, Nov 14**

**Steven Freeman**

**6:16 AM**

Here is a reponse Maksym: Yes voice agent shoudl handle live inbound real inbound calls as the primary product we want to create.



So you are saying Retell will help achieve lowest latency, less technical risk, and fast deployment.



Regarind of AWS instance, No, you won’t need to run or manage your own AWS instance.

I handle the hosting setup on my side, and it’s only used to keep latency low for AU/NZ users.

 Can you explain this? We need full ownership / admin right/control / over all elements in this system and rely can’t rely on a critical note in your control.

Please detail about the AWS component specifically, how it sits in the design chain, our control / ownership and associated costs.



\-

Onboarding:

\- You collect the basic business information (services, FAQs, call rules, hours, voice preference)







Please detail how this process can work in reality to make it easy as possible for the customer?

Are you talking about a standard document they will out and we forward to you to setup or more an integrated / automated approach which some form validation via suitedash?







\- You review and approve the call flow.

How does this step actually work.







\- I build the agent based on the approved details and set up the logic, voice prompts, SuiteDash connection, and Zapier automation.







\- What is estimated time to build basic level and more complex 2nd tier voice agents? Can the setup options / costs be more productised.



\- You test the agent by making a call.



What time / process involved to do this. Or customer does this?

\- I apply any revisions you need.







How are revisions formatted / communicated back.



\- Once approved, we go live on the client’s number.



\-

Just to confirm the core MVP logic, should the AI Receptionist send structured lead data directly into SuiteDash (name, phone, intent, call outcome), or should we also store the full call transcript so you can review calls and improve the agent’s behaviour for different regions and clients later on?





We need to consider customers phone data security / privacy / cost of data retention as an essential design point.

We can’t without VO agent asking for consent, and many customer may not want that voice agent to ask for consent.

--

The short answer is: Call history reviews should be pushed to the client's preferred digital channel (email/CRM) but stored within the SuiteDash portal.

Here is the strategic breakdown of the process:

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

The Call History Workflow (Client-Centric)

The goal is to provide the data where the client works (email/CRM) while keeping the full historical archive in your branded system (SuiteDash).

1\. Data Synced to the Client's System (The "Actionable" Data)

You will use Zapier/Make.com to send the essential data directly to the client's preferred system, minimizing friction.

• Email / SMS: Immediately upon call completion, send the client's office an automated email/SMS notification that includes the AI-generated call summary and the outcome (e.g., "New Lead Qualified, Needs Quote"). This ensures the client follows up instantly.

• Client CRM (HubSpot/Zoho): The structured data (Name, Phone, Intent) is automatically pushed to the client's CRM, allowing them to track the lead.

2\. Data Stored and Displayed in SuiteDash (The "Review" Data)

Your client will log into the Evolved Sound SuiteDash Portal for comprehensive review and compliance.

• Full Archive: The full transcript recorded by default.

And saving / archiving of the actual audio recording of call would need to be an add-on, as legally the voice agent would need to say the call is being recorded and give option to hang etc. Some voice agent designs would not want to ask this question.







• And if we are keep audio the link to the audio recording are stored in SuiteDash (or linked from the S3 vault, displayed in the SuiteDash UI).

Not sure about the call audio archiving, as this would present a significant security and storage / cost / risk. Maybe this could be a future custom offering, and allow customer to store such an archive on their storage?

• Why SuiteDash: The client needs a single, secure, branded place to:

o Listen to the Recording: For quality checking (QA) or legal compliance. (if we are including audio copy)

o Review Usage: To verify why they were billed for a specific call duration.

o Avoid External Logins: They only need their Evolved Sound/SuiteDash login, not an extra login to your internal systems.







1\. Why Full Call Recording is Mandatory 🚨

You cannot eliminate storing the call data because it is essential for:

Financial Compliance and Billing: Since you are charging clients based on usage minutes ($X per minute of AI interaction), the call recording is the auditable proof of that usage. If a client disputes a bill, you need the recording to validate the charge.

Quality Assurance (QA) and Improvement: As you expand, you will need to audit real-world calls to train the AI model on new slang, regional accents (AU/NZ), and complex scenarios, which improves the agent's performance.

Legal Protection: For many service industries (like finance, legal, insurance), the call recording serves as the legal record of what was said (e.g., pricing agreed upon, services declined). Your client needs this for their own compliance.







2\. The Solution: Store Externally with Clear Retention Limits

You must address the "significant cost and responsibility" by managing where and for how long the data is stored.

• Storage Location: You must store the audio files externally in a low-cost, high-volume cloud storage solution (like AWS S3 or Google Cloud Storage). Do not store them on the SuiteDash server or in your SuiteCRM database, as this would be prohibitively expensive and slow down your systems

Cost Management: While you store the full files, you pass the cost through to the client via your usage fee.

Retention Policy: The greatest safeguard against risk is a contractual retention policy. Your service agreement with the client must state that recordings are only retained for a standard period (e.g., 3 months, 6 months, or 12 months), after which they are automatically deleted unless the client pays a premium for long-term archival storage.



Tuesday, Nov 18

**Maksym Rekhniuk**

**12:53 PM**

Hey Steven

Thanks for the detailed questions



1\. Live Calls \& Retell/Vapi

Yes, the AI will handle live inbound calls. Retell can give lower latency and less technical risk for the MVP, while Vapi is better later for deeper customization.



2\. AWS Ownership \& Control

You will have full ownership. If AWS is required, it will be created inside your AWS account, not mine.

It only handles small routing tasks, not customer data.

Cost is usually $5–10/month, and you have full admin control.



3\. Onboarding New Clients

To make onboarding simple, we can start with a short intake form where the customer enters their business details. Later, we can move this into SuiteDash as an automated form with validation.

After the client submits the form, I send you a simple call-flow draft to approve.







4\. Build Time for Agents

Basic agents take about 2–4 hours to build.

More complex second-tier agents take 6–10 hours.

Yes, these can be productised into clear setup packages.







5\. Testing \& Revisions

You or the client can test the agent by simply calling the number.

Revisions can be sent as bullet points, and I update the logic accordingly.







6\. MVP Data Logic (Structured Data vs Transcript)

For MVP, the agent will send structured lead data into SuiteDash.

Transcripts can be stored in SuiteDash for review and improvement, but must follow your privacy rules.







7\. Call Recording \& Storage

Audio recording can be optional, because it requires consent.

If you want recordings, they can be stored in your AWS S3 with automatic deletion rules (3–12 months).

This keeps security high and storage cost low.







Hopefully it makes sense to you



Once you make a contract here, I am willing to start it immediately

Please let me know, if you move forward with me for this MVP







Looking forward to hearing from you soon







Best

Maksym



**Wednesday, Nov 19**

**Steven Freeman**

**3:33 AM**

Thanks a lot Maksym and that answers all our latest questions. We are reviewing everything further.



**Maksym Rekhniuk**

**9:57 AM**

no problem



**Maksym Rekhniuk**

**11:53 PM**

Hey Steven







Just wanted to check in and see if everything is going well on your edn



Hope to hear fromyou



**Friday, Nov 21**

**Steven Freeman**

**4:06 AM**

Thanks for bearing with us, Maksym. Your offer is short‑listed in our process.

Please break down your top‑level MVP quotation into fixed‑priced milestones, each tied to successful completion of each stage.

If you believe any corrections are needed in the attached spreadsheet, please highlight them in a different colour font so they are easy to identify. Thanks, Steven



voice\_audio\_AI\_project\_roadmap\_211125.xlsx 

voice\_audio\_AI\_project\_roadmap\_211125.xlsx

12 kB



**Maksym Rekhniuk**

**6:34 AM**

Hey Steven

Thanks for your kindness







I will check the doc carefully and highlithem them if there is



**Maksym Rekhniuk**

**8:42 AM**

I highlighted some technical things, which are small issues

No worries







I can build the MVP with my best practices



**Maksym Rekhniuk**

**8:49 AM**

This is highlighted doc



voice\_audio\_highlighted\_with\_reasons.xlsx 

voice\_audio\_highlighted\_with\_reasons.xlsx

10 kB

I fixed the technicalll small issues and updated it



voice\_audio\_AI\_roadmap\_fixed\_with\_reasons.xlsx 

voice\_audio\_AI\_roadmap\_fixed\_with\_reasons.xlsx

10 kB

I made milestones focusing on MVP carefully



MVP\_Milestones.docx 

MVP\_Milestones.docx

44 kB

Let's build the MVP to live for success



Best

Maksym



**Tuesday, Nov 25**

**Steven Freeman**

**3:56 AM**

So we agree Maksim to use Retell.AI and not VAPI to get us going fast and reliably? I have updated the spreadsheet. Please review and ensure there will be nothing missing or hidden costs from your side to get us to market to be able to start selling this service.



Retell, Inc.

voice\_audio\_AI\_roadmap.xlsx 

voice\_audio\_AI\_roadmap.xlsx

15 kB



**Maksym Rekhniuk**

**7:45 PM**

Hey, steven

yep. using Retell ai for the MVP makes the most sense - it's faster to deploy, lower risk, and keeps latency solid for AU/NZ . No surprises there



I will go through the updated spreadsheet now and double check everything so there are no mising items or hidden costs on my side



thanks again- we are close to being ready to build this live 👍



**Wednesday, Nov 26**

**Maksym Rekhniuk**

**11:20 AM**

Hey, Steven

I ve reviewed the updated doc and everyghing lloks soid on my end. NO issues



if u re happy with it too, feel free to send the contract. I am ready to start working as soon as it's in place



looking forward to getting the MVP moving



**Thursday, Nov 27**

**Steven Freeman sent an offer**



4:21 AM

Professional AI and Product Software Development to create a new product we can sell to market in accordance with the agreed voice\_audio\_AI\_roadmap\_251125.xlsx document and discussions through Upwork.



Est. Budget: $3,900.00



Milestone 1: Milestone 1 - Core Voice Agent and Inbound Call System



Due: Thursday, Dec 18, 2025



Project funds: $1,000.00



View offer

voice\_audio\_AI\_roadmap\_251125.xlsx 

voice\_audio\_AI\_roadmap\_251125.xlsx

15 kB



**Maksym Rekhniuk accepted an offer**



**5:19 AM**

thanks, I will provide the best result



View contract



**Steven Freeman**

**5:22 AM**

Thanks Maksym, and before you start we also require a copy of your ID, and confirm address so we can forward the contractor agreement too for signing. Then once that is in place you will be good to go.



**Maksym Rekhniuk**

**5:25 AM**

Okay. Np

