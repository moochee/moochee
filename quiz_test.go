package main

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

func TestQuiz(t *testing.T) {

	// #1 when quiz starts, then one question and 4 answers should be presented
	quiz := Quiz{}

	quiz.Start()

	if quiz.currentQuestion.question == "" {
		t.Error("expected a question")
	}

	if len(quiz.currentQuestion.answers) != 4 {
		t.Error("expected 4 answers")
	}

	// #2 guess wrong answer => 0 points
	if quiz.Guess("No") != 0 {
		t.Error("expected 0 points")
	}

	// #3 guess right answer => 100 points
	if quiz.Guess("Yes") != 100 {
		t.Error("expected 100 points")
	}

	// TODO
	// #4 every second of response time reduces the points by 10%, e.g. after 4 seconds it's 65 seconds (100 * .9 ^ 4)
	// #5 response time is limited to 20 seconds
	// #6 points are accumulated during the quiz
	// #7 the "leaderboard" can be inspected, e.g. who are the top 3 participants
	// #8 changes to the leaderboard can be tracked, e.g. "peter is on a fire" if he climbed consistently during the last questions
	// #9 quiz is over when no more questions
	// DONE
	// #3.1 more questions

	// r := strings.NewReader("test")
	// req := httptest.NewRequest("POST", "/api/requests", r)
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
