# tank-tactics
Tank Tactics is an implementation of the game "Tank Turn Tactics" from [this GDC talk](https://youtu.be/t9WMNuyjm4w). I made it as close as possible to the game described in the talk, so I recommend watching it and learning the rules that way. For the people who don't want to do that, I have this guide for them.

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
Range is the distance where you can't interact with players further than that distance. Every player's range starts at 2. Range can be [upgraded](#Upgrading_Range). You can see your range as the yellow squares around you.

## Actions
There are 4 actions that are able to do in the game, and they are the following:

### 🡆 Moving
Moving is changing your position. You are able to move one square in any direction (without the diagonals) per [AP](#action-points-ap).

### ⚔️ Attacking
Attacking is reducing another player's [HP](#health-hp). You can only attack in your [range](#range). You remove one HP from your opponent per [AP](#action-points-ap) used.
# Hosting the game

lorem ipsum