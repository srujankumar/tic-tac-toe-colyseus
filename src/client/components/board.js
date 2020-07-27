import React from 'react';
import PropTypes from 'prop-types';
import './board.css';
import {GameStatus} from "../../server/State";

export class TicTacToeBoard extends React.Component {
    static propTypes = {
        G: PropTypes.any.isRequired,
        moves: PropTypes.any.isRequired,
        playerID: PropTypes.number,
        isActive: PropTypes.bool,
    };

    onClick = id => {
        if (this.isActive(id)) {
            this.props.moves.clickCell(id);
        }
    };

    isActive(id) {
        if (!this.props.isActive) return false;
        return this.props.G.cells[id] === -1;
    }

    render() {
        let tbody = [];
        for (let i = 0; i < 3; i++) {
            let cells = [];
            for (let j = 0; j < 3; j++) {
                const id = 3 * i + j;
                cells.push(
                    <td
                        key={id}
                        className={this.isActive(id) ? 'active' : ''}
                        onClick={() => this.onClick(id)}
                    >
                        {this.props.G.cells[id] === -1 ? null: this.props.G.cells[id]}
                    </td>
                );
            }
            tbody.push(<tr key={i}>{cells}</tr>);
        }

        let winner = null;
        if (this.props.G.status === GameStatus.ENDED) {
            winner =
                this.props.G.gameOver.winner !== -1 ? (
                    <div id="winner">Winner: {this.props.G.gameOver.winner}</div>
                ) : (
                    <div id="winner">Draw!</div>
                );
        }

        return (
            <div>
                <table id="board">
                    <tbody>{tbody}</tbody>
                </table>
                {winner}
            </div>
        );
    }
}