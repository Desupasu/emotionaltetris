 // License CC0 1.0 Universal 
    // https://gist.github.com/straker/3c98304f8a6a9174efd8292800891ea1
    // https://tetris.fandom.com/wiki/Tetris_Guideline

window.onload = () => {
    const gameOverText = {
      exit: {
        main: 'Do you really want to go to the menu?',
        sub: 'Your current points are not saved'
      },
      restart: {
        main: 'Do you really want to start over?',
        sub: 'Your current points are not saved'
      },
      gameover: {
        main: 'GAME OVER',
        sub: 'Want to start over?'
      },
      bestgameover: {
        main: 'GAME OVER. BEST SCORE!',
        sub: 'Want to start over?'
      },
    }

    const exit = () => {
      const a = document.createElement('a');
      a.href = 'main.html';
      a.click();
    }

    const restart = () => {
      const a = document.createElement('a');
      a.href = 'tetris.html';
      a.click();
    }

    const tetrisHeight = configuration.TETRISHEIGHT;
    // получаем доступ к холсту
    const canvas = document.getElementById('game');
    let grid = configuration.GRIDSIZE;
    const context = canvas.getContext('2d');

    const nextCanvas = document.getElementById('next');
    const ctx = nextCanvas.getContext('2d');

    function showPopup(type) {
      showPause();
      const section = document.querySelector('.gameover');
      const actions = document.querySelector('.gameover__actions');
      section.children[0].textContent = gameOverText[type].main;
      section.children[1].textContent = gameOverText[type].sub;

      if (type === 'exit') {
        actions.children[0].onclick = exit;
        actions.children[1].onclick = continueGame;
      }
      if (type === 'restart') {
        actions.children[0].onclick = restart;
        actions.children[1].onclick = continueGame;
      }
      if (type === 'gameover' || type === 'bestgameover') {
        actions.children[0].onclick = restart;
        actions.children[1].onclick = exit;
        section.classList.add('bold');
      }
      actions.children[0].addEventListener('click', () => {
        section.classList.remove('show');
        section.classList.remove('bold');
      });
      actions.children[1].addEventListener('click', () => {
        section.classList.remove('show');
        section.classList.remove('bold');
      });
      section.classList.add('show');
    }

    const tertisActions = document.getElementById('actions');
    tertisActions.children[0].onclick = e => {
      showPopup('restart');
    };
    tertisActions.children[1].onclick = e => {
      showPopup('exit');
    };
    // Функция изменения размера санваса при ресайзе окна
    function resizeCanvas() {
     // grid = Math.floor((window.innerHeight - 130) / configuration.TETRISHEIGHT);
      canvas.height = tetrisHeight * grid;
      canvas.width = grid * 10;

      // nextCanvas.height = grid * 2;
      // nextCanvas.width = grid * 4;

      const section = document.querySelector('.gameover');
      section.style.width = 569 + 'px';
      // section.style.width = grid * 10 + 150 + 'px';
    }
    // Инициализирующий ресайз
    resizeCanvas();
    // размер квадратика
    // массив с последовательностями фигур, на старте — пустой
    var tetrominoSequence = [];

    // с помощью двумерного массива следим за тем, что находится в каждой клетке игрового поля
    // размер поля — 10 на 20, и несколько строк ещё находится за видимой областью
    var playfield = [];

    // заполняем сразу массив пустыми ячейками
    for (let row = -2; row < tetrisHeight; row++) {
      playfield[row] = [];

      for (let col = 0; col < 10; col++) {
        playfield[row][col] = 0;
      }
    }

    // как рисовать каждую фигуру
    // https://tetris.fandom.com/wiki/SRS
    const tetrominos = {
      'I': [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0]
      ],
      'J': [
        [1,0,0],
        [1,1,1],
        [0,0,0],
      ],
      'L': [
        [0,0,1],
        [1,1,1],
        [0,0,0],
      ],
      'O': [
        [1,1],
        [1,1],
      ],
      'S': [
        [0,1,1],
        [1,1,0],
        [0,0,0],
      ],
      'Z': [
        [1,1,0],
        [0,1,1],
        [0,0,0],
      ],
      'T': [
        [0,1,0],
        [1,1,1],
        [0,0,0],
      ]
    };

    // цвет каждой фигуры
    const colors = {
      'I': '#e20e0e',
      'O': '#e28166',
      'T': '#4b57f2',
      'S': '#069c93',
      'Z': '#5a9c06',
      'J': '#a90ee2',
      'L': '#e2810e'
    };
    // Количество выпавших фигур для обновления эмоции
    const tetraminoForUpdate = configuration.COUNTTOCHANGE;
    // Количество выпавших фигур для смены эмоции
    let countOfTetramino = 0;
    // Количество строк для расчета уровня
    let rowCountForUpdate = 0;
    // Количество убравшихся строк глобально
    let totalRows = 0;
    // Уровень
    let level = 1;
    // Счет
    let score = 0;
    // Эмоция
    let emotion = '';
    // Группа
    let group = '';
    // счётчик
    let count = 0;
    // Запуск новых правил
    let needNewRule = false;
    // Запуск счетчика, когда пройдет время
    let allowCount = false;
    // Запуск времени ожидания, для игры по новым правилам
    setTimeout(() => {
      needNewRule = true;
      allowCount = true;
    }, configuration.EXPECTATION);

    // текущая фигура в игре
    let tetromino = getNextTetromino();
    // следим за кадрами анимации, чтобы если что — остановить игру
    let rAF = null;  
    // флаг конца игры, на старте — неактивный
    let gameOver = false;
    // Пауза
    let pause = false;
    // Уровень игры

    // Функция возвращает случайное число в заданном диапазоне
    // https://stackoverflow.com/a/1527820/2124254
    function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);

      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // создаём последовательность фигур, которая появится в игре
    //https://tetris.fandom.com/wiki/Random_Generator

    /**
      * Генерация последовательности тетромино
      * 
      * @param {string} gr group of emotions
      * @param {boolean} nu need to update level
      */
    function generateSequence(gr, nu) {
      // тут — сами фигуры
      if (nu) {
        // Если повторно выпала та же группа
        level++;
      }
      // Выбор последовательности фигур
      let sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

      if (gr === 'NEUTRAL') {
        sequence = ['S', 'Z'];
      } else if (gr === 'NEGATIVE') {
        sequence = ['I'];
      }
   // while (countLoop < 2) {
        // случайным образом находим любую из них
        const rand = getRandomInt(0, sequence.length - 1);
        const name = sequence.slice(rand, rand + 1)[0];
        // помещаем выбранную фигуру в игровой массив с последовательностями
        tetrominoSequence.push(name);
    //}

    }

    /**
      * Получение группы эмоций по эмоции
      * 
      * @param {string} em emotion
      * @returns {string}
      */
    function getGroup(em) {
      switch(em || emotion) {
        case 'H':
        case 'U': return 'POSITIVE'

        case 'N':
        case 'G': return 'NEUTRAL'

        case 'A':
        case 'D':
        case 'S': return 'NEGATIVE'
      }
    }
    // Обновляем справочную информацию
    function updateText() {
      // Обновление эмоции
        const doc1 = document.getElementById('emotion');
        // const sequence = ['H', 'U', 'N', 'G', 'A', 'D', 'S'];
        // if (emotion) {
        //   const emotionIndex = sequence.indexOf(emotion);
        //   doc1.innerHTML = '<div>Emotion:<br /><img src="../icons/' + (emotionIndex + 1) + '.png"><div>';
        // }
        const emotionSequence = {
          H: 'Happy',
          U: 'Wonder',
          N: 'OK',
          G: 'Sad',
          A: 'Angry',
          D: 'Disgust',
          S: 'Scared'
        };
        if (emotion) {
          doc1.innerHTML = `<div>Emotion:<br />${emotionSequence[emotion]}<div>`;
        }
        // Обновление скора
        const doc2 = document.getElementById('score');
        doc2.innerHTML = 'Score:<br />' + score;
        // Обновление левела
        const doc3 = document.getElementById('level');
        doc3.innerHTML = 'Level:<br />' + level;
        // Обновление количества строк
        const doc4 = document.getElementById('lines');
        doc4.innerHTML = 'Lines:<br />' + totalRows;
        // обновление бест скора
        // let scores = localStorage.getItem('scores');
        // if (scores) {
        //   scores = JSON.parse(scores);
        // } else {
        //   scores = {};
        // }
        // const bestscore = Object.keys(scores).reduce((acc, red) => red > Number(acc) ? red : Number(acc), 0);
        // const doc5 = document.getElementById('bestscore');
        // doc5.innerHTML = 'Best score:<br />' + Math.max(bestscore, score);
    }

    updateText();

    function getEmotion() {
      const sequence = ['H', 'U', 'N', 'G', 'A', 'D', 'S'];
      const rand = getRandomInt(0, sequence.length - 1);
      return sequence[rand];
    }

    function drawNextTetromino() {
      // Рисуем следующую фигуру
      ctx.clearRect(0,0, nextCanvas.width, nextCanvas.height);
      if (tetrominoSequence && tetrominoSequence.length > 0 && tetrominoSequence[tetrominoSequence.length-1]) {
        ctx.fillStyle = colors[tetrominoSequence[tetrominoSequence.length-1]];
        let tetr = tetrominos[tetrominoSequence[tetrominoSequence.length-1]];
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 4; col++) {
            if (tetr[row] && tetr[row][col]) ctx.fillRect(col * grid, row * grid, grid-1, grid-1);
          }
        }
      }
    }

    // получаем следующую фигуру
    function getNextTetromino() {
      // если следующей нет — генерируем
      if (tetrominoSequence.length === 0) {
        // countOfTetramino++;
        let needUpdate = false;

        if (countOfTetramino >= tetraminoForUpdate) {
          const lastGroup = group;
          emotion = getEmotion();
          group = getGroup();
          countOfTetramino = 0;
          needUpdate = lastGroup === group;
        }
        generateSequence(group, needUpdate);
        updateText();
      }

      // берём первую фигуру из массива
      const name = tetrominoSequence.pop();

      if (tetrominoSequence.length === 0) {
        if (allowCount && !!totalRows) countOfTetramino++;
        let needUpdate = false;

        if (countOfTetramino >= tetraminoForUpdate || (needNewRule && !!totalRows)) {
          const lastGroup = group;
          emotion = getEmotion();
          group = getGroup();
          countOfTetramino = 0;
          needUpdate = lastGroup === group;
          needNewRule = false;
        }
        generateSequence(group, needUpdate);
        updateText();

        drawNextTetromino();
      }

      // сразу создаём матрицу, с которой мы отрисуем фигуру
      const matrix = tetrominos[name];

      // I и O стартуют с середины, остальные — чуть левее
      const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);

      // I начинает с 21 строки (смещение -1), а все остальные — со строки 22 (смещение -2)
      const row = name === 'I' ? -1 : -2;

      // вот что возвращает функция 
      return {
        name: name,      // название фигуры (L, O, и т.д.)
        matrix: matrix,  // матрица с фигурой
        row: row,        // текущая строка (фигуры стартую за видимой областью холста)
        col: col         // текущий столбец
      };
    }

    // поворачиваем матрицу на 90 градусов
    // https://codereview.stackexchange.com/a/186834
    function rotate(matrix) {
      const N = matrix.length - 1;
      const result = matrix.map((row, i) =>
        row.map((val, j) => matrix[N - j][i])
      );
      // на входе матрица, и на выходе тоже отдаём матрицу
      return result;
    }

    // проверяем после появления или вращения, может ли матрица (фигура) быть в этом месте поля или она вылезет за его границы
    function isValidMove(matrix, cellRow, cellCol) {
      // проверяем все строки и столбцы
      for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
          if (matrix[row][col] && (
              // если выходит за границы поля…
              cellCol + col < 0 ||
              cellCol + col >= playfield[0].length ||
              cellRow + row >= playfield.length ||
              // …или пересекается с другими фигурами
              playfield[cellRow + row][cellCol + col])
            ) {
            // то возвращаем, что нет, так не пойдёт
            return false;
          }
        }
      }
      // а если мы дошли до этого момента и не закончили раньше — то всё в порядке
      return true;
    }

    // когда фигура окончательна встала на своё место
    function placeTetromino() {
      // обрабатываем все строки и столбцы в игровом поле
      for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
          if (tetromino.matrix[row][col]) {
            // если край фигуры после установки вылезает за границы поля, то игра закончилась
            if (tetromino.row + row <= 0) {
              return showGameOver();
            }
            // если всё в порядке, то записываем в массив игрового поля нашу фигуру
            playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
          }
        } 
      }

      // проверяем, чтобы заполненные ряды очистились снизу вверх
      let countOfRows = 0;

      for (let row = playfield.length - 1; row >= 0; ) {
        // если ряд заполнен
        if (playfield[row].every(cell => !!cell)) {
          countOfRows++;
          // очищаем его и опускаем всё вниз на одну клетку
          for (let r = row; r >= 0; r--) {
            for (let c = 0; c < playfield[r].length; c++) {
              playfield[r][c] = playfield[r-1][c];
            }
          }
        }
        else {
          // переходим к следующему ряду
          row--;
        }
      }

      rowCountForUpdate += countOfRows;
      totalRows += countOfRows;

      if (score + 100 >= Number.MAX_SAFE_INTEGER) {
        let scores = localStorage.getItem('scores');
        if (scores) {
          scores = JSON.parse(scores);
        } else {
          scores = {};
        }

        if (score) {
          scores[Number.MAX_SAFE_INTEGER] = (new Date()).valueOf();
          localStorage.setItem('scores', JSON.stringify(scores));
        }
        showError();
      }

      if (countOfRows === 1) {
        score += 100;
      } else if (countOfRows === 2) {
        score += 300;
      } else if (countOfRows === 3) {
        score += 700;
      } else if (countOfRows === 4) {
        score += 1000;
      }
      if (rowCountForUpdate >= 10) {
        level++;
        rowCountForUpdate = rowCountForUpdate - 10;
      }
      updateText();
      // получаем следующую фигуру
      tetromino = getNextTetromino();
    }

      // показываем надпись Game Over
      function showGameOver() {
        // прекращаем всю анимацию игры
        cancelAnimationFrame(rAF);
        // ставим флаг окончания
        gameOver = true;

        let scores = localStorage.getItem('scores');
        if (scores) {
          scores = JSON.parse(scores);
        } else {
          scores = {};
        }

        if (score) {
          scores[score.toString()] = (new Date()).valueOf();
          localStorage.setItem('scores', JSON.stringify(scores));
        }
        showPopup('gameover');
        // if (score && (!scores || Object.keys(scores).every(item => Number(item) < score))) {
        //   showPopup('bestgameover');
        // } else {
        //   showPopup('gameover');
        // }
      }
      // пауза
      function showPause() {
        // прекращаем всю анимацию игры
        pause = true;
        cancelAnimationFrame(rAF);
      }

    function showError() {
      cancelAnimationFrame(rAF);
      const body = document.querySelector('body');
      body.style.display = 'flex';
      body.style.alignItems = 'center';
      Array.from(body.children).map(item => {
        body.removeChild(item);
      });
      const div = document.createElement('div');
      body.appendChild(div);
      div.innerHTML = `<b>OOPS!</b><br />ERROR! GAMER DETECTED!<br />STOP PLAYING AND DO YOUR HOMEWORK!<br />(MAX SCORE REACHED)<br /><button id="error">OK</button>`;
      div.style.textAlign = 'center';
      div.style.fontSize = '30px';
      div.onclick = exit;
    }

    function drawField() {
      // очищаем холст
      context.clearRect(0,0,canvas.width,canvas.height);
      // рисуем игровое поле с учётом заполненных фигур
      for (let row = 0; row < tetrisHeight; row++) {
        for (let col = 0; col < 10; col++) {
          if (playfield[row][col]) {
            const name = playfield[row][col];
            context.fillStyle = colors[name];

            // рисуем всё на один пиксель меньше, чтобы получился эффект «в клетку»
            context.fillRect(col * grid, row * grid, grid-1, grid-1);
          }
        }
      }

      // рисуем текущую фигуру
      if (tetromino) {

        // фигура сдвигается вниз каждые 35 кадров
        if (++count > 36 - level) {
          tetromino.row++;
          count = 0;

          // если движение закончилось — рисуем фигуру в поле и проверяем, можно ли удалить строки
          if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
            tetromino.row--;
            placeTetromino();
          }
        }

        // не забываем про цвет текущей фигуры
        context.fillStyle = colors[tetromino.name];

        // отрисовываем её
        for (let row = 0; row < tetromino.matrix.length; row++) {
          for (let col = 0; col < tetromino.matrix[row].length; col++) {
            if (tetromino.matrix[row][col]) {

              // и снова рисуем на один пиксель меньше
              context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid-1, grid-1);
            }
          }
        }
      }
    }
    // главный цикл игры
    function loop() {
      // начинаем анимацию
      rAF = requestAnimationFrame(loop);
      drawField();
    }

    function continueGame() {
      pause = false;
      rAF = requestAnimationFrame(loop);
    }

    // следим за нажатиями на клавиши
    document.addEventListener('keydown', function(e) {
      // если игра закончилась — сразу выходим
      if (gameOver) return;

      // стрелки влево и вправо
      if (e.which === 37 || e.which === 39) {
        const col = e.which === 37
          // если влево, то уменьшаем индекс в столбце, если вправо — увеличиваем
          ? tetromino.col - 1
          : tetromino.col + 1;

        // если так ходить можно, то запоминаем текущее положение 
        if (isValidMove(tetromino.matrix, tetromino.row, col)) {
          tetromino.col = col;
        }
      }

      // стрелка вверх — поворот
      if (e.which === 38) {
        // поворачиваем фигуру на 90 градусов
        const matrix = rotate(tetromino.matrix);
        // если так ходить можно — запоминаем
        if (isValidMove(matrix, tetromino.row, tetromino.col)) {
          tetromino.matrix = matrix;
        }
      }

      // стрелка вниз — ускорить падение
      if(e.which === 40) {
        // смещаем фигуру на строку вниз
        const row = tetromino.row + 1;
        // если опускаться больше некуда — запоминаем новое положение
        if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
          tetromino.row = row - 1;
          // ставим на место и смотрим на заполненные ряды
          placeTetromino();
          return;
        }
        // запоминаем строку, куда стала фигура
        tetromino.row = row;
      }
      // // Показ паузы
      // if(e.code === 'KeyP') {
      //   if (!pause) {
      //     showPause();
      //   } else {
      //     continueGame();
      //   }
      // }
    });

    // старт игры
    rAF = requestAnimationFrame(loop);

    document.addEventListener('keydown', function(e) {
      // Выход из игры в главное меню
      if(e.code === 'Escape') {
        showPopup('exit');
      }
      // Перезагрузка игры
      if(e.code === 'KeyR') {
        showPopup('restart');
      }
    })
    // Отслеживание ресайза окна
    window.addEventListener('resize', () => {
      resizeCanvas();
      drawNextTetromino();
      drawField();
    })
}