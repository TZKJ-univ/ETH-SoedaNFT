// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import "hardhat/console.sol";

contract EthEcho {

    uint256 private _totalEchoes;
    event NewEcho(address indexed from, uint256 timestamp, string message);

    /*
     * ユーザが送信したEcho情報
     */
    struct Echo {
        address echoer;
        string message;
        uint256 timestamp;
    }

    /*
     * ユーザが送信したlatestのEchoを保持
     */
     Echo private _latestEcho;

    // constructor: 初期化
    constructor() {
        console.log("Here is my second smart contract");
    }

    function writeEcho(string memory _message) public {
        _totalEchoes += 1;
        console.log("%s echoed w/ message %s", msg.sender, _message);
        _latestEcho = Echo(msg.sender, _message, block.timestamp);

        emit NewEcho(msg.sender, block.timestamp, _message);
    }

    function getLatestEcho() public view returns (Echo memory) {
        return _latestEcho;
    }

    function getTotalEchoes() public view returns (uint256) {
        console.log("We have %d total Echoes", _totalEchoes);
        return _totalEchoes;
    }
}