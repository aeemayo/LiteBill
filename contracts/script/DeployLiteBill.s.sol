// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {LiteBill} from "../contracts/LiteBill.sol";

interface Vm {
    function envUint(string calldata name) external returns (uint256 value);
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
}

contract DeployLiteBill {
    Vm private constant VM = Vm(
        address(uint160(uint256(keccak256("hevm cheat code"))))
    );

    function run() external returns (LiteBill deployed) {
        uint256 privateKey = VM.envUint("DEPLOYER_PRIVATE_KEY");
        VM.startBroadcast(privateKey);
        deployed = new LiteBill();
        VM.stopBroadcast();
    }
}
