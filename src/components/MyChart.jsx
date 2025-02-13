import React from "react";
import "./mychart.css";
import {createChart} from "@devexperts/dxcharts-lite";
import generateCandlesData from '@devexperts/dxcharts-lite/dist/chart/utils/candles-generator.utils';


const MyChart = ()=>{

    React.useEffect(()=>{
        // create chart instance, pass parent container as 1st argument
		const container = document.getElementById('chart_container');
		const chart = createChart(container);
		// create and set candles data
		const candles = generateCandlesData();
        console.log(container);
        console.log(candles);
		chart.setData({ candles });
    },[])


    return (
        <>
          <div>
            <p>this is my chart</p>
            <div id="chart_container">

            </div>
          </div>
        </>
    )
}

export default MyChart;