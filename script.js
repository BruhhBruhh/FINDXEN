// XEN Contract Details for each EVM (Replace placeholders with actual addresses if needed)
const XEN_CONTRACT_ADDRESSES = {
    Ethereum: "0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8", // Mainnet (confirmed from web results)
    Polygon: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e", // Evmos XEN (similar structure, adjust if different)
    Optimism: "0xeB585163DEbB1E637c6D617de3bEF99347cd75c8", // Placeholder, confirm address
    Avalanche: "0xC0C5AA69Dbe4d6DDdfBc89c0957686ec60F24389", // Placeholder, adjust from web results
    Fantom: "0xb564A5767A00Ee9075cAC561c427643286F8F4E1", // Placeholder, confirm address
    BSC: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e", // Placeholder, adjust from web results
    Base: "0xffcbF84650cE02DaFE96926B37a0ac5E34932fa5", // Placeholder, confirm address (similar to Evmos)
    Pulsechain: "0x8a7FDcA264e87b6da72D000f22186B4403081A2a", // Placeholder, confirm address
    Evmos: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e", // Confirmed from web results
    Moonbeam: "0xb564A5767A00Ee9075cAC561c427643286F8F4E1", // Placeholder, adjust from web results
    EthereumPoW: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e", // Placeholder, confirm address
    OKX: "0x1cC4D981e897A3D2E7785093A648c0a75fAd0453", // Placeholder, adjust from web results
    DogeChain: "0x948eed4490833D526688fD1E5Ba0b9B35CD2c32e"  // Placeholder, confirm address
};

const XEN_ABI = [
    {
        "inputs": [],
        "name": "globalRank",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
    // Add other methods if needed
];

let web3, contract, totalRank = 0;

// Chain IDs for each EVM
const evmChains = [
    { name: "Ethereum", chainId: 1 },
    { name: "Polygon", chainId: 137 },
    { name: "Optimism", chainId: 10 },
    { name: "Avalanche", chainId: 43114 },
    { name: "Fantom", chainId: 250 },
    { name: "BSC", chainId: 56 },
    { name: "Base", chainId: 8453 },
    { name: "Pulsechain", chainId: 369 }, // Testnet, confirm mainnet ID
    { name: "Evmos", chainId: 9001 },
    { name: "Moonbeam", chainId: 1284 },
    { name: "EthereumPoW", chainId: 10001 }, // Confirm exact ID
    { name: "OKX", chainId: 66 }, // OKX Chain
    { name: "DogeChain", chainId: 2000 } // Confirm exact ID
];

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
            contract = new web3.eth.Contract(XEN_ABI, XEN_CONTRACT_ADDRESS); // Default to Ethereum
            updateRank();
            setInterval(updateRank, 5000); // Update every 5 seconds
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

async function updateRank() {
    try {
        let rankSum = 0;
        for (const chain of evmChains) {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: web3.utils.toHex(chain.chainId) }],
            });
            const contractAddress = XEN_CONTRACT_ADDRESSES[chain.name];
            if (!contractAddress) {
                console.warn(`No contract address for ${chain.name}, using mock data`);
                rankSum += Math.floor(Math.random() * 1000000); // Mock data
                continue;
            }
            const tempContract = new web3.eth.Contract(XEN_ABI, contractAddress);
            const rank = await tempContract.methods.globalRank().call();
            rankSum += parseInt(rank);
            console.log(`Rank for ${chain.name}: ${rank}`);
        }
        // Reset to Ethereum mainnet
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: web3.utils.toHex(1) }],
        });
        totalRank = rankSum;
        updateDisplay();
    } catch (error) {
        console.error("Error fetching ranks:", error);
        document.getElementById('rank-counter').innerText = "Error";
    }
}

function updateDisplay() {
    const counter = document.getElementById('rank-counter');
    let current = parseInt(counter.innerText.replace(/,/g, '')) || 0;
    const target = totalRank;
    const duration = 1000; // 1 second animation
    const startTime = performance.now();

    function animate(time) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const newValue = Math.floor(current + (target - current) * progress);
        counter.innerText = newValue.toLocaleString(); // Add commas
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            counter.innerText = target.toLocaleString();
        }
    }
    requestAnimationFrame(animate);
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
