window.onload = () => {
    const linkList = document.querySelectorAll('main > a');
    linkList[0].focus();
    Array.from(linkList).forEach(item => {
        item.addEventListener('mouseover', (e) => {
            if (e.target) {
                e.target.focus();
            }
        })
        item.addEventListener('click', e => {
            if (e.target.textContent.trim() === 'RATING') {
                e.preventDefault();
            }
        })
    })

    let stat = localStorage.getItem('scores');

    if (stat) {
        const section = document.getElementById('scores');
        stat = Object.entries(JSON.parse(stat)).sort((a,b) => a[1] - b[1]);
        const maxScore = Math.max(...stat.map(item => +item[0]))
        for (const [key, value] of stat) {
            const divElem = document.createElement('div');
            const dateElem = document.createElement('div');
            const dateText = document.createTextNode(new Date(value).toLocaleDateString('ru-RU'));
            const scoreElem = document.createElement('div');
            const scoreText = document.createTextNode(key);
            dateElem.appendChild(dateText);
            scoreElem.appendChild(scoreText);
            scoreElem.style.marginLeft = '20px';
            divElem.appendChild(dateElem);
            divElem.appendChild(scoreElem);
            if (maxScore == key) {
                const crown = document.createElement('div');
                crown.id = 'crown';
                divElem.appendChild(crown);
            }
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