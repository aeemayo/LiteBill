// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {LiteBill} from "../contracts/LiteBill.sol";

contract Actor {
    receive() external payable {}

    function contribute(
        LiteBill liteBill,
        uint256 billId,
        uint256 amount
    ) external {
        liteBill.contribute{value: amount}(billId);
    }

    function claimRefund(LiteBill liteBill, uint256 billId) external {
        liteBill.claimRefund(billId);
    }
}

contract Payee {
    receive() external payable {}
}

contract LiteBillTest {
    LiteBill private liteBill;
    Payee private payee;
    Actor private p1;
    Actor private p2;
    Actor private p3;
    Actor private p4;

    function setUp() public {
        liteBill = new LiteBill();
        payee = new Payee();
        p1 = new Actor();
        p2 = new Actor();
        p3 = new Actor();
        p4 = new Actor();

        _fund(address(p1), 2 ether);
        _fund(address(p2), 2 ether);
        _fund(address(p3), 2 ether);
        _fund(address(p4), 2 ether);
    }

    receive() external payable {}

    function testCreatesBillAndSettlesAfterAllContributions() public {
        uint256 totalAmount = 1.5 ether;
        uint256 share = 0.5 ether;

        liteBill.createBill(payable(address(payee)), totalAmount, 3);

        uint256 beforeBalance = address(payee).balance;

        p1.contribute(liteBill, 1, share);
        p2.contribute(liteBill, 1, share);
        p3.contribute(liteBill, 1, share);

        (
            ,
            ,
            ,
            ,
            uint256 totalContributed,
            ,
            ,
            bool settled
        ) = liteBill.getBillStatus(1);

        require(settled, "Expected bill to be settled");
        require(totalContributed == totalAmount, "Unexpected total contributed");
        require(
            address(payee).balance - beforeBalance == totalAmount,
            "Payee payout mismatch"
        );
    }

    function testRejectsNonEvenTotalsForParticipantCount() public {
        (bool ok, ) = address(liteBill).call(
            abi.encodeWithSelector(
                liteBill.createBill.selector,
                payable(address(payee)),
                1 ether + 1,
                3
            )
        );

        require(!ok, "Expected createBill to revert");
    }

    function testRevertsWhenSameAddressContributesTwice() public {
        uint256 totalAmount = 1.5 ether;
        uint256 share = 0.5 ether;

        liteBill.createBill(payable(address(payee)), totalAmount, 3);
        p1.contribute(liteBill, 1, share);

        (bool ok, ) = address(p1).call(
            abi.encodeWithSelector(Actor.contribute.selector, liteBill, 1, share)
        );

        require(!ok, "Expected second contribution to revert");
    }

    function testRevertsWhenContributionAmountIsIncorrect() public {
        uint256 totalAmount = 1.5 ether;

        liteBill.createBill(payable(address(payee)), totalAmount, 3);

        (bool ok, ) = address(p1).call(
            abi.encodeWithSelector(
                Actor.contribute.selector,
                liteBill,
                1,
                0.4 ether
            )
        );

        require(!ok, "Expected incorrect amount contribution to revert");
    }

    function testRevertsWhenContributingToAlreadySettledBill() public {
        uint256 totalAmount = 1.5 ether;
        uint256 share = 0.5 ether;

        liteBill.createBill(payable(address(payee)), totalAmount, 3);
        p1.contribute(liteBill, 1, share);
        p2.contribute(liteBill, 1, share);
        p3.contribute(liteBill, 1, share);

        (bool ok, ) = address(p4).call(
            abi.encodeWithSelector(Actor.contribute.selector, liteBill, 1, share)
        );

        require(!ok, "Expected settled bill contribution to revert");
    }

    function testAllowsCreatorCancelAndContributorRefund() public {
        uint256 totalAmount = 1.5 ether;
        uint256 share = 0.5 ether;

        liteBill.createBill(payable(address(payee)), totalAmount, 3);
        p1.contribute(liteBill, 1, share);

        liteBill.cancelBill(1);

        uint256 beforeBalance = address(p1).balance;
        p1.claimRefund(liteBill, 1);

        require(
            address(p1).balance == beforeBalance + share,
            "Refund amount mismatch"
        );

        (bool ok, ) = address(p1).call(
            abi.encodeWithSelector(Actor.claimRefund.selector, liteBill, 1)
        );

        require(!ok, "Expected second refund attempt to revert");
    }

    function _fund(address target, uint256 amount) internal {
        (bool sent, ) = payable(target).call{value: amount}("");
        require(sent, "Funding failed");
    }
}
