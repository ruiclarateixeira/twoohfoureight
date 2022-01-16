const BOARD_SIDE = 4;
let boardState = [];
let moving = false;

function empty() {
    return { value: -1 };
}

function init() {
    let board = document.getElementById("board");
    for (let i = 0; i < BOARD_SIDE; i++) {
        boardState[i] = [];
        for (let j = 0; j < BOARD_SIDE; j++) {
            boardState[i][j] = { value: -1 };
            let cell = document.createElement("div");
            cell.className = "cell";
            cell.id = `${i}_${j}`;
            board.appendChild(cell);
        }
    }

    // Place first pieces
    place(1, 1);
    // place(2, 1);

    document.addEventListener("keypress", (ev) => {
        let moved = false;
        switch (ev.key) {
            // case "w":
            //     move("up");
            //     break;
            case "a":
                moved = moveLeft(false);
                break;
            case "d":
                moved = moveLeft(true);
                break;
            case "s":
                moved = moveDown();
                break;
        }

        if (moved) {
            placeNext();
        }
    });
}

function placeNext() {
    let free = [];
    for (let rowIx = 0; rowIx < boardState.length; rowIx++) {
        for (let colIx = 0; colIx < BOARD_SIDE; colIx++) {
            if (boardState[rowIx][colIx].value < 0) {
                free.push([rowIx, colIx]);
            }
        }
    }
    let randomIx = Math.floor(Math.random() * free.length);
    let picked = free[randomIx];
    place(picked[1], picked[0]);
}

function place(x, y) {
    console.log(`Placing (${x}, ${y})`);
    let newNumber = { value: 2 };
    boardState[y][x] = newNumber;
    let cell = document.getElementById(`${y}_${x}`);
    let number = document.createElement("div");
    number.className = "number";
    number.innerHTML = `${newNumber.value}`;
    cell.appendChild(number);
}

function moveDown() {
    let moved = false;
    for (let colIx = 0; colIx < boardState.length; colIx++) {
        let lowest = BOARD_SIDE - 1;
        let lowestValue = -1;
        for (let rowIx = lowest; rowIx >= 0; rowIx--) {
            const rowState = boardState[rowIx];
            let currentNumber = rowState[colIx];
            if (currentNumber.value > 0) {
                if (lowestValue === currentNumber.value) {
                    moveBox([rowIx, colIx], [lowest + 1, colIx]);
                    moved = true;
                    lowestValue = -1;
                    continue;
                }

                if (lowest > rowIx) {
                    moveBox([rowIx, colIx], [lowest, colIx]);
                    moved = true;
                    lowestValue = currentNumber.value;
                }
                lowest--;
                lowestValue = currentNumber.value;
            }
        }
    }
    return moved;
}

function moveLeft(inverse) {
    let moved = false;
    for (let rowIx = 0; rowIx < boardState.length; rowIx++) {
        let lowest = 0;
        let direction = 1;
        if (inverse) {
            lowest = BOARD_SIDE - 1;
            direction = -1;
        }

        let lowestValue = -1;
        for (
            let colIx = lowest;
            colIx < BOARD_SIDE && colIx >= 0;
            colIx += direction
        ) {
            const rowState = boardState[rowIx];
            let currentNumber = rowState[colIx];
            if (currentNumber.value > 0) {
                if (lowestValue === currentNumber.value) {
                    moveBox([rowIx, colIx], [rowIx, lowest - direction]);
                    moved = true;
                    lowestValue = -1;
                    continue;
                }

                if (lowest * direction < colIx * direction) {
                    moveBox([rowIx, colIx], [rowIx, lowest]);
                    moved = true;
                    lowestValue = currentNumber.value;
                }
                lowest += direction;
                lowestValue = currentNumber.value;
            }
        }
    }
    return moved;
}

function moveBox(from, to) {
    console.log(`Move ${from} to ${to}`);

    let currentNumber = boardState[from[0]][from[1]];
    let targetNumber = boardState[to[0]][to[1]];
    boardState[from[0]][from[1]] = empty();
    if (targetNumber.value > 0) {
        boardState[to[0]][to[1]] = { value: targetNumber.value * 2 };
    } else {
        boardState[to[0]][to[1]] = currentNumber;
    }

    let cell = document.getElementById(`${from[0]}_${from[1]}`);
    let number = cell.getElementsByClassName("number")[0];

    let clone = number.cloneNode();

    clone.innerHTML = `${currentNumber.value}`;
    clone.style.position = "absolute";
    clone.style.top = `${number.offsetTop}px`;
    clone.style.left = `${number.offsetLeft}px`;
    clone.style.width = `${number.offsetWidth}px`;
    clone.style.height = `${number.offsetHeight}px`;
    cell.appendChild(clone);

    if (targetNumber.value > 0) {
        cell.removeChild(number);

        let anotherCell = document.getElementById(`${to[0]}_${to[1]}`);
        let anotherNumber = anotherCell.getElementsByClassName("number")[0];
        anotherNumber.innerHTML = `${boardState[to[0]][to[1]].value}`;

        clone.style.top = `${anotherNumber.offsetTop}px`;
        clone.style.left = `${anotherNumber.offsetLeft}px`;
    } else {
        let anotherCell = document.getElementById(`${to[0]}_${to[1]}`);
        anotherCell.appendChild(number);
        number.style.visibility = "hidden";

        clone.style.top = `${number.offsetTop}px`;
        clone.style.left = `${number.offsetLeft}px`;
    }

    clone.addEventListener("transitionend", () => {
        number.style.visibility = "visible";
        cell.removeChild(clone);
    });
}

function getBoxValue(coords) {
    let cell = document.getElementById(`${coords[0]}_${coords[1]}`);
    if (cell == null) {
        return null;
    }

    let numbers = cell.getElementsByClassName("number");
    if (numbers.length > 1) {
        console.error(`Two numbers found in box (${coords[0]}, ${coords[1]})`);
    }

    let number = numbers[0];
    if (number == null) {
        return null;
    }

    return parseInt(number.innerHTML);
}

function validate() {
    for (let rowIx = 0; rowIx < boardState.length; rowIx++) {
        const row = boardState[rowIx];
        for (let colIx = 0; colIx < row.length; colIx++) {
            const currentValue = row[colIx].value;
            let boxValue = getBoxValue([rowIx, colIx]);
            if (currentValue > 0) {
                if (boxValue !== currentValue) {
                    console.error(
                        `Expected ${currentValue} but got ${boxValue}`
                    );
                }
            } else {
                if (boxValue !== null) {
                    console.error(
                        `Expected (${rowIx}, ${colIx}) to be null but got ${boxValue}`
                    );
                }
            }
        }
    }
}

function printBoardState() {
    for (let rowIx = 0; rowIx < boardState.length; rowIx++) {
        console.log(boardState[rowIx].map((p) => p.value));
    }
}

init();

// let number = document.createElement("div");
// number.className = "number";
// number.innerHTML = "1";
// let cell = document.getElementById("0_0");
// cell.appendChild(number);

// setTimeout(() => {
//     let clone = number.cloneNode();

//     clone.innerHTML = "1";
//     clone.style.position = "absolute";
//     clone.style.top = `${number.offsetTop}px`;
//     clone.style.left = `${number.offsetLeft}px`;
//     clone.style.width = `${number.offsetWidth}px`;
//     clone.style.height = `${number.offsetHeight}px`;
//     cell.appendChild(clone);

//     let anotherCell = document.getElementById("0_1");
//     anotherCell.appendChild(number);
//     number.style.visibility = "hidden";

//     clone.style.top = `${number.offsetTop}px`;
//     clone.style.left = `${number.offsetLeft}px`;

//     clone.addEventListener("transitionend", () => {
//         number.style.visibility = "visible";
//         cell.removeChild(clone);
//     });
// }, 1000);
