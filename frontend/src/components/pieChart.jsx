import React, { Component } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';
//var CanvasJSReact = require('@canvasjs/react-charts');
 
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
 
class PieChartComponent extends Component {	
	render() {
		const options = {
			animationEnabled: true,
			exportEnabled: false,
      backgroundColor: "transparent",
      explodeOnClick: true,
      
			/* title:{
				text: this.props.title,
        fontSize: 20,
        fontWeight: "bold",
        color: "#000000"
			}, */
			data: [{
				type: "pie",
				indexLabel: "{y}₪",		
				startAngle: -90,
        colorSet: ["#22222", "#00C49F", "#FFBB28"],
				dataPoints: this.props.data
			}]
		}
		
		return (
		<div>
			<CanvasJSChart options = {options} />
		</div>
		);
	}
}
 
export default PieChartComponent;  