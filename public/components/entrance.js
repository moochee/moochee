"use strict";

function Entrance(props) {
    const [quizzes, setQuizzes] = React.useState([]);

    React.useEffect(async () => {
        //const list = await props.adapter.getQuizzes();
        const list = [
            { id: 1, text: '1'},
            { id: 2, text: '1'},
            { id: 3, text: '1'},
            { id: 4, text: '1'},
            { id: 5, text: '1'},
            { id: 6, text: '1'},
            { id: 7, text: '1'}
        ]
        setQuizzes(list);
    }, []);

    const host = async (quizId) => {
        const gameId = await props.adapter.host(quizId);
        props.onHost(gameId);
    };

    const quizList = quizzes.map((q) => {
        return (
            <StickyCard
                key={q.id}
                onClick={() => host(q.id)}
                text={q.text}
                color="blue"
            />
        );
    });

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <h1>Welcome to the Gorilla Quiz App!</h1>
            <h4>Select one quiz below to host a new game</h4>
            <p />
            <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
                {quizList}
            </div>
        </div>
    );
}
