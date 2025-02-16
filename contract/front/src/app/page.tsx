"use client";
import { ethers } from "ethers";
import React, { useState, useEffect } from "react";

import abi from "./utils/EthEcho.json"

interface Echo {
  address: string;
  timestamp: Date;
  message: string;
}

/* ボタンのスタイルをまとめた変数 */
const buttonStyle =
  "flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

/* 履歴の詳細を表示するコンポーネント */
interface EchoDetailsProps {
  title: string;
  value: string;
}
const EchoDetails: React.FC<EchoDetailsProps> = ({ title, value }) => (
  <div className="py-3 px-4 block w-full border-gray-200 rounded-lg dark:bg-slate-900 dark:border-gray-700 dark:text-gray-100">
    <div>
      <p className="font-semibold">{title}</p>
      <p>{value}</p>
    </div>
  </div>
);

export default function Home() {
  /* ユーザーのパブリックウォレットを保存するために使用する状態変数 */
  const [currentAccount, setCurrentAccount] = useState<string>("");
  console.log("currentAccount: ", currentAccount);
  /* ユーザーのメッセージを保存するために使用する状態変数 */
  const [messageValue, setMessageValue] = useState<string>("");
  const [latestEcho, setLatestEcho] = useState<Echo | null>(null);

  const contractAddress = "0x798FA01353b630753E1ecd429E57dFD0af32d071";

  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    /* window.ethereumにアクセスできることを確認 */
    const { ethereum } = window as any;
    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
    } else {
      if (ethereum === "") return;
      console.log("We have the ethereum object", ethereum);
    }

    /* ユーザーのアカウントを取得 */
    const accounts = await ethereum.request({method: "eth_accounts" });
    if (accounts.length !== 0){
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window as any;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = (await ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const writeEcho = async () => {
    try {
      const { ethereum } = window as any;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        /* ABI参照 */
        const ethEchoContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        let count = await ethEchoContract.getTotalEchoes();
        console.log("Retrieved total echo count...", Number(count));
        /* メッセージを書き込む */
        const echoTxn = await ethEchoContract.writeEcho(messageValue, {
          gasLimit: 300000,
        });
        console.log("Mining...", echoTxn.hash);
        await echoTxn.wait();
        console.log("Mined -- ", echoTxn.hash);
        count = await ethEchoContract.getTotalEchoes();
        console.log("Retrieved total echo count...", Number(count));
        console.log("Signer:", signer);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getLatestEcho = async () => {
    const { ethereum } = window as any;
    try {
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const ethEchoContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const echo = await ethEchoContract.getLatestEcho();
        
        const newLatestEcho: Echo = {
          address: echo.echoer,
          timestamp: new Date(Number(echo.timestamp) * 1000),
          message: echo.message,
        };

        setLatestEcho(newLatestEcho);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      checkIfWalletIsConnected();
      let ethEchoContract: ethers.Contract;
      
      const onNewEcho = (from: string, timestamp: number, message: string) => {
        console.log("NewEcho", from, timestamp, message);
      };

      if ((window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();

        ethEchoContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
      );
      ethEchoContract.on("NewEcho", onNewEcho);
    }

    /* メモリリークの件 */
    return () => {
      if (ethEchoContract) {
        ethEchoContract.off("NewEcho", onNewEcho);
      }
    };
    })();
  }, [contractAddress, contractABI]); 

  const isExistLogs = currentAccount && latestEcho;

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      {/* ヘッダー */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <h1 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white-900">
          EthEcho🏔️
        </h1>
        <div className="bio mt-2 mb-8">
          イーサリアムウォレットを接続して、メッセージを作成。あなたのメッセージをチェーンに響かせましょう！
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg space-y-6">
        <div>
          {/* メッセージボックス */}
          {currentAccount && (
            <textarea
              placeholder="メッセージはこちら"
              name="messageArea"
              id="message"
              value={messageValue}
              onChange={(e) => setMessageValue(e.target.value)}
              className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
            />
          )}
        </div>

        {/* ウォレットを接続するボタン */}
        {!currentAccount && (
          <button
            onClick={connectWallet}
            type="button"
            className={`${buttonStyle} bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600`}
          >
            Connect Wallet
          </button>
        )}
        {/* ウォレットが接続されている場合 */}
        {currentAccount && (
          <button
            disabled={true}
            title="Wallet Connected"
            className={`${buttonStyle} bg-indigo-900 text-white cursor-not-allowed`}
          >
            Wallet Connected
          </button>
        )}
        {/* コントラクトに書き込むボタン */}
        {currentAccount && (
          <button
            className={`${buttonStyle} bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600`}
            onClick={writeEcho}
          >
            Echo🏔️
          </button>
        )}
        {/* 最新の書き込みを読み込むボタン */}
        {currentAccount && (
          <button
            className={`${buttonStyle} bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600 mt-6`}
            onClick={getLatestEcho}
          >
            Load Latest Echo🏔️
          </button>
        )}
        {/* 履歴を表示する */}
        {isExistLogs && (
          <div className="py-3 px-4 block w-full border-gray-200 rounded-lg dark:bg-slate-900 dark:border-gray-700 dark:text-gray-100">
            <div>
              <EchoDetails
                title="Address"
                value={latestEcho.address}
              />
              <EchoDetails
                title="Time🦴🐕💨"
                value={latestEcho.timestamp.toString()}
              />
              <EchoDetails
                title="Message"
                value={latestEcho.message}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}