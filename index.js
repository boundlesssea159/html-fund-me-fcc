import {ethers} from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";
// import {ethers} from "ethers";
import {abi, contractAddress} from "./constants.js"

const connectButton = document.getElementById("connectButton")
connectButton.onclick = connect

const fundButton = document.getElementById("fundButton")
fundButton.onclick = fund

const getBalanceButton = document.getElementById("getBalance");
getBalanceButton.onclick = getBalance

const withDrawButton = document.getElementById("withdraw");
withDrawButton.onclick = withdraw

function connect() {
    if (typeof window.ethereum !== "undefined") {
        window.ethereum.request({method: "eth_requestAccounts"});
        document.getElementById("connectButton").innerHTML = "Connected!"
    } else {
        document.getElementById("connectButton").innerHTML = "Please install metamask!"
    }
}

async function fund() {
    let ethAmount = document.getElementById("ethAmount").value;
    console.log(`Funding with ${ethAmount}`)
    if (typeof window.ethereum !== "undefined") {
        let {provider, contract} = await makeContractInstance();
        try {
            const transactionResponse = await contract.fund({value: ethers.parseEther(ethAmount)})
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transcationReceipt) => {
            console.log(`Completed with confirmations`)
            resolve()
        })
    })
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        let provider = new ethers.BrowserProvider(window.ethereum)
        let balance = await provider.getBalance(contractAddress);
        console.log(ethers.formatEther(balance))
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        let {provider, contract} = await makeContractInstance();
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}

async function makeContractInstance() {
    let provider = new ethers.BrowserProvider(window.ethereum)
    let signer = await provider.getSigner();
    let contract = new ethers.Contract(contractAddress, abi, signer)
    return {provider, contract};
}
