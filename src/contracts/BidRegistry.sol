// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract BidRegistry {
    struct Bid {
        uint256 id;
        uint256 auctionId;
        uint256 developerId;
        uint256 amount;
        uint256 timestamp;
    }

    uint256 private _nextId = 1;
    mapping(uint256 => Bid) public bids;
    mapping(uint256 => uint256[]) public bidsByAuction;
    mapping(uint256 => uint256[]) public bidsByDeveloper;

    event BidCreated(uint256 indexed id, uint256 indexed auctionId, uint256 indexed developerId, uint256 amount, uint256 timestamp);

    function createBid(uint256 auctionId, uint256 developerId, uint256 amount) external returns (uint256) {
        uint256 bidId = _nextId++;
        bids[bidId] = Bid({
            id: bidId,
            auctionId: auctionId,
            developerId: developerId,
            amount: amount,
            timestamp: block.timestamp
        });

        bidsByAuction[auctionId].push(bidId);
        bidsByDeveloper[developerId].push(bidId);

        emit BidCreated(bidId, auctionId, developerId, amount, block.timestamp);
        return bidId;
    }

    function getBid(uint256 bidId) external view returns (Bid memory) {
        require(bidId > 0 && bidId < _nextId, "Bid not found");
        return bids[bidId];
    }

    function getBidsByAuction(uint256 auctionId) external view returns (Bid[] memory) {
        uint256[] storage ids = bidsByAuction[auctionId];
        Bid[] memory out = new Bid[](ids.length);
        for (uint i = 0; i < ids.length; i++) {
            out[i] = bids[ids[i]];
        }
        return out;
    }

    function getBidsByDeveloper(uint256 developerId) external view returns (Bid[] memory) {
        uint256[] storage ids = bidsByDeveloper[developerId];
        Bid[] memory out = new Bid[](ids.length);
        for (uint i = 0; i < ids.length; i++) {
            out[i] = bids[ids[i]];
        }
        return out;
    }
}