const ethers = require('ethers');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const readline = require('readline');

// Connect to the Ethereum network via a provider
const provider = new ethers.providers.JsonRpcProvider('https://api.harmony.one');

// Define signers using different private keys
const signer1 = new ethers.Wallet(process.env.PRIVATE_KEY_1, provider);
const signer2 = new ethers.Wallet(process.env.PRIVATE_KEY_2, provider);
const signer3 = new ethers.Wallet(process.env.PRIVATE_KEY_3, provider);

// Contract ABI and address (Replace with actual values)
const {
	abi: perpsV2MarketABI,
} = require('../build/artifacts/contracts/PerpsV2Market.sol/PerpsV2Market.json');
const perpsV2MarketAddress = '0x340B5d664834113735730Ad4aFb3760219Ad9112';

// Instantiate the PerpsV2Market contract
const perpsV2MarketContract = new ethers.Contract(perpsV2MarketAddress, perpsV2MarketABI, provider);

// Create a readline interface
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const askUser = question => {
	return new Promise(resolve => {
		rl.question(question, answer => {
			resolve(answer);
		});
	});
};

const executeTrades = async () => {
	try {
		// Prompt the user for trade values
		const size1 = await askUser('Enter size for first long position (signer1): ');
		const price1 = await askUser('Enter desired fill price for first long position (signer1): ');

		const size2 = await askUser('Enter size for second long position (signer2): ');
		const price2 = await askUser('Enter desired fill price for second long position (signer2): ');

		const size3 = await askUser('Enter size for short position (signer3): ');
		const price3 = await askUser('Enter desired fill price for short position (signer3): ');

		// Open First Long Position (with signer1)
		console.log('Opening long position with signer1...');
		let tx = await perpsV2MarketContract.connect(signer1).modifyPosition(
			ethers.utils.parseUnits(size1, 18), // Size for long
			ethers.utils.parseUnits(price1, 18) // Desired Fill Price
		);
		await tx.wait();
		console.log(`Long position opened with signer1: ${tx.hash}`);

		// Open Second Long Position (with signer2)
		console.log('Opening long position with signer2...');
		tx = await perpsV2MarketContract.connect(signer2).modifyPosition(
			ethers.utils.parseUnits(size2, 18), // Size for long
			ethers.utils.parseUnits(price2, 18) // Desired Fill Price
		);
		await tx.wait();
		console.log(`Long position opened with signer2: ${tx.hash}`);

		// Open Short Position (with signer3)
		console.log('Opening short position with signer3...');
		tx = await perpsV2MarketContract.connect(signer3).modifyPosition(
			ethers.utils.parseUnits(size3, 18), // Size for short (negative value)
			ethers.utils.parseUnits(price3, 18) // Desired Fill Price
		);
		await tx.wait();
		console.log(`Short position opened with signer3: ${tx.hash}`);

		// Close First Long Position (with signer1)
		console.log('Closing long position with signer1...');
		tx = await perpsV2MarketContract
			.connect(signer1)
			.closePosition(ethers.utils.parseUnits(price1, 18)); // Use the desired price
		await tx.wait();
		console.log(`Long position closed profitably with signer1: ${tx.hash}`);

		// Close Second Long Position (with signer2)
		console.log('Closing long position with signer2...');
		tx = await perpsV2MarketContract
			.connect(signer2)
			.closePosition(ethers.utils.parseUnits(price2, 18)); // Use the desired price
		await tx.wait();
		console.log(`Long position closed profitably with signer2: ${tx.hash}`);

		// Close Short Position (with signer3)
		console.log('Closing short position with signer3...');
		tx = await perpsV2MarketContract
			.connect(signer3)
			.closePosition(ethers.utils.parseUnits(price3, 18)); // Use the desired price
		await tx.wait();
		console.log(`Short position closed profitably with signer3: ${tx.hash}`);

		// Close the readline interface
		rl.close();
	} catch (error) {
		console.error('Failed to execute trades:', error);
		rl.close();
	}
};

executeTrades();
