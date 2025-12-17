// 獲取畫布和上下文
const canvas = document.getElementById('pingPongCanvas');
const ctx = canvas.getContext('2d');

// 獲取分數和狀態顯示元素
const scoreElement = document.getElementById('score');
const statusElement = document.getElementById('status');

// 遊戲參數設定
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 10;
const WINNING_SCORE = 5;

// 物件狀態
let player = {
    x: 0,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    score: 0,
    dy: 0 // 垂直移動速度
};

let computer = {
    x: canvas.width - PADDLE_WIDTH,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    score: 0,
    dy: 0
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5, // 水平移動速度
    dy: 5, // 垂直移動速度
    speed: 5
};

let gameRunning = false;
let animationFrameId;

// --- 遊戲功能函數 ---

// 1. 繪製物件
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function draw() {
    // 清空畫布 (黑色)
    drawRect(0, 0, canvas.width, canvas.height, 'black');

    // 繪製中線 (虛線)
    for (let i = 0; i < canvas.height; i += 30) {
        drawRect(canvas.width / 2 - 2, i, 4, 20, 'white');
    }

    // 繪製球拍和球
    drawRect(player.x, player.y, PADDLE_WIDTH, PADDLE_HEIGHT, 'white'); // 玩家球拍
    drawRect(computer.x, computer.y, PADDLE_WIDTH, PADDLE_HEIGHT, 'white'); // 電腦球拍
    drawCircle(ball.x, ball.y, BALL_SIZE, 'red'); // 球
}

// 2. 更新球和球拍的位置
function update() {
    if (!gameRunning) return;

    // 玩家球拍移動 (由事件處理)
    player.y += player.dy;
    // 限制玩家球拍在邊界內
    player.y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, player.y));

    // 電腦 AI (簡單地追蹤球的位置)
    const computerCenter = computer.y + PADDLE_HEIGHT / 2;
    if (computerCenter < ball.y - 15) { // 球在電腦球拍下方
        computer.y += 4; // 調整移動速度
    } else if (computerCenter > ball.y + 15) { // 球在電腦球拍上方
        computer.y -= 4;
    }
    // 限制電腦球拍在邊界內
    computer.y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, computer.y));

    // 球移動
    ball.x += ball.dx;
    ball.y += ball.dy;

    // 球撞擊上下邊界
    if (ball.y < 0 || ball.y > canvas.height - BALL_SIZE) {
        ball.dy = -ball.dy; // 反彈
    }

    // 處理球拍碰撞
    let paddle = (ball.x < canvas.width / 2) ? player : computer;

    if (//
        ball.x + BALL_SIZE > paddle.x &&
        ball.x < paddle.x + PADDLE_WIDTH &&
        ball.y + BALL_SIZE > paddle.y &&
        ball.y < paddle.y + PADDLE_HEIGHT
    ) {
        // 碰撞發生！
        ball.dx = -ball.dx; // 反轉水平方向

        // 根據撞擊點調整球的垂直速度，讓遊戲更有趣
        const collisionPoint = ball.y + BALL_SIZE / 2 - (paddle.y + PADDLE_HEIGHT / 2);
        ball.dy = collisionPoint * 0.35; // 調整係數來控制角度變化

        // 稍微加速球，讓遊戲難度增加
       //        ///        
        ball.dx *= 1.05; 
        ball.dy *= 1.05;
    }

    // 球出界 (得分)
    if (ball.x < 0) {
        computer.score++;
        updateScore();
        resetBall();
    } else if (ball.x > canvas.width - BALL_SIZE) {
        player.score++;
        updateScore();
        resetBall();
    }
}

// 3. 重設球的位置
function resetBall() {
    ball.x = canvas.width / 2 - BALL_SIZE / 2;
    ball.y = canvas.height / 2 - BALL_SIZE / 2;
    ball.speed = 5;
    
    // 隨機發球方向
    const directionX = Math.random() < 0.5 ? -1 : 1;
    const directionY = Math.random() < 0.5 ? -1 : 1;
    
    ball.dx = directionX * ball.speed;
    ball.dy = directionY * ball.speed;
    
    // 檢查遊戲是否結束
    if (player.score >= WINNING_SCORE || computer.score >= WINNING_SCORE) {
        endGame();
    } else {
        // *** 這裡新增了關鍵的一行 ***
        gameRunning = false;
        statusElement.textContent = `得分! ${player.score} : ${computer.score}。點擊繼續...`;
        
        // 讓玩家能夠點擊畫布來呼叫 startGame() 函數，繼續遊戲
        canvas.onclick = startGame; 
    }
}

// 4. 更新分數顯示
function updateScore() {
    scoreElement.textContent = `玩家: ${player.score} | 電腦: ${computer.score}`;
}

// 5. 遊戲結束
function endGame() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);

    const winner = player.score > computer.score ? '玩家' : '電腦';
    statusElement.textContent = `遊戲結束! ${winner} 獲勝! 點擊重新開始...`;
    
    // 準備重新開始
    canvas.onclick = () => {
        player.score = 0;
        computer.score = 0;
        updateScore();
        startGame();
    };
}

// 6. 遊戲主迴圈
function gameLoop() {
    update();
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
}

// 7. 開始遊戲
function startGame() {
    gameRunning = true;
    statusElement.textContent = '遊戲進行中...';
    // 取消點擊事件，避免重複開始
    canvas.onclick = null; 
    // 開始遊戲迴圈
    animationFrameId = requestAnimationFrame(gameLoop);
}

// --- 事件監聽 ---

// 玩家控制：鍵盤 (W/S 或上/下箭頭)
document.addEventListener('keydown', (e) => {
    // W 鍵或上箭頭
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        player.dy = -7; // 向上移動
    } 
    // S 鍵或下箭頭
    else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        player.dy = 7; // 向下移動
    }
});

document.addEventListener('keyup', (e) => {
    // 停止移動
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' || 
        e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        player.dy = 0;
    }
});

// 滑鼠/觸摸控制 (更簡單的控制方式)
canvas.addEventListener('mousemove', (e) => {
    if (!gameRunning) return;
    // 根據滑鼠Y座標移動玩家球拍
    let rect = canvas.getBoundingClientRect();
    let root = document.documentElement;
    let mouseY = e.clientY - rect.top - root.scrollTop;
    
    // 讓球拍中心點對準滑鼠位置
    player.y = mouseY - PADDLE_HEIGHT / 2;
});


// 首次啟動：等待點擊開始
draw(); // 首次繪製靜態畫面
canvas.onclick = startGame;
