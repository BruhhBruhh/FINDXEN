
document.addEventListener('scroll', () => {
    const mintSection = document.getElementById('minting');
    const stakeSection = document.getElementById('staking');
    const mintBox = document.getElementById('mint-action');
    const stakeBox = document.getElementById('stake-action');

    const mintRect = mintSection.getBoundingClientRect();
    const stakeRect = stakeSection.getBoundingClientRect();

    if (mintRect.top >= 0 && mintRect.bottom <= window.innerHeight) {
        mintBox.classList.remove('hidden');
    } else {
        mintBox.classList.add('hidden');
    }

    if (stakeRect.top >= 0 && stakeRect.bottom <= window.innerHeight) {
        stakeBox.classList.remove('hidden');
    } else {
        stakeBox.classList.add('hidden');
    }
});

function simulateMint() {
    const term = document.getElementById('mint-term').value;
    document.getElementById('mint-result').innerText = `Simulating minting XEN for ${term} days... (Connect MetaMask for real action!)`;
}

function simulateStake() {
    const amount = document.getElementById('stake-amount').value;
    const term = document.getElementById('stake-term').value;
    document.getElementById('stake-result').innerText = `Simulating staking ${amount} XEN for ${term} days... (Connect MetaMask for real action!)`;
}
