const { assert } = require('chai');

const Bank = artifacts.require('./Bank.sol');

const MainToken = artifacts.require('./MainToken.sol');
const StakingToken = artifacts.require('./StakingToken.sol');

require('chai').use(require('chai-as-promised')).should

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))


contract('Bank', (accounts) => {

    let Mycontract

    before(async () => {
        babyMTN = await StakingToken.deployed();
        MTN = await MainToken.deployed();

        Mycontract = await Bank.deployed(MTN.address, babyMTN.address);
    })

    describe('deployment', async () => {
        it('deploy successfully', async () => {
            const address = await Mycontract.address

            assert.notEqual(address, 0x00, 'zero address');
            assert.notEqual(address, '', 'empty');
            assert.notEqual(address, undefined, 'undefined');
            assert.notEqual(address, null, 'null');
        })
    })


    describe('Check Balance', async () => {

        let MTNBalance, babyMTNBalance;

        before(async () => {
            const address = await Mycontract.address;

            MTNBalance = await MTN.balanceOf(address);
            babyMTNBalance = await babyMTN.balanceOf(address);
        });

        it('Balance Of SmartContract', async () => {
            assert.equal(MTNBalance, "10000000000000000000000000000000000", 'MTNBalance wrong');
            assert.equal(babyMTNBalance, "10000000000000000000000000", 'babyMTNBalance wrong');
        });
    });


    describe('Get Free Staking Token', async () => {

        let balanceMsgSender;

        before(async () => {
            await Mycontract.getFreeStakingToken({ from: accounts[1] })
            balanceMsgSender = await babyMTN.balanceOf(accounts[1]);
        });

        it('Balance Of Msg Sender', async () => {
            assert.equal(balanceMsgSender, "50000000000000000000", 'balanceMsgSender wrong');
        });
    });


    describe('New Stake', async () => {

        let _stake = '50000000000000000000';
        let seconds;


        before(async () => {
            const address = await Mycontract.address;

            await babyMTN.approve(address, _stake, { from: accounts[1] });
            await Mycontract.createStake(_stake, { from: accounts[1] }).then(() => {
                seconds = Math.floor(new Date().getTime() / 1000)
            });


        });

        it('Create Stake', async () => {

            balanceMsgSender = await babyMTN.balanceOf(accounts[1]);
            balanceStake = await Mycontract.stakeOf(accounts[1]);
            sinceStake = await Mycontract.sinceOf(accounts[1]);
            totalStakes = await Mycontract.totalStakes();


            assert.equal(balanceMsgSender, "0", 'balanceMsgSender wrong');
            assert.equal(balanceStake, "50000000000000000000", 'balanceStake wrong');
            assert.equal(sinceStake.toNumber(), seconds, 'balanceMsgSender wrong');
            assert.equal(totalStakes, "50000000000000000000", 'totalStakes wrong');
        });
    });

    // _________________ ???????????????????????? _________________  //
    describe('Distribute Rewards', async () => {

        let _stake = '50000000000000000000';
        let rewardOfUser, totalRewards;

        before(async () => {
            await Mycontract.getFreeStakingToken({ from: accounts[1] });

            const address = await Mycontract.address;
            await babyMTN.approve(address, _stake, { from: accounts[1] });

            await Mycontract.createStake(_stake, { from: accounts[1] });
            // sleep(10000).then(async () => await Mycontract.distributeRewards({ from: accounts[0] }));
            balanceSmartContract = await babyMTN.balanceOf(address);  // for taking time
            MTNBalance = await MTN.balanceOf(address);  // for taking time
            babyMTNBalance = await babyMTN.balanceOf(address);   // for taking time

            await Mycontract.distributeRewards({ from: accounts[0], gas: "462190" }); // gas: "462190", gasPrice: web3.utils.toWei("20", 'gwei')

        });

        it('Increased Rewards successfully', async () => {


            rewardOfUser = await Mycontract.rewardOf(accounts[1]);
            totalRewards = await Mycontract.totalRewards();

            assert.notEqual(totalRewards * 1, 0, 'total Rewards wrong');
            assert.notEqual(rewardOfUser * 1, 0, 'reward Of User wrong');

        });
    });


    describe('Get Rewards', async () => {

        let _stake = '50000000000000000000';
        let rewardOfUser, totalRewards;

        before(async () => {

            await Mycontract.getFreeStakingToken({ from: accounts[1] });

            const address = await Mycontract.address;
            await babyMTN.approve(address, _stake, { from: accounts[1] });

            await Mycontract.createStake(_stake, { from: accounts[1] });

            balanceSmartContract = await babyMTN.balanceOf(address);  // for taking time
            MTNBalance = await MTN.balanceOf(address);  // for taking time
            babyMTNBalance = await babyMTN.balanceOf(address);   // for taking time

            await Mycontract.distributeRewards({ from: accounts[0], gas: "462190" }); // gas: "462190", gasPrice: web3.utils.toWei("20", 'gwei')

            rewardOfUser = await Mycontract.rewardOf(accounts[1]);
            totalRewards = await Mycontract.totalRewards();

            await Mycontract.withdrawReward({ from: accounts[1] });

        });

        it('withdraw Rewards', async () => {

            balanceMTNUser = await MTN.balanceOf(accounts[1])

            assert.equal(balanceMTNUser * 1, rewardOfUser * 1, 'balanceMTNUser wrong');   // if u know what happen? write assert.equal(balanceMTNUser * 1 , rewardOfUser + 1, 'balanceMTNUser wrong');

        });
    });



    describe('Remove Stake', async () => {

        let _stake = '50000000000000000000';

        before(async () => {

            await Mycontract.getFreeStakingToken({ from: accounts[1] });

            const address = await Mycontract.address;
            await babyMTN.approve(address, _stake, { from: accounts[1] });

            await Mycontract.createStake(_stake, { from: accounts[1] });

            balanceStake = await Mycontract.stakeOf(accounts[1]);

            await Mycontract.removeStake(balanceStake, { from: accounts[1] });

            balanceMsgSender = await babyMTN.balanceOf(accounts[1]);

        });

        it('check staking token balance', async () => {

            balanceStakeAfterRemove = await Mycontract.stakeOf(accounts[1]);

            assert.equal(balanceStakeAfterRemove * 1, 0, 'balanceStakeAfterRemove not 0')

            assert.notEqual(balanceMsgSender * 1 , 0, 'babyMTN Balance of user wrong');
        });
    });


})