package main

type QuizQuestion struct {
	question    string
	answers     [4]string
	rightAnswer string
}

type Quiz struct {
	currentQuestion QuizQuestion
	// REVISE try a map instead of an array
	playerList                    []Player
	numberOfplayersWhoHaveGuessed int
	allQuestions                  [7]QuizQuestion
}

type Player struct {
	name  string
	score int
}

func (q *Quiz) Start() {
	q.allQuestions = [7]QuizQuestion{}

	q.allQuestions[0] = QuizQuestion{}
	q.allQuestions[0].question = "Are you in?"
	q.allQuestions[0].answers[0] = "Yes"
	q.allQuestions[0].answers[1] = "No"
	q.allQuestions[0].answers[2] = "Maybe"
	q.allQuestions[0].answers[3] = "I don't know"
	q.allQuestions[0].rightAnswer = "Yes"
	// q.allQuestions[0].question = "..." - before we write like it, but we delete q. as allQuestions doesn't need to belong quize, and we also want to save memory

	q.allQuestions[1] = QuizQuestion{}
	q.allQuestions[1].question = "What does PPO stand for?"
	q.allQuestions[1].answers[0] = "Product Passionate Ownership"
	q.allQuestions[1].answers[2] = "Private Product Ownership"
	q.allQuestions[1].answers[1] = "Passionate Product Ownership"
	q.allQuestions[1].answers[3] = "Potential Product Optimization"
	q.allQuestions[1].rightAnswer = "Passionate Product Ownership"

	q.allQuestions[2] = QuizQuestion{}
	q.allQuestions[2].question = "What is the fundamental principle of PPO?"
	q.allQuestions[2].answers[0] = "Minimize Output - Minimize Outcome"
	q.allQuestions[2].answers[1] = "Maximize Output - Minimize Outcome"
	q.allQuestions[2].answers[2] = "Minimize Output - Maximize Outcome"
	q.allQuestions[2].answers[3] = "Maximize Output - Maximize Outcome"
	q.allQuestions[2].rightAnswer = "Minimize Output - Maximize Outcome"

	q.allQuestions[3] = QuizQuestion{}
	q.allQuestions[3].question = "PPO is meant to..."
	q.allQuestions[3].answers[0] = "Enrich the Development Process"
	q.allQuestions[3].answers[1] = "Embrace the Development Approach"
	q.allQuestions[3].answers[2] = "Extend the Developers' Life"
	q.allQuestions[3].answers[3] = "Embrace the Developers' Vision"
	q.allQuestions[3].rightAnswer = "Enrich the Development Process"

	q.allQuestions[4] = QuizQuestion{}
	q.allQuestions[4].question = "The Opportunity Canvas helps you to have...?"
	q.allQuestions[4].answers[0] = "Careful Observation"
	q.allQuestions[4].answers[1] = "Candid Communication"
	q.allQuestions[4].answers[2] = "Collaborative Argumentation"
	q.allQuestions[4].answers[3] = "Comprehensive Conversation"
	q.allQuestions[4].rightAnswer = "Comprehensive Conversation"

	q.allQuestions[5] = QuizQuestion{}
	q.allQuestions[5].question = "Which element is not part of the Opportunity Canvas?"
	q.allQuestions[5].answers[0] = "Users & Customers"
	q.allQuestions[5].answers[1] = "Solutions Today"
	q.allQuestions[5].answers[2] = "Satisfaction Rating"
	q.allQuestions[5].answers[3] = "Business Benefits & Metrics"
	q.allQuestions[5].rightAnswer = "Satisfaction Rating"

	q.allQuestions[6] = QuizQuestion{}
	q.allQuestions[6].question = "Day 1 was great & I would like to continue with Day2!"
	q.allQuestions[6].answers[0] = "True"
	q.allQuestions[6].answers[1] = "False"
	q.allQuestions[6].rightAnswer = "True"

	q.currentQuestion = q.allQuestions[0]
	q.numberOfplayersWhoHaveGuessed = 0
}

func (q *Quiz) Guess(playerName string, givenAnswer string) {
	for i := 0; i < len(q.playerList); i++ {
		player := &q.playerList[i]
		if player.name == playerName {
			q.GuessByIndex(i, givenAnswer)
		}
	}
}

func GoNextIfAllGuessed() {
	// Option 1: we have a new property hasGuessedInCurrentRound" as part of the Player class,
	//           when a player guesses, we set it to true
	//           then we can go next if all players in playerList have hasGuessedInCurrentRound being true
	// Option 2: we have a new property numberOfPlayersWhoHaveGuessed as part of the Quiz class,
	//           when a player guesses, we increment it by one
	//           then we can go next if the numberOfPlayersWhoHaveGuessed is same than number of players in the playerList

}

func (q *Quiz) GuessByIndex(playerIndex int, givenAnswer string) {
	player := &q.playerList[playerIndex]
	if givenAnswer == q.currentQuestion.rightAnswer {
		player.score = player.score + 100
	}
	q.numberOfplayersWhoHaveGuessed++
	if q.numberOfplayersWhoHaveGuessed == len(q.playerList) {
		q.currentQuestion = q.allQuestions[1]
	}

}

func (q *Quiz) Join(playerName string) {
	newPlayer := Player{name: playerName, score: 0}
	q.playerList = append(q.playerList, newPlayer)
}
