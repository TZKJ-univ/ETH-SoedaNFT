import { ethers } from 'hardhat';

const main = async () => {
    const [deployer] = await ethers.getSigners();
    const accountBalance = await deployer.provider.getBalance(deployer.address);
    const echoContractFactory = await ethers.getContractFactory("EthEcho");
    const echoContract = await echoContractFactory.deploy();
    const ethEcho = await echoContract.waitForDeployment();

    console.log("Deploying contracts with account: ", deployer.address);
    console.log("Account balance: ", accountBalance.toString());
    const deployedContractAddress = await ethEcho.getAddress();
    console.log("Contract deployed to: ", deployedContractAddress);
    console.log("Contract deployed by: ", deployer.address);

    let txn = await ethEcho.makeAnEchoNFT();
    const receipt = await txn.wait();
    console.log("Echo NFT minted!");
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();