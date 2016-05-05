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
