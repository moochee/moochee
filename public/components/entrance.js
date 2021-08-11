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
        return <Gorilla.StickyButton key={q.id} onClick={() => host(q.id, q.text)} text={q.text} color={q.color} />
    })

    return <Gorilla.Shell headerCenter='Welcome to the 🦍 Quiz App!'>
        <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
            <h1>Select a quiz below to host a new game</h1>
            <p />
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                {quizList}
            </div>
        </div>
    </Gorilla.Shell>
}
