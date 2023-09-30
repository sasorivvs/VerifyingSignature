// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract VerifyingSignature {
    function getMessageHash(
        address _to,
        uint _amount,
        string memory _message,
        uint _nonce
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_to, _amount, _message, _nonce));
    }

    function getETHSignedMessage(
        bytes32 _message
    ) public pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", _message)
            );
    }

    function verify(
        address _signer,
        address _to,
        uint _amount,
        string memory _message,
        uint _nonce,
        bytes memory _signature
    ) public pure returns (bool) {
        bytes32 messageHash = getMessageHash(_to, _amount, _message, _nonce);
        bytes32 ethSignedMessage = getETHSignedMessage(messageHash);

        return recoverSigner(_signature, ethSignedMessage) == _signer;
    }

    function recoverSigner(
        bytes memory _signature,
        bytes32 _ethSignedMessage
    ) public pure returns (address) {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(_signature);

        return ecrecover(_ethSignedMessage, v, r, s);
    }

    function splitSignature(
        bytes memory _signature
    ) public pure returns (uint8 v, bytes32 r, bytes32 s) {
        require(_signature.length == 65, "invalid signature length");
        assembly {
            r := mload(add(_signature, 0x20))
            s := mload(add(_signature, 0x40))
            v := byte(0, mload(add(_signature, 0x60)))
        }

        return (v, r, s);
    }
}
