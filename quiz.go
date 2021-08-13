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
}

type Player struct {
	name  string
	score int
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
}

func (q *Quiz) Join(playerName string) {
	newPlayer := Player{name: playerName, score: 0}
	q.playerList = append(q.playerList, newPlayer)
}
