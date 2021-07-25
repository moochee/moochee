package main

// TODO
// players can join the game
// points are accumulated during the quiz
// quiz is over when no more questions
// every second of response time reduces the points by 10%, e.g. after 4 seconds it's 65 seconds (100 * .9 ^ 4)
// response time is limited to 20 seconds
// the "leaderboard" can be inspected, e.g. who are the top 3 participants
// changes to the leaderboard can be tracked, e.g. "peter is on a fire" if he climbed consistently during the last questions
// DONE
// #3.1 more questions

import (
	"testing"
)

type QuizQuestion struct {
	question    string
	answers     [4]string
	rightAnswer string
}

type Quiz struct {
	currentQuestion QuizQuestion
	playerList      [1]string
}

func (q *Quiz) Start() {
	allQuestions := [7]QuizQuestion{}

	allQuestions[0] = QuizQuestion{}
	allQuestions[0].question = "Are you in?"
	allQuestions[0].answers[0] = "Yes"
	allQuestions[0].answers[1] = "No"
	allQuestions[0].answers[2] = "Maybe"
	allQuestions[0].answers[3] = "I don't know"
	allQuestions[0].rightAnswer = "Yes"
	// q.allQuestions[0].question = "..." - before we write like it, but we delete q. as allQuestions doesn't need to belong quize, and we also want to save memory

	allQuestions[1] = QuizQuestion{}
	allQuestions[1].question = "What does PPO stand for?"
	allQuestions[1].answers[0] = "Product Passionate Ownership"
	allQuestions[1].answers[2] = "Private Product Ownership"
	allQuestions[1].answers[1] = "Passionate Product Ownership"
	allQuestions[1].answers[3] = "Potential Product Optimization"
	allQuestions[1].rightAnswer = "Passionate Product Ownership"

	allQuestions[2] = QuizQuestion{}
	allQuestions[2].question = "What is the fundamental principle of PPO?"
	allQuestions[2].answers[0] = "Minimize Output - Minimize Outcome"
	allQuestions[2].answers[1] = "Maximize Output - Minimize Outcome"
	allQuestions[2].answers[2] = "Minimize Output - Maximize Outcome"
	allQuestions[2].answers[3] = "Maximize Output - Maximize Outcome"
	allQuestions[2].rightAnswer = "Minimize Output - Maximize Outcome"

	allQuestions[3] = QuizQuestion{}
	allQuestions[3].question = "PPO is meant to..."
	allQuestions[3].answers[0] = "Enrich the Development Process"
	allQuestions[3].answers[1] = "Embrace the Development Approach"
	allQuestions[3].answers[2] = "Extend the Developers' Life"
	allQuestions[3].answers[3] = "Embrace the Developers' Vision"
	allQuestions[3].rightAnswer = "Enrich the Development Process"

	allQuestions[4] = QuizQuestion{}
	allQuestions[4].question = "The Opportunity Canvas helps you to have...?"
	allQuestions[4].answers[0] = "Careful Observation"
	allQuestions[4].answers[1] = "Candid Communication"
	allQuestions[4].answers[2] = "Collaborative Argumentation"
	allQuestions[4].answers[3] = "Comprehensive Conversation"
	allQuestions[4].rightAnswer = "Comprehensive Conversation"

	allQuestions[5] = QuizQuestion{}
	allQuestions[5].question = "Which element is not part of the Opportunity Canvas?"
	allQuestions[5].answers[0] = "Users & Customers"
	allQuestions[5].answers[1] = "Solutions Today"
	allQuestions[5].answers[2] = "Satisfaction Rating"
	allQuestions[5].answers[3] = "Business Benefits & Metrics"
	allQuestions[5].rightAnswer = "Satisfaction Rating"

	allQuestions[6] = QuizQuestion{}
	allQuestions[6].question = "Day 1 was great & I would like to continue with Day2!"
	allQuestions[6].answers[0] = "True"
	allQuestions[6].answers[1] = "False"
	allQuestions[6].rightAnswer = "True"

	q.currentQuestion = allQuestions[0]
}

func (q *Quiz) Guess(givenAnswer string) int {
	if givenAnswer != q.currentQuestion.rightAnswer {
		return 0
	} else {
		return 100
	}
}

func (q *Quiz) Join(name string) { //<-- function "header", or also called "signature"
	q.playerList[0] = "Alice"
	// q.playerList...
}

func TestQuiz(test *testing.T) {
	// #1 when quiz starts, then one question and 4 answers should be presented
	quiz := Quiz{}

	quiz.Start()

	if quiz.currentQuestion.question == "" {
		test.Error("expected a question")
	}

	if len(quiz.currentQuestion.answers) != 4 {
		test.Error("expected 4 answers")
	}

	// #2 guess wrong answer => 0 points
	if quiz.Guess("No") != 0 {
		test.Error("expected 0 points")
	}

	// #3 guess right answer => 100 points
	if quiz.Guess("Yes") != 100 {
		test.Error("expected 100 points")
	}

	quiz.Join("Alice")

	if quiz.playerList[0] != "Alice" {
		test.Error("expected Alice for the first player")
	}

	// Given quiz
	// When "Alice" joins
	// Then the quiz should have one player with name "Alice"

	// r := strings.NewReader("test")
	// req := httptestest.NewRequest("POST", "/api/requests", r)
	// rr := httptest.NewRecorder()

	// serveApiRequests(rr, req)

	// if rr.Code != 201 {
	// 	t.Error("could not POST the request")
	// }

	// req = httptest.NewRequest("GET", "/api/requests", r)
	// rr = httptest.NewRecorder()

	// serveApiRequests(rr, req)
	// if rr.Code != 200 {
	// 	t.Error("could not GET the requests")
	// }
	// println(rr.Body.String())
	// if rr.Body.String() != "test" {
	// 	t.Error("could not GET the requests")
	// }
}
