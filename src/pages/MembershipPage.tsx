import { useState, useEffect, useRef } from 'react';
import { CheckIcon, HelpCircleIcon, Loader2Icon, ShieldCheckIcon, CheckCircleIcon, UserPlusIcon, TicketIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchMyMembership,
  fetchMyDayPasses,
  fetchPlans,
  createCheckoutSession,
  cancelMembership,
  verifyCheckoutSession,
  createGuestUser,
  MembershipType,
  DayPass,
} from '../services/membership';

function formatPrice(amount: number | null | undefined, currency = 'usd') {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount / 100);
}
import { fetchMyBookings, Reservation } from '../services/bookig';
import { getApiErrorMessage } from '../api/client';

// ─── Static data ──────────────────────────────────────────────────────────────

const features = [
  { name: 'Unlimited Simulator Access', monthly: true, yearly: true },
  { name: 'Priority 14-Day Booking Window', monthly: true, yearly: true },
  { name: 'Access to Club Leaderboards', monthly: true, yearly: true },
  { name: 'Guest Privileges via Day Pass', monthly: true, yearly: true },
  { name: 'Complimentary Club Storage', monthly: true, yearly: true },
  { name: 'Walk-in Access (Subject to availability)', monthly: true, yearly: true },
  { name: 'Food & Beverage Discount (15%)', monthly: true, yearly: false },
  { name: 'Enhanced F&B Discount (20%)', monthly: false, yearly: true },
  { name: 'Exclusive Tournament Access', monthly: false, yearly: true },
];

const faqs = [
  {
    q: 'How far in advance can I book?',
    a: 'Monthly and Yearly members can book up to 14 days in advance.',
  },
  {
    q: 'How do Day Passes work?',
    a: 'Day Passes let you bring a guest to one of your existing bookings. Purchase a pass, select the booking, enter the guest\'s details and they\'ll receive login credentials valid until that session ends.',
  },
  {
    q: 'Can I buy multiple Day Passes?',
    a: 'Yes — each Day Pass covers one guest for one booking. You can purchase as many as you need.',
  },
  {
    q: 'Do I need my own clubs?',
    a: 'While we recommend bringing your own clubs, we offer premium rental sets at both locations for a small fee.',
  },
];

const statusColors: Record<string, string> = {
  active: 'bg-green-900/30 text-green-400 border-green-900/50',
  cancelled: 'bg-red-900/30 text-red-400 border-red-900/50',
  expired: 'bg-slate-800 text-slate-400 border-slate-700',
};

const planLabels: Record<string, string> = {
  MONTHLY: 'Monthly Membership',
  MONTHLY_PREMIUM: 'Monthly Premium Membership',
  YEARLY: 'Annual Club Membership',
};

function formatBookingLabel(b: Reservation) {
  const start = new Date(b.startTime);
  const end = new Date(b.endTime);
  const date = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeRange = `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} – ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  const sim = b.simulator?.name ?? '';
  return `${date} · ${timeRange} · ${sim}`;
}

// ─── Per-DayPass guest creation form ─────────────────────────────────────────

interface DayPassFormProps {
  dayPass: DayPass;
  futureBookings: Reservation[];
  onSuccess: () => void;
}

function DayPassForm({ dayPass, futureBookings, onSuccess }: DayPassFormProps) {
  const [bookingId, setBookingId] = useState<number | ''>('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => createGuestUser(dayPass.id, Number(bookingId), guestName.trim(), guestEmail.trim()),
    onSuccess: (guest) => {
      setSuccessMsg(`Credentials sent to ${guest.email}`);
      setGuestName('');
      setGuestEmail('');
      setBookingId('');
      setErrorMsg(null);
      onSuccess();
    },
    onError: (err) => setErrorMsg(getApiErrorMessage(err)),
  });

  const canSubmit = bookingId !== '' && guestName.trim() && guestEmail.trim() && !mutation.isPending;

  if (dayPass.status === 'used') {
    const g = dayPass.guestUser;
    const b = dayPass.booking;
    const bookingInFuture = b ? new Date(b.endTime) > new Date() : false;

    if (bookingInFuture && g) {
      return (
        <div className="mt-4 bg-navy-900/60 border border-green-900/40 rounded-xl px-5 py-4 space-y-3">
          <div className="flex items-center gap-2 text-xs text-green-400 font-semibold uppercase tracking-wider">
            <CheckCircleIcon className="w-4 h-4 shrink-0" />
            Guest Active — access valid until session ends
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Guest Name</p>
              <p className="text-white font-medium">{g.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Guest Email</p>
              <p className="text-white font-medium">{g.email}</p>
            </div>
          </div>
          {b && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Booking</p>
              <p className="text-slate-300 text-sm">{formatBookingLabel(b as unknown as Reservation)}</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="mt-4 flex items-center gap-3 bg-navy-900/60 border border-navy-600 rounded-xl px-4 py-3 text-sm text-slate-500">
        <CheckCircleIcon className="w-4 h-4 text-slate-600 shrink-0" />
        <span>Session completed{b ? ` · ${formatBookingLabel(b as unknown as Reservation)}` : ''}.</span>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {/* Booking dropdown */}
      <div>
        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">
          Select Booking
        </label>
        {futureBookings.length === 0 ? (
          <p className="text-xs text-red-500 italic">No upcoming bookings found. Book a bay first.</p>
        ) : (
          <select
            value={bookingId}
            onChange={(e) => { setBookingId(Number(e.target.value)); setSuccessMsg(null); setErrorMsg(null); }}
            className="w-full bg-navy-900 border border-navy-600 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/60 transition-colors"
          >
            <option value="">— choose a booking —</option>
            {futureBookings.map((b) => (
              <option key={b.id} value={b.id}>{formatBookingLabel(b)}</option>
            ))}
          </select>
        )}
      </div>

      {/* Guest details */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">Guest Name</label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => { setGuestName(e.target.value); setSuccessMsg(null); setErrorMsg(null); }}
            placeholder="Jane Smith"
            className="w-full bg-navy-900 border border-navy-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/60 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">Guest Email</label>
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => { setGuestEmail(e.target.value); setSuccessMsg(null); setErrorMsg(null); }}
            placeholder="jane@example.com"
            className="w-full bg-navy-900 border border-navy-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/60 transition-colors"
          />
        </div>
      </div>

      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-sm text-green-400 bg-green-900/20 border border-green-900/40 rounded-xl px-4 py-3">
            <CheckCircleIcon className="w-4 h-4 shrink-0" />{successMsg}
          </motion.div>
        )}
        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-sm text-red-300 bg-red-950/30 border border-red-500/30 rounded-xl px-4 py-3">
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => mutation.mutate()}
        disabled={!canSubmit}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 text-navy-900 font-semibold text-sm hover:bg-gold-400 transition-colors disabled:opacity-50"
      >
        {mutation.isPending
          ? <><Loader2Icon className="w-4 h-4 animate-spin" /> Sending…</>
          : <><UserPlusIcon className="w-4 h-4" /> Send Guest Credentials</>}
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

interface MembershipPageProps {
  stripeSessionId?: string | null;
}

export function MembershipPage({ stripeSessionId }: MembershipPageProps) {
  const queryClient = useQueryClient();

  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [loadingType, setLoadingType] = useState<MembershipType | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [justBoughtDayPass, setJustBoughtDayPass] = useState(false);
  const dayPassSectionRef = useRef<HTMLDivElement>(null);

  // Verify Stripe redirect once on mount
  useEffect(() => {
    const sessionId = stripeSessionId;
    if (!sessionId) return;
    let unmounted = false;

    (async () => {
      setVerifying(true);
      try {
        const result = await verifyCheckoutSession(sessionId);
        if (!unmounted) {
          if (result.purchaseType === 'DAY_PASS') {
            setJustBoughtDayPass(true);
            queryClient.invalidateQueries({ queryKey: ['dayPasses'] });
          } else {
            queryClient.invalidateQueries({ queryKey: ['membership'] });
          }
          setPaymentSuccess(true);
          setTimeout(() => { if (!unmounted) setPaymentSuccess(false); }, 6000);
        }
      } catch (err) {
        if (!unmounted) setCheckoutError(getApiErrorMessage(err));
      } finally {
        setVerifying(false);
      }
    })();

    return () => { unmounted = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: fetchPlans,
  });

  const { data: membership, isLoading: membershipLoading } = useQuery({
    queryKey: ['membership'],
    queryFn: fetchMyMembership,
  });

  const { data: dayPasses = [] } = useQuery({
    queryKey: ['dayPasses'],
    queryFn: fetchMyDayPasses,
  });

  // Fetch member's future bookings for the guest creation dropdowns
  const { data: allBookings = [] } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => fetchMyBookings('BOOKED'),
  });
  const futureBookings = allBookings.filter(
    (b) => new Date(b.endTime) > new Date()
  );

  const checkoutMutation = useMutation({
    mutationFn: (type: MembershipType) => createCheckoutSession(type),
    onMutate: (type) => { setLoadingType(type); setCheckoutError(null); },
    onSuccess: (url) => { window.location.href = url; },
    onError: (err) => { setCheckoutError(getApiErrorMessage(err)); setLoadingType(null); },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelMembership,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['membership'] }),
    onError: (err) => setCheckoutError(getApiErrorMessage(err)),
  });

  const handlePurchase = (type: MembershipType) => {
    const priceLabel = type === 'DAY_PASS'
      ? `Day Pass (${formatPrice(plans?.DAY_PASS?.amount, plans?.DAY_PASS?.currency)})`
      : planLabels[type];
    if (window.confirm(`Purchase a ${priceLabel}?`)) {
      checkoutMutation.mutate(type);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel your membership? This cannot be undone.')) {
      cancelMutation.mutate();
    }
  };

  const isActiveMember = membership?.status === 'active' &&
    (membership?.type === 'MONTHLY' || membership?.type === 'MONTHLY_PREMIUM' || membership?.type === 'YEARLY');

  // Scroll to Day Pass section after a Day Pass purchase
  useEffect(() => {
    if (justBoughtDayPass && dayPassSectionRef.current) {
      setTimeout(() => {
        dayPassSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
  }, [justBoughtDayPass, dayPasses.length]);

  const planButtonLabel = (type: MembershipType, defaultLabel: string) =>
    isActiveMember && membership?.type === type ? 'Current Plan' : defaultLabel;

  const planButtonDisabled = (type: MembershipType) =>
    !!loadingType || cancelMutation.isPending || (isActiveMember && membership?.type === type);

  const unusedPasses = dayPasses.filter((p) => p.status === 'unused');
  // "Active" used passes = guest still has access (booking in the future)
  const activeUsedPasses = dayPasses.filter(
    (p) => p.status === 'used' && p.booking && new Date(p.booking.endTime) > new Date()
  );
  // "Completed" used passes = booking already ended
  const completedPasses = dayPasses.filter(
    (p) => p.status === 'used' && (!p.booking || new Date(p.booking.endTime) <= new Date())
  );

  return (
    <div className="min-h-screen bg-transparent pb-20">

      {/* Hero */}
      <div className="bg-navy-900 border-b border-navy-800 text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center mix-blend-luminosity" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-white drop-shadow-lg">
            Join The Admiralty Club
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto drop-shadow-md">
            Experience premium indoor golf with state-of-the-art TrackMan technology,
            luxurious amenities, and a community of passionate golfers.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">

        {/* Verifying banner */}
        <AnimatePresence>
          {verifying && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-navy-800 border border-navy-700 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
              <Loader2Icon className="w-6 h-6 text-gold-500 animate-spin shrink-0" />
              <p className="text-slate-300 text-sm">Verifying your payment…</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment success banner */}
        <AnimatePresence>
          {paymentSuccess && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-green-900/30 border border-green-500/30 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-green-900/50 border border-green-500/30 flex items-center justify-center shrink-0">
                <CheckCircleIcon className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-white">Payment Successful!</h3>
                <p className="text-slate-400 text-sm">
                  {justBoughtDayPass
                    ? 'Your Day Pass is ready. Select a booking below and create your guest account.'
                    : 'Welcome to the Admiralty Club. Your membership is now active.'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error banner */}
        <AnimatePresence>
          {checkoutError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-6 rounded-lg border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-300">
              {checkoutError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current membership banner */}
        {!membershipLoading && membership && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-navy-800 border border-navy-700 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center shrink-0">
                <ShieldCheckIcon className="w-6 h-6 text-gold-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Current Plan</p>
                <p className="text-lg font-serif font-bold text-white">
                  {planLabels[membership.type] ?? membership.type}
                </p>
                {membership.endDate && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {membership.status === 'active' ? 'Renews' : 'Expires'} on{' '}
                    {new Date(membership.endDate).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[membership.status] ?? statusColors.expired}`}>
                {membership.status.charAt(0).toUpperCase() + membership.status.slice(1)}
              </span>
              {membership.status === 'active' && (
                <button
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                  className="text-sm text-red-400 hover:text-red-300 border border-red-900/50 hover:border-red-500/50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {cancelMutation.isPending
                    ? <><Loader2Icon className="w-3 h-3 animate-spin" /> Cancelling...</>
                    : 'Cancel Membership'}
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Plan cards ───────────────────────────────────────────────────── */}
        {!isActiveMember ? (
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">

            {/* Monthly — $100 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-navy-800 rounded-2xl shadow-2xl border border-navy-600 overflow-hidden flex flex-col relative">
              <div className="absolute top-0 right-0 bg-slate-200 text-navy-900 text-xs font-bold px-4 py-1 rounded-bl-lg uppercase tracking-wider">
                Most Popular
              </div>
              <div className="p-7 border-b border-navy-700 bg-navy-900/80">
                <h3 className="text-2xl font-serif font-bold text-white mb-1">Monthly</h3>
                <p className="text-slate-400 mb-5 text-sm">Unlimited play, one session at a time.</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">{formatPrice(plans?.MONTHLY?.amount, plans?.MONTHLY?.currency)}</span>
                  <span className="text-slate-400 font-medium">/month</span>
                </div>
              </div>
              <div className="p-7 flex-1 flex flex-col">
                <div className="mb-6 bg-navy-900/60 border border-navy-700 rounded-xl p-4">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Reservations</p>
                  <p className="text-white font-semibold text-sm">Unlimited use · <span className="text-gold-400">1 active at a time</span></p>
                  <p className="text-xs text-slate-500 mt-1">Book a new session once your current one ends.</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1 text-sm">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {f.monthly
                        ? <CheckIcon className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                        : <div className="w-4 h-4 shrink-0 mt-0.5" />}
                      <span className={f.monthly ? 'text-slate-200' : 'text-slate-600 line-through'}>{f.name}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePurchase('MONTHLY')}
                  disabled={planButtonDisabled('MONTHLY')}
                  className="w-full py-4 rounded-xl font-medium bg-slate-200 text-navy-900 hover:bg-white transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loadingType === 'MONTHLY' && <Loader2Icon className="w-4 h-4 animate-spin" />}
                  {planButtonLabel('MONTHLY', 'Select Monthly')}
                </button>
              </div>
            </motion.div>

            {/* Monthly Premium — $200 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-navy-900 rounded-2xl shadow-[0_0_30px_rgba(201,168,76,0.15)] border-2 border-gold-500 overflow-hidden flex flex-col relative">
              <div className="absolute top-0 right-0 bg-gold-500 text-navy-900 text-xs font-bold px-4 py-1 rounded-bl-lg uppercase tracking-wider shadow-sm">
                Most Flexible
              </div>
              <div className="p-7 border-b border-navy-800 bg-navy-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
                <h3 className="text-2xl font-serif font-bold text-gold-500 mb-1 relative z-10">Monthly Premium</h3>
                <p className="text-slate-300 mb-5 text-sm relative z-10">Plan ahead with multiple reservations.</p>
                <div className="flex items-baseline gap-2 relative z-10">
                  <span className="text-5xl font-bold text-white drop-shadow-md">{formatPrice(plans?.MONTHLY_PREMIUM?.amount, plans?.MONTHLY_PREMIUM?.currency)}</span>
                  <span className="text-slate-400 font-medium">/month</span>
                </div>
              </div>
              <div className="p-7 flex-1 flex flex-col bg-navy-800">
                <div className="mb-6 bg-navy-900/60 border border-gold-500/20 rounded-xl p-4">
                  <p className="text-xs text-gold-400 uppercase tracking-wider mb-1">Reservations</p>
                  <p className="text-white font-semibold text-sm">Unlimited use · <span className="text-gold-400">3 active at a time</span></p>
                  <p className="text-xs text-slate-400 mt-1">Hold up to 3 upcoming sessions simultaneously.</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1 text-sm">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {f.monthly
                        ? <CheckIcon className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                        : <div className="w-4 h-4 shrink-0 mt-0.5" />}
                      <span className={f.monthly ? 'text-white' : 'text-slate-600 line-through'}>{f.name}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePurchase('MONTHLY_PREMIUM')}
                  disabled={planButtonDisabled('MONTHLY_PREMIUM')}
                  className="w-full py-4 rounded-xl font-bold bg-gold-500 text-navy-900 hover:bg-gold-400 transition-colors shadow-[0_0_15px_rgba(201,168,76,0.3)] hover:shadow-[0_0_25px_rgba(201,168,76,0.5)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loadingType === 'MONTHLY_PREMIUM' && <Loader2Icon className="w-4 h-4 animate-spin" />}
                  {planButtonLabel('MONTHLY_PREMIUM', 'Select Premium')}
                </button>
              </div>
            </motion.div>

            {/* Yearly */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-navy-800 rounded-2xl shadow-2xl border border-navy-600 overflow-hidden flex flex-col relative">
              <div className="absolute top-0 right-0 bg-slate-200 text-navy-900 text-xs font-bold px-4 py-1 rounded-bl-lg uppercase tracking-wider">
                Best Value
              </div>
              <div className="p-7 border-b border-navy-700 bg-navy-900/80">
                <h3 className="text-2xl font-serif font-bold text-white mb-1">Annual</h3>
                <p className="text-slate-400 mb-5 text-sm">The ultimate Admiralty Club experience.</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">{formatPrice(plans?.YEARLY?.amount, plans?.YEARLY?.currency)}</span>
                  <span className="text-slate-400 font-medium">/year</span>
                </div>
                {plans?.MONTHLY_PREMIUM?.amount && plans?.YEARLY?.amount && (
                  <p className="text-gold-400 text-xs mt-2 font-medium">
                    Save {formatPrice(plans.MONTHLY_PREMIUM.amount * 12 - plans.YEARLY.amount, plans.YEARLY.currency)} vs monthly premium
                  </p>
                )}
              </div>
              <div className="p-7 flex-1 flex flex-col">
                <div className="mb-6 bg-navy-900/60 border border-navy-700 rounded-xl p-4">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Reservations</p>
                  <p className="text-white font-semibold text-sm">Unlimited use · <span className="text-gold-400">3 active at a time</span></p>
                  <p className="text-xs text-slate-500 mt-1">Hold up to 3 upcoming sessions simultaneously.</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1 text-sm">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {f.yearly
                        ? <CheckIcon className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                        : <div className="w-4 h-4 shrink-0 mt-0.5" />}
                      <span className={f.yearly ? 'text-slate-200' : 'text-slate-600 line-through'}>{f.name}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePurchase('YEARLY')}
                  disabled={planButtonDisabled('YEARLY')}
                  className="w-full py-4 rounded-xl font-medium bg-slate-200 text-navy-900 hover:bg-white transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loadingType === 'YEARLY' && <Loader2Icon className="w-4 h-4 animate-spin" />}
                  {planButtonLabel('YEARLY', 'Apply for Annual')}
                </button>
              </div>
            </motion.div>

          </div>
        ) : null}

        {/* ── Day Pass section — visible to active members ──────────────────── */}
        {isActiveMember && (
          <div ref={dayPassSectionRef} className="mb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-white">Day Passes</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Each pass lets you bring one guest to an existing booking. They receive login credentials valid until the session ends.
                </p>
              </div>
              <button
                onClick={() => handlePurchase('DAY_PASS')}
                disabled={!!loadingType || cancelMutation.isPending}
                className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-gold-500 text-navy-900 font-semibold text-sm hover:bg-gold-400 transition-colors disabled:opacity-50 shadow-md"
              >
                {loadingType === 'DAY_PASS'
                  ? <><Loader2Icon className="w-4 h-4 animate-spin" /> Redirecting…</>
                  : <><TicketIcon className="w-4 h-4" /> Purchase Day Pass · {formatPrice(plans?.DAY_PASS?.amount, plans?.DAY_PASS?.currency)}</>}
              </button>
            </div>

            {dayPasses.length === 0 ? (
              <div className="bg-navy-800 border border-navy-700 rounded-2xl p-8 text-center text-slate-500 text-sm">
                No Day Passes yet. Purchase one above to bring a guest to one of your bookings.
              </div>
            ) : (
              <div className="space-y-4">

                {/* Unused passes — show creation form */}
                {unusedPasses.map((pass, i) => (
                  <motion.div
                    key={pass.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-navy-800 rounded-2xl p-6 border transition-colors duration-500 ${
                      justBoughtDayPass && i === 0 ? 'border-gold-500/60' : 'border-navy-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-9 h-9 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center shrink-0">
                        <TicketIcon className="w-4 h-4 text-gold-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Day Pass #{pass.id}</p>
                        <p className="text-xs text-slate-400">
                          Purchased {new Date(pass.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' · '}
                          <span className="text-amber-400 font-medium">Awaiting Guest</span>
                        </p>
                      </div>
                    </div>
                    <DayPassForm
                      dayPass={pass}
                      futureBookings={futureBookings}
                      onSuccess={() => queryClient.invalidateQueries({ queryKey: ['dayPasses'] })}
                    />
                  </motion.div>
                ))}

                {/* Active used passes — guest created, booking still upcoming */}
                {activeUsedPasses.map((pass, i) => (
                  <motion.div
                    key={pass.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-navy-800 rounded-2xl p-6 border border-navy-700"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-9 h-9 rounded-full bg-green-900/30 border border-green-900/50 flex items-center justify-center shrink-0">
                        <TicketIcon className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Day Pass #{pass.id}</p>
                        <p className="text-xs text-slate-400">
                          Purchased {new Date(pass.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' · '}
                          <span className="text-green-400 font-medium">Guest Active</span>
                        </p>
                      </div>
                    </div>
                    <DayPassForm
                      dayPass={pass}
                      futureBookings={futureBookings}
                      onSuccess={() => queryClient.invalidateQueries({ queryKey: ['dayPasses'] })}
                    />
                  </motion.div>
                ))}

                {/* Completed passes — booking ended */}
                {completedPasses.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Purchased Day Passes</p>
                    <div className="space-y-2">
                      {completedPasses.map((pass) => (
                        <div key={pass.id}
                          className="bg-navy-800/50 border border-navy-700 rounded-xl px-5 py-3 flex items-center gap-3 text-sm text-slate-500">
                          <CheckCircleIcon className="w-4 h-4 text-slate-600 shrink-0" />
                          <span>
                            Day Pass #{pass.id}
                            {pass.booking && ` · ${formatBookingLabel(pass.booking as unknown as Reservation)}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* FAQ */}
        <div className="mt-8 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400">Everything you need to know about joining the club.</p>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-navy-800 p-6 rounded-xl border border-navy-700 shadow-md">
                <div className="flex gap-4">
                  <HelpCircleIcon className="w-6 h-6 text-gold-500 shrink-0" />
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">{faq.q}</h4>
                    <p className="text-slate-400 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
