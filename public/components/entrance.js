'use strict'

Gorilla.Entrance = function (props) {
    const [quizzes, setQuizzes] = React.useState([])

    const colors = ['green', 'blue', 'orange', 'purple']

    React.useEffect(async () => {
        const list = await props.adapter.getQuizzes()
        list.forEach((entry, index) => entry.color = colors[index % 4])
        setQuizzes(list)
    }, [])

    const host = async (quizId, quizTitle) => {
        const gameId = await props.adapter.host(quizId)
        props.onHost(gameId, quizTitle)
    }

    const quizList = quizzes.map((q) => {
        return <Gorilla.StickyCard key={q.id} onClick={() => host(q.id, q.text)} text={q.text} color={q.color} />
    })

    return <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
        <h1>Welcome to the 🦍 Quiz App!</h1>
        <h2>Select a quiz below to host a new game</h2>
        <p />
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            {quizList}
        </div>
    </div>
}
