// const
const GRID_EMPTY = 0;
const GRID_FOOD = 1;
const GRID_SNAKE = 2;
const GRID_OBSTACLE = 3;
const GRID_POISON = 4;

const initArraySize = 16;
let initArray = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];
const size = 35;
let snake = [
    {
        x: Math.floor(initArraySize / 2) - 1,
        y: Math.floor(initArraySize / 2)
    }
];
let snakeDirection
let scoreElement = document.getElementById("score")
let score = 0;
let isGameOver = false;
let isGameStarted = false;
let newDirection;
let level = 1;
let speed = 200;
let obstacles = [];
let poison = { x: 0, y: 0 };
let foods = [];


const newGame = document.querySelector(".ended__button")
const levelSelect = document.getElementById('level');

// Start the game
window.onload = () => {
    if (level >= 3) {
        initObstacles();
    }
    // initFood();
    initFoods();
    render();
    if (level >= 4) {
        initPoison();
    }

    levelSelect.addEventListener('change', function() {
        if (!isGameStarted) {
            level = parseInt(this.value);
            if (level >= 3) {
                initObstacles();
            }else{
                obstacles = [];
            }
            // initFood();
            initFoods();
            render();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (isGameOver) return; // Don't do anything if game is over

        if (event.code === 'ArrowLeft' && snakeDirection !== 'RIGHT') newDirection = 'LEFT';
        else if (event.code === 'ArrowUp' && snakeDirection !== 'DOWN') newDirection = 'UP';
        else if (event.code === 'ArrowRight' && snakeDirection !== 'LEFT') newDirection = 'RIGHT';
        else if (event.code === 'ArrowDown' && snakeDirection !== 'UP') newDirection = 'DOWN';

        // If a new direction was successfully determined and the game is not yet started:
        if (newDirection && !isGameStarted) {
            snakeDirection = newDirection; // Set the new direction
            isGameStarted = true; // Set the flag to true, indicating the game has started
            gameLoop(); // Start the game loop
        } else if (newDirection) {
            snakeDirection = newDirection; // Only update the direction if valid
        }
    });
    newGame.addEventListener('click', () => {
        restart()
    })
};

const gameLoop = () => {
    if (!isGameOver && updateSnakePosition()) {
        scoreElement.innerHTML = score;
        render();
        if (level === 4) {
            updateWalls();
        }
        setTimeout(gameLoop, speed);
        levelSelect.disabled = true

    } else if (isGameOver) {
        // If the game is over, reset isGameStarted so the game can be restarted
        isGameStarted = false;
        levelSelect.disabled = false
    }
};

// Clear board and render each time, this avoids memory leak and ensures updated view.
const render = () => {
    // Clear the game board
    initArray = initArray.map(() => Array(initArraySize).fill(0));
    // render obstacles
    obstacles.forEach(part => {
        const { x, y } = part;
        initArray[x][y] = GRID_OBSTACLE;
    });

    // Render the foods
    foods.forEach(part => {
        const { x, y } = part;
        initArray[x][y] = GRID_FOOD;
    });

    // Render the snake
    snake.forEach(part => {
        const { x, y } = part;
        initArray[x][y] = GRID_SNAKE;
    });


    const board = document.getElementById('board');
    // Ensure the border size is factored in correctly once, outside the loop.
    const borderSize = 10; // Example border size, update as needed.
    board.style.height = `${initArray.length * size + borderSize}px`;
    board.style.width = `${initArray[0].length * size + borderSize}px`;

    // Clear the board to avoid duplication of cells.
    board.innerHTML = '';

    initArray.forEach((row, indexRow) => {
        row.forEach((cell, indexCol) => {
            const cellElement = document.createElement('div');
            let color = '';
            if (cell === GRID_FOOD) {
                color = 'red'
            } else if (cell === GRID_SNAKE) {
                color = '#82e30f'
            } else if (cell === GRID_OBSTACLE) {
                color = '#141e05'
            } else if (cell === GRID_POISON) {
                color = '#2a218a'
            } else if (indexRow % 2 === indexCol % 2) {
                color = '#e0c182'
            }
        cellElement.style.cssText = `
        position: absolute;  
        width: ${size}px;  
        height: ${size}px;  
        top: ${indexRow * size}px;  
        left: ${indexCol * size}px;  
        background-color: ${color};
        `
        board.appendChild(cellElement);
        });


    });
};

const updateSnakePosition = () => {
    const head = { ...snake[0] };

    switch (snakeDirection) {
        case 'RIGHT':
            head.y += 1;
            if (head.y >= initArraySize) head.y = (level === 2) ? initArraySize - 1 : 0;
            break;
        case 'LEFT':
            head.y -= 1;
            if (head.y < 0) head.y = (level === 2) ? 0 : initArraySize - 1;
            break;
        case 'UP':
            head.x -= 1;
            if (head.x < 0) head.x = (level === 2) ? 0 : initArraySize - 1;
            break;
        case 'DOWN':
            head.x += 1;
            if (head.x >= initArraySize) head.x = (level === 2) ? initArraySize - 1 : 0;
            break;
        default: break;
    }

    // Check boundaries
    if (head.x < 0 || head.x >= initArraySize || head.y < 0 || head.y >= initArraySize) {
        // End the game or reset the game state
        ended('Game Over: Snake hit a wall!')
        return false;
    }

    // Check self-collision
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            // End the game or reset the game state
            ended('Game Over: Snake collided with itself!')
            return false;
        }
    }

    // Check for collision with obstacles
    for (let i = 0; i < obstacles.length; i++) {
        if (head.x === obstacles[i].x && head.y === obstacles[i].y) {
            // End the game or reset the game state
            ended('Game Over: Snake hit an obstacle!');
            return false;
        }
    }

    for (let i = 0; i < foods.length; i++) {
        if (head.x === foods[i].x && head.y === foods[i].y) {
            snake.unshift(head); // Add new head
            score++;
            // foods.splice(i, 1); // Remove the eaten food
            // initFoods(); // Initialize new foods
            console.log(snake)
            break;
        }else {
            // Move the snake
            snake.unshift(head); // Add new head
            snake.pop(); // Remove tail
        }
    }

    return true;
};

const ended = (notification) => {
    isGameOver = true;
    isGameStarted = false;

    const endedElement = document.querySelector(".ended")
    const notificationElement = document.querySelector(".ended__notification")
    const gameOverElement = document.querySelector(".ended__game-over")

    gameOverElement.innerHTML = notification
    endedElement.classList.add("ended--show")
    notificationElement.classList.add("ended__notification--show")
}

const restart = () => {
    isGameOver = false;

    snake = [
        {
            x: Math.floor(initArraySize / 2) - 1,
            y: Math.floor(initArraySize / 2)
        }
    ];

    score = 0;
    initFoods();
    snakeDirection = undefined

    scoreElement.innerHTML = score;

    const endedElement = document.querySelector(".ended");
    const notificationElement = document.querySelector(".ended__notification");
    endedElement.classList.remove("ended--show");
    notificationElement.classList.remove("ended__notification--show");

    obstacles = [];
    if (level >= 3) {
        initObstacles();
    }
    render()
}

function initObstacles() {
    for (let i = 0; i < initArray.length; i++) { // Create 5 obstacles
        let x, y;
        if (i === 2 || i === 3 || i === 4) continue; // Skip the first row
        x = 3;
        y = i;// Ensure an empty position
        obstacles.push({ x, y });
        initArray[x][y] = GRID_OBSTACLE;
    }

    for (let i = 0; i < initArray.length; i++) { // Create 5 obstacles
        let x, y;
        if (i === 11 || i === 12 || i === 13) continue; // Skip the first row
        x = 8;
        y = i;// Ensure an empty position
        obstacles.push({ x, y });
        initArray[x][y] = GRID_OBSTACLE;
    }

    for (let i = 0; i < initArray.length; i++) { // Create 5 obstacles
        let x, y;
        if (i === 6 || i === 7 || i === 8) continue; // Skip the first row
        x = 12;
        y = i;// Ensure an empty position
        obstacles.push({ x, y });
        initArray[x][y] = GRID_OBSTACLE;
    }
}

const initPoison = () => {
    let x, y;
    do {
        x = Math.floor(Math.random() * initArraySize);
        y = Math.floor(Math.random() * initArraySize);
    } while (initArray[x][y] !== GRID_EMPTY);  // Ensure an empty position

    poison = { x, y };
    initArray[x][y] = GRID_POISON;
};

const updateWalls = () => {
    // Move the walls up and down
    obstacles.forEach(part => {
        part.y += 1;
        if (part.y >= initArraySize) part.y = 0;
    });
};

const initFoods = () => {
    foods = [];
    for (let i = 0; i < 5; i++) { // Create 5 foods
        let x, y;
        do {
            x = Math.floor(Math.random() * initArraySize);
            y = Math.floor(Math.random() * initArraySize);
        } while (initArray[x][y] !== GRID_EMPTY);  // Ensure an empty position

        foods.push({ x, y });
        initArray[x][y] = GRID_FOOD;
    }

};
