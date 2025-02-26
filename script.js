// Scroll reveal functionality
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

document.addEventListener('DOMContentLoaded', handleScroll);

// Navigation bar mint/stake interactions (placeholders)
document.getElementById('mint-btn').addEventListener('click', () => {
    const term = prompt('Enter mint term in days (1-1000):');
    if (term && !isNaN(term) && term >= 1 && term <= 1000) {
        alert(`Minting XEN with term ${term} days... (Connect wallet to proceed on xen.network)`);
        // Placeholder: Call claimRank(term) via Web3/Ethers.js here
    } else {
        alert('Invalid term! Must be between 1 and 1000 days.');
    }
});

document.getElementById('stake-btn').addEventListener('click', () => {
    const amount = prompt('Enter XEN amount to stake:');
    const term = prompt('Enter stake term in days (1-1000):');
    if (amount && term && !isNaN(amount) && !isNaN(term) && amount > 0 && term >= 1 && term <= 1000) {
        alert(`Staking ${amount} XEN for ${term} days... (Connect wallet to proceed on xen.network)`);
        // Placeholder: Call stake(amount * 1e18, term) via Web3/Ethers.js here
    } else {
        alert('Invalid input! Amount must be > 0, term between 1-1000 days.');
    }
});
