const gameArea = document.querySelector(".game-area");
const player = document.getElementById("player");
const target = document.getElementById("target");
const statusText = document.getElementById("status");
const buttons = document.querySelectorAll(".controls button");

let playerX = 100;
let playerY = 250;
const speed = 5;

const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false
};

document.addEventListener("keydown", function(event) {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = true;
        event.preventDefault();
    }
});

document.addEventListener("keyup", function(event) {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = false;
    }
});

buttons.forEach(button => {
    const key = button.dataset.key;

    button.addEventListener("pointerdown", function(event) {
        event.preventDefault();
        keys[key] = true;
    });

    button.addEventListener("pointerup", function(event) {
        event.preventDefault();
        keys[key] = false;
    });

    button.addEventListener("pointerleave", function() {
        keys[key] = false;
    });

    button.addEventListener("pointercancel", function() {
        keys[key] = false;
    });
});

function update() {
    if (keys.ArrowLeft) {
        playerX -= speed;
    }

    if (keys.ArrowRight) {
        playerX += speed;
    }

    if (keys.ArrowUp) {
        playerY -= speed;
    }

    if (keys.ArrowDown) {
        playerY += speed;
    }

    const maxX = gameArea.clientWidth - player.offsetWidth;
    const maxY = gameArea.clientHeight - player.offsetHeight;

    playerX = Math.max(0, Math.min(playerX, maxX));
    playerY = Math.max(0, Math.min(playerY, maxY));

    player.style.left = playerX + "px";
    player.style.top = playerY + "px";

    checkCollision();

    requestAnimationFrame(update);
}

function checkCollision() {
    const playerRect = player.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const isColliding =
        playerRect.left < targetRect.right &&
        playerRect.right > targetRect.left &&
        playerRect.top < targetRect.bottom &&
        playerRect.bottom > targetRect.top;

    if (isColliding) {
        target.style.background = "rgb(255, 0, 0)";
        statusText.textContent = "BERTABRAKAN!";
    } else {
        target.style.background = "rgb(0, 200, 0)";
        statusText.textContent = "Tidak bertabrakan";
    }
}

update();