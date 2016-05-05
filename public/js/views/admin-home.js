var PoolsBox = React.createClass({
	getInitialState: function() {
		return {data: []};
	},
	componentDidMount: function() {
		$.ajax({
			url: 'pool/list',
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({data: data});
			}.bind(this),
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
				<Pool pool={pool} key={pool.id}/>
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
					<a href={'admin/pool/' + this.props.pool.id}>{this.props.pool.name}</a> <span className="dates"> {poolDateString(this.props.pool.open_date, this.props.pool.closing_date)}</span>
				</h2>
			</div>
		);
	}
});

var AddPool = React.createClass({
	render: function() {
		return (
			<a href="admin/pool/add" class="add-new-pool">Add New Pool</a>
		);
	}
});

var BracketsBox = React.createClass({
	getInitialState: function() {
		return {
			brackets: []
		};
	},
	componentDidMount: function() {
		$.ajax({
			url: 'bracket/list',
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({brackets: data});
			}.bind(this),
		});
	},
	render: function() {
		var bracketNodes = this.state.brackets.map(function(bracket) {
			return (
				<Bracket bracket={bracket} key={bracket.id}/>
			);
		});

		return (
		<div>
			<div>
				<a href="admin/bracket/add">Add New Bracket</a>
			</div>
			<div>
				{bracketNodes}
			</div>
		</div>
		);
	}
});

var Bracket = React.createClass({
	render: function() {
		return (
		<div className="bracket">
			<h2>
			<a href={'admin/bracket/' + this.props.bracket.id}>{this.props.bracket.name}</a> <span className="dates"> {poolDateString(this.props.bracket.open_date, this.props.bracket.first_round_date)}</span>
		</h2>
		</div>
		)
	}
});


ReactDOM.render(
	<div>
		<AddPool />
		<PoolsBox/>
		<BracketsBox/>
	</div>
	,
	document.getElementById('poolsBox')
);
