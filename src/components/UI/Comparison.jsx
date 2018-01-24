class Comparison extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			text: '',
			placeholder: 'Add Comparison'
		}
		this.bindCorrectContext();
  }

	bindCorrectContext(){
		this.onChange = this.onChange.bind(this);
		this.onOptionClick = this.onOptionClick.bind(this);
		this.handleKeyPress = this.handleKeyPress.bind(this);
	}

  onChange(event) {
		this.setState({
			text: event.target.value
		});
  }

	onOptionClick() {
		if (!this.props.ciq) { return; }
		if (!this.props.ciq.callbacks.symbolChange) { this.props.ciq.callbacks.symbolChange = this.updateComparisonSeries.bind(this) }
		function getRandomColor() {
			var letters = '0123456789ABCDEF';
			var color = '#';
			for (var i = 0; i < 6; i++) {
				color += letters[Math.floor(Math.random() * 16)];
			}
			return color;
		}

		let seriesParams = {
			isComparison: true,
			color: getRandomColor(),
			data: {
				useDefaultQuoteFeed: true
			}
		}

    let symbolCompare = this.state.text.replace(/\s/g,'').toUpperCase();
    if(symbolCompare && !this.props.comparisons.find(comp=>comp && comp.id===symbolCompare) && symbolCompare!==this.props.symbol){
      this.props.addComparison(symbolCompare, seriesParams)
    }

		this.setState({
			text: ''
		});
  }

	handleKeyPress(event) {
		let key = event.key;
		if (key == 'Enter') {
			this.onOptionClick();
		}
  }

	updateComparisonSeries() {
		if (arguments[0].action == 'remove-series') {
      let stx = arguments[0]
			this.props.removeComparison(stx.symbol)
		}
  }

	render() {
		return (
			<span className="symbol-frame">
				<input onChange={this.onChange} onKeyPress={this.handleKeyPress} id="symbolCompareInput" placeholder={this.state.placeholder} type="text" value={this.state.text} />
				<div className="comparison-btn" onClick={this.onOptionClick}></div>
			</span>
		);
	}
}

module.exports = Comparison;
