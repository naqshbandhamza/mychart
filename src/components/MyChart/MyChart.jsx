import React, { useRef, useEffect } from 'react';
import "./mychart.css";
import { createChart } from "@devexperts/dxcharts-lite";
import generateCandlesData from '@devexperts/dxcharts-lite/dist/chart/utils/candles-generator.utils';
import { getDefaultConfig } from '@devexperts/dxcharts-lite/dist/chart/chart.config';
import { CanvasInputListenerComponent } from '@devexperts/dxcharts-lite/dist/chart/inputlisteners/canvas-input-listener.component';
import EventBus from '@devexperts/dxcharts-lite/dist/chart/events/event-bus';
import { VisualSeriesPoint } from '@devexperts/dxcharts-lite/dist/chart/model/data-series.model';

const MyChart = () => {

  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const pointsRef = useRef([]); // Storing points in a ref to avoid re-renders
  const isTrendLine = useRef(false);
  const chartRef = useRef(null);
  const canvasInputListenerRef = useRef(null);

  const getpoints = (position) => {
    const myp = new VisualSeriesPoint(position.x,position.y);
    console.log(myp);
    pointsRef.current.push(myp);
  }


  const drawTrendLines = (ctx) => {
    for (let i = 0; i < pointsRef.current.length; i++) {

      if (i % 2 === 0 && i < pointsRef.current.length - 1) {
        ctx.beginPath();
        ctx.moveTo(pointsRef.current[i].x(chartRef.current.scale), pointsRef.current[i].y(chartRef.current.scale));
        ctx.lineTo(pointsRef.current[i+1].x(chartRef.current.scale), pointsRef.current[i+1].y(chartRef.current.scale)); 
        ctx.strokeStyle = 'blue'; 
        ctx.stroke(); 
        ctx.closePath();
      }

      ctx.beginPath(); 
      ctx.arc(pointsRef.current[i].x(chartRef.current.scale), pointsRef.current[i].y(chartRef.current.scale), 5, 0, 2 * Math.PI); // Draw a circle with radius 5 at x, y
      ctx.fillStyle = 'red'; 
      ctx.fill(); 
      ctx.closePath(); 
    }

  }

  React.useEffect(() => {
    const container = document.getElementById('chart_container');
    const myc1 = container.querySelector('[data-element="crossToolCanvas"]');
    canvasRef.current = myc1;
    
    const getdc = getDefaultConfig();
    getdc.rtl = true;

    const chart = createChart(container,getdc);
    chartRef.current = chart;
    const candles = generateCandlesData();
    chart.setData({ candles });
    console.log({candles})
    chart.enableUserControls();
    chart.setGridVisible(true);


    const customDrawer = {
      draw() {
        const ctx = chart.dynamicObjectsCanvasModel.ctx;
        //const series = chart.chartModel.mainCandleSeries.getSeriesInViewport().flat();
        //const lastCandle = series[series.length - 1];
        //const startCandle = series[0];
        // to get actual coordinates for canvas we need to use scaleModel,
        // since actual coordinates in pixels depends on current zoom level and viewport (scale)
        //const [x1, y1] = [startCandle.x(chart.scale), startCandle.y(chart.scale)];
        //const [x2, y2] = [lastCandle.x(chart.scale), lastCandle.y(chart.scale)];

        ctx.save();
        drawTrendLines(ctx)
        ctx.restore();
      },
      // this methods should return ids of canvases which this drawers uses
      getCanvasIds() {
        return [chart.dynamicObjectsCanvasModel.canvasId];
      },
    };

    chart.drawingManager.addDrawerAfter(customDrawer, 'trendLineDrawer', 'DYNAMIC_OBJECTS');

    const context = chart.dynamicObjectsCanvasModel.ctx;
    contextRef.current = context;

  }, [])

  React.useEffect(()=>{
      const container = document.getElementById('chart_container');
      const myc1 = container.querySelector('[data-element="crossToolCanvas"]');

      const candles = generateCandlesData();


      // Get min/max for `timestamp` and `close`
    let minTimestamp = Math.min(...candles.map(item => item.timestamp));
    let maxTimestamp = Math.max(...candles.map(item => item.timestamp));
    let minClose = Math.min(...candles.map(item => item.close));
    let maxClose = Math.max(...candles.map(item => item.close));

    console.log(minTimestamp,maxTimestamp);
    console.log(minClose,maxClose);

      //console.log(myc1);

      if(myc1){
      const eventBus = new EventBus();
      const canvasInputListener = new CanvasInputListenerComponent(eventBus, myc1);
      canvasInputListenerRef.current = canvasInputListener;
      canvasInputListener.doActivate();
      }


      myc1.addEventListener("click", (e) => {

        // Calculate scale factors
        let scaleX = (maxTimestamp - minTimestamp) / canvasRef.current.width;
        let scaleY = (maxClose - minClose) / canvasRef.current.height;

        console.log("clicked")
          if (isTrendLine.current) {
            //let c_p = chartRef.current.canvasInputListener.getCurrentPoint();
            //console.log(chartRef.current.crosshair.observeCrossToolChanged().observed)
            //console.log(c_p)
            //const timestamp = minTimestamp + (c_p.x * scaleX);
            //const close = maxClose - (c_p.y * scaleY);  // Invert y-axis to match typical graph behavior
            //console.log(`Timestamp: ${timestamp}, Close: ${close}`);

            let ctx = contextRef.current;
            const rect = ctx.canvas.getBoundingClientRect(); // Get canvas position relative to viewport
            const scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
            const x = e.clientX - rect.left - scrollLeft; // Mouse X relative to canvas
            const y = e.clientY - rect.top;  // Mouse Y relative to canvas
            // getpoints(c_p);
            console.log({x,y})
            getpoints({x,y})
          }
        });

  },[])

  return (
    <>
      <div>
        <p>this is my chart</p>
        <button onClick={(e) => {
          isTrendLine.current = !isTrendLine.current;
        }}>toggle trendlines</button>
        <div id="chart_container">
        </div>
      </div>
    </>
  )
}

export default MyChart;