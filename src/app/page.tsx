"use client";
import Image from "next/image";
import Container from "react-bootstrap/esm/Container";
import Layout from "../components/common/Layout";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const redirectTOlogin = () => {
    router.push("/login");
  };

  
  return (
    <>
      <Layout>
        <Container className="bg-gray-200 p-5 rounded-md h-screen">
          <section className="bg-white">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
              <div className="max-w-xl mx-auto text-center">
              
                <h2 className="text-3xl font-extrabold text-gray-900 text-center">
               :: VNFRepuChain ::  </h2>
                <p className="mt-4 text-lg text-black text-center">
                Blockchain-based reputation model of trusted VNF services in 5G and Beyond Networks 
                </p>
              
                <br/>
                <br/>
                <br/>
        
              
            
                <br />
                {/* <p className="mt-4 text-lg text-gray-500 text-center">
                 by
                </p>
                <p className="mt-2 text-lg text-gray-500 text-center">
                 Panchanan Nath 202204021001 & Ujjal Roy 202204021002
                </p>
                <br />
                <p className="mt-4 text-lg text-gray-500 text-center">
                 Supervisors
                </p>
                <p className="mt-2 mb-8 text-lg text-gray-500 text-center">
                 Dr. Pranav Kumar Singh & Bikramjit Choudhary */}
                
                <br/>
          
                <button
                  type="button"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                  onClick={redirectTOlogin}
                >
                  Login
                </button>
              </div>
            </div>
          </section>
        </Container>
      </Layout>
    </>
  );
}
