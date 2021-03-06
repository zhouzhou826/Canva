## Coding test results - REJECTED

**I am leaving this feedback here so that anybody appearing for the test should know Canva's marking standards. My overall guess of the assessment was that the accessor was asked to fail the assessment whichever way possible. I would be delighted ot hear your comments on my code on amarsh.anand@gmail.com**

Hi Amarsh,

Thank you for your time and interest in the opportunity with Canva.
 
After careful review of your application, I wish to advise that unfortunately we will not be progressing further with your profile, the following feedback was provided:

Correctness:
- Errors are shown, but only the HTTP error, not the message inside the errored response
- Server errors are not caught/shown at all 

> A sample error looks like:
>  
> `Error: Could not play this Tournament : FATAL: Couldnt post /tournament : Bad Request`
> 
> This is sufficient to display on the UI. I dont think display stack trace will be neat.
> 

0 UI is strange at best with three rows

> The specs clearly state to keep the UI simple. I have simple copied what was being given in the spec. Having 3 rows was just an addition from my side, to show how concurrent operations can be carried on without affecting the responsiveness of the UI. It tells me that you have little undertanding of multi-process simulation and the concurrency issues that may arise from it.

Performance:
+ Teams are cached
0 Tracing into a DOM element with .innerHTML

> The spec clearly asks not to use jQuery etc, but pure JS. Also, tracing was not a part of the spec ... it was only there to demonstrate how I think, and was hidden on purpose in the final submission.

- Main thread blocks when using a big number until some calculation is done

> No it doesnt. Run it in parallel, and you would see that all three simulations are running in parallel. Yes, the code blocks at one stage for a round of the torunament, which I have mentioned in my submission, could be mine or server's fault. In 5 hrs, this is all I could achieve, and its a lot.

- Large number brings up the INSUFFICIENT_RESOURCES error

> Yes, because browsers, much like any other software, gets limited resources. And it cries when you ask for more ;)

Code Clarity/Culture:
+ Well commented
+ Tracing is a a nice idea
- No promise chaining used ("aTeam.setTeam().then(()=>resolve(aTeam)).catch((err)=>reject(err));")

> What!! There is only one Promise in this statement! I have used chaining in line 53 on the same file:
>  `Promise.all(matchArray.map((match) => match.run()))
             .then((winningTeams) => {`

- Code structure is a bit confusing - DOM management with custom ID's etc. is almost unreadable

> Its more readbale than your feedback. Read with an attitude of understanding, and not criticising

Architecture:
+ Uses classes
+ Uses Promises
- No UI entity class, even though UI is reused (three rows)

> The specs prohibit using any UI framework. Also, two additional rows were created only to show you the simulation.  

Testability:
+ There is some DI
- The DOM code is almost impossible to test
> Learn to write better test cases. Test cases are written to test code, not the other way round.
- The eventing does not make it easier
> Emiting events is the best way to notify UI of any changes in the underlying model. Entire Angular library is written around it. I repeat - Test cases are written to test code, not the other way round. 

**Parting notes:  Yes the code has flaws, but given that there was a 5hr window in which I had coded it. There are a lot more great things about the code, if you hadn't looked at it from the viewpoint of critisicing it. The code is good enough to invite me for a second round of interview at the least**

## View Demo

https://amarshcanva.herokuapp.com/



# Knockout Tournament

The goal of this task is to simulate a single-elimination knockout tournament in the browser, determining the winner as quickly as possible.

We expect this task will take around 5 hours.

The simulation must implement the following flow:

1. The user enters the teams participating per match (`#teamsPerMatch`).
2. The user enters the number of teams participating in the tournament (a non-zero power of the `#teamsPerMatch` value)
3. The user clicks the start button.
4. The first round's match-ups are fetched from the server.
5. The winner of a match moves on to the next round and matches up against the adjacent winner(s).
6. Matches are simulated until the winning team is determined.
7. The winning team's name is shown in the UI.

Both teams and matches have scores that are constant for the duration of the tournament. To simulate a match:

1. The teams' scores are fetched from the server.
2. The match's score is fetched from the server.
3. All these scores are sent to the server and it returns the winning team's score.
4. In the event of a tie, the team with the lowest ID wins.

### UI Requirements
Please implement the simple UI wireframes outlined below. Minimal styling is acceptable.

Display a square for each match. Completed matches should be filled with a solid colour.
```
■ ■ ■ □ □ □ □
```

When the winner is determined, display it above the squares.

```
Killara Quokkas is the Winner.

■ ■ ■ ■ ■ ■ ■
```

## Constraints

You may:

- Develop only for Chrome
- Use any feature available in the latest stable release of Chrome
- Edit `/etc/hosts`

You must not:

- Hard code the number of teams per match — respect the `#teamsPerMatch` value
- Modify the server or integration tests
- Modify/remove the `#teamsPerMatch`, `#numberOfTeams`, `#start`, or `#winner` elements
- Submit your solution if the test suite is failing
- Use any build tools other than npm (Browserify, webpack, etc.)
- Use any frameworks or libraries (Angular, jQuery, React, etc.)

## Marking Criteria

Your code should be clear and easy to understand:

- Avoids unnecessary complexity / over-engineering
- Brief comments are added where appropriate
- Broken into logical chunks
- Follows a module pattern

Your code should be performant:

- Gives feedback to the user as soon as possible (perceived performance)
- Intelligently coordinates dependent asynchronous tasks
- UI remains responsive

Your code should be testable (but writing tests isn't necessary):

- Application and bootstrap code is split into separate files
- Class-based architecture (ES6 classes preferred)
- Dependency injection (the design pattern, not a framework or library)
- No singletons or static mutable state 

## Running

```
// Node v6+ required
npm install
npm start # Starts the server on port 8765
npm test # Runs the test suite
```

## Server API

### `GET /`

Serves `index.html`.

### `GET /client/*`

Serves resources from the `client` directory.

### `GET /shared/*`

Serves resources from the `shared` directory.

### `POST /tournament`

Creates a tournament and gets the first round's matches.


#### Parameters
| Name            | Type     | Description                                          |
|:----------------|:---------|:-----------------------------------------------------|
| `numberOfTeams` | `number` | Number of teams in the tournament you want to create |
| `teamsPerMatch` | `number` | Number of teams per match                            |

```
$ curl -d numberOfTeams=4&teamsPerMatch=2 http://localhost:8765/tournament
{
  tournamentId: 0,
  matchUps: [{
    match: 0,
    teamIds: [0, 1]
  }, {
    match: 1,
    teamIds: [2, 3]
  }]
}
```

### `GET /team`

Gets team data.

#### Query Parameters
| Name           | Type     | Description  |
|:---------------|:---------|:-------------|
| `tournamentId` | `number` | TournamentID |
| `teamId`       | `number` | Team ID      |

```
$ curl http://localhost:8765/team?tournamentId=0&teamId=0
{
  teamId: 0,
  name: "Camden Wombats",
  score: 8
}
```

### `GET /match`

Gets match data.

#### Query Parameters
| Name           | Type     | Description                         |
|:---------------|:---------|:------------------------------------|
| `tournamentId` | `number` | Tournament ID                       |
| `round`        | `number` | Round of the tournament (0-indexed) |
| `match`        | `number` | Match of the round (0-indexed)      |


```
$ curl http://localhost:8765/match?tournamentId=0&round=0&match=0
{
  score: 67
}
```

### `GET /winner`

Gets the winning score of a match.

#### Query Parameters
| Name           | Type            | Description                      |
|:---------------|:----------------|:---------------------------------|
| `tournamentId` | `number`        | Tournament ID                    |
| `teamScores`   | `Array<number>` | Team scores                      |
| `matchScore`   | `number`        | Score for the match being played |

```
$ curl http://localhost:8765/winner?tournamentId=0&teamScores=8&teamScores=9&matchScore=67
{
  score: 9
}
```
