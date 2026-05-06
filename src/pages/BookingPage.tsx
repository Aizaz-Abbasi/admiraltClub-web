import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SimulatorCard } from '../components/SimulatorCard';
import { TimeSlotCard } from '../components/TimeSlotCard';
import {
  MapPinIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  KeyIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import { Location, Simulator, TimeSlot } from '../api';
import { fetchLocations } from '../services/location';
import { useQuery } from '@tanstack/react-query';
import { fetchSimulators } from '../services/simulator';
import { bookSlot, fetchSlots } from '../services/bookig';

interface BookingPageProps {
  canBook?: boolean;
}

export function BookingPage({ canBook = true }: BookingPageProps) {
  if (!canBook) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-navy-800 border border-navy-700 rounded-2xl p-10 text-center shadow-2xl"
        >
          <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-6">
            <ShieldCheckIcon className="w-8 h-8 text-gold-500" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mb-3">
            Membership Required
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            An active membership is required to book a simulator bay.
            Choose a plan to get started.
          </p>
          <a
            href="#membership"
            onClick={(e) => {
              e.preventDefault();
              // Dispatch a custom event so App can switch to membership view
              window.dispatchEvent(new CustomEvent('navigate', { detail: 'membership' }));
            }}
            className="inline-block w-full py-3 rounded-xl bg-gold-500 text-navy-900 font-bold text-sm hover:bg-gold-400 transition-colors"
          >
            View Membership Plans
          </a>
        </motion.div>
      </div>
    );
  }
  const [step, setStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedSimulator, setSelectedSimulator] = useState<Simulator | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [doorCode, setDoorCode] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  console.log("selectedSlot", selectedSlot);

  //
  const {
    data: fetchedLocations,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'locations'],
    queryFn: fetchLocations,
  });

  const {
    data: availableSlots = [],
    isFetching: isFetchingSlots,
  } = useQuery({
    queryKey: ['slots', selectedDate, selectedSimulator?.id],
    queryFn: () => fetchSlots(selectedDate, selectedSimulator!.id),
    enabled: !!selectedDate && !!selectedSimulator,
  });

  const { data: fetchedSimulators, isLoading: isSimulatorsLoading, isError: isSimulatorsError, error: simulatorsError, refetch: refetchSimulators } = useQuery({
    queryKey: ['admin', 'simulators'],
    queryFn: fetchSimulators,
  });

  const locationSims = fetchedSimulators?.filter(
    (sim) => sim.locationId === selectedLocation?.id
  );

  // Generate next 14 days for date picker
  // const dates = Array.from(
  //   {
  //     length: 14
  //   },
  //   (_, i) => {
  //     const d = new Date();
  //     d.setDate(d.getDate() + i);
  //     return d.toISOString().split('T')[0];
  //   }
  // );

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    const localDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    return localDate.toLocaleDateString('en-CA'); // gives YYYY-MM-DD in local time
  });

  useEffect(() => {
    if (fetchedLocations?.length && !selectedLocation) {
      setSelectedLocation(fetchedLocations[0]);
    }
  }, [fetchedLocations]);

  useEffect(() => {
    if (locationSims?.length && !selectedSimulator) {
      setSelectedSimulator(locationSims[0]);
    }
  }, [locationSims]);

  useEffect(() => {
    //setSelectedSlot(null);
  }, [selectedDate, selectedSimulator]);

  // Reset simulator and date when location changes
  useEffect(() => {
    setSelectedSimulator(null);
    setSelectedDate('');
    setSelectedSlot(null);
  }, [selectedLocation]);

  const handleNext = async () => {
    if (step === 3) {
      setIsProcessing(true);
      setBookingError(null);
      try {
        const reservation = await bookSlot(
          selectedSimulator!.id,
          selectedDate,
          selectedSlot?.id ?? "0"   // make sure TimeSlot type has slotIndex
        );
        setDoorCode(reservation.doorCode);
        setIsConfirmed(true);
      } catch (e: any) {
        console.log("e.message ", e.message);
        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          'Something went wrong.';
        setBookingError(msg || 'Something went wrong. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1));
    setBookingError(null)
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!selectedLocation && !!selectedSimulator && !!selectedDate;
      case 2:
        return !!selectedSlot;
      case 3:
        return true;
      // return (
      //   cardName.length > 0 &&
      //   cardNumber.length >= 16 &&
      //   cardExpiry.length >= 5 &&
      //   cardCvc.length >= 3
      // );

      default:
        return false;
    }
  };
  const stepTitles = ['Select Bay & Date', 'Pick Time', 'Confirm'];
  const renderStepIndicator = () =>
    <div className="mb-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-navy-800 rounded-full z-0"></div>
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gold-500 rounded-full z-0 transition-all duration-500 ease-in-out shadow-[0_0_10px_rgba(201,168,76,0.5)]"
          style={{
            width: `${(step - 1) / 2 * 100}%`
          }}>
        </div>

        {[1, 2, 3].map((num) =>
          <div
            key={num}
            className={`relative z-10 flex flex-col items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-colors duration-300 ${step >= num ? 'bg-gold-500 text-navy-900 shadow-lg ring-4 ring-navy-900' : 'bg-navy-800 text-slate-500 border-2 border-navy-700'}`}>

            {step > num ? <CheckCircleIcon className="w-6 h-6" /> : num}
            <span
              className={`absolute -bottom-7 text-xs whitespace-nowrap font-bold ${step >= num ? 'text-white' : 'text-slate-500'}`}>

              {stepTitles[num - 1]}
            </span>
          </div>
        )}
      </div>
    </div>;

  const renderStep1 = () => {
    const locationSims = fetchedSimulators?.filter(
      (sim) => sim.locationId === selectedLocation?.id
    );

    return (
      <div className="space-y-10">
        {/* Location Selector */}
        <div>
          <h3 className="text-lg font-serif font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-navy-700 text-gold-500 flex items-center justify-center text-xs border border-navy-600">
              1
            </span>
            Select Location
          </h3>
          <div className="flex flex-wrap gap-3">
            {fetchedLocations?.map((loc) =>
              <button
                key={loc.id}
                onClick={() => setSelectedLocation(loc)}
                className={`px-6 py-3 rounded-xl border-2 font-medium transition-all ${selectedLocation?.id === loc.id ? 'border-gold-500 bg-navy-800 text-white shadow-lg shadow-gold-500/10' : 'border-navy-700 bg-navy-800/50 text-slate-400 hover:border-navy-500 hover:text-slate-200'}`}>

                {loc.name}
              </button>
            )}
          </div>
        </div>

        {/* Simulator Selector */}
        <div>
          <h3 className="text-lg font-serif font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-navy-700 text-gold-500 flex items-center justify-center text-xs border border-navy-600">
              2
            </span>
            Choose Simulator
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locationSims?.map((sim) =>
              <SimulatorCard
                key={sim.id}
                simulator={sim}
                isSelected={selectedSimulator?.id === sim.id}
                onClick={() => setSelectedSimulator(sim)} />

            )}
          </div>
        </div>

        {/* Date Selector */}
        <div
          className={
            !selectedSimulator ?
              'opacity-50 pointer-events-none transition-opacity' :
              'transition-opacity'
          }>

          <h3 className="text-lg font-serif font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-navy-700 text-gold-500 flex items-center justify-center text-xs border border-navy-600">
              3
            </span>
            Select Date
          </h3>
          <div className="flex overflow-x-auto pb-4 hide-scrollbar gap-3 snap-x">
            {dates.map((dateStr) => {
              const d = new Date(dateStr);
              const isSelected = selectedDate === dateStr;
              const dayName = d.toLocaleDateString('en-US', {
                weekday: 'short'
              });
              const dayNum = d.getDate();
              const month = d.toLocaleDateString('en-US', {
                month: 'short'
              });
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`snap-start shrink-0 w-20 h-24 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${isSelected ? 'border-gold-500 bg-navy-800 text-white shadow-lg shadow-gold-500/20 scale-105' : 'border-navy-700 bg-navy-800/80 text-slate-400 hover:border-navy-500 hover:text-slate-200'}`}>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-gold-500' : 'text-slate-500'}`}>

                    {month}
                  </span>
                  <span className="text-2xl font-serif font-bold mb-1">
                    {dayNum}
                  </span>
                  <span
                    className={`text-xs font-medium ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>

                    {dayName}
                  </span>
                </button>);

            })}
          </div>
        </div>
      </div>);

  };
  const renderStep2 = () =>
    <div className="space-y-8">
      <div className="bg-navy-900 border border-navy-700 text-white rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-gold-500 text-xs font-bold uppercase tracking-wider mb-1">
            Selected Bay
          </p>
          <p className="font-serif font-bold text-lg">
            {selectedSimulator?.name}
          </p>
          <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
            <MapPinIcon className="w-3 h-3" /> {selectedLocation?.name ?? "-"}
          </p>
        </div>
        <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-navy-700 pt-4 sm:pt-0 sm:pl-6">
          <p className="text-gold-500 text-xs font-bold uppercase tracking-wider mb-1">
            Date
          </p>
          <p className="font-serif font-bold text-lg">
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-serif font-bold text-white mb-4">
          Available Time Slots
        </h3>
        {isFetchingSlots ? (
          <div className="flex items-center justify-center py-12 text-slate-400 gap-3">
            <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            Loading slots...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableSlots.map((slot: TimeSlot) => (
              <TimeSlotCard
                key={slot.id}
                slot={slot}
                isSelected={selectedSlot?.id === slot.id}
                onClick={() => setSelectedSlot(slot)}
              />
            )
            )}
          </div>
        )
        }
      </div>
    </div>;
  const renderStep3 = () => {
    if (isConfirmed) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center space-y-8 py-8"
        >
          <div className="w-24 h-24 bg-green-900/30 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <CheckCircleIcon className="w-12 h-12 text-green-400" />
          </div>

          <div>
            <h2 className="text-3xl font-serif font-bold text-white mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-slate-400">
              Your simulator bay has been reserved successfully.
            </p>
          </div>

          <div className="bg-navy-800 rounded-2xl border border-navy-700 shadow-lg p-6 text-left space-y-4">
            <div className="flex items-start gap-3 pb-4 border-b border-navy-700">
              <CalendarIcon className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-slate-400">{selectedSlot?.label}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-4 border-b border-navy-700">
              <MapPinIcon className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">{selectedSimulator?.name}</p>
                <p className="text-slate-400 text-sm">{selectedLocation?.name}</p>
              </div>
            </div>

            <div className="bg-navy-900 rounded-xl p-4 flex items-center justify-between border border-navy-700 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-navy-800 border border-navy-600 flex items-center justify-center text-gold-500">
                  <KeyIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                    Door Code
                  </p>
                  <p className="text-2xl font-mono font-bold text-gold-500 tracking-widest drop-shadow-[0_0_8px_rgba(201,168,76,0.5)]">
                    {doorCode}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-center text-slate-500 mt-2">
              This code will activate 15 minutes before your reservation.
            </p>
          </div>

          <button
            onClick={() => {
              setStep(1);
              setSelectedLocation(null);
              setSelectedSimulator(null);
              setSelectedDate('');
              setSelectedSlot(null);
              setIsConfirmed(false);
            }}
            className="w-full py-4 rounded-xl font-bold border border-navy-600 text-white hover:bg-navy-800 transition-colors"
          >
            Book Another Bay
          </button>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-xl mx-auto"
      >
        {/* Summary Card */}
        <div className="bg-navy-900 rounded-2xl border border-navy-700 shadow-inner p-6 mb-6">
          <h3 className="text-lg font-serif font-bold text-white mb-5 pb-4 border-b border-navy-700">
            Booking Summary
          </h3>

          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-navy-800 border border-navy-600 flex items-center justify-center shrink-0">
                <MapPinIcon className="w-4 h-4 text-gold-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">
                  Location & Simulator
                </p>
                <p className="font-medium text-white">{selectedSimulator?.name}</p>
                <p className="text-sm text-slate-400">{selectedLocation?.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-navy-800 border border-navy-600 flex items-center justify-center shrink-0">
                <CalendarIcon className="w-4 h-4 text-gold-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">
                  Date & Time
                </p>
                <p className="font-medium text-white">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-slate-400">{selectedSlot?.label}</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-navy-700/60" />

          {/* Door code hint */}
          <div className="flex items-center gap-3 bg-navy-800/60 rounded-xl px-4 py-3 border border-navy-700">
            <KeyIcon className="w-4 h-4 text-gold-500 shrink-0" />
            <p className="text-sm text-slate-400">
              A door code will be generated and shown after confirmation.
            </p>
          </div>
        </div>

        {/* Confirm Button */}
        {/* <button
          //onClick={handleConfirmBooking}
          className="w-full py-4 rounded-xl font-bold text-navy-900 bg-gold-500 hover:bg-gold-400 transition-colors shadow-[0_0_20px_rgba(201,168,76,0.25)] text-base tracking-wide"
        >
          Confirm Booking
        </button> */}

        <p className="text-center text-xs text-slate-500 mt-4">
          By confirming, you agree to the club's reservation policy.
        </p>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {!isConfirmed &&
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
              Reserve a Simulator
            </h1>
            {renderStepIndicator()}
          </div>
        }

        <div
          className={`bg-navy-800 rounded-3xl shadow-2xl border border-navy-700 overflow-hidden min-h-[500px] flex flex-col ${isConfirmed ? 'max-w-2xl mx-auto' : ''}`}>

          <div className="p-6 md:p-10 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={step + (isConfirmed ? '-confirmed' : '')}
                initial={{
                  opacity: 0,
                  x: 20
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                exit={{
                  opacity: 0,
                  x: -20
                }}
                transition={{
                  duration: 0.3
                }}>

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          {!isConfirmed &&
            <div className="bg-navy-900/80 p-6 border-t border-navy-700 flex justify-between items-center backdrop-blur-sm">
              <button
                onClick={handleBack}
                disabled={step === 1 || isProcessing}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${step === 1 || isProcessing ? 'text-navy-700 cursor-not-allowed' : 'text-slate-300 hover:bg-navy-800 hover:text-white'}`}>

                <ChevronLeftIcon className="w-5 h-5" />
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={!canProceed() || isProcessing}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${!canProceed() ? 'bg-navy-800 text-navy-600 cursor-not-allowed border border-navy-700' : 'bg-gold-500 text-navy-900 hover:bg-gold-400 shadow-[0_0_15px_rgba(201,168,76,0.4)] hover:shadow-[0_0_25px_rgba(201,168,76,0.6)]'}`}>

                {isProcessing ?
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-navy-900 border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span> :

                  <>
                    {step === 3 ? 'Confirm Booking' : 'Continue'}
                    {step < 3 && <ChevronRightIcon className="w-5 h-5" />}
                  </>
                }
              </button>
            </div>
          }
          {bookingError && (
            <p className="text-red-400 text-sm text-center w-full mb-2">{bookingError}</p>
          )}
        </div>
      </div>
    </div>);

}