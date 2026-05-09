export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-navy-900 py-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <img src="/logo.png" alt="The Admiralty Club" className="h-16 w-auto mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl font-serif font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: May 2026</p>
          <div className="w-16 h-px bg-gold-500 mx-auto mt-4" />
        </div>

        <div className="space-y-10 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">1. Introduction</h2>
            <p>
              The Admiralty Club ("we", "us", "our") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and share data when you use our platform and facilities at <strong className="text-white">theadmiraltyclub.com</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect the following types of information:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 pl-2">
              <li><strong className="text-slate-300">Account information:</strong> Name, email address, phone number, and age when you register.</li>
              <li><strong className="text-slate-300">Identity documents:</strong> Driving license images uploaded for verification purposes.</li>
              <li><strong className="text-slate-300">Profile picture:</strong> Optional photo you upload to your profile.</li>
              <li><strong className="text-slate-300">Booking data:</strong> Simulator bookings, session dates, times, and door codes.</li>
              <li><strong className="text-slate-300">Payment information:</strong> Processed securely by Stripe — we do not store card numbers.</li>
              <li><strong className="text-slate-300">Score data:</strong> Golf rounds and scores you log on the platform.</li>
              <li><strong className="text-slate-300">Usage data:</strong> Login times, page visits, and interactions with the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-400 pl-2">
              <li>To create and manage your member account.</li>
              <li>To process bookings and send confirmation emails with door codes.</li>
              <li>To process payments and manage your membership subscription.</li>
              <li>To send transactional emails (booking confirmations, password resets, guest credentials).</li>
              <li>To display your scores on the leaderboard (name and score only).</li>
              <li>To verify identity where required by our facilities.</li>
              <li>To improve our platform and customer experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">4. Data Sharing</h2>
            <p className="mb-3">We do not sell your personal data. We share information only with trusted service providers necessary to operate the platform:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 pl-2">
              <li><strong className="text-slate-300">Stripe</strong> — payment processing. Subject to <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:text-gold-300 transition-colors">Stripe's Privacy Policy</a>.</li>
              <li><strong className="text-slate-300">SendGrid (Twilio)</strong> — transactional email delivery.</li>
              <li><strong className="text-slate-300">Hosting providers</strong> — infrastructure and database hosting.</li>
            </ul>
            <p className="mt-3">
              All third-party providers are bound by data processing agreements and may not use your data for their own purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">5. Data Retention</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-400 pl-2">
              <li>Account data is retained for as long as your account is active.</li>
              <li>After account deletion, personal data is removed within 30 days, except where retention is required by law.</li>
              <li>Payment records may be retained for up to 7 years for accounting and legal compliance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">6. Security</h2>
            <p>
              We take security seriously. Passwords are hashed using bcrypt. All data is transmitted over HTTPS. Payment data is handled entirely by Stripe and never stored on our servers. Access to the database is restricted and monitored.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">7. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 pl-2">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your account and personal data.</li>
              <li>Withdraw consent for optional data processing at any time.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:info@theadmiraltyclub.com" className="text-gold-400 hover:text-gold-300 transition-colors">
                info@theadmiraltyclub.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">8. Cookies</h2>
            <p>
              We use minimal browser storage (localStorage) to maintain your login session and preferences. We do not use advertising or tracking cookies from third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email. Continued use of the platform after changes are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">10. Contact</h2>
            <p>
              For privacy-related enquiries, contact us at{' '}
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
