window.onload = () => {
    const linkList = document.querySelectorAll('main > a');
    linkList[0].focus();
    Array.from(linkList).forEach(item => {
        item.addEventListener('mouseover', (e) => {
            e.target?.focus();
        })
    })

    let stat = localStorage.getItem('scores');

    if (stat) {
        const section = document.getElementById('scores');
        stat = JSON.parse(stat);
        for (key in stat) {
            const divElem = document.createElement('div');
            const dateElem = document.createElement('div');
            const dateText = document.createTextNode(new Date(stat[key]).toLocaleDateString('ru-RU'));
            dateElem.appendChild(dateText);
            const scoreElem = document.createElement('div');
            const scoreText = document.createTextNode(key);
            scoreElem.appendChild(scoreText);
            divElem.appendChild(dateElem);
            divElem.appendChild(scoreElem);
            section.appendChild(divElem);
        }
    }
    window.addEventListener('mousedown', e => {
        const linkList = document.querySelectorAll('main > a');
        if (!Array.from(linkList).some(item => item === e.target)) {
            e.preventDefault();
        }
    })
    window.addEventListener('keydown', e => {
        if(e.code === 'Escape') {
            const a = document.createElement('a');
            a.href = 'main.html';
            a.click();
        }
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
}