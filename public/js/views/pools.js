var PoolsBox = React.createClass({
	getInitialState: function() {
		return {data: []};
	},
	componentDidMount: function() {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	render: function() {
		return (
			<div class="poolsBox">
				<PoolsList data={this.state.data}/>
			</div>
		);
	}
});

var PoolsList = React.createClass({
	render: function() {
		var poolNodes = this.props.data.map(function(pool) {
			return (
				<Pool key={pool.id} pool={pool}/>
			);
		});
		return (
			<div className="poolsList">
				{poolNodes}
			</div>
		);
	}
});

var Pool = React.createClass({
	render: function() {
		return (
			<div className="pool">
				<h2 className="poolName">
					<a href={'pool/' + this.props.pool.id}>{this.props.pool.name}</a> <span className="poolDates"> {poolDateString(this.props.pool.open_date, this.props.pool.closing_date)}</span>
				</h2>
			</div>
		);
	}
});

ReactDOM.render(
	<PoolsBox url="pool/list"/>,
	document.getElementById('poolsBox')
);


var BracketsBox = React.createClass({
	render: function() {
		var bracketNodes = this.props.brackets.map(function(bracket) {
			return (
				<Bracket key={bracket.id} bracket={bracket}/>
			);
		});
		return (
			<div>
				<div class="panel-heading">Brackets</div>

				<div class="panel-body">
					<div id="brackets-list">
						{bracketNodes}
					</div>
				</div>
			</div>
		);
	}
});

var Bracket = React.createClass({
	render: function() {
		return (
			<div className="bracket">
			<h2 className="bracketName">
				<a href={'bracket/' + this.props.bracket.id}>{this.props.bracket.name}</a> <span className="bracketDates"> {poolDateString(this.props.bracket.open_date, this.props.bracket.first_round_date)}</span>
			</h2>
		</div>
		);
	}
});

ReactDOM.render(
	<BracketsBox brackets={globals.brackets}/>,
	document.getElementById('bracketsBox')
);
