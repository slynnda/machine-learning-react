var React = require('react')
var _ = require('lodash')

console.log("working")

var HelloWorld = React.createClass({
    render: function() {
        return (<div>Hello {this.props.personsName}</div>)
    }
})


React.render(<HelloWorld personsName="Sophia"></HelloWorld>, document.getElementById("react-here"))