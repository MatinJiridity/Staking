$(function () {
    $(window).load(function () {
        PrepareNetwork();
    });
});

var BankContract = null;
var StakingTokenContract = null;
var web3 = null;
var JasonBankContract = null;
var JasonStakingToken = null;
var CurrentAccount = null;
var Owner = null;
var TotalValueLocked = null;
var TotalRewards = null;
var Balance = null;
var RewardRate = null;
var Reward = null;
var babyMTNAddress = null;
var MTNAddress = null;

async function PrepareNetwork() {
    await loadWeb3();
    await LoadSmartContract();
}


async function loadWeb3() {

    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum); // MetaMask
        await ethereum.request({ method: 'eth_requestAccounts' }).then(function (accounts) {
            CurrentAccount = accounts[0];
            web3.eth.defaultAccount = CurrentAccount;
            console.log('current account: ' + CurrentAccount);
            SetCurrentAccount();
        });
    } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
    } else {
        window.alert('Non-Ethreum browser detected!');
    }

    ethereum.on('accoontChange', handleAccountChange); // from MetaMask API 
    ethereum.on('chainChange', handleChainChange);

    web3.eth.handleRevert = true;

}


function SetCurrentAccount() {
    var newAddress = CurrentAccount.slice(0, 6) + "..." + CurrentAccount.slice(38, 42)
    $('#AddressFill').text(newAddress);
}


async function handleAccountChange() {
    await ethereum.request({ method: 'eth-reqqusetAccount' }).then(function (accounts) {
        CurrentAccount = accounts[0];
        web3.eth.defaultAccount = CurrentAccount;
        console.log('current account: ' + CurrentAccount);
        window.location.reload();
        SetCurrentAccount();
    });
}

async function handleChainChange(_chainId) {
    windoe.location.reload();
    console.log('cahin changed ', _chainId);
}


async function LoadSmartContract() {

    await $.getJSON('Bank.json', function (contractData) {
        JasonBankContract = contractData;
    });

    await $.getJSON('StakingToken.json', function (contractData) {
        JasonStakingToken = contractData;
    });

    // console.log("JasonBankContract: ",JasonBankContract);
    // console.log("JasonStakingToken: ",JasonStakingToken);

    web3 = await window.web3;

    const networkId = await web3.eth.net.getId();
    // console.log("networkId: ",networkId)

    networkDataBankContract = await JasonBankContract.networks[networkId];
    networkDataStakingTokenContract = await JasonStakingToken.networks[networkId];

    // console.log("networkDataBankContract:",  networkDataBankContract);
    // console.log("networkDataStakingTokenContract:",  networkDataStakingTokenContract);



    if (networkDataBankContract && networkDataStakingTokenContract) {
        // console.log("JasonBankContract.abi:",  JasonBankContract.abi);
        // console.log("networkDataBankContract.address:",  networkDataBankContract.address);
        // console.log("JasonStakingToken.abi:",  JasonStakingToken.abi);
        // console.log("networkDataStakingTokenContract.address:",  networkDataStakingTokenContract.address);


        BankContract = new web3.eth.Contract(JasonBankContract.abi, networkDataBankContract.address);
        StakingTokenContract = new web3.eth.Contract(JasonStakingToken.abi, networkDataStakingTokenContract.address);

        Owner = await BankContract.methods.getOwner().call();
        console.log("Owner:", Owner);

        TotalValueLocked = await BankContract.methods.totalStakes().call();
        // console.log("TotalValueLocked:", TotalValueLocked);
        $("#Locked").text(web3.utils.fromWei(TotalValueLocked))

        TotalRewards = await BankContract.methods.totalRewards().call();
        // console.log("TotalRewards:", TotalRewards);
        $("#AllReward").text(web3.utils.fromWei(TotalRewards))

        Balance = await BankContract.methods.stakeOf(CurrentAccount).call();
        console.log(Balance)
        Balance18 = web3.utils.fromWei(Balance);
        $('#Stake').text(Balance18);


        Reward = await BankContract.methods.calculateReward(CurrentAccount).call();
        $('#Reward').text(web3.utils.fromWei(Reward));
        console.log("Reward:", Reward);
        

        MTN = await BankContract.methods.getBalanceOfBankMTN().call();
        console.log("MTN-Contract:", web3.utils.fromWei(MTN));

        babyMTN = await BankContract.methods.getBalanceOfMsgSenderBabyMTN().call();
        console.log("babyMTN-Contract:", web3.utils.fromWei(babyMTN));


        MTNMsg = await BankContract.methods.getBalanceOfMsgSenderMTN().call();
        console.log("MTN-MsgSender:", web3.utils.fromWei(MTNMsg));

        babyMTNMsg = await BankContract.methods.getBalanceOfMsgSenderBabyMTN().call();
        console.log("babyMTN-MsgSender:", web3.utils.fromWei(babyMTNMsg));
    
        // var seconds = Math.floor(new Date().getTime() / 1000);
        // // console.log((seconds))

        // sinceMsgSender = await BankContract.methods.sinceOf(CurrentAccount).call();
        // console.log(sinceMsgSender)

        babyMTNAddress = await BankContract.methods.getStakingTokenAddress().call();
        // console.log('babyMTNAddress:', babyMTNAddress);
        $('#babyFZMA').text(babyMTNAddress)

        MTNAddress = await BankContract.methods.getMainTokenAddress().call();
        // console.log('MTNAddress:', MTNAddress);
        $('#FZMA').text(MTNAddress);
        

        RewardOfuser = await BankContract.methods.rewardOf(CurrentAccount).call();
        console.log('RewardOfuser:', RewardOfuser);


    }

    $(document).on('click', '#btn_Stake', btn_Stake);
    $(document).on('click', '#recievetoken', recievetoken);
    $(document).on('click', '#claimreward', claimreward);
    $(document).on('click', '#unstake', unstake);
    $(document).on('click', '#btn_distributeRewards', distributeRewards);
}

async function distributeRewards() {
    if(Owner.toLowerCase() == CurrentAccount){
        await BankContract.methods.distributeRewards().send({ from: CurrentAccount }).then(function (Instance) {
            console.log(Instance)
            $.msgBox({
                title: "Reward",
                content: 'All tokens Rewarded from owner',
                type: "alert"
            });    
        }).catch(function (error) {
            console.log("error", error);
        });
    }else{
        $.msgBox({
            title: "Error",
            content: "You Not Owner" ,
            type: "error"
        });
    }

}

async function unstake() {


    await BankContract.methods.removeStake(Balance).send({ from: CurrentAccount }).then(function (Instance) {

        $.msgBox({
            title: "UnStaked",
            content: 'all token UnStaked',
            type: "alert"
        });    
    }).catch(function (error) {
        console.log("error", error);
    });
}


async function claimreward() {

    
    await BankContract.methods.withdrawReward().send({ from: CurrentAccount }).then(function (Instance) {

        $.msgBox({
            title: "Reward Claimed",
            content: 'Claimed all Reward',
            type: "alert"
        });    
    }).catch(function (error) {
        console.log("error", error);
    });
}


async function recievetoken() {
    
    await BankContract.methods.getFreeStakingToken().send({ from: CurrentAccount }).then(function (Instance) {

        $.msgBox({
            title: "Recieve Token",
            content: 'You have got 50 babyMTN token',
            type: "alert"
        });    
    }).catch(function (error) {
        console.log("error", error);
    });
}

async function btn_Stake() {
    var stake = $("#valueStake").val();
    if (stake == '') {
        $.msgBox({
            title: "Error",
            content: "Please fill text box",
            type: "error"
        });
    }
        let Bankaddress = await BankContract.methods.getContractAddress().call();
        // console.log('Bankaddress:',Bankaddress)

        StakingTokenContract.methods.approve(Bankaddress, web3.utils.toWei(stake, 'ether')).send({ from: CurrentAccount }).then(function (Instance) {

            BankContract.methods.createStake(web3.utils.toWei(stake, 'ether')).send({ from: CurrentAccount }).then(function (Instance) {
                let staker = Instance.events.StakeToken.returnValues[0];
                let val = web3.utils.fromWei(Instance.events.StakeToken.returnValues[1], 'ether');
                $.msgBox({
                    title: "Staking Token",
                    content: staker.slice(0, 6) + "..." + staker.slice(38, 42) + 'has staked' + val + 'babyMTN token',
                    type: "alert"
                });    
            }).catch(function (error) {
                console.log("error", error);
            })

        }).catch(function (error) {
            console.log("error", error);
        })
    
}

function Close() {
    window.location.reload();
}


