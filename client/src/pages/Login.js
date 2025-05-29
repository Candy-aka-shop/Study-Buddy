import React, { useState } from 'react';
   import { useMutation } from '@tanstack/react-query';
   import { useNavigate, Link } from 'react-router-dom';
   import { useAuthStore } from '../stores';
   import { authApi } from '../utils/api';

   const LoginPage = () => {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const setUser = useAuthStore((state) => state.setUser);
     const navigate = useNavigate();

     const loginMutation = useMutation({
       mutationFn: ({ email, password }) => authApi.login({ email, password }),
       onSuccess: (response) => {
         setUser(response.data.user, response.data.token);
         navigate('/profile');
       },
       onError: (error) => {
         console.error('Login Error:', error);
       },
     });

     const handleLogin = (e) => {
       e.preventDefault();
       loginMutation.mutate({ email, password });
     };

     return (
       <div className="flex min-h-screen items-center justify-center bg-pure-white py-6 sm:py-8 md:py-12">
         <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto bg-pure-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
           <img src="/logo.png" alt="Study Buddy Logo" className="mx-auto mb-4 w-24 sm:w-32" />
           <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-pure-black text-center">Log In</h2>
           <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4 md:space-y-5">
             <div>
               <label htmlFor="loginEmail" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Email</label>
               <input
                 type="email"
                 id="loginEmail"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
                 required
                 aria-required="true"
               />
             </div>
             <div>
               <label htmlFor="loginPassword" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Password (6+ characters)</label>
               <input
                 type="password"
                 id="loginPassword"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
                 required
                 aria-required="true"
                 minLength={6}
               />
             </div>
             <p className="text-xs sm:text-sm text-right">
               <Link to="/reset-password" className="text-blue-500 hover:underline">Forgot your password?</Link>
             </p>
             <button
               type="submit"
               className="w-full bg-light-blue text-pure-black p-2 sm:p-3 rounded hover:bg-blue-200 text-sm sm:text-base md:text-lg font-semibold transition"
               disabled={loginMutation.isLoading}
               aria-disabled={loginMutation.isLoading}
             >
               {loginMutation.isLoading ? 'Logging in...' : 'Log In'}
             </button>
             {loginMutation.isSuccess && <p className="text-green-500 mt-2 text-xs sm:text-sm md:text-base text-center">Login successful!</p>}
             {loginMutation.isError && (
               <p className="text-red-500 mt-2 text-xs sm:text-sm md:text-base text-center">
                 Error: {loginMutation.error?.response?.data?.error || 'Login failed'}
               </p>
             )}
           </form>
           <p className="mt-4 text-center text-xs sm:text-sm text-pure-black">
             Don't have an account yet? <Link to="/register" className="text-blue-500 hover:underline">Sign Up</Link>
           </p>
         </div>
       </div>
     );
   };

   export default LoginPage;