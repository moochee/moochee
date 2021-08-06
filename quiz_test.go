package main

// TODO
// points are accumulated during the quiz
// quiz is over when no more questions
// every second of response time reduces the points by 10%, e.g. after 4 seconds it's 65 seconds (100 * .9 ^ 4)
// response time is limited to 20 seconds
// the "leaderboard" can be inspected, e.g. who are the top 3 participants
// changes to the leaderboard can be tracked, e.g. "peter is on a fire" if he climbed consistently during the last questions
// DONE
// #3.1 more questions
// players can join the game

import (
	"testing"
)

func TestQuiz(test *testing.T) {
	// when quiz starts, then one question and 4 answers should be presented
	quiz := Quiz{}

	quiz.Start()

	if quiz.currentQuestion.question == "" {
		test.Error("expected a question")
	}

	if len(quiz.currentQuestion.answers) != 4 {
		test.Error("expected 4 answers")
	}

	// player joins => should be added to player list
	quiz.Join("Alice")

	if quiz.playerList[0].name != "Alice" {
		test.Error("expected Alice for the first player")
	}

	quiz.Join("Bob")

	if quiz.playerList[1].name != "Bob" {
		test.Error("expected Bob for the second player")
	}

	// guess wrong answer => 0 points
	quiz.Guess("Alice", "No")
	if quiz.playerList[0].score != 0 {
		test.Error("expected 0 points")
	}

	// guess right answer => 100 points
	quiz.Guess("Bob", "Yes")
	if quiz.playerList[1].score != 100 {
		test.Error("expected 100 points")
	}

	// guess right another time => 100 points more, so 200 in total
	quiz.Guess("Bob", "Yes")
	if quiz.playerList[1].score != 200 {
		test.Error("expected 200 points")
	}
}
