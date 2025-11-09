\# DocuSign Integration Guide - Green Acres Land Investments



\*\*Created:\*\* November 8, 2025  

\*\*Current System:\*\* In-app signature system (Option 2)  

\*\*Upgrade Path:\*\* DocuSign API integration  



---



\## 📋 Current System Overview (Option 2)



\### What We Built

\- Contract auto-fill with merge fields

\- In-app signature collection (customer types name)

\- Database tracking of signature status

\- Audit trail: timestamp, IP address, user agent

\- Admin and customer can download signed contracts



\### Database Schema (contracts table)

```sql

CREATE TABLE contracts (

&nbsp; id SERIAL PRIMARY KEY,

&nbsp; loan\_id INTEGER REFERENCES loans(id),

&nbsp; contract\_text TEXT NOT NULL,

&nbsp; status VARCHAR(50) DEFAULT 'pending',

&nbsp; -- Status: 'pending', 'customer\_signed', 'fully\_signed'

&nbsp; 

&nbsp; customer\_signature VARCHAR(255),

&nbsp; customer\_signed\_date TIMESTAMP,

&nbsp; customer\_ip\_address VARCHAR(45),

&nbsp; customer\_user\_agent TEXT,

&nbsp; 

&nbsp; admin\_signature VARCHAR(255),

&nbsp; admin\_signed\_date TIMESTAMP,

&nbsp; admin\_ip\_address VARCHAR(45),

&nbsp; 

&nbsp; created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP

);

```



\### Key Files

\- \*\*Backend:\*\* `/server/server.js` - Contract generation endpoint

\- \*\*Backend:\*\* `/server/contract-template.txt` - Template with merge fields

\- \*\*Frontend:\*\* `/client/src/pages/Dashboard.js` - Customer signs here

\- \*\*Frontend:\*\* `/client/src/pages/AdminLoans.js` - Admin generates/signs here



---



\## 🔄 DocuSign Integration Steps



\### Step 1: DocuSign Account Setup

1\. Sign up at https://developers.docusign.com/

2\. Create Integration Key (API credentials)

3\. Generate RSA keypair for JWT authentication

4\. Add redirect URI: `https://greenacreslandinvestments.com/auth/docusign`



\*\*Save these to Railway environment variables:\*\*

```

DOCUSIGN\_INTEGRATION\_KEY=your\_integration\_key

DOCUSIGN\_USER\_ID=your\_user\_id

DOCUSIGN\_ACCOUNT\_ID=your\_account\_id

DOCUSIGN\_PRIVATE\_KEY=your\_rsa\_private\_key

DOCUSIGN\_ENVIRONMENT=sandbox (or production)

```



\### Step 2: Install DocuSign SDK

```bash

cd /server

npm install docusign-esign

```



\### Step 3: Update Database Schema

```sql

-- Add DocuSign fields to contracts table

ALTER TABLE contracts 

ADD COLUMN docusign\_envelope\_id VARCHAR(255),

ADD COLUMN docusign\_status VARCHAR(50),

ADD COLUMN docusign\_sent\_date TIMESTAMP,

ADD COLUMN docusign\_completed\_date TIMESTAMP,

ADD COLUMN docusign\_document\_url TEXT;

```



\### Step 4: Modify Backend (server.js)



\*\*Add DocuSign initialization (top of file, after other requires):\*\*

```javascript

const docusign = require('docusign-esign');

const fs = require('fs');



// Initialize DocuSign client

const jwtLifeSec = 10 \* 60; // 10 minutes

const scopes = "signature impersonation";



async function getDocuSignAccessToken() {

&nbsp; const apiClient = new docusign.ApiClient();

&nbsp; apiClient.setBasePath(process.env.DOCUSIGN\_ENVIRONMENT === 'production' 

&nbsp;   ? 'https://www.docusign.net/restapi'

&nbsp;   : 'https://demo.docusign.net/restapi');

&nbsp;   

&nbsp; const results = await apiClient.requestJWTUserToken(

&nbsp;   process.env.DOCUSIGN\_INTEGRATION\_KEY,

&nbsp;   process.env.DOCUSIGN\_USER\_ID,

&nbsp;   scopes,

&nbsp;   Buffer.from(process.env.DOCUSIGN\_PRIVATE\_KEY),

&nbsp;   jwtLifeSec

&nbsp; );

&nbsp; 

&nbsp; return results.body.access\_token;

}

```



\*\*Replace the "Generate Contract" endpoint (around line 2050):\*\*



\*\*FIND:\*\*

```javascript

app.get('/api/admin/loans/:id/generate-contract', authenticateAdmin, async (req, res) => {

```



\*\*REPLACE WITH:\*\*

```javascript

// Send contract to DocuSign

app.post('/api/admin/loans/:id/send-contract', authenticateAdmin, async (req, res) => {

&nbsp; try {

&nbsp;   const { id } = req.params;

&nbsp;   

&nbsp;   // Get loan data (same query as before)

&nbsp;   const result = await db.pool.query(`...same query...`);

&nbsp;   const loan = result.rows\[0];

&nbsp;   

&nbsp;   // Generate contract text (same logic as before)

&nbsp;   let contract = generateFilledContract(loan); // Extract to helper function

&nbsp;   

&nbsp;   // Get DocuSign access token

&nbsp;   const accessToken = await getDocuSignAccessToken();

&nbsp;   const apiClient = new docusign.ApiClient();

&nbsp;   apiClient.setBasePath(process.env.DOCUSIGN\_ENVIRONMENT === 'production' 

&nbsp;     ? 'https://www.docusign.net/restapi'

&nbsp;     : 'https://demo.docusign.net/restapi');

&nbsp;   apiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);

&nbsp;   

&nbsp;   // Create envelope definition

&nbsp;   const envelopeDefinition = new docusign.EnvelopeDefinition();

&nbsp;   envelopeDefinition.emailSubject = `Contract for Deed - ${loan.property\_title}`;

&nbsp;   

&nbsp;   // Add document

&nbsp;   const doc = new docusign.Document();

&nbsp;   doc.documentBase64 = Buffer.from(contract).toString('base64');

&nbsp;   doc.name = 'Contract for Deed';

&nbsp;   doc.fileExtension = 'txt';

&nbsp;   doc.documentId = '1';

&nbsp;   envelopeDefinition.documents = \[doc];

&nbsp;   

&nbsp;   // Add customer signer

&nbsp;   const customerSigner = new docusign.Signer();

&nbsp;   customerSigner.email = loan.email;

&nbsp;   customerSigner.name = `${loan.first\_name} ${loan.last\_name}`;

&nbsp;   customerSigner.recipientId = '1';

&nbsp;   customerSigner.routingOrder = '1';

&nbsp;   

&nbsp;   // Customer signature tab

&nbsp;   const signHere = new docusign.SignHere();

&nbsp;   signHere.documentId = '1';

&nbsp;   signHere.pageNumber = '1';

&nbsp;   signHere.recipientId = '1';

&nbsp;   signHere.tabLabel = 'CustomerSignature';

&nbsp;   signHere.xPosition = '100';

&nbsp;   signHere.yPosition = '700';

&nbsp;   

&nbsp;   customerSigner.tabs = { signHereTabs: \[signHere] };

&nbsp;   

&nbsp;   // Add admin signer (you)

&nbsp;   const adminSigner = new docusign.Signer();

&nbsp;   adminSigner.email = 'greenacreslandinvestments@gmail.com';

&nbsp;   adminSigner.name = 'Lisa Legendre';

&nbsp;   adminSigner.recipientId = '2';

&nbsp;   adminSigner.routingOrder = '2';

&nbsp;   

&nbsp;   // Admin signature tab

&nbsp;   const adminSignHere = new docusign.SignHere();

&nbsp;   adminSignHere.documentId = '1';

&nbsp;   adminSignHere.pageNumber = '1';

&nbsp;   adminSignHere.recipientId = '2';

&nbsp;   adminSignHere.tabLabel = 'SellerSignature';

&nbsp;   adminSignHere.xPosition = '100';

&nbsp;   adminSignHere.yPosition = '750';

&nbsp;   

&nbsp;   adminSigner.tabs = { signHereTabs: \[adminSignHere] };

&nbsp;   

&nbsp;   // Add signers to envelope

&nbsp;   envelopeDefinition.recipients = {

&nbsp;     signers: \[customerSigner, adminSigner]

&nbsp;   };

&nbsp;   

&nbsp;   envelopeDefinition.status = 'sent';

&nbsp;   

&nbsp;   // Send envelope

&nbsp;   const envelopesApi = new docusign.EnvelopesApi(apiClient);

&nbsp;   const results = await envelopesApi.createEnvelope(

&nbsp;     process.env.DOCUSIGN\_ACCOUNT\_ID,

&nbsp;     { envelopeDefinition }

&nbsp;   );

&nbsp;   

&nbsp;   // Save to database

&nbsp;   await db.pool.query(`

&nbsp;     INSERT INTO contracts 

&nbsp;     (loan\_id, contract\_text, status, docusign\_envelope\_id, docusign\_status, docusign\_sent\_date)

&nbsp;     VALUES ($1, $2, 'sent\_to\_docusign', $3, 'sent', NOW())

&nbsp;   `, \[id, contract, results.envelopeId]);

&nbsp;   

&nbsp;   res.json({ 

&nbsp;     success: true, 

&nbsp;     message: 'Contract sent to DocuSign',

&nbsp;     envelopeId: results.envelopeId 

&nbsp;   });

&nbsp;   

&nbsp; } catch (error) {

&nbsp;   console.error('DocuSign error:', error);

&nbsp;   res.status(500).json({ error: 'Failed to send contract' });

&nbsp; }

});



// DocuSign webhook endpoint (receives signing events)

app.post('/api/webhooks/docusign', async (req, res) => {

&nbsp; try {

&nbsp;   const event = req.body;

&nbsp;   

&nbsp;   if (event.event === 'envelope-completed') {

&nbsp;     const envelopeId = event.data.envelopeId;

&nbsp;     

&nbsp;     // Update database

&nbsp;     await db.pool.query(`

&nbsp;       UPDATE contracts 

&nbsp;       SET status = 'fully\_signed',

&nbsp;           docusign\_status = 'completed',

&nbsp;           docusign\_completed\_date = NOW()

&nbsp;       WHERE docusign\_envelope\_id = $1

&nbsp;     `, \[envelopeId]);

&nbsp;     

&nbsp;     // TODO: Send notification email to admin

&nbsp;   }

&nbsp;   

&nbsp;   res.json({ success: true });

&nbsp; } catch (error) {

&nbsp;   console.error('Webhook error:', error);

&nbsp;   res.status(500).json({ error: 'Webhook failed' });

&nbsp; }

});



// Download signed contract from DocuSign

app.get('/api/admin/loans/:id/download-signed-contract', authenticateAdmin, async (req, res) => {

&nbsp; try {

&nbsp;   const { id } = req.params;

&nbsp;   

&nbsp;   // Get envelope ID from database

&nbsp;   const result = await db.pool.query(`

&nbsp;     SELECT docusign\_envelope\_id 

&nbsp;     FROM contracts 

&nbsp;     WHERE loan\_id = $1 AND status = 'fully\_signed'

&nbsp;   `, \[id]);

&nbsp;   

&nbsp;   if (result.rows.length === 0) {

&nbsp;     return res.status(404).json({ error: 'Signed contract not found' });

&nbsp;   }

&nbsp;   

&nbsp;   const envelopeId = result.rows\[0].docusign\_envelope\_id;

&nbsp;   

&nbsp;   // Get DocuSign access token

&nbsp;   const accessToken = await getDocuSignAccessToken();

&nbsp;   const apiClient = new docusign.ApiClient();

&nbsp;   apiClient.setBasePath(process.env.DOCUSIGN\_ENVIRONMENT === 'production' 

&nbsp;     ? 'https://www.docusign.net/restapi'

&nbsp;     : 'https://demo.docusign.net/restapi');

&nbsp;   apiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);

&nbsp;   

&nbsp;   // Download document

&nbsp;   const envelopesApi = new docusign.EnvelopesApi(apiClient);

&nbsp;   const document = await envelopesApi.getDocument(

&nbsp;     process.env.DOCUSIGN\_ACCOUNT\_ID,

&nbsp;     envelopeId,

&nbsp;     '1' // document ID

&nbsp;   );

&nbsp;   

&nbsp;   res.setHeader('Content-Type', 'application/pdf');

&nbsp;   res.setHeader('Content-Disposition', `attachment; filename="Signed\_Contract\_${Date.now()}.pdf"`);

&nbsp;   res.send(document);

&nbsp;   

&nbsp; } catch (error) {

&nbsp;   console.error('Download error:', error);

&nbsp;   res.status(500).json({ error: 'Failed to download contract' });

&nbsp; }

});

```



\### Step 5: Update Frontend



\*\*AdminLoans.js - Change button text:\*\*

```javascript

// FIND:

📄 Contract



// REPLACE:

📧 Send to DocuSign

```



\*\*Dashboard.js - Show DocuSign status:\*\*

```javascript

// Add to customer dashboard:

{loan.contract\_status === 'sent\_to\_docusign' \&\& (

&nbsp; <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '5px' }}>

&nbsp;   📧 Your contract has been sent to your email via DocuSign.

&nbsp;   Please check your inbox and sign electronically.

&nbsp; </div>

)}



{loan.contract\_status === 'fully\_signed' \&\& (

&nbsp; <button 

&nbsp;   onClick={downloadSignedContract}

&nbsp;   className="btn"

&nbsp; >

&nbsp;   📄 Download Signed Contract

&nbsp; </button>

)}

```



\### Step 6: Configure DocuSign Webhook

1\. Go to DocuSign admin panel

2\. Set webhook URL: `https://your-railway-url.up.railway.app/api/webhooks/docusign`

3\. Enable events: `envelope-completed`, `envelope-sent`, `recipient-completed`



\### Step 7: Testing Checklist

\- \[ ] Admin sends contract from Loan Management

\- \[ ] Customer receives DocuSign email

\- \[ ] Customer signs electronically

\- \[ ] Admin receives notification to sign

\- \[ ] Admin signs electronically

\- \[ ] Webhook updates database status

\- \[ ] Both parties can download signed PDF

\- \[ ] Signed PDF stored in DocuSign



---



\## 🔍 Key Differences: Option 2 vs DocuSign



| Feature | Option 2 (Current) | DocuSign |

|---------|-------------------|----------|

| Customer signs | Types name in app | Email link to DocuSign |

| Signature capture | Text field | Electronic signature pad |

| Legal audit trail | Basic (IP, timestamp) | Comprehensive + tamper-proof |

| Contract format | TXT file | PDF with signature fields |

| Storage | Your database | DocuSign cloud + your DB |

| Button text | "📄 Contract" | "📧 Send to DocuSign" |

| Cost | Free | $15-40/month |



---



\## 📝 Migration Notes



\*\*When switching from Option 2 to DocuSign:\*\*

1\. Existing contracts with in-app signatures remain valid

2\. New contracts go through DocuSign

3\. Keep both systems running for historical records

4\. Add `signature\_method` column to distinguish: `in\_app` vs `docusign`



\*\*No data loss\*\* - all existing signatures are preserved.



---



\## 🆘 Troubleshooting



\*\*Common Issues:\*\*

1\. \*\*"Invalid Grant" error\*\* → JWT credentials expired, regenerate

2\. \*\*"Insufficient Permissions"\*\* → Check DocuSign scopes

3\. \*\*Webhook not firing\*\* → Verify URL in DocuSign settings

4\. \*\*PDF rendering issues\*\* → Contract template needs PDF conversion



---



\## 📞 Support Resources

\- DocuSign Developer Docs: https://developers.docusign.com/docs/

\- Node.js SDK: https://github.com/docusign/docusign-node-client

\- Support: https://support.docusign.com/



---



\*\*End of Guide\*\*

