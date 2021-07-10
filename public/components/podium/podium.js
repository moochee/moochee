function Podium(props) {
    const getPlayer = (i) => props.players[i] || { avatar: '' }
    return <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", flexDirection: "row" }}>
            <img style={{ width: "5%" }} src="components/podium/GoldCup.svg" />
            <div style={{ marginLeft: "10px", fontSize: "5em" }}>{getPlayer(0).avatar}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
            <img style={{ width: "5%" }} src="components/podium/SilverCup.svg" />
            <div style={{ marginLeft: "10px", fontSize: "5em" }}>{getPlayer(1).avatar}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
            <img style={{ width: "5%" }} src="components/podium/BronzeCup.svg" />
            <div style={{ marginLeft: "10px", fontSize: "5em" }}>{getPlayer(2).avatar}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
            <div style={{ width: "5%" }} />
            <div style={{ marginLeft: "10px", fontSize: "5em" }}>{getPlayer(3).avatar}</div>
        </div>
    </div>
}
