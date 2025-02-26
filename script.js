// Function to check if an element is in the viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    );
}

// Function to handle scroll and show blurbs
function handleScroll() {
    const blurbs = document.querySelectorAll('.blurb');
    blurbs.forEach(blurb => {
        if (isInViewport(blurb)) {
            blurb.classList.add('visible');
        }
    });
}

// Add scroll event listener
window.addEventListener('scroll', handleScroll);

// Check initial state on page load
document.addEventListener('DOMContentLoaded', handleScroll);
