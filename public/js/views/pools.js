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
		return {};
	},
	componentDidMount: function() {
		$.ajax({
			url: 'bracket/list',
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState(data);
		}.bind(this),
		error: function(xhr, status, err) {
			console.error(this.props.url, status, err.toString());
		}.bind(this)
	});

	},
	render: function() {
		var playDates;
		if (Object.keys(this.state).length) {
			var poolTL = this.state.pools.find(p => p.id == this.state.top_left_pool_id);
			var poolBL = this.state.pools.find(p => p.id == this.state.bottom_left_pool_id);
			var poolTR = this.state.pools.find(p => p.id == this.state.top_right_pool_id);
			var poolBR = this.state.pools.find(p => p.id == this.state.bottom_right_pool_id);

			playDates = [
				{
					name: 'Open for picking',
					date: this.state.open_date
				},
				{
					name: 'First Round (Day 1)',
					date: this.state.first_round_date_day_1
				},
				{
					name: 'First Round (Day 2)',
					date: this.state.first_round_date_day_2
				},
				{
					name: 'Second Round',
					date: this.state.second_round_date
				},
				{
					name: 'Sweet Sixteen',
					date: this.state.third_round_date
				},
				{
					name: 'Elite Eight',
				},
				{
					name: 'Final Four',
					date: this.state.fifth_round_date
				},
				{
					name: 'Pandimensional Champion',
					date: this.state.sixth_round_date
				}
			].map(function (date, idx, arr) {
				var current = date.date && moment(date.date).diff(moment().startOf('day')) >= 0 && (idx == 0 || moment(arr[idx - 1].date).diff(moment().startOf('day')) < 0);
				return (
					<div className={'playRow ' + (current ? 'current' : '')} key={idx}>
						<div className="dateLabel">{date.name}</div><div className="date">{date.date}</div>
					</div>
				);
			});
		} else {
			playDates = '';
		}

		return (
			<div className="bracket">
				<div className="conferences">
					<div className="column">
						<div className="conference">{poolTL ? poolTL.name : ''}</div>
						<div className="vs">vs</div>
						<div className="conference">{poolBL ? poolBL.name : ''}</div>
					</div>
					<div className="column">
						<div className="vs">vs</div>
					</div>
					<div className="column">
						<div className="conference">{poolTR ? poolTR.name : ''}</div>
						<div className="vs">vs</div>
						<div className="conference">{poolBR ? poolBR.name : ''}</div>
					</div>
				</div>
				<div className="playDates">
					{playDates}
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
				<a href={'bracket/' + this.props.id}>{this.props.name}</a> <span className="bracketDates"> {poolDateString(this.props.open_date, this.props.first_round_date_day_1)}</span> <a href={'bracket/scores/' + this.props.id}>View Scores</a>
			</h2>
		</div>
		);
	}
});

ReactDOM.render(
	<BracketsBox/>,
	document.getElementById('bracketsBox')
);
