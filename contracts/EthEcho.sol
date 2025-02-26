// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import { Base64 } from "./libraries/Base64.sol";

contract EthEcho is ERC721URIStorage{

    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    string baseSvg = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base {fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='black' /><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";

    uint256 private _totalEchoes;
    event NewEcho(address indexed from, uint256 timestamp, string message);
    event NewEchoNFT(address indexed owner, uint256 timestamp, string message, string tokenURI);

    struct Echo {
        address echoer;
        string message;
        uint256 timestamp;
    }

     Echo private _latestEcho;

    constructor() ERC721 ("Echo", "SOEDA") {
        console.log("Here is my second smart contract");
    }

    function writeEcho(string memory _message) public {
        _totalEchoes += 1;
        console.log("%s echoed w/ message %s", msg.sender, _message);
        _latestEcho = Echo(msg.sender, _message, block.timestamp);

        emit NewEcho(msg.sender, block.timestamp, _message);
    }

    function makeAnEchoNFT() public {

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();

        string memory NFTword = string(abi.encodePacked("SoedaNFT #", Strings.toString(newItemId), " - ", _latestEcho.message));
        string memory finalSvg = string(abi.encodePacked(baseSvg, NFTword, "</text></svg>"));

        console.log("\n--------SVG data------------");
        console.log(finalSvg);
        console.log("----------------------------\n");

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        NFTword,
                        '", "description": "A highly acclaimed collection of soeda.", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(finalSvg)),
                        '"}'
                    )
                )
            )
        );

        string memory finalTokenUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );
        console.log("\n--------Token URI------------");
        console.log(finalTokenUri);
        console.log("-----------------------------\n");

        _safeMint(msg.sender, newItemId);

        _setTokenURI(
            newItemId,
            finalTokenUri
        );
        emit NewEchoNFT(msg.sender, block.timestamp, _latestEcho.message, finalTokenUri);
    }

    function getLatestEcho() public view returns (Echo memory) {
        return _latestEcho;
    }

    function getTotalEchoes() public view returns (uint256) {
        console.log("We have %d total Echoes", _totalEchoes);
        return _totalEchoes;
    }
}