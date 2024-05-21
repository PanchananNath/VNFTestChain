"use client";
import React, { useEffect, useState } from "react";
import { UserData } from "@/utils/interfaces";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from "@/components/common/Layout";
import { Container, Modal } from "react-bootstrap";
import Web3 from "web3";
import Link from "next/link";
import { abi as contractABI } from "build/contracts/VNF.json";
import StarRatings from 'react-star-ratings';
import { userData } from "@/utils/users";

// Ethereum contract address and local URL
const contractAddress = '0x9074Eb6429919255e4179Ed049BACa606afBf473';
const localUrl = 'http://localhost:8545';

// Interface for block data
interface BlockData {
  id: string;
  vnfName: string;
  vendorid: string;
  processor: string;
  memory: string;
  storage: string;
  bandwidth: string;
  security: string;
  vnfprice: string;
  description: string;
  ispreputationalscore: string;
  subscriberreputationalscore: string;
}

// React component
export default function Customer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userid = searchParams.get("userid");
  const [user, setUser] = useState<UserData | null>(null);
  const [blockData, setBlockData] = useState<BlockData[]>([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedVNF, setSelectedVNF] = useState<BlockData | null>(null);
  const [myEthAdd, setMyEthAdd] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [formData, setFormData] = useState({
    vnfid: '',
    userid: '',
    success: '',
    processormatched: '',
    memorymatched: '',
    storagematched: '',
    bandwidthmatched: '',
    securitymatched: '',
    throughput: '',
    latency: '',
    score: 0
  });

  // Function to fetch block data from Ethereum blockchain
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
                ["string", "string", "string", "string", "string", "string", "string", "string", "string", "string", "string", "string"],
                transaction.input as string
              );

              blocks.push({
                id: decodedData[0] as string,
                vnfName: decodedData[1] as string,
                vendorid: decodedData[2] as string,
                processor: decodedData[3] as string,
                memory: decodedData[4] as string,
                storage: decodedData[5] as string,
                bandwidth: decodedData[6] as string,
                security: decodedData[7] as string,
                vnfprice: decodedData[8] as string,
                description: decodedData[9] as string,
                ispreputationalscore: decodedData[10] as string,
                subscriberreputationalscore: decodedData[11] as string,
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
      } else {
        console.log("User not found");
        router.push("/login");
      }
    }
  }, [userid, router]);

  useEffect(() => {
    fetchBlockData();
  }, []);

  const handleRatingClick = (badge: BlockData) => {
    setSelectedVNF(badge);
    setShowRatingModal(true);
  };

  const handleCloseRatingModal = () => {
    setShowRatingModal(false);
    setSelectedVNF(null);
    setRating(0);
  };

  const handleRateVNF = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log(`Rated VNF '${selectedVNF?.vnfName}' with rating ${rating}`);
    handleCloseRatingModal();

    try {
      const web3 = new Web3(new Web3.providers.HttpProvider(localUrl));
  
      // Validate Ethereum address
      const isValidAddress = web3.utils.isAddress(user?.ethadd);
      if (!user?.ethadd || !isValidAddress) {
        console.error('Invalid or missing Ethereum address:', user?.ethadd);
        return;
      }
  
      // Get other input values
      const vnfName = selectedVNF?.vnfName;
      const success = formData.success === 'true';
      const processormatched = formData.processormatched === 'true';
      const memorymatched = formData.memorymatched === 'true';
      const storagematched = formData.storagematched === 'true';
      const bandwidthmatched = formData.bandwidthmatched === 'true';
      const securitymatched = formData.securitymatched === 'true';
      const throughput = formData.throughput === 'true';
      const latency = formData.latency === 'true';
      const score = calculateScore();
  
      const dataToUpload = web3.eth.abi.encodeParameters(
        ['string', 'string', 'string', 'string', 'string', 'string', 'string', 'string', 'string', 'string', 'string'],
        [vnfName, success, processormatched, memorymatched, storagematched, bandwidthmatched, securitymatched, throughput, latency, score]
      );
  
      // Fetch the current base fee and calculate the maxFeePerGas and maxPriorityFeePerGas
      const latestBlock = await web3.eth.getBlock('latest');
      const baseFeePerGas = latestBlock.baseFeePerGas;
      const maxPriorityFeePerGas = web3.utils.toWei('2', 'gwei'); // Set a reasonable priority fee, e.g., 2 Gwei
      // const maxFeePerGas = parseInt(baseFeePerGas) + parseInt(maxPriorityFeePerGas);
  
      const nonce = await web3.eth.getTransactionCount(myEthAdd, 'latest');
      const transactionObject = {
        from: user?.ethadd,
        to: contractAddress,
        nonce: web3.utils.toHex(nonce),
        gas: web3.utils.toHex(32632), // Standard gas limit for the transaction
        maxFeePerGas: web3.utils.toHex(maxFeePerGas),
        maxPriorityFeePerGas: web3.utils.toHex(maxPriorityFeePerGas),
        data: dataToUpload,
      };
  
      const receipt = await web3.eth.sendTransaction(transactionObject);
      console.log('Transaction receipt:', receipt);
      console.log('Data uploaded to the Ethereum blockchain.');
      window.alert('Vendor and VNF details uploaded to Blockchain based VNF Marketplace');
    } catch (error) {
      console.error('Error uploading Badger details:', error);
    }
  };
  
  const handleTabClick = (tabNumber: number) => {
    // handle tab click
  };

  const buyVNF = async (badgeId: number) => {
    try {
      const ethereum = (window as any).ethereum;

      if (!ethereum) {
        console.error('MetaMask is not installed or not detected');
        return;
      }

      await ethereum.request({ method: 'eth_requestAccounts' });
      const web3 = new Web3(ethereum);
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      await contract.methods.buyVNF(badgeId).send({
        from: user?.ethadd,
        value: web3.utils.toWei('1', 'ether'), // Adjust the value based on the VNF price
      });
      console.log(badgeId);

      fetchBlockData(); // Refresh the block data after purchase
    } catch (error) {
      console.error('Error buying VNF:', error);
    }
  };


  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  useEffect(() => {
    const calculateScore = () => {
      let score = 0;
      if (formData.success === 'true') score += 65;
      if (formData.processormatched === 'true') score += 5;
      if (formData.memorymatched === 'true') score += 5;
      if (formData.storagematched === 'true') score += 5;
      if (formData.bandwidthmatched === 'true') score += 5;
      if (formData.securitymatched === 'true') score += 5;
      if (formData.throughput === 'true') score += 5;
      if (formData.latency === 'true') score += 5;
      console.log(score);
      setFormData(prevState => ({
        ...prevState,
        score: score.toString()
      }));
    };
    calculateScore();
  }, [formData]); // Include formData in the dependencies array
  

    return (
      <>
        <Layout>
          <Container className="bg-gray-200 p-5 rounded-md flex w-full">
            <div className="bg-white">
              <div className="mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <div className="mx-auto">
                  <h2 className="text-3xl font-extrabold text-gray-900 self-center text-center">::VNF Marketplace::</h2>
                  <br />
                  <br />
                  <h2 className="text-2xl font-extrabold text-gray-900 self-center text-center">Customer Dashboard</h2>
                  <br />
                  <br />
                  <div className="justify-center">
                    <div>
                      <h1 className="text-1xl font-extrabold text-gray-700 text-center">::Current User Details::</h1>
                    </div>
                    <div className="block text-center px-5 py-2.5 mr-2 mb-2 text-sm h-12 text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-900 focus:outline-none dark:bg-gray-400 dark:border-gray-600 dark:placeholder-gray-400">
                      {user?.name} :: {user?.roleName}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-5">
                  {blockData.map((badge, badgeIndex) => (
                    <div key={badgeIndex} className="flex flex-col w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
                      <h5 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-400 text-center">{badge.vnfName}</h5>
                      <ul role="list" className="space-y-5 my-7">
                        <li className="flex space-x-3 items-center">
                          <span className="text-base font-semibold leading-tight text-gray-700 dark:text-gray-400">vendorid: {badge.vendorid}</span>
                        </li>
                        <li className="flex space-x-3 items-center">
                          <span className="text-base font-semibold leading-tight text-gray-700 dark:text-gray-400">processor: {badge.processor}</span>
                        </li>
                        <li className="flex space-x-3 items-center">
                          <span className="text-base font-semibold leading-tight text-gray-700 dark:text-gray-400">memory: {badge.memory}</span>
                        </li>
                        <li className="flex space-x-3 items-center">
                          <span className="text-base font-semibold leading-tight text-gray-700 dark:text-gray-400">storage: {badge.storage}</span>
                        </li>
                        <li className="flex space-x-3 items-center">
                          <span className="text-base font-semibold leading-tight text-gray-700 dark:text-gray-400">bandwidth: {badge.bandwidth}</span>
                        </li>
                        <li className="flex space-x-3 items-center">
                          <span className="text-base font-semibold leading-tight text-gray-700 dark:text-gray-400">security: {badge.security}</span>
                        </li>
                        <li className="flex space-x-3 items-center">
                          <span className="text-base font-semibold leading-tight text-gray-700 dark:text-gray-400">vnfprice: {badge.vnfprice}</span>
                        </li>
                        <li className="flex space-x-3 items-center">
                          <span className="text-base font-semibold leading-tight text-gray-700 dark:text-gray-400">description: {badge.description}</span>
                        </li>
                        <li className="flex space-x-3 items-center">
                          <span className="text-base font-semibold leading-tight text-gray-700 dark:text-gray-400">ispreputationalscore: {badge.ispreputationalscore}</span>
                        </li>
                        <li className="flex space-x-3 items-center">
                          <span className="text-base font-semibold leading-tight text-gray-700 dark:text-gray-400">subscriberreputationalscore: {badge.subscriberreputationalscore}</span>
                        </li>
                      </ul>
                      <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        onClick={() => buyVNF(badgeIndex)}
                      >
                        Buy VNF
                      </button>
                      <button className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                        onClick={() => handleRatingClick(badge)}
                      >
                        Rate VNF
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {showRatingModal && (
              <div className="bg-white bg-opacity-100 w-1/3">
                <div className="flex flex-col justify-center items-center bg-white bg-opacity-100">
                  <div className="text-3xl font-bold mt-5">Rate VNF: {selectedVNF?.vnfName}</div>
                  {/* Form for user input */}
                  <form onSubmit={handleRateVNF} className="mt-5 w-full max-w-sm">
                    {/* Deployment Success Matched */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-1">Deployment Success Matched:</label>
                      <select name="success" value={formData.success} onChange={handleChange} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-400">
                        <option value="">Select</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    </div>
                    {/* Processor Matched */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-1">Processor Matched:</label>
                      <select name="processormatched" value={formData.processormatched} onChange={handleChange} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-400">
                        <option value="">Select </option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    </div>
                    {/* Memory Matched */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-1">Memory Matched:</label>
                      <select name="memorymatched" value={formData.memorymatched} onChange={handleChange} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-400">
                        <option value="">Select </option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    </div>
                    {/* Storage Matched */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-1">Storage Matched:</label>
                      <select name="storagematched" value={formData.storagematched} onChange={handleChange} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-400">
                        <option value="">Select </option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    </div>
                    {/* Bandwidth Matched */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-1">Bandwidth Matched:</label>
                      <select name="bandwidthmatched" value={formData.bandwidthmatched} onChange={handleChange} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-400">
                        <option value="">Select </option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    </div>
                    {/* Security Matched */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-1">Security Matched:</label>
                      <select name="securitymatched" value={formData.securitymatched} onChange={handleChange} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-400">
                        <option value="">Select </option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    </div>
                    {/* Throughput */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-1">Throughput:</label>
                      <select name="throughput" value={formData.throughput} onChange={handleChange} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-400">
                      <option value="">Select </option>
                      <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    </div>
                    {/* Latency */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-1">Latency:</label>
                      <select name="latency" value={formData.latency} onChange={handleChange} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-400">
                        <option value="">Select </option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    </div>
                    {/* Score */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-1">Score:</label>
                      <input disabled type="text" name="score" value={formData.score} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-400" />
                    </div>
                    {/* Submit button */}
                    <button type="submit" className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600" onClick={handleRateVNF}>Submit</button>   
                  </form>
                  {/* Close button */}
                  <button
                    onClick={handleCloseRatingModal}
                    type="button"
                    className="mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </Container>
        </Layout>
      </>
    );
  };
  
function calculateScore() {
  throw new Error("Function not implemented.");
}

