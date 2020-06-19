
[luke.b@rlow.org.uk]
# X's and O's
![Image of game board](https://github.com/RedOrigins/ccc-xs-and-os/blob/master/src/image.png)
## NB. Things I'm not sure about

There's a few things in relation to this challenge that I've done, but am not sure if they are required or things that I haven't done, that I don't know if they are. These are the main ones that I know of:
* The flag and port are currently being passed as an environment variables.
* Ratelimited. Is this required? If not, what other measures could I take to prevent large numbers of connections from a single player if this is required?
* Build version probably requires some setup to work properly at some scale, not sure how much of this I need to do.
## Flag
Flag: w41T_Y0ur_TurN
## Briefing
Win the game, get the flag. Simple, right?
By Red.
## Infrastructure
The challenge all runs on a nodejs server running express and socketio. No files are required to be downloaded, though web pages will need to be served by said server.
There are a few things which could be set via environment variables. These can also be put directly into the program is required.
### Build Instructions
`npm i` followed by `node server.js`
## Risks
Given a large number of concurrent users, the memory footprint could grow to be quite large, so I have put in the option to limit this should it be an issue.
Someone could also open a large number of connections to the server, this could effectively block all other users from accessing the challenge. I've put express-rate-limiter onto the app, though I'm not too sure about the configuration of that one, so I've just left it at the default for now.
## Walkthrough
1) A student will attempt to play the game, and lose/draw. (Perhaps 1-3 times)
2) The student will see that they cannot win by playing, then find their way to the javascript network logic.
3) The student will see that, when taking their turn, a request is sent to the server containing the piece (x or o) and the tile.
4) The student will attempt to send a request on behalf of the computer player (probably by editing in the browser with the console)
5) There is a chance that they may be able to complete the challenge here, but I have found that to be fairly challenging due to the time restrictions.
Note: The challenge solution comes down to playing the moves of the other player. There is a two second delay between the player taking their turn and the ai taking their next. By default, the client will prevent the player from taking their next turn until the ai has taken theirs, though clearly this can be bypassed. If the player has not won the game within the two seconds it takes for the ai to take their next turn, it can lead to some slightly strange behaviour, making the challenge rather difficult to complete in this way.
6) There are a few ways that you could go about doing this final step (javascript injection, writing it all out in the console etc..) but the way I would consider 'ideal' would be to create a node app or web page running the socketio client, connecting to the server directly, then imitating the official page, winning the game within those two seconds, getting the flag.
Note: I have included my solution within the build folder.
## Suggested Hint
You can't win by playing the game, but winning is the key to success here. A good starting point would be looking at what happens when you take your turn.
### Difficulty
Easy ( /Medium ? )
