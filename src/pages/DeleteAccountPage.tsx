export function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-navy-900 py-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <img src="/logo.png" alt="The Admiralty Club" className="h-16 w-auto mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl font-serif font-bold text-white mb-3">Delete Your Account</h1>
          <p className="text-slate-400 text-sm">The Admiralty Club · Last updated: June 2026</p>
          <div className="w-16 h-px bg-gold-500 mx-auto mt-4" />
        </div>

        <div className="space-y-10 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">Overview</h2>
            <p>
              Members of The Admiralty Club may request the permanent deletion of their account and all associated personal data at any time. This page explains how to submit a deletion request, what data will be removed, and what (if any) data is retained for legal or operational purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">How to Request Account Deletion</h2>
            <p className="mb-4">
              To request deletion of your account and data, follow these steps:
            </p>
            <ol className="list-decimal list-inside space-y-3 text-slate-300 pl-2">
              <li>
                Send an email to{' '}
                <a
                  href="mailto:support@theadmiraltyclub.com?subject=Account%20Deletion%20Request"
                  className="text-gold-400 underline hover:text-gold-300 transition-colors"
                >
                  support@theadmiraltyclub.com
                </a>{' '}
                with the subject line: <span className="text-white font-semibold">Account Deletion Request</span>
              </li>
              <li>
                Include the <span className="text-white font-semibold">email address</span> associated with your Admiralty Club account so we can locate your record.
              </li>
              <li>
                We will confirm receipt of your request within <span className="text-white font-semibold">2 business days</span> and complete the deletion within <span className="text-white font-semibold">30 days</span>.
              </li>
            </ol>

            <div className="mt-6">
              <a
                href="mailto:support@theadmiraltyclub.com?subject=Account%20Deletion%20Request"
                className="inline-block px-8 py-3 bg-gold-500 text-navy-900 font-bold rounded-xl hover:bg-gold-400 transition-colors shadow-lg"
              >
                Email Us to Delete Account
              </a>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">Data That Will Be Deleted</h2>
            <p className="mb-3">Upon completion of your request, the following data will be permanently deleted:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 pl-2">
              <li>Your account credentials (name, email address, password)</li>
              <li>Profile information (phone number, age, profile picture)</li>
              <li>Uploaded verification documents (driving licence)</li>
              <li>Booking history and reservation records</li>
              <li>Scorecard and leaderboard entries</li>
              <li>Day Pass records and guest history</li>
              <li>Membership record (plan, status, dates)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">Data That May Be Retained</h2>
            <p className="mb-3">
              Certain data may be retained after account deletion where required by law or for legitimate business purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 pl-2">
              <li>
                <span className="text-slate-300 font-medium">Payment transaction records</span> — retained for up to <span className="text-white font-semibold">7 years</span> to comply with financial and tax regulations. These records are anonymised where possible and are not used for any marketing purpose.
              </li>
              <li>
                <span className="text-slate-300 font-medium">Stripe billing records</span> — Stripe (our payment processor) retains transaction data independently under their own privacy policy.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">Active Memberships</h2>
            <p>
              If you have an active paid membership at the time of your deletion request, it will be cancelled and no further charges will be made. Refunds for unused membership time are issued at our discretion in accordance with our{' '}
              <a href="/terms" className="text-gold-400 underline hover:text-gold-300 transition-colors">
                Terms of Service
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">Contact Us</h2>
            <p>
              If you have any questions about this process or your data, please contact us at{' '}
              <a
                href="mailto:support@theadmiraltyclub.com"
                className="text-gold-400 underline hover:text-gold-300 transition-colors"
              >
                support@theadmiraltyclub.com
              </a>
              .
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-navy-700 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} The Admiralty Club. All rights reserved.
        </div>
      </div>
    </div>
  );
}
