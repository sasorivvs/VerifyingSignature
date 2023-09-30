import { loadFixture, ethers, expect } from "./setup";

describe("VerifyingSignature", function () {
	async function deploy() {
		const [owner, receiver] = await ethers.getSigners();

		const VerifyingSignature = await ethers.getContractFactory(
			"VerifyingSignature"
		);
		const contract = await VerifyingSignature.deploy();
		await contract.waitForDeployment();

		return {
			owner,
			receiver,
			contract,
		};
	}

	it("should return correct v,r,s", async function () {
		const { owner, receiver, contract } = await loadFixture(deploy);

		const nonce = 1;
		const amount = ethers.parseUnits("1", "ether");
		const message = "Test";

		const hash = ethers.solidityPackedKeccak256(
			["address", "uint256", "string", "uint256"],
			[receiver.address, amount, message, nonce]
		);

		const messageHashBin = ethers.getBytes(hash);
		const signature = await owner.signMessage(messageHashBin);

		const tx = await contract.splitSignature(signature);

		expect(tx[0]).to.eq(ethers.dataSlice(signature, 0x40));
		expect(tx[1]).to.eq(ethers.dataSlice(signature, 0x0, 0x20));
		expect(tx[2]).to.eq(ethers.dataSlice(signature, 0x20, 0x40));
	});

	it("should return Message hash", async function () {
		const { receiver, contract } = await loadFixture(deploy);

		const nonce = 1;
		const amount = ethers.parseUnits("1", "ether");
		const message = "Test";

		const hash = ethers.solidityPackedKeccak256(
			["address", "uint256", "string", "uint256"],
			[receiver.address, amount, message, nonce]
		);

		const mesHash = await contract.getMessageHash(
			receiver.address,
			amount,
			message,
			nonce
		);

		expect(mesHash).to.eq(hash);
	});

	it("should return ethMessageHash", async function () {
		const { receiver, contract } = await loadFixture(deploy);

		const nonce = 1;
		const amount = ethers.parseUnits("1", "ether");
		const message = "Test";

		const hash = ethers.solidityPackedKeccak256(
			["address", "uint256", "string", "uint256"],
			[receiver.address, amount, message, nonce]
		);

		const ethHash = ethers.solidityPackedKeccak256(
			["string", "bytes32"],
			["\x19Ethereum Signed Message:\n32", hash]
		);

		const mesHash = await contract.getMessageHash(
			receiver.address,
			amount,
			message,
			nonce
		);

		const ethMessageHash = await contract.getETHSignedMessage(mesHash);

		expect(ethMessageHash).to.eq(ethHash);
	});

	it("should return signer", async function () {
		const { owner, receiver, contract } = await loadFixture(deploy);

		const nonce = 1;
		const amount = ethers.parseUnits("1", "ether");
		const message = "Test";

		const hash = ethers.solidityPackedKeccak256(
			["address", "uint256", "string", "uint256"],
			[receiver.address, amount, message, nonce]
		);

		const messageHashBin = ethers.getBytes(hash);
		const signature = await owner.signMessage(messageHashBin);

		const mesHash = await contract.getMessageHash(
			receiver.address,
			amount,
			message,
			nonce
		);

		const ethMessageHash = await contract.getETHSignedMessage(mesHash);

		const recSigner = await contract.recoverSigner(
			signature,
			ethMessageHash
		);

		expect(recSigner).to.eq(owner.address);
	});

	it("should verify", async function () {
		const { owner, receiver, contract } = await loadFixture(deploy);

		const nonce = 1;
		const amount = ethers.parseUnits("1", "ether");
		const message = "Test";

		const hash = ethers.solidityPackedKeccak256(
			["address", "uint256", "string", "uint256"],
			[receiver.address, amount, message, nonce]
		);

		const messageHashBin = ethers.getBytes(hash);
		const signature = await owner.signMessage(messageHashBin);

		const verifyTx = await contract.verify(
			owner.address,
			receiver.address,
			amount,
			message,
			nonce,
			signature
		);

		expect(verifyTx).to.eq(true);
	});
});
