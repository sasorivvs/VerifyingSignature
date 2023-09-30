import { loadFixture, ethers, expect } from "./setup";

describe("Payments", function () {
	async function deploy() {
		const [owner, receiver] = await ethers.getSigners();

		const Payments = await ethers.getContractFactory("Payments");
		const payments = await Payments.deploy({
			value: ethers.parseUnits("100", "ether"),
		});
		await payments.waitForDeployment();

		return {
			owner,
			receiver,
			payments,
		};
	}

	it("should allow to send and receive payments", async function () {
		const { owner, receiver, payments } = await loadFixture(deploy);

		const nonce = 1;
		const amount = ethers.parseUnits("1", "ether");
		const message = "Test";

		const hash = ethers.solidityPackedKeccak256(
			["address", "uint256", "string", "uint256"],
			[receiver.address, amount, message, nonce]
		);

		const messageHashBin = ethers.getBytes(hash);
		const signature = await owner.signMessage(messageHashBin);

		const tx = await payments
			.connect(receiver)
			.claim(amount, message, nonce, signature);
		await tx.wait();

		const ethSignedMessage = await payments.getETHSignedMessage(
			await payments.getMessageHash(
				receiver.address,
				amount,
				message,
				nonce
			)
		);

		expect(tx).to.changeEtherBalance(receiver, amount);
	});

	it("should revert double spent tx", async function () {
		const { owner, receiver, payments } = await loadFixture(deploy);

		const nonce = 1;
		const amount = ethers.parseUnits("1", "ether");
		const message = "Test";

		const hash = ethers.solidityPackedKeccak256(
			["address", "uint256", "string", "uint256"],
			[receiver.address, amount, message, nonce]
		);

		const messageHashBin = ethers.getBytes(hash);
		const signature = await owner.signMessage(messageHashBin);

		const tx = await payments
			.connect(receiver)
			.claim(amount, message, nonce, signature);
		await tx.wait();

		const tx2 = payments
			.connect(receiver)
			.claim(amount, message, nonce, signature);

		await expect(tx2).to.be.revertedWith("Already paid");
	});

	it("should revert invalid signature", async function () {
		const { owner, receiver, payments } = await loadFixture(deploy);

		const nonce = 1;
		const amount = ethers.parseUnits("1", "ether");
		const message = "Test";

		const fakeMessage = "SecondTest";

		const hash = ethers.solidityPackedKeccak256(
			["address", "uint256", "string", "uint256"],
			[receiver.address, amount, message, nonce]
		);

		const messageHashBin = ethers.getBytes(hash);
		const signature = await owner.signMessage(messageHashBin);

		const tx = payments
			.connect(receiver)
			.claim(amount, fakeMessage, nonce, signature);

		await expect(tx).to.be.revertedWith("Invalid signature");
	});
});
