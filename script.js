// XEN Contract Details
const XEN_CONTRACT_ADDRESS = "0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8"; // Replace if incorrect
const XEN_ABI = [
    {"inputs":[{"internalType":"uint256","name":"term","type":"uint256"}],"name":"claimRank","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[],"name":"claimMintReward","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"term","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[],"name":"getUserMint","outputs":[{"components":[{"internalType":"uint256","name":"cRank","type":"uint256"},{"internalType":"uint256","name":"term","type":"uint256"},{"internalType":"uint256","name":"maturityTs","type":"uint256"},{"internalType":"uint256","name":"amp","type":"uint256"}],"internalType":"struct XEN.MintInfo","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"getUserStake","outputs":[{"components":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"term","type":"uint256"},{"internalType":"uint256","name":"maturityTs","type":"uint256"},{"internalType":"uint256","name":"apy","type":"uint256"}],"internalType":"struct XEN.StakeInfo","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"globalRank","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
];

let web3, accounts, contract;

async function initWeb3() {
    const connectButton = document.getElementById('connect-wallet');
    const walletStatus = document.getElementById('wallet-status');
    const walletLoading = document.getElementById('wallet-loading');
    
    connectButton.disabled = true;
    walletLoading.classList.remove('hidden');
    walletStatus.innerText = '';

    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            document.getElementById('wallet-status').innerText = `Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`;
            contract = new web3.eth.Contract(XEN_ABI, XEN_CONTRACT_ADDRESS);
            updateTermLimit();
            updateUserStatus();
        } catch (error) {
            console.error("Wallet connection failed:", error);
            walletStatus.innerText = "Connection failed! Please check MetaMask.";
            if (error.code === 4001) {
                walletStatus.innerText = "User rejected wallet connection.";
            }
        } finally {
            connectButton.disabled = false;
            walletLoading.classList.add('hidden');
        }
    } else {
        walletStatus.innerText = "Please install MetaMask!";
        connectButton.disabled = false;
        walletLoading.classList.add('hidden');
    }
}

async function updateTermLimit() {
    try {
        const globalRank = await contract.methods.globalRank().call();
        const termLimit = globalRank <= 5000 ? 100 : 100 + Math.log2(globalRank) * 15;
        document.getElementById('mint-term').max = Math.floor(termLimit);
    } catch (error) {
        console.error("Error fetching global rank:", error);
    }
}

async function updateUserStatus() {
    if (!contract || !accounts) return;
    try {
        const mintInfo = await contract.methods.getUserMint().call({ from: accounts[0] });
        const stakeInfo = await contract.methods.getUserStake().call({ from: accounts[0] });
        
        const mintStatusBox = document.getElementById('mint-status-box');
        if (mintInfo.maturityTs > 0) {
            const now = Math.floor(Date.now() / 1000);
            const daysLeft = Math.max(0, Math.ceil((mintInfo.maturityTs - now) / (24 * 3600)));
            mintStatusBox.innerHTML = daysLeft > 0 
                ? `Mint in Progress: ${daysLeft} days left (Term: ${mintInfo.term}, Rank: ${mintInfo.cRank})`
                : `Mint Ready: Claim your reward! (Rank: ${mintInfo.cRank})`;
        } else {
            mintStatusBox.innerHTML = "No active mint.";
        }

        const stakeStatusBox = document.getElementById('stake-status-box');
        if (stakeInfo.maturityTs > 0) {
            const now = Math.floor(Date.now() / 1000);
            const daysLeft = Math.max(0, Math.ceil((stakeInfo.maturityTs - now) / (24 * 3600)));
            stakeStatusBox.innerHTML = daysLeft > 0 
                ? `Stake Active: ${web3.utils.fromWei(stakeInfo.amount, 'ether')} XEN for ${daysLeft} days (APY: ${stakeInfo.apy / 100}%)`
                : `Stake Mature: Withdraw ${web3.utils.fromWei(stakeInfo.amount, 'ether')} XEN + rewards!`;
        } else {
            stakeStatusBox.innerHTML = "No active stake.";
        }
    } catch (error) {
        console.error("Error fetching user status:", error);
    }
}

document.getElementById('connect-wallet').addEventListener('click', initWeb3);

document.addEventListener('scroll', () => {
    const sections = ['minting', 'staking'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        const actionBox = document.getElementById(`${id.split('ing')[0]}-action`);
        const rect = section.getBoundingClientRect();
        // Ensure the section is in view (adjust threshold if needed)
        if (rect.top >= -200 && rect.bottom <= window.innerHeight + 200) {
            actionBox.classList.remove('hidden');
        } else {
            actionBox.classList.add('hidden');
        }
    });
});

document.getElementById('claim-rank').addEventListener('click', async () => {
    if (!contract) return alert("Please connect your wallet!");
    const term = document.getElementById('mint-term').value;
    try {
        await contract.methods.claimRank(term).send({ from: accounts[0] });
        document.getElementById('mint-status').innerText = `Rank claimed for ${term} days!`;
        updateUserStatus();
    } catch (error) {
        document.getElementById('mint-status').innerText = `Error: ${error.message}`;
    }
});

document.getElementById('claim-mint').addEventListener('click', async () => {
    if (!contract) return alert("Please connect your wallet!");
    try {
        await contract.methods.claimMintReward().send({ from: accounts[0] });
        document.getElementById('mint-status').innerText = "XEN minted successfully!";
        updateUserStatus();
    } catch (error) {
        document.getElementById('mint-status').innerText = `Error: ${error.message}`;
    }
});

document.getElementById('stake-xen').addEventListener('click', async () => {
    if (!contract) return alert("Please connect your wallet!");
    const amount = document.getElementById('stake-amount').value;
    const term = document.getElementById('stake-term').value;
    try {
        await contract.methods.stake(web3.utils.toWei(amount, 'ether'), term).send({ from: accounts[0] });
        document.getElementById('stake-status').innerText = `Staked ${amount} XEN for ${term} days!`;
        updateUserStatus();
    } catch (error) {
        document.getElementById('stake-status').innerText = `Error: ${error.message}`;
    }
});
