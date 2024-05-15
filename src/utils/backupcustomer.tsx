"use client";
import React, { useEffect, useState } from "react";
import { UserData } from "@/utils/interfaces";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { userData } from "@/utils/users";
import Layout from "@/components/common/Layout";
import { Container } from "react-bootstrap";
import { pricingData } from "@/utils/pricing";
import Web3 from "web3";
import Link from "next/link";


const contractAddress = '0xF570BaF61D48d7F767135Df9b25013B29bb0bbf1';
const localUrl = 'http://localhost:8545'
const contractAbi = [
  // Update with your contract ABI
  {
    "constant": true,
    "inputs": [
      {
        "name": "_badgerId",
        "type": "uint256"
      }
    ],
    "name": "getBadgerDetails",
    "outputs": [
      {
        "components": [
          {"name": "id", "type": "uint256"},
          {"name": "vnfName", "type": "string"},
          {"name": "vnfHash", "type": "string"},
          {"name": "testResult", "type": "string"},
          {"name": "reviewResult", "type": "string"},
          {"name": "verifierResult", "type": "string"},
          {"name": "description", "type": "string"},
          {"name": "owner", "type": "address"}
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];


// interface BlockData 
//   { vnfname: any; vnfHash: any; testResult: any; reviewResult: any; verifierResult: any; description: any;}



export default function Customer() {
  const [activeTab, setActiveTab] = useState(1);
  const handleTabClick = (tabNumber: React.SetStateAction<number>) => {
    setActiveTab(tabNumber);

    const [badgerData, setBadgerData] = useState<any[]>([]);
    const web3 = new Web3(new Web3.providers.HttpProvider(localUrl));
  
    // Get the contract instance
    const contract = new web3.eth.Contract(contractAbi, contractAddress);

    const fetchBadgerData = async () => {
      try {
        // Connect to the local Ethereum node
       
        // Assume you want to fetch details for a specific Badger (replace 1 with the desired Badger ID)
        const badgerIdToFetch = 0;
  
        // Call the contract function to get the Badger details
        const result = await contract.methods.getBadgerDetails(badgerIdToFetch).call();
  
        // Update the state with the fetched data
        setBadgerData([result]);
      } catch (error) {
        console.error('Error fetching Badger data:', error);
      }
    };
  }
       
  const router = useRouter();
  // const [user, setUser] = React.useState<UserData | null>(null);
  const searchParams = useSearchParams();
  const userid = searchParams.get("userid");
  const [isUser, setIsUser] = React.useState(false);
  const [user, Setuser] = React.useState<UserData | null>(null);
  // Access the user from the query parameters

  useEffect(() => {
    if (!userid) {
      console.log("User is not present");
      router.push("/login"); // Redirect to the login page if user is not present
    } else {
      const foundUser = userData.find((user) => user.id === String(userid));
      if (foundUser) {
        console.log("User found:", foundUser);
        Setuser(foundUser); // Set the user data when the user is found
        setIsUser(true);
      } else {
        console.log("User not found");
        router.push("/login"); // Redirect to the login page if user is not found
      }
    }
  }, [userid]);

  console.log(userid);



  useEffect(() => {
    // Fetch Badger data when the component mounts
    fetchBadgerData();
  }, []);
  return (
    <>
      <Layout>
        <Container className="bg-gray-200 p-5 rounded-md h-screen">
          <section className="bg-white">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
              <div className="max-w-xl mx-auto">
                <h2 className="text-3xl font-extrabold text-gray-900 self-center text-center">
                  ::VNF Repository::
                </h2>

                <br />
                <br />
                <h2 className="text-2xl font-extrabold text-gray-900 self-center text-center">
                  Customer Dashboard
                </h2>
                <br />
                <br />
                <div className="justify-center">
                  <div className="">
                    <h1 className="text-1xl font-extrabold text-gray-700 text-center">::Current User Details::</h1>

                  </div>
                  <div className="block text-center px-5 py-2.5 mr-2 mb-2 text-sm h-12 text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-900 focus:outline-none dark:bg-gray-400 dark:border-gray-600 dark:placeholder-gray-400 ">
                    {user?.name} :: {user?.roleName}
                  </div>

                </div>
              </div>
              <div className="grid grid-cols-3 gap-5">
                {pricingData.map((pricing, index) => (
                  

                  <div key={index} className="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
                    <h5 className="mb-4 text-xl font-medium text-gray-500 dark:text-gray-400 text-center">{pricing.title}</h5>
                    <div className="flex items-baseline text-gray-900 dark:text-white">
                      <span className="text-3xl font-semibold"></span>
                      <span className="text-3xl font-extrabold tracking-tight text-ceter">{pricing.price}</span>
                      <span className="ml-1 text-xl font-normal text-gray-500 dark:text-gray-400">{}</span>
                    </div>
                    <ul role="list" className="space-y-5 my-7">
                      {pricing.details.map((detail, index) => (
                        <li className="flex space-x-3 items-center " key={index}>
                          <svg className="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                          </svg>
                          <span className="text-base font-normal leading-tight text-gray-500 dark:text-gray-400">{detail}</span>
                        </li>
                      ))}

                    </ul>
                    <div className="flex items-center mt-2.5 mb-5">
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <svg style={{
                  color: pricing.rating >= 1 ? "#10B981" : "#999999"
                }}  className="w-4 h-4 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                </svg>
                <svg style={{
                  color: pricing.rating >= 2 ? "#10B981" : "#999999"
                }}  className="w-4 h-4 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                </svg>
                <svg style={{
                  color: pricing.rating >= 3 ? "#10B981" : "#999999"
                }}  className="w-4 h-4 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                </svg>
                <svg style={{
                  color: pricing.rating >= 4 ? "#10B981" : "#999999"
                }} className="w-4 h-4 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                </svg>
                <svg style={{
                  color: pricing.rating >= 5 ? "#10B981" : "#999999"
                }}  className="w-4 h-4 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                </svg>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ms-3">{pricing.rating}</span>
        </div>
                    <button type="button" className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-200 dark:focus:ring-blue-900 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex justify-center w-full text-center">Request for Demo</button>
                  </div>
                ))}








              </div>



            </div>









          </section>
        </Container>
      </Layout>



    </>
  );
}



function fetchBadgerData() {
  throw new Error("Function not implemented.");
}

