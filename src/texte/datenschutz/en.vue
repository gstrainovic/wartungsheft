<template>
  <h1>Privacy policy</h1>
  <p class="legal-updated">
    Last updated: September 2026
  </p>
  <p class="legal-updated">
    This is a translation. Only the German version is legally binding:
    <router-link to="/datenschutz">
      Datenschutzerklärung (German version)
    </router-link>
  </p>

  <h2>1. Controller</h2>
  <p>
    <strong>Goran Strainovic</strong><br>
    Strainovic IT (sole proprietorship)<br>
    Bahnstrasse 9b<br>
    9323 Steinach<br>
    Switzerland<br>
    Email: <a href="mailto:info@wartungsheft.ch">info@wartungsheft.ch</a>
  </p>

  <h2>2. Principle</h2>
  <p>
    The protection of your personal data is important to us. We process your personal data in accordance
    with the Swiss Federal Act on Data Protection (FADP) and, where applicable, the EU General Data
    Protection Regulation (GDPR).
  </p>
  <p>
    We only collect the data that is actually required to use our app.
  </p>

  <h2>3. What data we collect</h2>

  <h3>3.1 Account data</h3>
  <ul>
    <li><strong>Email address</strong> — for signing in via Magic Code</li>
  </ul>
  <p>We do not store any password. Authentication is done with one-time codes sent by email.</p>

  <h3>3.2 Vehicle data</h3>
  <ul>
    <li>Make, model, year</li>
    <li>Mileage</li>
    <li>Number plate and chassis number (VIN)</li>
  </ul>

  <h3>3.3 Counting on the offer pages</h3>
  <p>
    On the public pages we count how often the "Try free for 30 days" button is pressed, and from which of the
    two offer pages. Only the name of the event, the page and the time are stored — no IP address, no cookie,
    no link to a person. We do not use any analytics tool or advertising tracking services.
  </p>

  <h3>3.4 Invoice and maintenance data</h3>
  <ul>
    <li>Garage name, date, amount</li>
    <li>Individual line items (work and parts)</li>
    <li>Uploaded images and PDFs of invoices</li>
    <li>
      The channel through which an entry was created (chat, form, service book …), in order to improve the app
      where it is used. We do not record clicks or movements within the app.
    </li>
  </ul>

  <h3>3.5 Feedback from the app</h3>
  <p>
    If you write via «Report a problem or a wish» or record a voice message, the text
    or recording is sent to our mailbox together with your email address, the page you were on and the time.
    We have voice messages transcribed automatically by Mistral (France, EU) so that we can read rather than
    listen to them; the recording itself then remains only in our mailbox and is not processed further. You
    decide afresh with each piece of feedback whether to speak or write. We keep feedback for as long as we
    need it to improve the app, for no more than two years.
  </p>

  <h3>3.6 Subscription and billing data (annual business subscription)</h3>
  <ul>
    <li>Company, contact person, billing address, billing email, optional reference</li>
    <li>Number of vehicles billed, invoices with amount, payment reference and receipt of payment</li>
  </ul>

  <h3>3.7 Technical data</h3>
  <ul>
    <li>IP address (server logs, automatically deleted after 30 days)</li>
    <li>Browser type and version</li>
    <li>No cookies for tracking purposes</li>
  </ul>

  <h2>4. Purpose of data processing</h2>
  <table>
    <thead>
      <tr>
        <th>Data</th>
        <th>Purpose</th>
        <th>Legal basis</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Email</td>
        <td>Authentication, account access</td>
        <td>Performance of contract</td>
      </tr>
      <tr>
        <td>Vehicle and invoice data</td>
        <td>Core function: maintenance tracking</td>
        <td>Performance of contract</td>
      </tr>
      <tr>
        <td>Images / PDFs</td>
        <td>AI-assisted data extraction</td>
        <td>Consent (upload by the user)</td>
      </tr>
      <tr>
        <td>Subscription and billing data</td>
        <td>Invoicing, receipt of payment, renewal and cancellation of the subscription</td>
        <td>Performance of contract, statutory retention obligation</td>
      </tr>
      <tr>
        <td>IP address</td>
        <td>Server security, abuse prevention</td>
        <td>Legitimate interest</td>
      </tr>
    </tbody>
  </table>

  <h2>5. AI-assisted processing</h2>
  <p>
    Wartungsheft uses an AI service to extract data from photos of invoices and from documents, and for the
    chat assistant. In the process, images, PDFs and chat messages are transmitted to the following provider:
  </p>
  <table>
    <thead>
      <tr>
        <th>Provider</th>
        <th>Location</th>
        <th>Training on data</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Mistral AI</td>
        <td>France (EU)</td>
        <td>Training with your data disabled</td>
      </tr>
    </tbody>
  </table>
  <p>
    <strong>Important:</strong> AI requests run through our server using our Mistral account; you do not
    enter into a contract of your own with Mistral. Training with customer data is disabled in this account.
    Images and texts are transmitted to Mistral solely to process the request and are not stored permanently.
  </p>

  <h2>6. Data storage</h2>

  <h3>6.1 Database</h3>
  <p>
    Your data is stored in a self-hosted InstantDB instance. The server is located in the Infomaniak Public
    Cloud in Switzerland. Data is transmitted in encrypted form (TLS).
  </p>

  <h3>6.2 Local storage (offline mode)</h3>
  <p>
    For offline functionality, your data is additionally stored in your browser's IndexedDB. This data does
    not leave your device and is deleted automatically when the app is uninstalled.
  </p>

  <h3>6.3 Retention period</h3>
  <ul>
    <li><strong>Account data:</strong> until your account is deleted</li>
    <li><strong>Vehicle/invoice data:</strong> until deleted by you</li>
    <li><strong>Subscription invoices:</strong> 10 years (retention obligation, Art. 958f CO)</li>
    <li><strong>Server logs:</strong> 30 days</li>
    <li><strong>OCR cache:</strong> until the associated invoice is deleted</li>
  </ul>

  <h2>7. Disclosure to third parties</h2>
  <p>We do not sell your data. Data is disclosed exclusively to:</p>
  <table>
    <thead>
      <tr>
        <th>Service</th>
        <th>Purpose</th>
        <th>Location</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Infomaniak Network SA</td>
        <td>Server and frontend hosting, domain</td>
        <td>Switzerland</td>
      </tr>
      <tr>
        <td>Resend (Plus Five Five, Inc.)</td>
        <td>Email delivery of sign-in codes, reminders and subscription invoices; the email address and the content of the message are processed (for invoices: company, address and amount), sent from Ireland (EU), contract with EU standard contractual clauses for Switzerland</td>
        <td>USA / Ireland</td>
      </tr>
      <tr>
        <td>Mistral AI</td>
        <td>Image and document analysis, chat assistant (section 5)</td>
        <td>France (EU)</td>
      </tr>
    </tbody>
  </table>
  <p>
    For US providers, standard contractual clauses (SCCs) serve as the basis for the data transfer.
  </p>

  <h2>8. Your rights</h2>
  <p>Under the Swiss FADP and the GDPR you have the following rights:</p>
  <ul>
    <li><strong>Access:</strong> you can request information about your stored data at any time.</li>
    <li><strong>Rectification:</strong> you can correct inaccurate data yourself or ask us to do so.</li>
    <li><strong>Erasure:</strong> you can delete your data yourself in the app at any time or request the deletion of your account.</li>
    <li><strong>Data portability:</strong> you can download your data as an export (CSV/PDF).</li>
    <li><strong>Objection:</strong> you can object to the processing of your data at any time.</li>
  </ul>
  <p>
    To exercise your rights, contact us at the email address given in the legal notice.
  </p>

  <h2>9. Supervisory authority</h2>
  <p>
    Competent data protection authority in Switzerland:<br>
    <strong>Federal Data Protection and Information Commissioner (FDPIC)</strong><br>
    Feldeggweg 1, 3003 Bern<br>
    <a href="https://www.edoeb.admin.ch" target="_blank" rel="noopener">www.edoeb.admin.ch</a>
  </p>

  <h2>10. Cookies</h2>
  <p>
    Wartungsheft uses <strong>no tracking cookies</strong>.
    Only technically necessary data is stored in the browser
    (localStorage for settings, IndexedDB for offline data).
    After you sign in, the browser remembers your email address, even after you sign out,
    so that the sign-in page can prefill it. It does not leave your device.
    «Andere E-Mail» (other email) on the sign-in page deletes it.
  </p>

  <h2>11. Changes</h2>
  <p>
    We may amend this privacy policy at any time. The current version is always available on this page. In
    the event of material changes, we will inform registered users by email.
  </p>
</template>
