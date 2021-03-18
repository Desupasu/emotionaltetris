window.onload = () => {
    const linkList = document.querySelectorAll('main > a');
    linkList[0].focus();
    Array.from(linkList).forEach(item => {
        item.addEventListener('mouseover', (e) => {
            e.target?.focus();
        })
    })

    window.addEventListener('keydown', e => {
        const linkList = document.querySelectorAll('main > a');
        const selectedIndex = Array.from(linkList).findIndex(item => item === document.activeElement);
        if (e.code === 'ArrowDown') {
            if (selectedIndex === -1 || selectedIndex === linkList.length - 1) {
                linkList[0].focus();
            } else {
                linkList[selectedIndex + 1].focus();
            }
        } else if (e.code === 'ArrowUp') {
            if (selectedIndex === -1 || selectedIndex === 0) {
                linkList[linkList.length - 1].focus();
            } else {
                linkList[selectedIndex - 1].focus();
            }
        }
    })
    window.addEventListener('mousedown', e => {
        const linkList = document.querySelectorAll('main > a');
        if (!Array.from(linkList).some(item => item === e.target)) {
            e.preventDefault();
        }
    })
}