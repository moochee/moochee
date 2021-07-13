'use strict'

function Podium(props) {

    const getImg = (player) => {
        switch (player.rank) {
            case 1:
            // return <img style={{ width: "10%" }} src="components/podium/GoldCup.svg" />
            return <div style={{ fontSize: "5em" }}>🥇</div>
            case 2:
            // return <img style={{ width: "10%" }} src="components/podium/SilverCup.svg" />
            return <div style={{ fontSize: "5em" }}>🥈</div>
            case 3:
            // return <img style={{ width: "10%" }} src="components/podium/BronzeCup.svg" />
            return <div style={{ fontSize: "5em" }}>🥉</div>
            default:
                return <div></div>
        }
    }
    const getPlayer = (i) => props.players[i] || { avatar: '' }
    // REVISE make it completely dynamic instead of hard coding 4    
    return <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
        <div className="podiumFirst" style={{ padding: "2%", display: "flex", flexDirection: "row", justifyContent: "center" }}>
            {getImg(getPlayer(0))}
            <div style={{ fontFamily: "komika_textregular", whiteSpace: "nowrap", color: "white", marginLeft: "10px", fontSize: "5em" }}>{getPlayer(0).avatar} {getPlayer(0).name}</div>
        </div>
        <div className="podiumSecond" style={{ padding: "2%", display: "flex", flexDirection: "row", justifyContent: "center" }}>
            {getImg(getPlayer(1))}
            <div style={{ fontFamily: "komika_textregular", whiteSpace: "nowrap", color: "white", marginLeft: "10px", fontSize: "5em" }}>{getPlayer(1).avatar} {getPlayer(1).name}</div>
        </div>
        <div className="podiumThird" style={{ padding: "2%", display: "flex", flexDirection: "row", justifyContent: "center" }}>
            {getImg(getPlayer(2))}
            <div style={{ fontFamily: "komika_textregular", whiteSpace: "nowrap", color: "white", marginLeft: "10px", fontSize: "5em" }}>{getPlayer(2).avatar} {getPlayer(2).name}</div>
        </div>
        <div className="podiumFourth" style={{ padding: "2%", display: "flex", flexDirection: "row", justifyContent: "center" }}>
            {getImg(getPlayer(3))}
            <div style={{ fontFamily: "komika_textregular", whiteSpace: "nowrap", color: "white", marginLeft: "10px", fontSize: "5em" }}>{getPlayer(3).avatar} {getPlayer(3).name}</div>
        </div>
    </div>
}
