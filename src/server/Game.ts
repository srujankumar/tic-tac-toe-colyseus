export const isVictory = (cells: number[]): Boolean => {
    const positions: Array<Array<number>> = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    const isRowComplete = (row: Array<number>): Boolean => {
        const symbols = row.map(i => cells[i]);
        return symbols.every(i => i !== -1 && i === symbols[0]);
    };

    return positions.map(isRowComplete).some(i => i === true);
}

export const isDraw = (cells: number[]): Boolean => cells.filter(c => c === -1).length === 0;