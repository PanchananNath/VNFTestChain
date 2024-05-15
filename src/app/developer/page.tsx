"use client";
import React, { useEffect, useState } from "react";
import { UserData } from "@/utils/interfaces";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { userData } from "@/utils/users";
import Layout from "@/components/common/Layout";
import { Container } from "react-bootstrap";
import axios from "axios";

import path from 'path';

const contractAddress = '0x2DCE9D209296bA516D63a4506aC42445A55Fb1e2';
const localUrl = 'http://localhost:8545'

const JWT = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlMTY5MDlmMC02MjM1LTQ5ZTQtYmVjMi0yNjY0MWMwYjI1NmEiLCJlbWFpbCI6InAyMmNzZTEwMDJAY2l0LmFjLmluIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImYyYzU2OWJkOWZhMjUzODRmNDE5Iiwic2NvcGVkS2V5U2VjcmV0IjoiYTgxMDc1ZjUzZjBkZTM4NzUyYTYxZjdiNWVkZWE3YWM4Y2Y5YmRkZDMyZmU5YjBhMjI4ZjZjYTMzODViMTM0YSIsImlhdCI6MTcwMDgxNzM5MH0.YhiRhLzMI0X3wOOmpSmrtBSpS_-Xrhr-SLApi4U8wUw';
import Web3 from 'web3';
import { abi } from "@/utils/abi";
export default function Developer() {
  const abiFilePath = '@build/contracts/VNF.json';
  const [activeTab, setActiveTab] = useState(1);
  const handleTabClick = (tabNumber: React.SetStateAction<number>) => {
    setActiveTab(tabNumber);
  };
  const ethereumAddresses = userData.map(user => user.ethadd);

  const web3 = new Web3();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userid = searchParams?.get("userid");
  const [isUser, setIsUser] = React.useState(false);
  const [user, Setuser] = React.useState<UserData | null>(null);
  const [myEthAdd, setMyEthAdd] = useState('');

  const [blockUpload, setBlockUplaod] = useState({
    roleID : "",
    devId : "",
    devName : "",
    ipfsHash : "",
    devAddress: ""
  })

  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });

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

  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files && e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const checkWeb3 = async () => {
    try {
      const web3 = new Web3(new Web3.providers.HttpProvider(localUrl));
      console.log(web3);

      await web3.eth.net.isListening()
        .then(() => console.log('Connected to Ganache'))
        .catch((e) => {
          console.log('Unable to connect to Ganache:', e);
          throw e;
        });

      const dataToUpload = web3.eth.abi.encodeParameters(
        ['string', 'string', 'string', 'string', 'address'],
        [0, 'John Doe', 'QmXyZ...', 1, user?.ethadd]
      );

      console.log(dataToUpload);

      const gas = 32632;
      const gasPrice = 100;
      const nonce = await web3.eth.getTransactionCount(user?.ethadd as string, 'latest');
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
      window.alert('File Uploaded to IPFS Pinata');
    } catch (e) {
      console.error(e);
    }
  };

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
      console.log("id : ",id);
      setBlockUplaod({
        roleID: user?.role as string,
        devId: id,
        devName: user?.name as string,
        ipfsHash: response.data.IpfsHash as string,
        devAddress: user?.ethadd as string,
      });
      const ipfshash =  response.data.IpfsHash as string;

      const web3 = new Web3(new Web3.providers.HttpProvider(localUrl));
      console.log(web3);

      await web3.eth.net.isListening()
        .then(() => console.log('Connected to Ganache'))
        .catch((e) => {
          console.log('Unable to connect to Ganache:', e);
          throw e;
        });

      const dataToUpload = web3.eth.abi.encodeParameters(
        ['string','string', 'string', 'string', 'address'],
        [
          user?.role as string,
          id,
          user?.name as string,
          ipfshash,
          user?.ethadd as string,
        ]
      );

      console.log(dataToUpload);

      const gas = 32632;
      const gasPrice = 100;
      const nonce = await web3.eth.getTransactionCount(myEthAdd, 'latest');
      const transactionObject = {
        from: myEthAdd,
        to: contractAddress,
        nonce: web3.utils.toHex(nonce),
        gas: web3.utils.toHex(gas),
        gasPrice: web3.utils.toHex(gasPrice),
        data: dataToUpload,
      };

      const receipt = await web3.eth.sendTransaction(transactionObject);
      console.log('Transaction receipt:', receipt);

      console.log('Data uploaded to the Ethereum blockchain.');
      window.alert('File Uploaded to IPFS Pinata');
    } catch (error) {
      setUploadStatus('Error uploading data: ' + error);
    }
  };

  console.log(userid);
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

                <br />
                <br />
                <h2 className="text-2xl font-extrabold text-gray-900 self-center text-center">
                  Developer Dashboard
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

                </div>
              </div>
              <div className="flex justify-center pt-16">
                <div className="flex w-1/3 justify-center items-center h-12">
                  <input
                    className="block px-5 py-2.5 mr-2 mb-2 w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                    id="file_input"
                    type="file" onChange={handleFileChange}
                  />
                </div>

                <button
                  type="button"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                  onClick={handleUpload}
                >
                  Upload
                </button>
                <button
                  type="button"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                  onClick={checkWeb3}
                >
                  test
                </button>
              </div>
            </div>
          </section>
        </Container>
      </Layout>
    </>
  );
}
