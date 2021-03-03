 // License CC0 1.0 Universal 
    // https://gist.github.com/straker/3c98304f8a6a9174efd8292800891ea1
    // https://tetris.fandom.com/wiki/Tetris_Guideline

window.onload = () => {
    const tetrisHeight = configuration.TETRISHEIGHT;
    // получаем доступ к холсту
    const canvas = document.getElementById('game');
    const grid = configuration.GRIDSIZE;
    canvas.height = tetrisHeight * grid;
    canvas.width = grid * 10;
    const context = canvas.getContext('2d');

    const nextCanvas = document.getElementById('next');
    const ctx = nextCanvas.getContext('2d');
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
      'I': 'cyan',
      'O': 'yellow',
      'T': 'purple',
      'S': 'green',
      'Z': 'red',
      'J': 'blue',
      'L': 'orange'
    };

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
    // Получить группу
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
    function updateText(type) {
     // if (type === 'emotion') {
        const doc1 = document.getElementById('emotion');
        const sequence = ['H', 'U', 'N', 'G', 'A', 'D', 'S'];
        if (emotion) {
          const emotionIndex = sequence.indexOf(emotion);
          doc1.innerHTML = '<div>Emotion:<br /><img src="../icons/' + (emotionIndex + 1) + '.png"><div>';
        }
     // } else if (type === 'score') {
        const doc2 = document.getElementById('score');
        doc2.innerHTML = 'Score:<br />' + score;
     // } else if (type === 'level') {
        const doc3 = document.getElementById('level');
        doc3.innerHTML = 'Level:<br />' + level;
     // } else if (type === 'lines') {
        const doc4 = document.getElementById('lines');
        doc4.innerHTML = 'Lines:<br />' + totalRows;
     // }
        let scores = localStorage.getItem('scores');
        if (scores) {
          scores = JSON.parse(scores);
        } else {
          scores = {};
        }
        const bestscore = Object.keys(scores).reduce((acc, red) => red > Number(acc) ? red : Number(acc), 0);
        const doc5 = document.getElementById('bestscore');
        doc5.innerHTML = 'Best score:<br />' + Math.max(bestscore, score);
    }

    updateText('emotion');

    function getEmotion() {
      const sequence = ['H', 'U', 'N', 'G', 'A', 'D', 'S'];
      const rand = getRandomInt(0, sequence.length - 1);
      return sequence[rand];
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
        updateText('emotion');
      }

      // берём первую фигуру из массива
      const name = tetrominoSequence.pop();

      if (tetrominoSequence.length === 0) {
        if (allowCount) countOfTetramino++;
        let needUpdate = false;

        if (countOfTetramino >= tetraminoForUpdate || needNewRule) {
          const lastGroup = group;
          emotion = getEmotion();
          group = getGroup();
          countOfTetramino = 0;
          needUpdate = lastGroup === group;
          needNewRule = false;
        }
        generateSequence(group, needUpdate);
        updateText('emotion');

              // Рисуем следующую фигуру
        ctx.clearRect(0,0, nextCanvas.width, nextCanvas.height);
        if (tetrominoSequence && tetrominoSequence.length > 0 && tetrominoSequence[tetrominoSequence.length-1]) {
          ctx.fillStyle = colors[tetrominoSequence[tetrominoSequence.length-1]];
          const tetr = tetrominos[tetrominoSequence[tetrominoSequence.length-1]];
          for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
              if (tetr[row] && tetr[row][col]) ctx.fillRect(col * grid, row * grid, grid-1, grid-1);
            }
          }
        }
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
            if (tetromino.row + row < 0) {
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
          rowCountForUpdate += countOfRows;
          totalRows += countOfRows;
        }
        else {
          // переходим к следующему ряду
          row--;
        }
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
      updateText('level');
      // получаем следующую фигуру
      tetromino = getNextTetromino();
    }

      // показываем надпись Game Over
      function showGameOver() {
        // прекращаем всю анимацию игры
        cancelAnimationFrame(rAF);
        // ставим флаг окончания
        gameOver = true;
        
        if (score) {
          let scores = localStorage.getItem('scores');
          if (scores) {
            scores = JSON.parse(scores);
          } else {
            scores = {};
          }

          if (!scores || Object.keys(scores).every(item => Number(item) < score)) {
            context.fillStyle = 'black';
            context.globalAlpha = 0.75;
            context.fillRect(0, canvas.height / 2 - 60, canvas.width, 120);
            // пишем надпись белым моноширинным шрифтом по центру
            context.globalAlpha = 1;
            context.fillStyle = 'white';
            context.font = '36px monospace';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('GAME OVER!', canvas.width / 2, (canvas.height / 2) + 25);
            context.fillText('BEST SCORE!', canvas.width / 2, (canvas.height / 2) - 25);
          }
          scores[score.toString()] = (new Date()).valueOf();
          localStorage.setItem('scores', JSON.stringify(scores));

        } else {
          // рисуем чёрный прямоугольник посередине поля
          context.fillStyle = 'black';
          context.globalAlpha = 0.75;
          context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
          // пишем надпись белым моноширинным шрифтом по центру
          context.globalAlpha = 1;
          context.fillStyle = 'white';
          context.font = '36px monospace';
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
        }
      }
      // пауза
      function showPause() {
        // прекращаем всю анимацию игры
        pause = true;
        cancelAnimationFrame(rAF);
        // ставим флаг окончания
        // рисуем чёрный прямоугольник посередине поля
        context.fillStyle = 'black';
        context.globalAlpha = 0.75;
        context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
        // пишем надпись белым моноширинным шрифтом по центру
        context.globalAlpha = 1;
        context.fillStyle = 'white';
        context.font = '36px monospace';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('PAUSE!', canvas.width / 2, canvas.height / 2);
      }

    // главный цикл игры
    function loop() {
      // начинаем анимацию

      rAF = requestAnimationFrame(loop);
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

      if(e.code === 'Escape') {
        const a = document.createElement('a');
        a.href = 'main.html';
        a.click();
      }

      if(e.code === 'KeyR') {
        const a = document.createElement('a');
        a.href = 'tetris.html';
        a.click();
      }

      if(e.code === 'KeyP') {
        if (!pause) {
          showPause();
        } else {
          continueGame();
        }
      }
    });

    // старт игры
    rAF = requestAnimationFrame(loop);
}