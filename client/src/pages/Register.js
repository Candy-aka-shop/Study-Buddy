import React, { useState } from 'react';
   import { useMutation } from '@tanstack/react-query';
   import { useNavigate, Link } from 'react-router-dom';
   import { useAuthStore } from '../stores';
   import { authApi } from '../utils/api';

   const RegisterPage = () => {
     const [fullName, setFullName] = useState('');
     const [username, setUsername] = useState('');
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [confirmPassword, setConfirmPassword] = useState('');
     const [acceptedTerms, setAcceptedTerms] = useState(false);
     const [error, setError] = useState('');
     const setUser = useAuthStore((state) => state.setUser);
     const navigate = useNavigate();

     const registerMutation = useMutation({
       mutationFn: (userData) => authApi.register(userData),
       onSuccess: (response) => {
         setUser(response.data.user, response.data.token);
         navigate('/verify-email');
       },
       onError: (error) => {
         console.error('Registration Error:', error);
         setError(error.response?.data?.error || 'Registration failed');
       },
     });

     const handleRegister = (e) => {
       e.preventDefault();
       setError('');
       if (password !== confirmPassword) {
         setError('Passwords do not match');
         return;
       }
       if (!acceptedTerms) {
         setError('Please accept the terms');
         return;
       }
       registerMutation.mutate({ name: fullName, username, email, password });
     };

     return (
       <div className="flex min-h-screen items-center justify-center bg-pure-white py-6 sm:py-8 md:py-12">
         <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto bg-pure-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
           <img src="/logo.png" alt="Study Buddy Logo" className="mx-auto mb-4 w-24 sm:w-32" />
           <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-pure-black text-center">Sign Up</h2>
           <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4 md:space-y-5">
             <div>
               <label htmlFor="fullName" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Full Name *</label>
               <input
                 type="text"
                 id="fullName"
                 value={fullName}
                 onChange={(e) => setFullName(e.target.value)}
                 className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
                 required
                 aria-required="true"
               />
             </div>
             <div>
               <label htmlFor="username" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Username *</label>
               <input
                 type="text"
                 id="username"
                 value={username}
                 onChange={(e) => setUsername(e.target.value)}
                 className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
                 required
                 aria-required="true"
               />
             </div>
             <div>
               <label htmlFor="email" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Email *</label>
               <input
                 type="email"
                 id="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
                 required
                 aria-required="true"
               />
             </div>
             <div>
               <label htmlFor="password" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Password *</label>
               <input
                 type="password"
                 id="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
                 required
                 aria-required="true"
               />
             </div>
             <div>
               <label htmlFor="confirmPassword" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Confirm Password *</label>
               <input
                 type="password"
                 id="confirmPassword"
                 value={confirmPassword}
                 onChange={(e) => setConfirmPassword(e.target.value)}
                 className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
                 required
                 aria-required="true"
               />
             </div>
             <div className="flex items-center">
               <input
                 type="checkbox"
                 id="terms"
                 checked={acceptedTerms}
                 onChange={(e) => setAcceptedTerms(e.target.checked)}
                 className="mr-2"
                 required
               />
               <label htmlFor="terms" className="text-xs sm:text-sm text-pure-black">
                 I agree to the <Link to="/terms" className="text-blue-500 hover:underline">Terms of Use</Link>,{' '}
                 <Link to="/purchase-policy" className="text-blue-500 hover:underline">Purchase Policy</Link>, and{' '}
                 <Link to="/privacy-policy" className="text-blue-500 hover:underline">Privacy Policy</Link>
               </label>
             </div>
             <button
               type="submit"
               className="w-full bg-light-blue text-pure-black p-2 sm:p-3 rounded hover:bg-blue-200 text-sm sm:text-base md:text-lg font-semibold transition"
               disabled={registerMutation.isLoading}
               aria-disabled={registerMutation.isLoading}
             >
               {registerMutation.isLoading ? 'Registering...' : 'Sign Up'}
             </button>
             {registerMutation.isSuccess && <p className="text-green-500 mt-2 text-xs sm:text-sm md:text-base text-center">Registration successful!</p>}
             {error && (
               <p className="text-red-500 mt-2 text-xs sm:text-sm md:text-base text-center">
                 Error: {error}
               </p>
             )}
           </form>
           <p className="mt-4 text-center text-xs sm:text-sm text-pure-black">
             Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Log In</Link>
           </p>
         </div>
       </div>
     );
   };

   export default RegisterPage;