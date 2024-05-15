// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VNF {
    address public owner;
    uint public badgerCount;
    uint public vnfPrice = 1 ether; // Price of each VNF

    struct Badger {
        uint id;
        string vnfName;
        string vnfHash;
        string testResult;
        string reviewResult;
        string verifierResult;
        string description;
        address owner;
    }

    mapping(uint => Badger) public badgers;

    event BadgerAdded(uint indexed id, string vnfName, address owner);
    event BadgerDetailsUpdated(uint indexed id, string vnfName, string vnfHash, string testResult, string reviewResult, string verifierResult, string description, address owner);
    event BadgerPurchased(uint indexed id, string vnfName, address owner, uint price);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addBadger(
        string memory _vnfName,
        string memory _vnfHash,
        string memory _testResult,
        string memory _reviewResult,
        string memory _verifierResult,
        string memory _description
    ) external onlyOwner {
        badgerCount++;
        uint newBadgerId = badgerCount;
        badgers[newBadgerId] = Badger({
            id: newBadgerId,
            vnfName: _vnfName,
            vnfHash: _vnfHash,
            testResult: _testResult,
            reviewResult: _reviewResult,
            verifierResult: _verifierResult,
            description: _description,
            owner: msg.sender
        });

        emit BadgerAdded(newBadgerId, _vnfName, msg.sender);
    }

    function updateBadgerDetails(
        uint _badgerId,
        string memory _vnfName,
        string memory _vnfHash,
        string memory _testResult,
        string memory _reviewResult,
        string memory _verifierResult,
        string memory _description
    ) external onlyOwner {
        require(_badgerId <= badgerCount, "Badger with this ID does not exist");
        
        Badger storage badger = badgers[_badgerId];
        badger.vnfName = _vnfName;
        badger.vnfHash = _vnfHash;
        badger.testResult = _testResult;
        badger.reviewResult = _reviewResult;
        badger.verifierResult = _verifierResult;
        badger.description = _description;

        emit BadgerDetailsUpdated(_badgerId, _vnfName, _vnfHash, _testResult, _reviewResult, _verifierResult, _description, msg.sender);
    }

    function getBadgerDetails(uint _badgerId) external view returns (uint, string memory, string memory, string memory, string memory, string memory, string memory, address) {
        require(_badgerId <= badgerCount, "Badger with this ID does not exist");
        
        Badger memory badger = badgers[_badgerId];
        return (badger.id, badger.vnfName, badger.vnfHash, badger.testResult, badger.reviewResult, badger.verifierResult, badger.description, badger.owner);
    }

    function buyVNF(uint _badgerId) external payable {
        require(_badgerId <= badgerCount, "Badger with this ID does not exist");
        require(msg.value >= vnfPrice, "Insufficient funds");

        Badger storage badger = badgers[_badgerId];
        require(badger.owner != address(0), "Badger does not exist");

        address payable seller = payable(badger.owner);
        seller.transfer(msg.value); // Transfer funds to the seller
        badger.owner = msg.sender; // Transfer ownership to the buyer

        emit BadgerPurchased(_badgerId, badger.vnfName, msg.sender, msg.value);
    }
}
