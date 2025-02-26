// Scroll reveal for index.html
function isNearTop(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.top <= windowHeight * 0.9 && rect.bottom >= 0;
}

function handleScroll() {
    const blurbs = document.querySelectorAll('.blurb');
    blurbs.forEach(blurb => {
        if (isNearTop(blurb)) {
            blurb.classList.add('visible');
        }
    });
}

let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            handleScroll();
            ticking = false;
        });
        ticking = true;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    handleScroll();
});

// Web3 Integration with MetaMask and Ethers.js
let provider, signer, xenContract;
const XEN_CONTRACT_ADDRESS = '0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8'; // Mainnet XEN address
const XEN_ABI = [
    'function claimRank(uint256 term) external',
    'function stake(uint256 amount, uint256 term) external',
    'function balanceOf(address account) external view returns (uint256)',
    'function userMints(address) external view returns (address user, uint256 term, uint256 maturityTs, uint256 rank, uint256 amplifier, uint256 eaaRate)',
    'function userStakes(address) external view returns (uint256 term, uint256 maturityTs, uint256 amount, uint256 apy)'
];

async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Request account access from MetaMask
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            xenContract = new ethers.Contract(XEN_CONTRACT_ADDRESS, XEN_ABI, signer);

            const connectBtn = document.getElementById('connect-wallet-btn');
            connectBtn.textContent = 'Wallet Connected';
            connectBtn.disabled = true;

            // Enable buttons and check status
            if (document.getElementById('start-mint-btn')) {
                document.getElementById('start-mint-btn').disabled = false;
                await checkMintStatus();
            }
            if (document.getElementById('start-stake-btn')) {
                document.getElementById('start-stake-btn').disabled = false;
                await checkStakeStatus();
            }

            alert('MetaMask wallet connected successfully!');
        } catch (error) {
            console.error('MetaMask connection failed:', error);
            alert('Failed to connect MetaMask: ' + error.message);
        }
    } else {
        alert('Please install MetaMask to use this feature!');
    }
}

async function checkMintStatus() {
    if (!xenContract) return;
    const address = await signer.getAddress();
    const mintInfo = await xenContract.userMints(address);
    const statusDiv = document.getElementById('mint-status');

    if (mintInfo.rank.toNumber() === 0) {
        statusDiv.innerHTML = '<p>No mint in progress.</p>';
    } else {
        const maturityDate = new Date(mintInfo.maturityTs.toNumber() * 1000);
        const now = new Date();
        const status = now < maturityDate ? 'In Progress' : 'Ready to Claim';
        statusDiv.innerHTML = `
            <p>Mint Status: ${status}</p>
            <p>Term: ${mintInfo.term.toNumber()} days</p>
            <p>Maturity: ${maturityDate.toLocaleString()}</p>
            <p>Rank: ${mintInfo.rank.toString()}</p>
        `;
    }
}

async function startMint() {
    const termInput = document.getElementById('mint-term').value;
    const term = parseInt(termInput);
    if (!term || term < 1 || term > 1000) {
        alert('Invalid term! Must be between 1 and 1000 days.');
        return;
    }

    try {
        const tx = await xenContract.claimRank(term);
        await tx.wait();
        alert(`Minting initiated for ${term} days! Tx: ${tx.hash}`);
        await checkMintStatus();
    } catch (error) {
        console.error('Minting failed:', error);
        alert('Minting failed: ' + error.message);
    }
}

async function checkStakeStatus() {
    if (!xenContract) return;
    const address = await signer.getAddress();
    const stakeInfo = await xenContract.userStakes(address);
    const statusDiv = document.getElementById('stake-status');

    if (stakeInfo.amount.toString() === '0') {
        statusDiv.innerHTML = '<p>No stake in progress.</p>';
    } else {
        const maturityDate = new Date(stakeInfo.maturityTs.toNumber() * 1000);
        const now = Date.now();
        const status = now < maturityDate ? 'In Progress' : 'Ready to Withdraw';
        statusDiv.innerHTML = `
            <p>Stake Status: ${status}</p>
            <p>Amount: ${ethers.utils.formatEther(stakeInfo.amount)} XEN</p>
            <p>Term: ${stakeInfo.term.toNumber()} days</p>
            <p>Maturity: ${maturityDate.toLocaleString()}</p>
            <p>APY: ${stakeInfo.apy.toNumber()}%</p>
        `;
    }
}

async function startStake() {
    const amountInput = document.getElementById('stake-amount').value;
    const termInput = document.getElementById('stake-term').value;
    const amount = parseFloat(amountInput);
    const term = parseInt(termInput);

    if (!amount || !term || amount <= 0 || term < 1 || term > 1000) {
        alert('Invalid input! Amount must be > 0, term between 1-1000 days.');
        return;
    }

    try {
        const balance = await xenContract.balanceOf(await signer.getAddress());
        const amountWei = ethers.utils.parseEther(amount.toString());
        if (balance.lt(amountWei)) {
            alert('Insufficient XEN balance!');
            return;
        }

        const tx = await xenContract.stake(amountWei, term);
        await tx.wait();
        alert(`Staked ${amount} XEN for ${term} days! Tx: ${tx.hash}`);
        await checkStakeStatus();
    } catch (error) {
        console.error('Staking failed:', error);
        alert('Staking failed: ' + error.message);
    }
}

// Event Listeners
document.getElementById('connect-wallet-btn').addEventListener('click', connectWallet);

if (document.getElementById('start-mint-btn')) {
    document.getElementById('start-mint-btn').addEventListener('click', startMint);
}

if (document.getElementById('start-stake-btn')) {
    document.getElementById('start-stake-btn').addEventListener('click', startStake);
}
