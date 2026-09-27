<script setup lang="ts">
import { BUSINESS_VEHICLE_YEARLY_CHF, PRIVATE_MAX_VEHICLES, PRIVATE_YEARLY_CHF } from '@strainovic/ai-proxy/plans'
import { formatCurrency } from '../../lib/locale'

const CONTACT_EMAIL = 'info@wartungsheft.ch'
</script>

<template>
  <h1>Terms and conditions</h1>
  <p class="legal-meta">
    Version of 22 September 2026
  </p>
  <p class="legal-meta">
    This is a translation. Only the German version is legally binding:
    <router-link to="/agb">
      Allgemeine Geschäftsbedingungen
    </router-link>.
  </p>

  <h2>1. Provider and scope</h2>
  <p>
    Wartungsheft (wartungsheft.ch) is offered by Goran Strainovic, Strainovic IT (sole proprietorship),
    Bahnstrasse 9b, 9323 Steinach, Switzerland, email <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>.
    These terms and conditions apply to all accounts, the trial period and all subscriptions, for private
    individuals and businesses. Deviating terms apply only if we confirm them in writing.
  </p>

  <h2>2. Service</h2>
  <p>
    Wartungsheft is a digital service book in the form of a web app: record vehicles, invoices and maintenance work,
    read invoices and documents with AI (scan and chat), due dates and email reminders, costs and exports. The app
    also works offline and synchronises the data as soon as a connection is available again.
  </p>
  <p>
    The AI reads invoices, vehicle registration documents and service books. It can make mistakes. Check the values
    it has taken over before you rely on them. Due dates and reminders are an aid and replace neither the
    manufacturer's specifications nor official notices, for example for the MFK (periodic vehicle inspection).
  </p>
  <p>
    We develop Wartungsheft continuously. Features may change as long as the core remains: recording, evaluating and
    exporting invoices and maintenance work per vehicle.
  </p>

  <h2>3. Account</h2>
  <p>
    You sign in with your email address and a one-time code, or with Google. Keep access to this mailbox protected,
    because anyone who can read it can sign in. Businesses may use one account on a team address
    (e.g. fuhrpark@betrieb.ch) with several people.
  </p>

  <h2>4. Trial period</h2>
  <p>
    Every new account can test Wartungsheft for 30 days with all features. The trial period starts with the first
    scan or the first chat request. It costs nothing, requires no means of payment and ends by itself without a
    subscription being created.
  </p>
  <p>
    After the trial period, AI scan and chat require a subscription. Reading, manual entry and exports remain
    possible without a subscription.
  </p>

  <h2>5. Subscription and prices</h2>
  <ul>
    <li>
      <strong>Private:</strong> {{ formatCurrency(PRIVATE_YEARLY_CHF) }} per year for up to
      {{ PRIVATE_MAX_VEHICLES }} vehicles. From the sixth vehicle, the per-vehicle price applies to private owners
      as well.
    </li>
    <li>
      <strong>Business:</strong> {{ formatCurrency(BUSINESS_VEHICLE_YEARLY_CHF) }} per vehicle and year, invoiced
      to the company. The relevant number is the one stated when ordering and, at each renewal, the number of vehicles
      active at that time (vehicles sold or handed over do not count). If vehicles are added during the year, no
      additional charge is made.
    </li>
  </ul>
  <p>
    Both subscriptions have the same features. Prices are in Swiss francs. The provider is not subject to VAT, which
    is why the invoices do not include VAT.
  </p>
  <p>
    AI use is included in the subscription, within the scope of normal use. To prevent misuse, technical limits apply
    (requests per minute and a generous monthly quota) that are not reached in ordinary use. Automated mass queries
    are not permitted.
  </p>

  <h2>6. Invoice and payment</h2>
  <p>
    The subscription is invoiced one year in advance. The invoice is sent by email and is payable within 30 days.
    After ordering, you can continue working immediately.
    If you order during the trial period, the paid year only begins at its end.
  </p>
  <p>
    If an invoice remains unpaid after its due date and a reminder, we may block AI scan and chat until payment is
    received. Your data remains readable and exportable.
  </p>

  <h2>7. Term, renewal and termination</h2>
  <p>
    The subscription runs for one year and renews automatically for a further year unless you cancel it.
    The invoice for the next year is sent 30 days before expiry.
  </p>
  <p>
    You can cancel at any time up to the last day of the term, without notice period: in the app under
    «Einstellungen» (settings), «Abo kündigen» (cancel subscription), or by email to
    <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>. The subscription then continues until the end of
    the paid year. An invoice for a year that has not yet begun is cancelled with the termination. There is no
    pro rata refund for a year that has already started.
  </p>
  <p>
    We may terminate the subscription with three months' notice to the end of the term, and immediately for good cause
    (e.g. misuse or repeated late payment). If we discontinue Wartungsheft entirely, we refund amounts already paid
    for the remaining term on a pro rata basis.
  </p>

  <h2>8. Price changes</h2>
  <p>
    We announce price changes by email at least 60 days before the next renewal. They apply from the following term.
    If you do not agree, you cancel before expiry as described in section 7.
  </p>

  <h2>9. Your data</h2>
  <p>
    The data you record belongs to you. You can export it at any time (CSV, PDF and full export in the settings),
    even without a subscription. We make backup copies every day. You should nevertheless keep important documents
    yourself, for example as an export or as the original.
  </p>
  <p>
    You delete your account yourself in the settings («Konto löschen», delete account), with all vehicles, invoices
    and receipts, immediately and permanently; or you write to
    <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a> and we take care of it. We keep invoices we have
    issued to you for as long as the law requires. How we handle personal data is set out in the
    <router-link to="/en/datenschutz">
      privacy policy
    </router-link>.
  </p>

  <h2>10. Obligations when using the service</h2>
  <ul>
    <li>Only upload content you are entitled to upload, and no unlawful content.</li>
    <li>Do not attempt to circumvent security measures or the limits on AI use.</li>
    <li>Do not pass on access to others and do not use other people's accounts.</li>
  </ul>

  <h2>11. Availability</h2>
  <p>
    We strive for operation that is as uninterrupted as possible but cannot guarantee it. Maintenance, disruptions at
    third parties (hosting, email, AI providers) or force majeure may temporarily restrict the app. Where possible, we
    announce major planned interruptions in advance.
  </p>

  <h2>12. Liability</h2>
  <p>
    We are liable for damage we cause intentionally or through gross negligence. Liability for slight negligence is
    excluded to the extent permitted by law. In particular, liability for consequential damage resulting from
    incorrectly read values, missed due dates or appointments, and for loss of profit is excluded. In any case,
    liability is limited to the amount you have paid for Wartungsheft in the last twelve months. Mandatory statutory
    liability, for example for personal injury, remains reserved.
  </p>

  <h2>13. Changes to these terms and conditions</h2>
  <p>
    We notify changes by email at least 30 days before they take effect. If you do not agree, you may cancel the
    subscription with effect from the date the changes take effect; we then refund amounts already paid for the
    remaining term on a pro rata basis. If you continue to use Wartungsheft afterwards, the new terms and conditions
    apply.
  </p>

  <h2>14. Applicable law and place of jurisdiction</h2>
  <p>
    Swiss law applies, excluding the United Nations Convention on Contracts for the International Sale of Goods
    (CISG). The place of jurisdiction is the provider's registered office in Steinach SG. For consumers, the mandatory
    places of jurisdiction under the Swiss Civil Procedure Code apply.
  </p>
</template>
