const Bank = artifacts.require("Bank");
const MainToken = artifacts.require("MainToken");
const StakingToken = artifacts.require("StakingToken");
module.exports = async function (deployer) {

    await deployer.deploy(MainToken);
    const mainToken = await MainToken.deployed();

    await deployer.deploy(StakingToken);
    const stakingToken = await StakingToken.deployed();


    await deployer.deploy(Bank, MainToken.address, StakingToken.address);
    const bank = await Bank.deployed();

    await stakingToken.transfer(bank.address, '10000000000000000000000000'); //10**7 * 10**18
    await mainToken.transfer(bank.address, '10000000000000000000000000000000000') // 10*12 * 10**18
    // await stakingToken.transfer('', '10000000000000000000000000');

};
