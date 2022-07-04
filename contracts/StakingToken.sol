// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract StakingToken is ERC20 {

    string public _name = "babyMATIN";
    string public _symbol = "babyMTN";

    uint256 private _totalSupply;

    address private owner;

    constructor() ERC20(_name, _symbol){
        owner = _msgSender();
        _totalSupply = (10 ** 9) * (10 ** 18); // 10 ** 18 is decimals
        _mint(owner, _totalSupply);
        emit Transfer(address(0), owner, _totalSupply);
    }
}