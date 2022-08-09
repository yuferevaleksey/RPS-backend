# Rock Paper Scissors Backend


## Technologies stack

* NestJS  https://nestjs.com/
* MongoDB https://www.mongodb.com/

## Extra libraries
* Mongoose https://mongoosejs.com/
* Socket-io https://socket.io/

## Installation

Clone repo:

```bash
 git clone https://github.com/yuferevaleksey/RPS-backend
```

```bash
 cd RPS-backend
```

Run docker command:

```bash
 docker-compose up -d
```

Check that all works: Open http://localhost:3001 in the browser, and you should see **Hello World!** on the white page`

## How it works.

Players could add a new game with unlimited counts of rounds or join an existing one.
After the player creates a new game he will wait till another player will not join his game.

For creating a new game client send the following event: **IncomingEvents.START_NEW_GAME**
For joining an existing game client send Event **IncomingEvents.JOIN_GAME**

After the second player joined a game, the backend noticed that game is ready to be started and will notify clients about that. So the game started!

The players make their choices. The round will not be finished till all players will not make their choices. After the last player makes his choice, the backend will calculate who is win and notify all participants.

For getting a list of available games **IncomingEvents.GET_GAMES_LIST**

Every time the client sends an event, such as **IncomingEvents.START_NEW_GAME** or **IncomingEvents.MAKE_CHOICE**, the backend part
store/modify data in mongo DB collection and return it as a response and also notify an opponent user about changes.


## WS Outgoing Events
```javascript
enum OutgoingEvents {
  GAME_RESPONSE = 'gameResponse',
  CONNECTED_SUCCESSFULLY = 'connectedSuccessfully',
  CONNECT = 'connect',
}
```

### OutgoingEvents.GAME_RESPONSE

Called for any outgoing event, the server always returns a Game response, so the client needs to listen to only one event: IncomingEvents.GAME_RESPONSE.

```javascript
{
  _id: string;
  roundsCount: number;
  currentRound: number;
  players:[{
    socketId: string;
    nickName: string;
    deactivated: string;
  }];
  rounds:[
    roundNumber: number;
  choices: [
    userSocket: string;
  choice: Shapes;
];
  winner: string;
];
  paused: boolean;
  finished: boolean;
  pausedBy: string;
}
```

### OutgoingEvents.CONNECTED_SUCCESSFULLY
Send after a connection was established. Used for saving on client side user's socket ID.


## WS incoming Events

```javascript
enum IncomingEvents {
  START_NEW_GAME = 'startNewGame',
  JOIN_GAME = 'joinGame',
  MAKE_CHOICE = 'makeChoice',
  GET_GAMES_LIST = 'getGamesList',
  MOVE_NEXT_ROUND = 'moveNextRound',
  PAUSE_GAME = 'pauseGame',
  RESUME_GAME = 'resumeGame',
  QUIT_GAME = 'quitGame',
}
```

### IncomingEvents.START_NEW_GAME

#### Request:
```javascript
interface StartNewGameMessage {
  nickName: string;
  socketId: string;
  roundsCount: number;
}
```

#### Responce:
See: *OutgoingEvents.GAME_RESPONSE*

### IncomingEvents.JOIN_GAME

#### Request:
```javascript
interface JoinNewGameMessage {
  gameId: string;
  nickName: string;
  socketId: string;
}
```

#### Responce:
See: *OutgoingEvents.GAME_RESPONSE*


### IncomingEvents.QUIT_GAME

#### Request:
```javascript 
interface ExitGameMessage {
    gameId: string;
    socketId: string;
}
```

#### Responce:
See: *OutgoingEvents.GAME_RESPONSE*

### IncomingEvents.MAKE_CHOICE

#### Request:
```javascript
interface MakeChoiceMessage {
  gameId: string;
  socketId: string;
  choice: Shapes;
}
```

#### Responce:
See: *OutgoingEvents.GAME_RESPONSE*

### IncomingEvents.GET_GAMES_LIST

#### Request:
none

#### Response:
Returns array of GameItem
```javascript
interface GameItem {
  id: string;
  roundsCount: number;
}
```

### IncomingEvents.MOVE_NEXT_ROUND

#### Request:
```javascript
interface GotToNextRoundMessage {
  gameId: string;
  socketId: string;
}
```

#### Responce:
See: *IncomingEvents.GAME_RESPONSE*

### OutgoingEvents.PAUSE_GAME

#### Request:
```javascript
interface GotToNextRoundMessage {
  gameId: string;
  socketId: string;
}
```

#### Responce:
See: *IncomingEvents.GAME_RESPONSE*


### OutgoingEvents.RESUME_GAME

#### Request:
```javascript
interface GotToNextRoundMessage {
  gameId: string;
  socketId: string;
}
```

#### Responce:
See: *OutgoingEvents.GAME_RESPONSE*

