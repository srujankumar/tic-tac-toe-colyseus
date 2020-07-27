import {Client, Room} from "colyseus";
import * as http from "http";
import {GameStatus, State} from "./State";
import {Player} from "./Player";
import {isDraw, isVictory} from "./Game";

export class TicTacToeRoom extends Room<State> {

    private counter: number = 0;

    password: string;

    onCreate(options: any): void {
        this.setState(new State());
        this.maxClients = 2;
        this.autoDispose = true;
        this.resetAutoDisposeTimeout(5);
        if(options.password) {
            this.password = options.password;
            this.setPrivate().then(r => console.log('Private Room Created!'));
        }
        this.onMessage("click-cell", this.clickCell.bind(this));
    }

    onAuth(client: Client, options: any, request?: http.IncomingMessage): boolean {
        return options.password === this.password;
    }

    onJoin(client: Client, options: any): void {
        this.state.createPlayer(client.sessionId, this.incrementCounter(), options.playerName)
        if(this.locked) {
            this.state.activatePlayerOne();
            this.state.status = GameStatus.STARTED;
        }
        console.log('Room Joined', client.sessionId);
    }

    async onLeave(client: Client): Promise<any> {
        this.state.players[client.sessionId].connected = false;
        try {
            await this.allowReconnection(client, 20);
            this.state.players[client.sessionId].connected = true;
        } catch (e) {
            console.log('Client Removed', client.sessionId);
            this.state.removePlayer(client.sessionId);
        }
    }


    private clickCell(client: Client, data: any): void {
        const player: Player = this.state.players[client.sessionId];
        if(!player.isActive) return;
        const { id } = data;
        if (this.state.cells[id] !== -1) {
            return;
        }
        this.state.cells[id] = player.id;
        this.toggleActivePlayers();
        if (isVictory(this.state.cells)) {
            this.state.status = GameStatus.ENDED;
            this.state.gameOver.winner = player.id;
        } else if (isDraw(this.state.cells)) {
            this.state.status = GameStatus.ENDED;
            this.state.gameOver.draw = true;
        }
    }

    private toggleActivePlayers(): void {
        for (let key in this.state.players) {
            const player: Player = this.state.players[key];
            player.toggleActive();
        }
    }

    private incrementCounter() : number {
        return this.counter++;
    }
}