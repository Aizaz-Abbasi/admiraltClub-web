// import { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { CheckCircleIcon } from 'lucide-react';
// import { useQueryClient } from '@tanstack/react-query';
// import { motion } from 'framer-motion';

// export function MembershipSuccessPage() {
//     const navigate = useNavigate();
//     const queryClient = useQueryClient();

//     useEffect(() => {
//         // Invalidate membership so it refreshes on next visit
//         queryClient.invalidateQueries({ queryKey: ['membership'] });
//         const t = setTimeout(() => navigate('/membership'), 5000);
//         return () => clearTimeout(t);
//     }, []);

//     return (
//         <div className="min-h-screen bg-transparent flex items-center justify-center px-4">
//             <motion.div
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="bg-navy-800 border border-navy-700 rounded-2xl p-12 max-w-md w-full text-center shadow-2xl"
//             >
//                 <div className="w-20 h-20 rounded-full bg-green-900/30 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
//                     <CheckCircleIcon className="w-10 h-10 text-green-400" />
//                 </div>
//                 <h1 className="text-3xl font-serif font-bold text-white mb-3">Payment Successful!</h1>
//                 <p className="text-slate-400 mb-6">
//                     Welcome to the Admiralty Club. Your membership is now active.
//                 </p>
//                 <p className="text-xs text-slate-500">Redirecting you back in 5 seconds...</p>
//                 <button
//                     onClick={() => navigate('/membership')}
//                     className="mt-6 px-6 py-3 bg-gold-500 text-navy-900 font-bold rounded-xl hover:bg-gold-400 transition-colors"
//                 >
//                     Back to Membership
//                 </button>
//             </motion.div>
//         </div>
//     );
// }