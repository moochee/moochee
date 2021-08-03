'use strict'

function StickyCard(props) {
	const [stickyClass, setStickyClass] = React.useState('stickyCard')

	const click = () => {
		setStickyClass('stickyCard stickyThrowAway')
		props.onClick()
	}

	const img = `components/sticky/sticky-${props.color}.svg`

	return <div onClick={click} className={stickyClass} >
		<img src={img}></img>
		<div className="textField">
			{props.text}
		</div>
	</div>
}
