'use strict'

Gorilla.Entrance = function (props) {
    const [quizzes, setQuizzes] = React.useState([])

    const colors = ['green', 'blue', 'orange', 'purple']

    React.useEffect(async () => {
        const list = await props.adapter.getQuizzes()
        list.forEach((entry, index) => entry.color = colors[index % 4])
        setQuizzes(list)
    }, [])

    const host = async (quizId) => {
        const gameId = await props.adapter.host(quizId)
        props.onHost(gameId)
    }

    const quizList = quizzes.map((q) => {
        return <Gorilla.StickyCard key={q.id} onClick={() => host(q.id)} text={q.text} color={q.color} />
    })

    return <div style={{ fontFamily: 'komika_textregular', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
        <h1>Welcome to the 🦍 Quiz App!</h1>
        <h4>Select one quiz below to host a new game</h4>
        <p />
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            {quizList}
        </div>
    </div>
}
