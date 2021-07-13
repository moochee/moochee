'use strict'

function Podium(props) {
    const getPlayer = (i) => props.players[i] || { avatar: '' }
    return <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
        <div className="podiumFirst" style={{ padding: "2%", display: "flex", flexDirection: "row", justifyContent: "center" }}>
            {/* <img style={{ width: "10%" }} src="components/podium/GoldCup.svg" /> */}
            <div style={{ fontSize: "5em" }}>🥇</div>
            <div style={{ fontFamily: "komika_textregular", whiteSpace: "nowrap", color: "white", marginLeft: "10px", fontSize: "5em" }}>{getPlayer(0).avatar}</div>
        </div>
        <div className="podiumSecond" style={{ padding: "2%", display: "flex", flexDirection: "row", justifyContent: "center" }}>
            {/* <img style={{ width: "10%" }} src="components/podium/SilverCup.svg" /> */}
            <div style={{ fontSize: "5em" }}>🥈</div>
            <div style={{ fontFamily: "komika_textregular", whiteSpace: "nowrap", color: "white", marginLeft: "10px", fontSize: "5em" }}>{getPlayer(1).avatar}</div>
        </div>
        <div className="podiumThird" style={{ padding: "2%", display: "flex", flexDirection: "row", justifyContent: "center" }}>
            {/* <img style={{ width: "10%" }} src="components/podium/BronzeCup.svg" /> */}
            <div style={{ fontSize: "5em" }}>🥉</div>
            <div style={{ fontFamily: "komika_textregular", whiteSpace: "nowrap", color: "white", marginLeft: "10px", fontSize: "5em" }}>{getPlayer(2).avatar}</div>
        </div>
        <div className="podiumFourth" style={{ padding: "2%", display: "flex", flexDirection: "row", justifyContent: "center" }}>
            <div style={{ width: "10%" }} />
            <div style={{ fontFamily: "komika_textregular", whiteSpace: "nowrap", color: "white", marginLeft: "10px", fontSize: "5em" }}>{getPlayer(3).avatar}</div>
        </div>
    </div>
}
