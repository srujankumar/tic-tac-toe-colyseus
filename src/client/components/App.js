import React from 'react';
import {Client} from "colyseus.js";
import {isEmpty} from "lodash";
import {TicTacToeBoard} from "./board";
import Lobby from "./Lobby";
import {GameStatus} from "../../server/State";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gameId: null,
      secret: null,
      room: null,
      G: null
    };

    this.clickCell = this.clickCell.bind(this);
    this.stateChanged = this.stateChanged.bind(this);
    this.createRoom = this.createRoom.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.shouldReconnect = this.shouldReconnect.bind(this);
  }

  async componentDidMount() {
    if(this.shouldReconnect()) {
      console.log('Reconnecting !');
      const { gameId, secret} = this.parseHash(window.location.hash);
      const client = new Client("ws://localhost:2567")
      const room = await client.reconnect(gameId, secret);
      room.onStateChange.once(this.stateChanged);
      room.onStateChange(this.stateChanged);
      this.setState({room, gameId, secret})
    }
  }

  parseHash(hash) {
    const str = hash.substr(1);
    const entities = str.split('&');
    let result = {};
    for (let i=0; i < entities.length; i++) {
      const entity = entities[i];
      const [key, value] = entity.split('=');
      result[key] = value;
    }
    return result;
  }

  clickCell(id) {
    this.state.room.send('click-cell',{ id });
  }

  stateChanged(state) {
    this.setState({ G: state});
  }

  async createRoom(playerName) {
    const client = new Client("ws://localhost:2567");
    const room = await client.create('tic-tac-toe', {playerName});
    room.onStateChange.once(this.stateChanged);
    room.onStateChange(this.stateChanged);
    this.setState({room, gameId: room.id, secret: room.sessionId})
    window.location.hash = `gameId=${room.id}&secret=${room.sessionId}`;
    localStorage.setItem(`tic-tac-toe-${room.id}`, JSON.stringify({ [playerName.trim().toLowerCase()]: room.sessionId }));
  }

  async joinRoom(roomCode, playerName) {
    const client = new Client("ws://localhost:2567");
    const room = await client.joinById(roomCode, {playerName});
    const secretStore = localStorage.getItem(`tic-tac-toe-${room.id}`);
    let credentials;
    if(secretStore) {
      credentials = { ...(JSON.parse(secretStore)), [playerName.trim().toLowerCase()]: room.sessionId };
    } else {
      credentials = { [playerName.trim().toLowerCase()]: room.sessionId };
    }
    room.onStateChange.once(this.stateChanged);
    room.onStateChange(this.stateChanged);
    this.setState({room, gameId: room.id, secret: room.sessionId})
    window.location.hash = `gameId=${room.id}&secret=${room.sessionId}`;
    localStorage.setItem(`tic-tac-toe-${room.id}`, JSON.stringify(credentials));
  }

  shouldReconnect() {
    return !isEmpty(window.location.hash) && !this.state.room;
  }

  render() {
    let {secret, G} = this.state;
    return (
        <div className="player-container">
          { G ? <TicTacToeBoard
            G={G}
            moves={{ clickCell: this.clickCell }}
            playerID={G.players[secret]["id"]}
            isActive={G.status === GameStatus.STARTED && G.players[secret]["isActive"]}
          /> : !this.shouldReconnect() ? <Lobby
            createRoom={this.createRoom}
            joinRoom={this.joinRoom}
            gameId={this.state.gameId}
          />: null }
        </div>
    );
  }
}

export default App;