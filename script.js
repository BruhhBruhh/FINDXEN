// Mock XEN contract details (replace with real addresses/ABI)
const XEN_CONTRACT_ADDRESS = "0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8"; // Ethereum mainnet XEN address (placeholder)
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

// Simulated EVM chain IDs (13 EVMs: Ethereum, Polygon, Arbitrum, etc.)
const evmChains = [
    { name: "Ethereum", chainId: 1 },
    { name: "Polygon", chainId: 137 },
    { name: "Arbitrum", chainId: 42161 },
    { name: "Optimism", chainId: 10 },
    { name: "Avalanche", chainId: 43114 },
    { name: "Fantom", chainId: 250 },
    { name: "BSC", chainId: 56 },
    { name: "Base", chainId: 8453 },
    { name: "Pulsechain", chainId: 369 },
    { name: "Linea", chainId: 59144 },
    { name: "Scroll", chainId: 534352 },
    { name: "Blast", chainId: 81457 },
    { name: "Mantle", chainId: 5000 }
];

async function initWeb3() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            contract = new web3.eth.Contract(XEN_ABI, XEN_CONTRACT_ADDRESS);
            updateRank();
            setInterval(updateRank, 5000); // Update every 5 seconds
        } catch (error) {
            console.error("Wallet connection failed:", error);
            alert("Please connect MetaMask to view live ranks!");
        }
    } else {
        alert("Please install MetaMask!");
    }
}

async function updateRank() {
    try {
        let rankSum = 0;
        for (const chain of evmChains) {
            // Simulate switching chain or use multi-chain provider
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: web3.utils.toHex(chain.chainId) }],
            });
            const rank = await contract.methods.globalRank().call();
            rankSum += parseInt(rank); // Add rank from each EVM
        }
        // Reset to Ethereum mainnet (chainId 1)
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
        counter.innerText = newValue.toLocaleString(); // Add commas for readability
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            counter.innerText = target.toLocaleString();
        }
    }
    requestAnimationFrame(animate);
}

// Add Matrix rain effect (optional)
function createMatrixRain() {
    const rain = document.createElement('div');
    rain.className = 'matrix-rain';
    for (let i = 0; i < 100; i++) {
        const span = document.createElement('span');
        span.innerText = String.fromCharCode(65 + Math.random() * 57); // Random characters
        span.style.left = Math.random() * 100 + 'vw';
        span.style.animationDelay = Math.random() * 5 + 's';
        span.style.animationDuration = Math.random() * 5 + 5 + 's';
        rain.appendChild(span);
    }
    document.body.appendChild(rain);
}

document.addEventListener('DOMContentLoaded', () => {
    initWeb3();
    createMatrixRain();
});
