"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { userData } from '@/utils/users';
import Layout from "@/components/common/Layout";
export default function Login() {
    const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    const user = userData.find(u => u.username === username && u.password === password);

    if (user) {
      if (user.role === "0") {
        router.push('/badger?userid='+ encodeURIComponent(user.id));
      } else if (user.role === "1") {
        //add user to route
        router.push('/customer?userid='+ encodeURIComponent(user.id));
      }
    //   }else if (user.role === 2) {
    //   //add user to route
    //   router.push('/reviewer?userid='+ encodeURIComponent(user.id));
    // }else if (user.role === 3) {
    //   //add user to route
    //   router.push('/badger?userid='+ encodeURIComponent(user.id));
    // }
    } else {
      alert('Invalid username or password');
    }
  };

  return (
    
    <>
    <Layout>
    <section className="bg-gray-50 dark:bg-gray-900">
  <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          {/* <img className="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo"/> */}
          ::VNFTestChain::    
      </a>
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white text-center">
                  Login to your account
              </h1>
              <div>
                                    <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Role</label>
                                    <select name="role" id="role" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} required>
                                        <option value="">Select Role</option>
                                        <option value="customer">Customer</option>
                                        <option value="verifier">Badger</option>
                                    </select>
                                </div>
              <div className="space-y-4 md:space-y-6" >
                  <div>
                  
                      <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username</label>
                      <input type="username" name="username" id="username" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="username" required value={username}
        onChange={(e) => setUsername(e.target.value)}/>
                  </div>
                  <div>
                      <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                      <input type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={password}
        onChange={(e) => setPassword(e.target.value)} required/>
                  </div>
                  <div className="flex items-center justify-between">
                      <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input id="remember" aria-describedby="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"/>
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="remember" className="text-gray-500 dark:text-gray-300">Remember me</label>
                          </div>
                      </div>
                      <a href="#" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</a>
                  </div>
                  <button  className="w-full text-white bg-blue-700 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" onClick={handleLogin}>Login</button>
                 
              </div>
          </div>
      </div>
  </div>
</section>
</Layout>
    </>
  )
}
