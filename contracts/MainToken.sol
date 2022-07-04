// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MainToken is ERC20 {

    string public _name = "MATIN";
    string public _symbol = "MTN";

    uint256 private _totalSupply;

    address private owner;

    constructor() ERC20(_name, _symbol){
        owner = _msgSender();
        _totalSupply = (10 ** 17) * (10 ** 18); // 10 ** 18 is decimals
        _mint(owner, _totalSupply);
        emit Transfer(address(0), owner, _totalSupply);
    }
}