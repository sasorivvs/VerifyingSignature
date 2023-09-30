// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./VerifySig.sol";

contract Payments is VerifyingSignature {
    address public owner;

    mapping(uint => bool) nonces;

    constructor() payable {
        require(msg.value > 0, "Please, send ETH");

        owner = msg.sender;
    }

    function claim(
        uint _amount,
        string memory _message,
        uint _nonce,
        bytes memory _signature
    ) public {
        require(!nonces[_nonce], "Already paid");
        nonces[_nonce] = true;

        require(
            verify(owner, msg.sender, _amount, _message, _nonce, _signature),
            "Invalid signature"
        );

        (bool s, ) = (msg.sender).call{value: _amount}("");
        require(s, "Transaction failed");
    }
}
