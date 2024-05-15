"use client";
import React, { useEffect, useState } from "react";
import { UserData } from "@/utils/interfaces";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { userData } from "@/utils/users";
import Layout from "@/components/common/Layout";
import { Container, Modal, Button } from "react-bootstrap";
import { pricingData } from "@/utils/pricing";
import Web3 from "web3";
import Link from "next/link";
import { abi as contractABI } from "build/contracts/VNF.json";
import StarRatings from 'react-star-ratings'; // Import react-star-ratings


const contractAddress = '0xB1cb43796750E44A784a3634DF55431DBF7e5d10';
const localUrl = 'http://localhost:8545'

interface BlockData {
  id: string;
  vnfName: string;
  vnfHash: string;
  testResult: string;
  reviewResult: string;
  verifierResult: string;
  description: string;
  vnfprice: string;
}

export default function Customer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userid = searchParams.get("userid");
  const [user, setUser] = useState<UserData | null>(null);
  const [isUser, setIsUser] = useState(false);
  const [blockData, setBlockData] = useState<BlockData[]>([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedVNF, setSelectedVNF] = useState<BlockData | null>(null);
  const [rating, setRating] = useState<number>(0); // State variable to hold the rating

  

  const fetchBlockData = async () => {
    try {
      const web3 = new Web3(new Web3.providers.HttpProvider(localUrl));
      const latestBlockNumber = await web3.eth.getBlockNumber();
      const blocks = [];
      const startBlock = BigInt(latestBlockNumber) - BigInt(5);
  
      for (let i = BigInt(latestBlockNumber); i > startBlock; i--) {
        if (i < 0) {
          console.error('Invalid block number:', i);
          continue;
        }
  
        const block = await web3.eth.getBlock(i, true);
  
        if (block && block.transactions) {
          for (const transaction of block.transactions) {
            try {
              const decodedData = web3.eth.abi.decodeParameters(
                ["string", "string", "string", "string", "string", "string", "string","string"],
                transaction.input as string
              );
  
              blocks.push({
                id: decodedData[0] as string,
                vnfName: decodedData[1] as string,
                vnfHash: decodedData[2] as string,
                testResult: decodedData[3] as string,
                reviewResult: decodedData[4] as string,
                verifierResult: decodedData[5] as string,
                description: decodedData[6] as string,
                vnfprice: decodedData[7] as string,
              });
            } catch (decodeError) {
              console.error('Error decoding transaction input:', decodeError);
            }
          }
        }
      }
  
      setBlockData(blocks);
    } catch (error) {
      console.error('Error fetching block data:', error);
    }
  };

  useEffect(() => {
    if (!userid) {
      console.log("User is not present");
      router.push("/login");
    } else {
      const foundUser = userData.find((user) => user.id === String(userid));
      if (foundUser) {
        console.log("User found:", foundUser);
        setUser(foundUser);
        setIsUser(true);
      } else {
        console.log("User not found");
        router.push("/login");
      }
    }
  }, [userid]);

  useEffect(() => {
    fetchBlockData();
  }, []);

  const handleTabClick = (tabNumber: number) => {
    // handle tab click
  };

  if ((window as any).ethereum) {
    const ethereum = (window as any).ethereum;
    ethereum.enable().then(() => {
      // Do something after ethereum is enabled
    });
  } else {
    console.error("MetaMask is not installed");
  }

  const buyVNF = async (badgerId: number) => {
    try {
      const ethereum = (window as any).ethereum;
      
      if (!ethereum) {
        console.error('MetaMask is not installed or not detected');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const web3 = new Web3(ethereum);
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      
      await contract.methods.buyVNF(badgerId).send({
        from: user?.ethadd,
        value: web3.utils.toWei('1', 'ether'), // Adjust the value based on the VNF price
      });
      console.log(badgerId);

      // Optional: Refresh the block data after purchase
      fetchBlockData();
    } catch (error) {
      console.error('Error buying VNF:', error);
    }
  };
  const [blockUpload, setBlockUplaod] = useState({
    roleId: "",
    Id : "",
    name : "",
    ethadd: ""
  })

  // Function to handle opening rating pop-up
  const handleRatingClick = (badge: BlockData) => {
    setSelectedVNF(badge); // Set the selected VNF
    setShowRatingModal(true); 
    try {
      const web3 = new Web3(new Web3.providers.HttpProvider(localUrl));
      const randomId = Math.floor(Math.random() * 100).toString();
      const id = Math.floor(Math.random() * 100).toString();
        console.log("id : ",id);

      // Update state with the relevant information
        setBlockUplaod({
          roleId: user?.role as string,
          id: id.toString(),
          name: user?.name as string,
        
          ethadd: user?.ethadd as string,
     
        
        });

     // Encode parameters for the transaction data
      const dataToUpload = web3.eth.abi.encodeParameters(
        ['string','string', 'string', 'string', 'string', 'string'],
        [
       
       
          // random id
          // random id
          user?.role as string,
          id,
       user?.name as string,
       user?.ethadd as string,
       
        ]
      );
       const  myEthAdd = user?.ethadd as string;
      console.log(dataToUpload);
  
      // Create the transaction object
      const gas = 32632; // Set an appropriate gas limit
      const gasPrice = 100; // Set an appropriate gas price (in wei)
      const nonce = await web3.eth.getTransactionCount(myEthAdd, 'latest');
      const transactionObject = {
        from: myEthAdd,
        to: contractAddress,
        nonce: web3.utils.toHex(nonce),
        gas: web3.utils.toHex(gas),
        gasPrice: web3.utils.toHex(gasPrice),
        data: dataToUpload,
      };
  
      // Send the transaction to the Ethereum network
      const receipt = await web3.eth.sendTransaction(transactionObject);
      console.log('Transaction receipt:', receipt);
  
      console.log('Data uploaded to the Ethereum blockchain.');
      window.alert('Tester Accepted');

    } catch (error) {
      console.error('Error uploading data to the Ethereum blockchain:', error);
    }
  };
    
    
    // Show the rating pop-up
  };

  // Function to handle closing rating pop-up
  const handleCloseRatingModal = () => {
    setShowRatingModal(false);
    setSelectedVNF(null);
    setRating(0); // Reset the rating when the modal is closed
  };

  // Function to handle rating submission
  const handleRateVNF = () => {
    // Implement logic to submit rating for the selected VNF
    console.log(`Rated VNF '${selectedVNF?.vnfName}' with rating ${rating}`);
    handleCloseRatingModal(); // Close the rating pop-up after submission
  };

  return (
    <>
      <Layout>
        <Container className="bg-gray-200 p-5 rounded-md h-screen">
          {/* Rating Modal */}
          <Modal show={showRatingModal} onHide={handleCloseRatingModal} centered 
          
  className="w-1/2 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center items-center flex-col p-5 rounded-md"
  style={{ backgroundColor: "#f2f2f2" }} // Light grey color
          >
          <div className="flex flex-col justify-center items-center">
  <div className="text-3xl font-bold mt-5">Rate VNF: {selectedVNF?.vnfName}</div>

  <StarRatings
    rating={rating}
    starRatedColor="orange"
    changeRating={setRating}
    numberOfStars={5}
    name="rating"
  />
  <div>

  <button
    onClick={handleCloseRatingModal}
    type="button"
    className="mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
  >
    Close
  </button>
  <button
    onClick={handleRateVNF}
    type="button"
    className="mt-5 text-white bg-green-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
  >
    Submit
  </button>
  </div>
</div>
</Modal>


          <section className="bg-white">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
              <div className="max-w-xl mx-auto">
                <h2 className="text-3xl font-extrabold text-gray-900 self-center text-center">::VNF Repository::</h2>
                <br />
                <br />
                <h2 className="text-2xl font-extrabold text-gray-900 self-center text-center">Customer Dashboard</h2>
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
                {blockData.map((badge, badgeIndex) => (
                  <div key={badgeIndex} className="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
                    <h5 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-400 text-center">{badge.vnfName}</h5>
                    <ul role="list" className="space-y-5 my-7">
                      <li className="flex space-x-3 items-center " key={badge.testResult}>
                        <span className="text-base font-semibold leading-tight text-gray-700 dark:text-gray-400">VNF Hash: {badge.vnfHash}<Link
                            target="_blank"
                            download
                              href={`https://gateway.pinata.cloud/ipfs/${badge.vnfHash}`}
                              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                            >
                              View 
                            </Link></span>
                      </li>
                      <li className="flex space-x-3 items-center " key={badge.testResult}>
                        <span className="text-base font-semibold leading-tight text-gray-700 dark:text-gray-400">Test Result: {badge.testResult}</span>
                      </li>
                      <li className="flex space-x-3 items-center " key={badge.reviewResult}>
                        <span className="text-base font-semibold leading-tight text-gray-700 dark:text-gray-400">Review Result: {badge.reviewResult}</span>
                      </li>
                      <li className="flex space-x-3 items-center " key={badge.reviewResult}>
                        <span className="text-base font-semibold leading-tight text-gray-700 dark:text-gray-400">Verifier Result: {badge.verifierResult}</span>
                      </li>
                      <li className="flex space-x-3 items-center " key={badge.vnfprice}>
                        <span className="text-base font-semibold leading-tight text-gray-700 dark:text-gray-400">VNF Price: {badge.vnfprice}</span>
                        
                      </li>
                      <li className="flex space-x-3 items-center " key={badge.vnfprice}>
                        <span className="text-base font-semibold leading-tight text-gray-700 dark:text-gray-400">Descriprtion: {badge.description}</span>
                        
                      </li>
                    </ul>
                    <button 
                      type="button" 
                      onClick={() => buyVNF(parseInt(badge.id))}
                      className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-200 dark:focus:ring-blue-900 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex justify-center w-full text-center"
                    >
                      Buy VNF
                    </button>
                    {/* Rating button */}
                    <button 
                      type="button" 
                      onClick={() => handleRatingClick(badge)} // Pass the badge to the rating handler
                      className="text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-200 dark:focus:ring-yellow-900 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex justify-center w-full text-center mt-3"
                    >
                      Rate VNF
                    </button>
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
