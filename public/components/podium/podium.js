'use strict'

function Podium(props) {

    const getImg = (player) => {
        return ['🥇', '🥈', '🥉'][player.rank - 1] || ''
        // const img = ['GoldCup.svg', 'SilverCup.svg', 'BronzeCup.svg']
        // const imgSrc = img[player.rank - 1] ? `components/podium/${img[player.rank - 1]}` : undefined
        // return imgSrc ? <img style={{ width: "10%" }} src={imgSrc}/> : ''
    }

    const getPlayer = (i) => props.players[i] || { avatar: '' }
    // REVISE make it completely dynamic instead of hard coding 4
    return <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
        <div className="podiumFirst" style={{ fontSize: "5em", color: "white", fontFamily: "komika_textregular", padding: "2%", textAlign: "center" }}>
            {getImg(getPlayer(0))} {getPlayer(0).avatar} {getPlayer(0).name}
        </div>
        <div className="podiumSecond" style={{ fontSize: "5em", color: "white", fontFamily: "komika_textregular", padding: "2%", textAlign: "center" }}>
            {getImg(getPlayer(1))} {getPlayer(1).avatar} {getPlayer(1).name}
        </div>
        <div className="podiumThird" style={{ fontSize: "5em", color: "white", fontFamily: "komika_textregular", padding: "2%", textAlign: "center" }}>
            {getImg(getPlayer(2))} {getPlayer(2).avatar} {getPlayer(2).name}
        </div>
        <div className="podiumFourth" style={{ fontSize: "5em", color: "white", fontFamily: "komika_textregular", padding: "2%", textAlign: "center" }}>
            {getImg(getPlayer(3))} {getPlayer(3).avatar} {getPlayer(3).name}
        </div>
    </div>
}
