'use strict'

function Entrance(props) {

    const [quizzes, setQuizzes] = React.useState([])
    
    React.useEffect(async () => {
        const list = await props.adapter.getQuizzes()
        setQuizzes(list)
    }, [])

    const host = async (quizId) => {
        const gameId = await props.adapter.host(quizId)
        props.onHost(gameId)
    }

    const quizList = quizzes.map( q => {
        return <ui5-li key={q.id} onClick={() => host(q.id)} >{q.text}</ui5-li>
    })

    return <div style={{ display: "flex", flexDirection: "column" }}>
        <ui5-title level="H1">Welcome to the Gorilla Quiz App!</ui5-title>
        <ui5-title level="H4">Select one quiz below to host a new game</ui5-title>
        <p />
        <ui5-list header-text="All Quizzes">
            {quizList}
        </ui5-list>
    </div>
}
