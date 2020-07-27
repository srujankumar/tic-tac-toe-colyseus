import {ArraySchema, MapSchema, Schema, type} from "@colyseus/schema";
import {find} from "lodash";
import {Player} from "./Player";
class GameOver extends Schema {
    @type("number") winner: number = -1;
    @type("boolean") draw: boolean = false;
}

export enum GameStatus {
    NOT_STARTED, STARTED, ENDED
}

export class State extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>();

    @type(  ["number"]) cells = new ArraySchema<number>();

    @type(GameOver) gameOver: GameOver = new GameOver();

    @type("number") status = GameStatus.NOT_STARTED;

    constructor() {
        super();
        for (let i: number = 0; i < 9; i++) {
            this.cells[i] = -1;
        }
    }

    createPlayer(sessionId: string, playerId: number, playerName: string) : Player{
        const player= new Player(playerId, playerName);
        this.players[sessionId]  = player;
        return player;
    }

    removePlayer(sessionId: string) {
        delete this.players[sessionId];
    }

    activatePlayerOne() {
        const player = find(this.players, ['id',0]);
        player.toggleActive();
    }
}

