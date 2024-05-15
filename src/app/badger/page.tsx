"use client";
import React, { useEffect, useState } from "react";
import { UserData } from "@/utils/interfaces";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { userData } from "@/utils/users";
import Layout from "@/components/common/Layout";
import { Container } from "react-bootstrap";
import axios from "axios";
import Web3 from 'web3';

const contractAddress = '0xB1cb43796750E44A784a3634DF55431DBF7e5d10';
const localUrl = 'http://localhost:8545';

const JWT = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlMTY5MDlmMC02MjM1LTQ5ZTQtYmVjMi0yNjY0MWMwYjI1NmEiLCJlbWFpbCI6InAyMmNzZTEwMDJAY2l0LmFjLmluIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImYyYzU2OWJkOWZhMjUzODRmNDE5Iiwic2NvcGVkS2V5U2VjcmV0IjoiYTgxMDc1ZjUzZjBkZTM4NzUyYTYxZjdiNWVkZWE3YWM4Y2Y5YmRkZDMyZmU5YjBhMjI4ZjZjYTMzODViMTM0YSIsImlhdCI6MTcwMDgxNzM5MH0.YhiRhLzMI0X3wOOmpSmrtBSpS_-Xrhr-SLApi4U8wUw';

export default function BadgerPage() {
  const abiFilePath = '@build/contracts/VNF.json';
  const [activeTab, setActiveTab] = useState(1);
  const handleTabClick = (tabNumber: React.SetStateAction<number>) => {
    setActiveTab(tabNumber);
  };
  const ethereumAddresses = userData.map(user => user.ethadd);
  const router = useRouter();
  const searchParams = useSearchParams();
  const userid = searchParams?.get("userid");
  const [isUser, setIsUser] = useState(false);
  const [user, Setuser] = useState<UserData | null>(null);
  const [myEthAdd, setMyEthAdd] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files && e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      formData.append('pinataMetadata', JSON.stringify({
        name: file.name,
      }));
      formData.append('pinataOptions', pinataOptions);

      const axiosConfig = {
        headers: {
          Authorization: JWT,
        },
        maxBodyLength: 1000,
      };

      const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, axiosConfig);
      const id = Math.floor(Math.random() * 100).toString();
      const ipfshash = response.data.IpfsHash as string;

      const web3 = new Web3(new Web3.providers.HttpProvider(localUrl));

      const badgerId = user?.id;
      const vnfName = (document.getElementById('vnfName') as HTMLInputElement)?.value;
      const vnfHash = (document.getElementById('vnfHash') as HTMLInputElement)?.value;
      const testResult = (document.getElementById('testResult') as HTMLInputElement)?.value;
      const reviewResult = (document.getElementById('reviewResult') as HTMLInputElement)?.value;
      const verifierResult = (document.getElementById('verifierResult') as HTMLInputElement)?.value;
      const description = (document.getElementById('description') as HTMLInputElement)?.value;
      const vnfprice = (document.getElementById('vnfprice') as HTMLInputElement)?.value;

      const dataToUpload = web3.eth.abi.encodeParameters(
        ['string', 'string', 'string', 'string', 'string', 'string', 'string', 'string', 'string'],
        [badgerId, vnfName, vnfHash, testResult, reviewResult, verifierResult, description, vnfprice, ipfshash]
      );

      const gas = 32632;
      const gasPrice = 100;
      const nonce = await web3.eth.getTransactionCount(myEthAdd, 'latest');
      const transactionObject = {
        from: user?.ethadd,
        to: contractAddress,
        nonce: web3.utils.toHex(nonce),
        gas: web3.utils.toHex(gas),
        gasPrice: web3.utils.toHex(gasPrice),
        data: dataToUpload,
      };

      const receipt = await web3.eth.sendTransaction(transactionObject);
      console.log('Transaction receipt:', receipt);
      console.log('Data uploaded to the Ethereum blockchain.');
      window.alert('Badger Details Uploaded to Ethereum Blockchain');
    } catch (error) {
      console.error('Error uploading Badger details:', error);
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
        Setuser(foundUser);
        setIsUser(true);
        setMyEthAdd(foundUser.ethadd);
      } else {
        console.log("User not found");
        router.push("/login");
      }
    }
  }, [userid]);

  return (
    <>
      <Layout>
        <Container className="bg-gray-200 p-5 rounded-md h-screen">
          <section className="bg-white">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
              <div className="max-w-xl mx-auto">
                <h2 className="text-3xl font-extrabold text-gray-900 self-center text-center">
                  ::VNFTestChain::
                </h2>
              </div>
              <br />
              <br />
              <h2 className="text-2xl font-extrabold text-gray-900 self-center text-center">
                Vendor Dashboard
              </h2>
              <br />
              <br />
              <div className="justify-center">
                <div className="">
                  <h1 className="text-1xl font-extrabold text-gray-900 text-center">::Current User Details::</h1>
                </div>
                <div className="block text-center px-5 py-2.5 mr-2 mb-2 text-sm h-12 text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-900 focus:outline-none dark:bg-gray-400 dark:border-gray-600 dark:placeholder-gray-400 ">
                  {user?.name} :: {user?.roleName}
                </div>
                <form className="max-w-sm mx-auto" onSubmit={handleUpload}>
                  <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                      <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white text-center">
                        Add VNF Details
                      </h1>
                      <div className="mb-5">
                        <label htmlFor="base-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          VNF Name
                        </label>
                        <input
                          type="text"
                          id="vnfName"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                      </div>
                      <div className="mb-5">
                        <label htmlFor="base-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          VNF hash
                        </label>
                        <input
                          type="text"
                          id="vnfHash"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                      </div>
                      <div className="mb-5">
                        <label htmlFor="base-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Test Result
                        </label>
                        <input
                          type="text"
                          id="testResult"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                      </div>
                      <div className="mb-5">
                        <label htmlFor="base-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Review Result
                        </label>
                        <input
                          type="text"
                          id="reviewResult"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                      </div>
                      <div className="mb-5">
                        <label htmlFor="base-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Verifier Result
                        </label>
                        <input
                          type="text"
                          id="verifierResult"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                      </div>
                      <div className="mb-5">
                        <label htmlFor="base-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Vnf Price
                        </label>
                        <input
                          type="text"
                          id="vnfprice"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                      </div>
                      <div className="mb-5">
                        <label htmlFor="base-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Description
                        </label>
                        <input
                          type="text"
                          id="description"
                          className="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                      </div>
                      <div className="w-full flex justify-center items-center mb-2">
                        <input
                          className="block px-3 py-2 w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                          id="file_input"
                          type="file"
                          onChange={handleFileChange}
                        />
                      </div>
                      <button
                        type="button"
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                        onClick={handleUpload}
                      >
                       Summit Details
                      </button>
                      {/* <button type="submit" className="w-full text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Summit</button> */}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </Container>
      </Layout>
    </>
  );
}