var PoolsBox = React.createClass({
	getInitialState: function() {
		return {data: []};
	},
	componentDidMount: function() {
		$.ajax({
			url: "pool/list",
			dataType: 'json',
			cache: false,
			success: function(data) {
				data.forEach(function (pool) {
					pool.status = poolDateStatus(pool.open_date, pool.closing_date);
				});
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
				<PoolSection title="Upcoming" titleClass="upcoming" list={this.state.data.filter(function (pool) {return pool.status == -1;})}/>
				<PoolSection title="Voting!" titleClass="voting" list={this.state.data.filter(function (pool) {return pool.status == 0;})}/>
				<PoolSection title="Complete" titleClass="complete" list={this.state.data.filter(function (pool) {return pool.status == 1;})}/>
			</div>
		);
	}
});

var PoolSection = React.createClass({
	render: function () {
		return (
			<div className={'poolSection ' + this.props.titleClass}>
				<div className="poolSectionTitle h4">{this.props.title}</div>
				<PoolsList data={this.props.list}/>
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
				<div className="poolName">
					<a href={'pool/' + this.props.pool.id} className="h4">{this.props.pool.name} <span className="poolDates"> {poolDateStringFromPool(this.props.pool)}</span></a>
				</div>
			</div>
		);
	}
});

ReactDOM.render(
	<PoolsBox/>,
	document.getElementById('poolsBox')
);


var BracketsBox = React.createClass({
	getInitialState: function() {
		return {brackets: []};
	},
	componentDidMount: function() {
		$.ajax({
			url: 'bracket/list',
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({brackets: data});
		}.bind(this),
		error: function(xhr, status, err) {
			console.error(this.props.url, status, err.toString());
		}.bind(this)
	});

	},
	render: function() {
		var bracketNodes = this.state.brackets.map(function(bracket) {
			return (
				<Bracket key={bracket.id} bracket={bracket}/>
			);
		});
		return (
			<div id="brackets-list">
				{bracketNodes}
			</div>
		);
	}
});

var Bracket = React.createClass({
	render: function() {
		return (
			<div className="bracket">
			<h2 className="bracketName">
				<a href={'bracket/' + this.props.bracket.id}>{this.props.bracket.name}</a> <span className="bracketDates"> {poolDateString(this.props.bracket.open_date, this.props.bracket.first_round_date)}</span> <a href={'bracket/scores/' + this.props.bracket.id}>View Scores</a>
			</h2>
		</div>
		);
	}
});

ReactDOM.render(
	<BracketsBox/>,
	document.getElementById('bracketsBox')
);
