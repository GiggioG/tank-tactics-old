## THIS IS THE OLD VERSION. THE NEW (REWRITTEN FROM SCRATCH) VERSION IS [HERE](https://github.com/GiggioG/tank-tactics).

# tank-tactics-old
Tank Tactics is an implementation of the game "Tank Turn Tactics" from [this GDC talk](https://youtu.be/t9WMNuyjm4w). I made it as close as possible to the game described in the talk, so I recommend watching it and learning the rules that way. For the people who don't want to do that, I have this guide for them.

## THIS APP IS PROBABLY INSECURE. IF YOU GET HACKED I HAVE NO RESPONSABILITY ABOUT YOUR DATA/PC/WHATEVER. USE AT YOUR OWN RISC. I ADVISE YOU TO PLAY ONLY WITH PEOPLE YOU TRUST AND MAKE SURE ONLY THEY CAN ACCESS THE APP.

| README Links          |      Description          |
| :-------------------- | :-----------------------: |
| [Game mechanics](#game-mechanics)|The rules of the game.|
| [Hosting the game](#hosting-the-game)|How to host and enter the game.|

# Game mechanics
## Stats
Each player has 3 stats. They are the following:

### Health (HP)
Health (or HP) is the amount of health a player has left. Every player starts with 3 Health. You can [Attack](#attacking) players to lower their HP. HP can not be healed. Once a player's HP drops to 0, they join [the Jury](#jury) and are no longer able to interact with other players.

### Action Points (AP)
Action points (or AP) are used to [do everything in this game](#actions). Every player starts with one. You can give AP to other players. Once every in-game day, every alive player gets one more AP. You can also obtain AP through [the Jury](#jury).

### Range
Range is the distance where you can't interact with players further than that distance. Every player's range starts at 2. Range can be [upgraded](#upgrading-your-range). You can see your range as the yellow squares around you.

## Actions
There are 4 actions that are able to do in the game, and they are the following:

### Moving
Moving is changing your position. You are able to move one square in any direction (without the diagonals) per [AP](#action-points-ap).

### Attacking
Attacking is reducing another player's [HP](#health-hp). You can only attack in your [range](#range). You remove one HP from your opponent per [AP](#action-points-ap) used.

### Giving AP
You can give [AP](#action-points-ap) to players in your range. You give 1 AP per AP.

### Upgrading Your Range
You can upgrade your [range](#range). You increase your range by 1 for every 2 [AP](#action-points-ap) used.

## Jury
When a player dies, they join the jury. Everyone in the jury votes every in-game day and when the vote ends, every player with 3+ votes gets one extra [AP](#action-points-ap). If you don't vote, your vote will be wasted.

## Spectating
You can spectate. This means watching the game without being logged in.

# Hosting the game
## Where to host?
You can host it wherever. You can use [heroku](https://www.heroku.com/) or you can host it on your local machine and either port-forward your router or use something like [ngrok](https://ngrok.com/).

## Installing dependencies
The npm scripts are made for Windows 10, they might work on older Windows versions. So from now on I will assume that you are on Windows 10.

### Node JS
The server for the app is written in NodeJS. You can install it [here](https://nodejs.org/en/download/).

### NPM dependencies
Go in the folder where you downloaded/git cloned this repo and type `npm i` in the command line to install the needed dependencies.

### Creating a game
Once you have the needed dependencies, you can create a game. Do this by typing `npm run createGame` and answering the questions.
You need to agree on usernames and passwords with the players beforehand.

### Starting the game
If you want to just host the game type `npm start`.
If you want to modify the server type `npm run devstart` (this uses nodemon).
The web server should be on port 8080 and the websocket server on port 9090.

### Playing the game

Tell the players to go to `<the url of your server>:8080`. Then they can enter their username and password and log in. They can also [spectate](#spectating).