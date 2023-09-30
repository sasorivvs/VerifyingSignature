import { ethers } from "hardhat";

async function main() {
	const Payments = await ethers.getContractFactory("Payments");
	const payments = await Payments.deploy();
	await payments.waitForDeployment();

	console.log(`Payments deployed to :${payments.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
