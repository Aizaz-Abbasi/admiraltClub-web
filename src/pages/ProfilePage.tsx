import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  CameraIcon,
  UploadCloudIcon,
  CheckCircleIcon,
  UserIcon,
  Loader2Icon,
  AlertCircleIcon,
} from 'lucide-react';
import { API_BASE_URL, getApiErrorMessage } from '../api/client';
import {
  fetchProfile,
  updateProfile,
  uploadProfilePicture,
  uploadDrivingLicense,
  type UserProfile,
} from '../services/profile';

// Strip trailing /api/ to get the storage base for file paths
// e.g. "http://localhost:5000/api/" → "http://localhost:5000"
const STORAGE_BASE = API_BASE_URL.replace(/\/api\/?$/, '');

type Toast = { message: string; type: 'success' | 'error' };

export function ProfilePage() {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({ name: '', phone: '', age: '' });

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);
  const [licenseName, setLicenseName] = useState('');

  const [toast, setToast] = useState<Toast | null>(null);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  // Ensures formData is seeded from server exactly once
  const seeded = useRef(false);

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const serverSrc = (path: string | null): string | null =>
    path ? `${STORAGE_BASE}${path}` : null;

  // ── 1. Fetch profile ──────────────────────────────────────────────────────
  const { data: profile, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 0,
  });

  // Seed form once when data first arrives — fixes "not showing existing values"
  if (profile && !seeded.current) {
    seeded.current = true;
    setFormData({
      name: profile.name ?? '',
      phone: profile.phone ?? '',
      age: profile.age != null ? String(profile.age) : '',
    });
  }

  // ── 2. Save name / phone ──────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: () => updateProfile({ name: formData.name, phone: formData.phone, age: formData.age }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      showToast('Profile saved successfully!');
    },
    onError: (err) => showToast(getApiErrorMessage(err), 'error'),
  });

  // ── 3. Profile picture ────────────────────────────────────────────────────
  const pictureMutation = useMutation({
    mutationFn: (file: File) => uploadProfilePicture(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      showToast('Profile picture updated!');
    },
    onError: (err) => {
      setProfilePreview(null);
      showToast(getApiErrorMessage(err), 'error');
    },
  });

  // ── 4. Driving license ────────────────────────────────────────────────────
  const licenseMutation = useMutation({
    mutationFn: (file: File) => uploadDrivingLicense(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      showToast('Driving license uploaded!');
    },
    onError: (err) => {
      setLicensePreview(null);
      setLicenseName('');
      showToast(getApiErrorMessage(err), 'error');
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePreview(URL.createObjectURL(file));
    pictureMutation.mutate(file);
  };

  const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLicensePreview(URL.createObjectURL(file));
    setLicenseName(file.name);
    licenseMutation.mutate(file);
  };

  // ── Loading / error states ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2Icon className="w-8 h-8 text-gold-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-sm">{getApiErrorMessage(error)}</p>
        <button
          onClick={() => void refetch()}
          className="px-4 py-2 rounded-lg bg-navy-800 text-white text-sm hover:bg-navy-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Optimistic preview takes priority, then fall back to server path
  const displayProfileImage = profilePreview ?? serverSrc(profile?.profilePicture ?? null);
  const displayLicenseImage = licensePreview ?? serverSrc(profile?.drivingLicense ?? null);
  const displayLicenseName = licenseName || profile?.drivingLicense?.split('/').pop() || '';

  const isErrorToast = toast?.type === 'error';
  const isSaving = saveMutation.isPending;

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8 relative">

      {/* ── Toast ── */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: toast ? 1 : 0, y: toast ? 0 : -50 }}
        className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 border px-4 py-3 rounded-lg
          shadow-lg flex items-center gap-3 pointer-events-none backdrop-blur-sm
          ${isErrorToast
            ? 'bg-red-900/90 border-red-500/50 text-red-100'
            : 'bg-green-900/90 border-green-500/50 text-green-100'}`}
      >
        {isErrorToast
          ? <AlertCircleIcon className="w-5 h-5 text-red-400" />
          : <CheckCircleIcon className="w-5 h-5 text-green-400" />}
        <span className="font-medium text-sm">{toast?.message}</span>
      </motion.div>

      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">My Profile</h1>
          <p className="text-slate-400">Manage your personal information and documents.</p>
        </div>

        <div className="bg-navy-800 rounded-3xl shadow-2xl border border-navy-700 overflow-hidden">

          {/* Banner */}
          <div className="h-32 bg-navy-900 relative border-b border-navy-700">
            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay" />
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}
            className="p-8 pt-0"
          >
            {/* ── Avatar ── */}
            <div className="relative -mt-16 mb-8 flex justify-center sm:justify-start sm:ml-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-navy-800 bg-navy-900 shadow-lg overflow-hidden flex items-center justify-center">
                  {displayProfileImage
                    ? <img src={displayProfileImage} alt="Profile" className="w-full h-full object-cover" />
                    : <UserIcon className="w-16 h-16 text-slate-600" />}
                  {pictureMutation.isPending && (
                    <div className="absolute inset-0 bg-navy-900/60 flex items-center justify-center">
                      <Loader2Icon className="w-6 h-6 text-gold-500 animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  disabled={pictureMutation.isPending}
                  onClick={() => profileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center
                    text-navy-900 shadow-lg hover:bg-gold-400 transition-colors border-2 border-navy-800 disabled:opacity-60"
                >
                  <CameraIcon className="w-5 h-5" />
                </button>
                <input
                  type="file" ref={profileInputRef}
                  onChange={handleProfileImageChange} accept="image/*" className="hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* ── Personal info ── */}
              <div className="space-y-6">
                <h3 className="text-lg font-serif font-bold text-white border-b border-navy-700 pb-2">
                  Personal Details
                </h3>

                {([
                  { label: 'Full Name', name: 'name', type: 'text' },
                  { label: 'Phone', name: 'phone', type: 'tel' },
                  { label: 'Age', name: 'age', type: 'number' },
                ] as const).map(({ label, name, type }) => (
                  <div key={name} className="space-y-1">
                    <label className="text-sm font-medium text-slate-300 block">{label}</label>
                    <input
                      type={type} name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      {...(name === 'age' ? { min: 18, max: 100 } : {})}
                      className="block w-full px-4 py-3 border border-navy-600 rounded-xl text-sm
        focus:ring-gold-500 focus:border-gold-500 bg-navy-900 text-white
        outline-none transition-colors shadow-inner"
                    />
                  </div>
                ))}
                {/* Email — read-only, always from server */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-300 block">Email Address</label>
                  <input
                    type="email"
                    value={profile?.email ?? ''}
                    disabled
                    className="block w-full px-4 py-3 border border-navy-700 rounded-xl text-sm
                      bg-navy-900/50 text-slate-500 cursor-not-allowed shadow-inner"
                  />
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed.</p>
                </div>
              </div>

              {/* ── Documents ── */}
              <div className="space-y-6">
                <h3 className="text-lg font-serif font-bold text-white border-b border-navy-700 pb-2">
                  Verification Documents
                </h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 block">Driving License</label>
                  <p className="text-xs text-slate-400 mb-3">
                    Required for age verification and liability purposes.
                  </p>

                  <div
                    onClick={() => !licenseMutation.isPending && licenseInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center
                      justify-center text-center transition-colors relative
                      ${licenseMutation.isPending ? 'cursor-wait opacity-70' : 'cursor-pointer'}
                      ${displayLicenseImage
                        ? 'border-gold-500 bg-gold-500/5'
                        : 'border-navy-600 bg-navy-900 hover:bg-navy-800 hover:border-navy-500'}`}
                  >
                    {licenseMutation.isPending && (
                      <div className="absolute inset-0 flex items-center justify-center bg-navy-900/50 rounded-xl z-10">
                        <Loader2Icon className="w-6 h-6 text-gold-500 animate-spin" />
                      </div>
                    )}

                    {displayLicenseImage ? (
                      <>
                        <div className="w-16 h-16 rounded-lg bg-navy-800 shadow-sm border border-navy-600 p-1 mb-3 overflow-hidden">
                          <img
                            src={displayLicenseImage}
                            alt="License preview"
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <p className="text-sm font-medium text-white truncate max-w-[200px]">
                          {displayLicenseName}
                        </p>
                        <p className="text-xs text-gold-500 mt-1 font-medium">Click to replace</p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-navy-800 border border-navy-700 shadow-sm flex items-center justify-center mb-3 text-slate-400">
                          <UploadCloudIcon className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-slate-300">Click to upload license</p>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file" ref={licenseInputRef}
                    onChange={handleLicenseChange} accept="image/*" className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* ── Save button ── */}
            <div className="mt-10 pt-6 border-t border-navy-700 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 bg-gold-500 text-navy-900 font-bold rounded-xl
                  shadow-[0_0_15px_rgba(201,168,76,0.3)] hover:bg-gold-400
                  hover:shadow-[0_0_20px_rgba(201,168,76,0.5)] transition-all
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  focus:ring-offset-navy-900 focus:ring-gold-500
                  disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving && <Loader2Icon className="w-4 h-4 animate-spin" />}
                {isSaving ? 'Saving…' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


// import React, { useState, useRef } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { motion } from 'framer-motion';
// import {
//   CameraIcon,
//   UploadCloudIcon,
//   CheckCircleIcon,
//   UserIcon,
//   Loader2Icon,
//   AlertCircleIcon,
// } from 'lucide-react';
// import { apiGet, apiPatch, apiPostForm } from '../api';
// import { getApiErrorMessage } from '../api/client';

// const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// interface UserProfile {
//   id: string;
//   name: string;
//   email: string;
//   phone: string | null;
//   age: number | null;
//   role: string;
//   profilePicture: string | null;
//   drivingLicense: string | null;
//   createdAt: string;
// }

// type Toast = { message: string; type: 'success' | 'error' };

// export function ProfilePage() {
//   const queryClient = useQueryClient();

//   // Local form state (controlled inputs — seeded from query data below)
//   const [formData, setFormData] = useState({ name: '', phone: '', age: '' });

//   // Optimistic image previews
//   const [profilePreview, setProfilePreview] = useState<string | null>(null);
//   const [licensePreview, setLicensePreview] = useState<string | null>(null);
//   const [licenseName, setLicenseName] = useState('');

//   const [toast, setToast] = useState<Toast | null>(null);

//   const profileInputRef = useRef<HTMLInputElement>(null);
//   const licenseInputRef = useRef<HTMLInputElement>(null);

//   const showToast = (message: string, type: Toast['type'] = 'success') => {
//     setToast({ message, type });
//     setTimeout(() => setToast(null), 3500);
//   };

//   // ── 1. Fetch profile ──────────────────────────────────────────────────────
//   const { data: profile, isLoading, isError, error, refetch } = useQuery({
//     queryKey: ['profile'],
//     queryFn: () => apiGet<UserProfile>('auth/profile'),
//     // Seed local form state the moment data arrives
//     // (runs once on first successful fetch)
//     staleTime: 0,
//   });

//   // Sync form state whenever profile data first loads
//   // This is the fix for "not showing existing values"
//   const seeded = useRef(false);
//   if (profile && !seeded.current) {
//     seeded.current = true;
//     setFormData({
//       name: profile.name ?? '',
//       phone: profile.phone ?? '',
//       age: profile.age != null ? String(profile.age) : '',
//     });
//   }

//   const serverSrc = (path: string | null) =>
//     path ? `${API}${path}` : null;

//   // ── 2. Save profile mutation ──────────────────────────────────────────────
//   const saveMutation = useMutation({
//     mutationFn: () =>
//       apiPatch<{ user: UserProfile }>('auth/profile', {
//         name: formData.name,
//         phone: formData.phone,
//         age: formData.age,
//       }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['profile'] });
//       showToast('Profile saved successfully!');
//     },
//     onError: (err) => showToast(getApiErrorMessage(err), 'error'),
//   });

//   // ── 3. Profile picture mutation ───────────────────────────────────────────
//   const pictureMutation = useMutation({
//     mutationFn: (file: File) => {
//       const form = new FormData();
//       form.append('profilePicture', file);
//       return apiPostForm<{ path: string }>('auth/upload/profile-picture', form);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['profile'] });
//       showToast('Profile picture updated!');
//     },
//     onError: (err) => {
//       setProfilePreview(null);   // revert optimistic preview
//       showToast(getApiErrorMessage(err), 'error');
//     },
//   });

//   // ── 4. Driving license mutation ───────────────────────────────────────────
//   const licenseMutation = useMutation({
//     mutationFn: (file: File) => {
//       const form = new FormData();
//       form.append('drivingLicense', file);
//       return apiPostForm<{ path: string }>('auth/upload/driving-license', form);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['profile'] });
//       showToast('Driving license uploaded!');
//     },
//     onError: (err) => {
//       setLicensePreview(null);   // revert optimistic preview
//       setLicenseName('');
//       showToast(getApiErrorMessage(err), 'error');
//     },
//   });

//   // ── Handlers ──────────────────────────────────────────────────────────────
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setProfilePreview(URL.createObjectURL(file));   // optimistic
//     pictureMutation.mutate(file);
//   };

//   const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setLicensePreview(URL.createObjectURL(file));   // optimistic
//     setLicenseName(file.name);
//     licenseMutation.mutate(file);
//   };

//   // ── Loading / error states ────────────────────────────────────────────────
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-transparent flex items-center justify-center">
//         <Loader2Icon className="w-8 h-8 text-gold-500 animate-spin" />
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-4">
//         <p className="text-red-400 text-sm">{getApiErrorMessage(error)}</p>
//         <button
//           onClick={() => void refetch()}
//           className="px-4 py-2 rounded-lg bg-navy-800 text-white text-sm hover:bg-navy-700 transition-colors"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   // Displayed image: optimistic preview takes priority, then server value
//   const displayProfileImage = profilePreview ?? serverSrc(profile?.profilePicture ?? null);
//   const displayLicenseImage = licensePreview ?? serverSrc(profile?.drivingLicense ?? null);
//   const displayLicenseName = licenseName || profile?.drivingLicense?.split('/').pop() || '';

//   const isError_toast = toast?.type === 'error';
//   const isSaving = saveMutation.isPending;

//   return (
//     <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8 relative">

//       {/* ── Toast ── */}
//       <motion.div
//         initial={{ opacity: 0, y: -50 }}
//         animate={{ opacity: toast ? 1 : 0, y: toast ? 0 : -50 }}
//         className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 border px-4 py-3 rounded-lg shadow-lg
//           flex items-center gap-3 pointer-events-none backdrop-blur-sm
//           ${isError_toast
//             ? 'bg-red-900/90 border-red-500/50 text-red-100'
//             : 'bg-green-900/90 border-green-500/50 text-green-100'}`}
//       >
//         {isError_toast
//           ? <AlertCircleIcon className="w-5 h-5 text-red-400" />
//           : <CheckCircleIcon className="w-5 h-5 text-green-400" />}
//         <span className="font-medium text-sm">{toast?.message}</span>
//       </motion.div>

//       <div className="max-w-3xl mx-auto">
//         <div className="mb-10">
//           <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">My Profile</h1>
//           <p className="text-slate-400">Manage your personal information and documents.</p>
//         </div>

//         <div className="bg-navy-800 rounded-3xl shadow-2xl border border-navy-700 overflow-hidden">
//           {/* Banner */}
//           <div className="h-32 bg-navy-900 relative border-b border-navy-700">
//             <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay" />
//           </div>

//           <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="p-8 pt-0">

//             {/* ── Avatar ── */}
//             <div className="relative -mt-16 mb-8 flex justify-center sm:justify-start sm:ml-8">
//               <div className="relative">
//                 <div className="w-32 h-32 rounded-full border-4 border-navy-800 bg-navy-900 shadow-lg overflow-hidden flex items-center justify-center">
//                   {displayProfileImage
//                     ? <img src={displayProfileImage} alt="Profile" className="w-full h-full object-cover" />
//                     : <UserIcon className="w-16 h-16 text-slate-600" />}
//                   {/* Upload spinner overlay */}
//                   {pictureMutation.isPending && (
//                     <div className="absolute inset-0 bg-navy-900/60 flex items-center justify-center">
//                       <Loader2Icon className="w-6 h-6 text-gold-500 animate-spin" />
//                     </div>
//                   )}
//                 </div>
//                 <button
//                   type="button"
//                   disabled={pictureMutation.isPending}
//                   onClick={() => profileInputRef.current?.click()}
//                   className="absolute bottom-0 right-0 w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center text-navy-900 shadow-lg hover:bg-gold-400 transition-colors border-2 border-navy-800 disabled:opacity-60"
//                 >
//                   <CameraIcon className="w-5 h-5" />
//                 </button>
//                 <input type="file" ref={profileInputRef}
//                   onChange={handleProfileImageChange} accept="image/*" className="hidden" />
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

//               {/* ── Personal info ── */}
//               <div className="space-y-6">
//                 <h3 className="text-lg font-serif font-bold text-white border-b border-navy-700 pb-2">
//                   Personal Details
//                 </h3>

//                 {([
//                   { label: 'Full Name', name: 'name', type: 'text' },
//                   { label: 'Phone', name: 'phone', type: 'tel' },
//                   { label: 'Age', name: 'age', type: 'number' },
//                 ] as const).map(({ label, name, type }) => (
//                   <div key={name} className="space-y-1">
//                     <label className="text-sm font-medium text-slate-300 block">{label}</label>
//                     <input
//                       type={type} name={name}
//                       value={formData[name]}
//                       onChange={handleChange}
//                       {...(name === 'age' ? { min: 18, max: 100 } : {})}
//                       className="block w-full px-4 py-3 border border-navy-600 rounded-xl text-sm
//                         focus:ring-gold-500 focus:border-gold-500 bg-navy-900 text-white
//                         outline-none transition-colors shadow-inner"
//                     />
//                   </div>
//                 ))}

//                 {/* Email — read-only, sourced directly from server */}
//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-slate-300 block">Email Address</label>
//                   <input type="email" value={profile?.email ?? ''} disabled
//                     className="block w-full px-4 py-3 border border-navy-700 rounded-xl text-sm
//                       bg-navy-900/50 text-slate-500 cursor-not-allowed shadow-inner" />
//                   <p className="text-xs text-slate-500 mt-1">Email cannot be changed.</p>
//                 </div>
//               </div>

//               {/* ── Documents ── */}
//               <div className="space-y-6">
//                 <h3 className="text-lg font-serif font-bold text-white border-b border-navy-700 pb-2">
//                   Verification Documents
//                 </h3>

//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-slate-300 block">Driving License</label>
//                   <p className="text-xs text-slate-400 mb-3">
//                     Required for age verification and liability purposes.
//                   </p>

//                   <div
//                     onClick={() => !licenseMutation.isPending && licenseInputRef.current?.click()}
//                     className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center
//                       text-center transition-colors relative
//                       ${licenseMutation.isPending ? 'cursor-wait opacity-70' : 'cursor-pointer'}
//                       ${displayLicenseImage
//                         ? 'border-gold-500 bg-gold-500/5'
//                         : 'border-navy-600 bg-navy-900 hover:bg-navy-800 hover:border-navy-500'}`}
//                   >
//                     {licenseMutation.isPending && (
//                       <div className="absolute inset-0 flex items-center justify-center bg-navy-900/50 rounded-xl z-10">
//                         <Loader2Icon className="w-6 h-6 text-gold-500 animate-spin" />
//                       </div>
//                     )}

//                     {displayLicenseImage ? (
//                       <>
//                         <div className="w-16 h-16 rounded-lg bg-navy-800 shadow-sm border border-navy-600 p-1 mb-3 overflow-hidden">
//                           <img src={displayLicenseImage} alt="License preview"
//                             className="w-full h-full object-cover rounded" />
//                         </div>
//                         <p className="text-sm font-medium text-white truncate max-w-[200px]">{displayLicenseName}</p>
//                         <p className="text-xs text-gold-500 mt-1 font-medium">Click to replace</p>
//                       </>
//                     ) : (
//                       <>
//                         <div className="w-12 h-12 rounded-full bg-navy-800 border border-navy-700 shadow-sm flex items-center justify-center mb-3 text-slate-400">
//                           <UploadCloudIcon className="w-6 h-6" />
//                         </div>
//                         <p className="text-sm font-medium text-slate-300">Click to upload license</p>
//                         <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
//                       </>
//                     )}
//                   </div>
//                   <input type="file" ref={licenseInputRef}
//                     onChange={handleLicenseChange} accept="image/*" className="hidden" />
//                 </div>
//               </div>
//             </div>

//             {/* ── Save button ── */}
//             <div className="mt-10 pt-6 border-t border-navy-700 flex justify-end">
//               <button
//                 type="submit" disabled={isSaving}
//                 className="px-8 py-3 bg-gold-500 text-navy-900 font-bold rounded-xl
//                   shadow-[0_0_15px_rgba(201,168,76,0.3)] hover:bg-gold-400
//                   hover:shadow-[0_0_20px_rgba(201,168,76,0.5)] transition-all
//                   focus:outline-none focus:ring-2 focus:ring-offset-2
//                   focus:ring-offset-navy-900 focus:ring-gold-500
//                   disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
//               >
//                 {isSaving && <Loader2Icon className="w-4 h-4 animate-spin" />}
//                 {isSaving ? 'Saving…' : 'Save Profile'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }