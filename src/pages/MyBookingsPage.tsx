import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  KeyIcon,
  XIcon
} from
  'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchMyBookings } from '../services/bookig';
import { useCancelBooking } from '../hooks/booking';
import React from 'react';
export function MyBookingsPage() {

  const {
    data: reservations = [],
    isFetching: isFetchingSlots,
  } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => fetchMyBookings("ALL"),
  });

  const { mutate: cancelBookingMutate } = useCancelBooking();

  const upcoming = reservations.filter((r) => r.status !== 'COMPLETED');
  const past = reservations.filter((r) => r.status === 'COMPLETED');

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [loadingId, setLoadingId] = React.useState<number | null>(null);

  const handleCancelBooking = (bookingId: number) => {
    const confirmed = window.confirm('Are you sure you want to cancel this booking?');
    if (!confirmed) return;

    setLoadingId(bookingId);

    cancelBookingMutate(bookingId, {
      onSettled: () => setLoadingId(null),
    });
  };

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
            My Bookings
          </h1>
          <p className="text-slate-400">
            Manage your upcoming simulator reservations.
          </p>
        </div>

        <div className="space-y-12">
          {/* Upcoming Bookings */}
          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-gold-500" />
              Upcoming Reservations
            </h2>

            {upcoming.length === 0 ?
              <div className="bg-navy-800 rounded-xl border border-navy-700 p-12 text-center shadow-md">
                <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No upcoming bookings
                </h3>
                <p className="text-slate-400 mb-6">
                  You don't have any simulator sessions scheduled.
                </p>
                <button className="px-6 py-3 bg-gold-500 text-navy-900 rounded-lg font-bold hover:bg-gold-400 transition-colors shadow-lg shadow-gold-500/20">
                  Book a Bay
                </button>
              </div> :

              <div className="space-y-4">
                {upcoming.map((booking, idx) =>
                  <motion.div
                    key={booking.id}
                    initial={{
                      opacity: 0,
                      y: 10
                    }}
                    animate={{
                      opacity: 1,
                      y: 0
                    }}
                    transition={{
                      delay: idx * 0.1
                    }}
                    className="bg-navy-800 rounded-xl border border-navy-700 shadow-md overflow-hidden flex flex-col md:flex-row">

                    {/* Date/Time Block */}
                    <div className="bg-navy-900 text-white p-6 md:w-64 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-navy-700 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                      <span className="text-sm font-medium text-gold-500 uppercase tracking-wider mb-1 relative z-10">
                        {new Date(booking.startTime).toLocaleDateString('en-US', {
                          weekday: 'long'
                        })}
                      </span>
                      <span className="text-3xl font-serif font-bold mb-2 relative z-10">
                        {new Date(booking.startTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-300 text-sm bg-navy-800 border border-navy-700 px-3 py-1.5 rounded-full relative z-10 shadow-inner">
                        <ClockIcon className="w-4 h-4" />
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </div>
                    </div>

                    {/* Details Block */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-serif font-bold text-white mb-1">
                              {booking.simulator.name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                              <MapPinIcon className="w-4 h-4" />
                              {booking.simulator.location}
                            </div>
                          </div>
                          <span
                            className={`
    inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
    ${booking.status === 'CANCELLED'
                                ? 'bg-red-900/30 text-red-400 border border-red-900/50'
                                : 'bg-green-900/30 text-green-400 border border-green-900/50'}
  `}
                          >
                            {booking.status}
                          </span>
                        </div>

                        <div className="bg-navy-900 rounded-lg p-4 border border-navy-700 flex items-center justify-between shadow-inner">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-navy-800 border border-navy-600 flex items-center justify-center text-gold-500 shadow-sm">
                              <KeyIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">
                                Door Code
                              </p>
                              <p className="text-lg font-mono font-bold text-gold-500 tracking-widest drop-shadow-[0_0_5px_rgba(201,168,76,0.3)]">
                                {booking.doorCode}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 max-w-[150px] text-right hidden sm:block">
                            Use this code to unlock the bay door during your
                            reservation.
                          </p>
                        </div>
                      </div>
                      {
                        booking.status === 'BOOKED' &&
                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={loadingId === booking.id}

                            className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors px-4 py-2 rounded-lg hover:bg-red-900/20 border border-transparent hover:border-red-900/50">
                            <XIcon className="w-4 h-4" />
                            {loadingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                          </button>
                        </div>
                      }

                    </div>
                  </motion.div>
                )}
              </div>
            }
          </section>

          {/* Past Bookings */}
          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-slate-500" />
              Past Reservations
            </h2>
            <div className="bg-navy-800 rounded-xl border border-navy-700 shadow-md overflow-hidden">
              <div className="divide-y divide-navy-700">
                {past.map((booking) =>
                  <div
                    key={booking.id}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-navy-700/50 transition-colors">

                    <div>
                      <h4 className="font-medium text-white">
                        {booking.simulator.name}
                      </h4>
                      <p className="text-sm text-slate-400">
                        {booking.simulator.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-slate-400">
                        {new Date(booking.startTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                        <span className="mx-2 text-slate-600">•</span>
                        {booking.startTime} - {booking.endTime}
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${booking.status === 'COMPLETED' ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-red-900/30 text-red-400 border border-red-900/50'}`}>

                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>);

}