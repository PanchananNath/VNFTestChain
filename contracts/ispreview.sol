// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ISPReview {
    struct Review {
        string vnfid;
        string userid;
        string success;
        string processormatched;
        string memorymatched;
        string storagematched;
        string bandwidthmatched;
        string securitymatched;
        string throughput;
        string latency;
        string score;
        string name;
    }

    mapping(string => Review) public reviews;

    function addReview(
        string memory _vnfid,
        string memory _userid,
        string memory _success,
        string memory _processormatched,
        string memory _memorymatched,
        string memory _storagematched,
        string memory _bandwidthmatched,
        string memory _securitymatched,
        string memory _throughput,
        string memory _latency,
        string memory _score,
        string memory _name
    ) public {
        reviews[_userid] = Review(
            _vnfid,
            _userid,
            _success,
            _processormatched,
            _memorymatched,
            _storagematched,
            _bandwidthmatched,
            _securitymatched,
            _throughput,
            _latency,
            _score,
            _name
        );
    }

    function getReview(string memory _userid) public view returns (Review memory) {
        return reviews[_userid];
    }
}
