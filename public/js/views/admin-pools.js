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
				<Pool name={pool.name} key={pool.id} id={pool.id}/>
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
					<a href={'pool/' + this.props.id}>{this.props.name}</a>
				</h2>
			</div>
		);
	}
});

var AddPool = React.createClass({
	render: function( ){
		<a href="#" class="add-new-pool">Add New Pool</a>
	};
});

ReactDOM.render(
	<AddPool />
	<PoolsBox url="pool/list"/>,
	document.getElementById('poolsBox')
);
