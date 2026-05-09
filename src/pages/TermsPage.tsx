export function TermsPage() {
  return (
    <div className="min-h-screen bg-navy-900 py-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <img src="/logo.png" alt="The Admiralty Club" className="h-16 w-auto mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl font-serif font-bold text-white mb-3">Terms of Service</h1>
          <p className="text-slate-400 text-sm">Last updated: May 2026</p>
          <div className="w-16 h-px bg-gold-500 mx-auto mt-4" />
        </div>

        <div className="space-y-10 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using The Admiralty Club platform, website, or facilities ("Services"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our Services. These terms apply to all members, guests, and visitors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">2. Membership</h2>
            <p className="mb-3">
              Membership at The Admiralty Club is available on a monthly or annual basis. By purchasing a membership, you agree to the following:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 pl-2">
              <li>Membership fees are billed in advance and are non-refundable except as required by law.</li>
              <li>Monthly memberships renew automatically each month unless cancelled before the renewal date.</li>
              <li>Annual memberships renew automatically each year unless cancelled at least 7 days before the renewal date.</li>
              <li>You are responsible for keeping your account information accurate and up to date.</li>
              <li>Membership is personal and non-transferable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">3. Day Pass &amp; Guest Access</h2>
            <p className="mb-3">
              Active members may purchase a Day Pass to grant temporary access to a single guest. The following conditions apply:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 pl-2">
              <li>Each Day Pass grants access to one guest for the duration of a single booked session.</li>
              <li>Guest access expires automatically at the end of the associated booking's end time.</li>
              <li>The member is responsible for the conduct of their guest during the visit.</li>
              <li>Day Pass fees are non-refundable once the guest account has been created.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">4. Bookings &amp; Cancellations</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-400 pl-2">
              <li>Simulator sessions must be booked in advance through the platform.</li>
              <li>Cancellations made at least 24 hours before the scheduled session will not incur a penalty.</li>
              <li>Late cancellations or no-shows may result in the session being forfeited without refund.</li>
              <li>The Admiralty Club reserves the right to cancel or reschedule bookings due to maintenance or unforeseen circumstances, with reasonable notice.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">5. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 pl-2">
              <li>Use the Services for any unlawful purpose.</li>
              <li>Share your account credentials with others.</li>
              <li>Damage, misuse, or tamper with simulator equipment or facilities.</li>
              <li>Behave in a manner that disrupts other members or guests.</li>
              <li>Attempt to gain unauthorised access to any part of the platform or facilities.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">6. Payments &amp; Refunds</h2>
            <p className="mb-3">
              All payments are processed securely through Stripe. By providing payment information, you authorise The Admiralty Club to charge the applicable fees. Refunds are handled on a case-by-case basis and are at the sole discretion of The Admiralty Club management, except where required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">7. Limitation of Liability</h2>
            <p>
              The Admiralty Club shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Services or facilities. Our total liability shall not exceed the amount paid by you in the three months preceding the claim. Use of simulators and facilities is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">8. Changes to Terms</h2>
            <p>
              We reserve the right to update these Terms of Service at any time. Continued use of the Services after changes are posted constitutes your acceptance of the revised terms. We will notify active members of significant changes via email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">9. Contact</h2>
            <p>
              For questions regarding these Terms, please contact us at{' '}
              <a href="mailto:info@theadmiraltyclub.com" className="text-gold-400 hover:text-gold-300 transition-colors">
                info@theadmiraltyclub.com
              </a>.
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-navy-700 text-center">
          <a href="/" className="text-gold-500 hover:text-gold-400 text-sm font-medium transition-colors">
            ← Back to Sign In
          </a>
        </div>

      </div>
    </div>
  );
}
