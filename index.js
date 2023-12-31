/**
 * Accessing element of the grid
 */
const grid = document.querySelector('.grid');

/**
 * Grid size
 */
const gridWidth = 560;
const gridHeight = 300;

/**
 * Accessing element of the score
 */
const scoreElement = document.querySelector('.score');

/**
 * Amount of score
 */
let score = +scoreElement.innerText;

/**
 * Class defining a block element
 */
class Block {
    /**
     * All blocks
     */
    static blocks = [];
    /**
     * Size of blocks
     */
    static size = 25;
    /**
     * Length of the row of blocks
     */
    static rowLength = 5;
    /**
    * Size of one block
    */
    static width = 100;
    static height = 20;
    /**
     * Assigns coordinates of the block corners
     * @param {x} x coordinate of the bottom left block corner
     * @param {y} y coordinate of the bottom left block corner
     */
    constructor(x, y) {
        this.bottomLeft = [ x, y ];
        this.bottomRight = [ x + Block.width, y ];
        this.topLeft = [ x, y + Block.height ];
        this.topRight = [ x + Block.width, y + Block.height ];
    }
    /**
     * Calculates coordinates for each block
     */
    static assignBlockCoordinates() {
        const initialX = 10;
        const dx = 110;
    
        const initialY = 270;
        const dy = 30;

        let x = initialX;
        let y = initialY;
    
        for (let i = 0; i < Block.size; i++) {
            if (i && i % 5 === 0) {
                y -= dy;
                x = initialX;
            }
            Block.blocks[i] = new Block(x, y);
            x += dx;
        }
    }
    /**
     * Creates a new block with applied some styles
     * @param {left} left 
     * @param {bottom} bottom
     */
    static createBlock(left, bottom) {
        const block = document.createElement('div');
    
        block.classList.add('block');
    
        block.style.left = left + 'px';
        block.style.bottom = bottom + 'px';
    
        grid.appendChild(block);
    }
    /**
     * Creates an array of blocks
     */
    static createBlocks() {
        Block.assignBlockCoordinates();

        for (let i = 0; i < Block.size; i++) {
            const left = Block.blocks[i].bottomLeft[0];
            const bottom = Block.blocks[i].bottomLeft[1];
            Block.createBlock(left, bottom);
        }
    }
}

/**
 * Class defining a paddle element
 */
class Paddle {
    /**
     *  Paddle width
     */
    static width = 100;
    /**
     * Paddle height
     */
    static height = 20;
    /**
     * Initial paddle coordinates
     */
    static startPosition = [
        230, 10
    ];
    /**
     * Current paddle coordinates
     */
    static currentPosition = Paddle.startPosition;
    /**
     * Creates paddle
     * @returns paddle element
     */
    static create() {
        const paddle = document.createElement('div');
        paddle.classList.add('paddle');
        Paddle.assignCoordinates(paddle);
        grid.appendChild(paddle);
        return paddle;
    }
    /**
     * Assigns current paddle position
     * @param {HTMLDivElement} paddle 
     */
    static assignCoordinates(paddle) {
        if (paddle) {
            paddle.style.left = Paddle.currentPosition[0] + 'px';
            paddle.style.bottom = Paddle.currentPosition[1] + 'px';
        }
    }
}

/**
 * Handles mouse movement events
 * @param {event} event 
 */
function mouseMoveHandler(event) {
    /**
     * Center paddle position
     */
    const relativeX = event.clientX - grid.getBoundingClientRect().left - Paddle.width / 2;
    
    if (relativeX > 0 && relativeX < gridWidth - Paddle.width) {
        Paddle.currentPosition[0] = relativeX;
        Paddle.assignCoordinates(paddle);
    }
}

/**
 * Class defining a ball element
 */
class Ball {
    /**
     * Initial ball coordinates
     */
    static startPosition = [
        (220 + Paddle.width / 2), 40
    ];
    /**
     * Current ball coordinates
     */
    static currentPosition = Ball.startPosition;
    /**
     * Ball moving deltas (initial directions)
     */
    static dx = -2;
    static dy = 2;
    /**
     * Ball diameter
     */
    static diameter = 20;
    /**
     * Timer instance for ball moving
     */
    static timer;
    /**
     * Creates ball
     * @returns ball HTML element
     */
    static create() {
        const ball = document.createElement('div');
        ball.classList.add('ball');
        Ball.assignCoordinates(ball);
        grid.appendChild(ball);
        return ball;
    }
    /**
     * Assigns ball coordinates
     * @param {HTMLDivElement} ball 
     */
    static assignCoordinates(ball) {
        ball.style.left = Ball.currentPosition[0] + 'px';
        ball.style.bottom = Ball.currentPosition[1] + 'px';
    }
    /**
     * Moves ball
     */
    static move() {
        Ball.currentPosition[0] += Ball.dx;
        Ball.currentPosition[1] += Ball.dy;
        Ball.assignCoordinates(ball);
        Ball.collisionCheck();
    }
    /**
     * Changes ball direction after collision
     */
    static changeDirection() {
        if ((Ball.dx > 0) && (Ball.dy > 0)) {
            Ball.dy = -2;
            return;
        }
          if ((Ball.dx > 0) && (Ball.dy < 0)) {
            Ball.dx = -2;
            return;
        }
          if ((Ball.dx < 0) && (Ball.dy < 0)) {
            Ball.dy = 2;
            return;
        }
          if ((Ball.dx < 0) && (Ball.dy > 0)) {
            Ball.dx = 2;
            return;
        }
    }
    /**
     * Checks collisions with walls, blocks and paddle
     */
    static collisionCheck() {
        /**
         * Block collision
         */
        for (let i = 0; i < Block.blocks.length; i++) {
                const currentBlock = Block.blocks[i];
                if (
                    (Ball.currentPosition[0] >= currentBlock.bottomLeft[0] && Ball.currentPosition[0] <= currentBlock.bottomRight[0]) &&
                    ((Ball.currentPosition[1] + Ball.diameter) >= currentBlock.bottomLeft[1] && Ball.currentPosition[1] <= currentBlock.topLeft[1])
                    )
                {
                    const allBlocks = Array.from(document.querySelectorAll('.block'));
                    allBlocks[i].classList.remove('block');
                    Block.blocks.splice(i, 1);
                    Ball.changeDirection();
                    score++;
                    scoreElement.innerHTML = score;

                    /**
                     * If all blocks are destroyed -> show win
                     */
                    if (Block.blocks.length == 0) {
                        clearInterval(this.timer);
                        Game.win();
                        document.removeEventListener('mousemove', mouseMoveHandler);
                    }
                }
        }
        /**
         * Wall colision
         */
        if (
            Ball.currentPosition[0] >= (gridWidth - Ball.diameter) ||
            Ball.currentPosition[0] <= 0 ||
            Ball.currentPosition[1] >= (gridHeight - Ball.diameter)
            ) {
            Ball.changeDirection();
        }
        /**
         * Bottom colision -> show game over
         */
        if (Ball.currentPosition[1] <= 0) {
            clearInterval(this.timer);
            Game.stop();
            document.removeEventListener('mousemove', mouseMoveHandler);
        }
        /**
         * Paddle collision
         */
        if (
            Ball.currentPosition[0] + Ball.diameter >= Paddle.currentPosition[0] &&
            Ball.currentPosition[0] <= Paddle.currentPosition[0] + Paddle.width &&
            Ball.currentPosition[1] <= Paddle.currentPosition[1] + Block.height &&
            Ball.currentPosition[1] >= Paddle.currentPosition[1]
        ) {
            /**
             * In order to avoid stucking in paddle
             */
            Ball.currentPosition[1] = Paddle.currentPosition[1] + Block.height;

            Ball.dx *= -1;

            Ball.changeDirection();
            Ball.changeDirection();
        }
    }
}

/**
 * Ball HTML element instance
 */
let ball;

/**
 * Paddle HTML element instance
 */
let paddle;

/**
 * Starting listening mouse move event
 */
document.addEventListener('mousemove', mouseMoveHandler, false);

/**
 * Class defining the game
 */
class Game {
    /**
     * Starts the game
     */
    static start() {
        /**
         * Creating blocks grid
         */
        Block.createBlocks();
        /**
         * Creating a ball
         */
        ball = Ball.create();
        /**
         * Creating a paddle
         */
        paddle = Paddle.create();

        /**
         * Shows game grid
         */
        const containerGrid = document.querySelector('.container-grid');
        containerGrid.style.display = 'flex';


        /**
         * Hides start window
         */
        const startGameWindow = document.querySelector('.start-game-window');
        startGameWindow.style.display = 'none';

        /**
         * Shows score
         */
        let score = document.querySelector('.score');
        score.style.display = 'flex';

        /**
         * Setts time interval for game
         */
        Ball.timer = setInterval(Ball.move, 20);
    }
    /**
     * Restarts the game by reloading the page
     */
    static restart() {
        location.reload();
    }
    /**
     * Stops the game after game over and shows game over window
     */
    static stop() {
        /**
         * Hides game grid
         */
        const containerGrid = document.querySelector('.container-grid');
        containerGrid.style.display = 'none';
        /**
         * Shows game over window
         */
        const gameOverWindow = document.querySelector('.game-over-window');
        gameOverWindow.style.display = 'flex';
        /**
         * Hides score
         */
        const score = document.querySelector('.score');
        score.style.display = 'none';
        /**
         * Remove event listener for mouse moving
         */
        document.removeEventListener('mousemove', mouseMoveHandler);
    }
    /**
     * Shows win window
     */
    static win() {
        /**
         * Hides game grid
         */
        const containerGrid = document.querySelector('.container-grid');
        containerGrid.style.display = 'none';
        /**
         * Shows win window
         */
        const winWindow = document.querySelector('.win-window');
        winWindow.style.display = 'flex';
        /**
         * Hides score
         */
        const score = document.querySelector('.score');
        score.style.display = 'none';
        /**
         * Remove event listener for mouse moving
         */
        document.removeEventListener('mousemove', mouseMoveHandler);
    }
    /**
     * Handles cancel button
     */
    static cancel() {
        /**
         * Hides start window
         */
        const startGameWindow = document.querySelector('.start-game-window');
        startGameWindow.style.display = 'none';
        /**
         * Hides game over window
         */
        const gameOverWindow = document.querySelector('.game-over-window');
        gameOverWindow.style.display = 'none';
        /**
         * Hides win window
         */
        const winWindow = document.querySelector('.win-window');
        winWindow.style.display = 'none';
        /**
         * Shows sad picture
         */
        const container = document.querySelector('.container');
        container.innerHTML = `
            <h2>Click on Spongebob if you changed your mind :(</h2>
            <img src='sad-spongebob.jpg' style='margin-top:20px;' onclick='Game.restart()'>
        `;
    }
}
