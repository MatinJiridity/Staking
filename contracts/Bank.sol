// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "./MainToken.sol";
import "./StakingToken.sol";

contract Bank is Context {
    string public name = "MATIN Decenterlize Bank";
    address private owner;

    // متغییر هایی از توکن هامون میسازیم
    MainToken private _MTN;
    StakingToken private _babyMTN;

    address[] public stakeholders;

    mapping(address => uint256) public stakes;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public since;

    constructor(MainToken _MTN_, StakingToken _babyMTN_) {
        _MTN = _MTN_;
        _babyMTN = _babyMTN_;

        owner = _msgSender();
    }

    function stakeOf(address _stakeholder) public view returns (uint256) {
        return stakes[_stakeholder];
    }

    function rewardOf(address _stakeholder) public view returns (uint256) {
        return rewards[_stakeholder];
    }

    function sinceOf(address _stakeholder) public view returns (uint256) {
        return since[_stakeholder];
    }

    function totalRewards() public view returns (uint256) {
        uint256 _totalRewards = 0;
        for (uint256 s = 0; s < stakeholders.length; s += 1) {
            _totalRewards = _totalRewards + (rewards[stakeholders[s]]);
        }
        return _totalRewards;
    }

    function isStakeholder(address _address)
        public
        view
        returns (bool, uint256)
    {
        for (uint256 s = 0; s < stakeholders.length; s += 1) {
            if (_address == stakeholders[s]) return (true, s);
        }
        return (false, 0);
    }

    function addStakeholder(address _stakeholder) public {
        (bool _isStakeholder, ) = isStakeholder(_stakeholder);
        if (!_isStakeholder) {
            since[_stakeholder] = block.timestamp;
            stakeholders.push(_stakeholder);
        }
    }

    function removeStakeholder(address _stakeholder) public {
        (bool _isStakeholder, uint256 s) = isStakeholder(_stakeholder);
        if (_isStakeholder) {
            stakeholders[s] = stakeholders[stakeholders.length - 1];
            stakeholders.pop();
        }
    }

    function totalStakes() public view returns (uint256) {
        uint256 _totalStakes = 0;
        for (uint256 s = 0; s < stakeholders.length; s += 1) {
            _totalStakes = _totalStakes + (stakes[stakeholders[s]]);
        }
        return _totalStakes;
    }

    function createStake(uint256 _stake) public {
        _babyMTN.transferFrom(_msgSender(), address(this), _stake);

        if (stakes[_msgSender()] == 0) addStakeholder(_msgSender());
        stakes[_msgSender()] = stakes[_msgSender()] + _stake;
    }

    function removeStake(uint _stake) public {
        require(stakes[_msgSender()] >= _stake, 'Bank: Insffiction staks!');

        stakes[_msgSender()] = stakes[_msgSender()] - _stake;

        if (stakes[_msgSender()] == 0) {
            removeStakeholder(_msgSender());
        } else if(stakes[_msgSender()] != 0) {
            since[_msgSender()] = block.timestamp;
        }



        _babyMTN.transfer(_msgSender(), _stake);

    }

    function calculateReward(address _stakeholder)
        public
        view
        returns (uint256)
    {
        return (((block.timestamp - since[_stakeholder]) / 1 ) *  // every 1 s, 1 percent 
            (stakes[_stakeholder] / 100));
    }

    function withdrawReward() public {
        require(stakes[_msgSender()] > 0, 'Bank: Insuffiction stake!');

        uint256 reward = rewards[_msgSender()];
        if (rewards[_msgSender()] != 0) _MTN.transfer(_msgSender(), reward);

        rewards[_msgSender()] = 0;
        since[_msgSender()] = block.timestamp;
    }

    function distributeRewards() public {
        require(_msgSender() == owner, "Bank: only owner can call it!");

        for (uint256 s = 0; s < stakeholders.length; s += 1) {
            address stakeholder = stakeholders[s];
            uint256 reward = calculateReward(stakeholder);
            rewards[stakeholder] = rewards[stakeholder] + reward;
        }
    }



    function getstakeholders() public view returns (address[] memory) {
        return stakeholders;
    }

    function getContractAddress() public view returns (address) {
        return address(this);
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getMainTokenAddress() public view returns (address) {
        return address(_MTN);
    }

    function getStakingTokenAddress() public view returns (address) {
        return address(_babyMTN);
    }

    function getFreeStakingToken() public {
        _babyMTN.transfer(_msgSender(), 50 * (10**18));
    }

    function getBalanceOfBankMTN() public view returns (uint256) {
        return _MTN.balanceOf(address(this));
    }

    function getBalanceOfMsgSenderMTN() public view returns (uint256) {
        return _MTN.balanceOf(_msgSender());
    }

    function getBalanceOfVontractBabyMTN() public view returns (uint256) {
        return _babyMTN.balanceOf(address(this));
    }

    function getBalanceOfMsgSenderBabyMTN() public view returns (uint256) {
        return _babyMTN.balanceOf(_msgSender());
    }
}

// میخواهیم از دو توکنی که بیرون ساختیم استفاده کنیم متغیر هایی  یه نام اون دوتا میسازیم جنسشون که نمیتونه هرچی باشه باید جتس قرارداد هایی باشه که توسط اون ساخته شدن یاشه. خط 13 و 14
// transfer , send , call when we want send token from smart contract directly but in 59 we want send tokens wich they are in another smart contract and they have specefic function for transportation
// break 85: یک بار بیشتر اکانت صفر پیدا نمیشه پس بعد ایف لازم تیست حلفه فور ادامه داشنه باشه
