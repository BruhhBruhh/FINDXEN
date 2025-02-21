// XEN Contract Details (Replace with actual address)
const XEN_CONTRACT_ADDRESS = "0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8"; // Example: XEN on Ethereum
const XEN_ABI = [
    {"inputs":[{"internalType":"uint256","name":"term","type":"uint256"}],"name":"claimRank","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[],"name":"claimMintReward","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"term","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[],"name":"getCurrentAMP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"getCurrentEAAR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"getCurrentAPY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
];

let web3, accounts, contract;

async function initWeb3() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            document.getElementById('wallet-address').innerText = `Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`;
            contract = new web3.eth.Contract(XEN_ABI, XEN_CONTRACT_ADDRESS);
            updateTermLimit();
        } catch (error) {
            console.error("Wallet connection failed:", error);
            document.getElementById('wallet-address').innerText = "Connection failed!";
        }
    } else {
        alert("Please install MetaMask!");
    }
}

async function updateTermLimit() {
    const globalRank = await contract.methods.globalRank().call(); // Assuming this exists; adjust if needed
    const termLimit = globalRank <= 5000 ? 100 : 100 + Math.log2(globalRank) * 15;
    document.getElementById('mint-term').max = Math.floor(termLimit);
}

document.getElementById('connect-wallet').addEventListener('click', initWeb3);

document.addEventListener('scroll', () => {
    const sections = ['minting', 'staking'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        const actionBox = document.getElementById(`${id.split('ing')[0]}-action`);
        const rect = section.getBoundingClientRect();
        if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
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
    } catch (error) {
        document.getElementById('mint-status').innerText = `Error: ${error.message}`;
    }
});

document.getElementById('claim-mint').addEventListener('click', async () => {
    if (!contract) return alert("Please connect your wallet!");
    try {
        await contract.methods.claimMintReward().send({ from: accounts[0] });
        document.getElementById('mint-status').innerText = "XEN minted successfully!";
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
    } catch (error) {
        document.getElementById('stake-status').innerText = `Error: ${error.message}`;
    }
});
