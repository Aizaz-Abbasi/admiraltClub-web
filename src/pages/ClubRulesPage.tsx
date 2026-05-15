export function ClubRulesPage() {
  return (
    <div className="min-h-screen bg-navy-900 py-16 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-12">
          <img src="/logo.png" alt="The Admiralty Club" className="h-16 w-auto mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl font-serif font-bold text-white mb-3">Member Rules & Responsibilities</h1>
          <p className="text-slate-400 text-sm">Last updated: May 2026</p>
          <div className="w-16 h-px bg-gold-500 mx-auto mt-4" />
        </div>

        <div className="space-y-10 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">1. Member Responsibility for Conduct and Damages</h2>
            <p className="mb-3">
              All members are personally responsible for their own conduct and for the conduct of any guest they bring into the club. Members shall be financially responsible for any damage, loss, or destruction of club property caused by themselves or their guests, whether accidental or intentional.
            </p>
            <p>
              The club reserves the right to assess repair or replacement costs directly to the responsible member.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">2. Cleanliness and Cleanup Requirement</h2>
            <p className="mb-3">
              Members are required to clean up after themselves and their guests immediately following use of the club facilities.
            </p>
            <p className="mb-3">This includes, but is not limited to:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 pl-2 mb-4">
              <li>Removing personal belongings</li>
              <li>Disposing of trash and food waste</li>
              <li>Returning furniture, equipment, and supplies to their proper locations</li>
              <li>Leaving the area in a clean and orderly condition</li>
            </ul>
            <p className="text-amber-400 font-medium">
              Failure to properly clean the area will result in a $100 cleaning fine charged to the responsible member.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">3. Guest Policy</h2>
            <p className="mb-3">Members may bring guests to the club; however:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 pl-2 mb-4">
              <li>The sponsoring member must remain with their guest at all times.</li>
              <li>Guests are the responsibility of the sponsoring member.</li>
              <li>Guests are not permitted to participate in club activities or play unless they possess a valid guest pass issued by the club.</li>
            </ul>
            <p>
              The club reserves the right to deny or revoke guest privileges at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">4. Food and Beverage Policy</h2>
            <p>
              Food and beverages are permitted within the club facilities. Members and guests must properly dispose of all food, containers, and beverage waste before leaving the premises. No food or trash may be left behind.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">5. Video Recording and Monitoring</h2>
            <p className="mb-3">
              For the safety and security of members, guests, and club property, all club areas are subject to video recording and monitoring.
            </p>
            <p className="mb-3">
              Security recordings may be used to investigate safety incidents, rule violations, equipment misuse, or property damage.
            </p>
            <p>
              By entering and using the club facilities, members and guests acknowledge and consent to such recording and monitoring.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">6. Limitation of Club Responsibility</h2>
            <p className="mb-3">
              The Admiralty Club is not responsible for the personal conduct, behavior, or actions of its members or guests while using club facilities.
            </p>
            <p>
              Members assume full responsibility for their own activities and the activities of their guests while on club property.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-3">7. Enforcement</h2>
            <p>
              Violation of these rules may result in fines, suspension of privileges, or termination of membership at the discretion of the club leadership or governing board.
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
