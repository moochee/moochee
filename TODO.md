# TODO
- integrate stickies design in host + play screens (see test-layout-quiz-player.html)
- respond to roundStarted->roundFinished->...->gameFinished in the ui
- consider the time to "scale" the score
- check animations etc. in chrome, edge, firefox, safari
- should participants see the other players?
- try implement both a WebSocket adapter and an HttpRestAdapter, both should work to be "plugged in" without changing the code
- try if using <> works, or understand why it doesn't work

# DONE
- timer/countdown
- display non-animated podium when transitioning to next question
- podium screen: display score
- handle players getting out in middle of the game
- QR code
- list multiple quizzes, select one to host a name
- podium screen, incl. participants with same score share the rank
- integrate with server using web sockets
- try own widget, e.g. post-its or fruits
- evaluate
- present next question
- animated transition
- avatars
- don't only deliver the question - also deliver the 4 possible answers!
- entrance screen (enter name and game id)
- create/host game
- join game
- copy url
- start the quiz after sufficient people joined
- guess the answer