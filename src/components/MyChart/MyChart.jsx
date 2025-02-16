import React, { useRef, useEffect } from 'react';
import "./mychart.css";
import { createChart } from "@devexperts/dxcharts-lite";
import generateCandlesData from '@devexperts/dxcharts-lite/dist/chart/utils/candles-generator.utils';
import { getDefaultConfig } from '@devexperts/dxcharts-lite/dist/chart/chart.config';
import { CanvasInputListenerComponent } from '@devexperts/dxcharts-lite/dist/chart/inputlisteners/canvas-input-listener.component';
import EventBus from '@devexperts/dxcharts-lite/dist/chart/events/event-bus';
import { CanvasBoundsContainer } from '@devexperts/dxcharts-lite/dist/chart/canvas/canvas-bounds-container';
import { VisualSeriesPoint } from '@devexperts/dxcharts-lite/dist/chart/model/data-series.model';

const MyChart = () => {

  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const pointsRef = useRef([]); // Storing points in a ref to avoid re-renders
  const isTrendLine = useRef(false);
  const chartRef = useRef(null);
  const canvasInputListenerRef = useRef(null);

  const isDragging = useRef(false);

  const getpoints = (position) => {
    const myp = new VisualSeriesPoint(position.x,position.y);
    pointsRef.current = [...pointsRef.current,myp]
  }


  const drawTrendLines = (ctx) => {
    for (let i = 0; i < pointsRef.current.length; i++) {
      // If this is not the last point, draw a line to the next point

      //const myp = new VisualSeriesPoint(pointsRef.current[i].x,pointsRef.current[i].y);


      if (i % 2 === 0 && i < pointsRef.current.length - 1) {
        //const myp1 = new VisualSeriesPoint(pointsRef.current[i+1].x,pointsRef.current[i+1].y);

        ctx.beginPath();
        ctx.moveTo(pointsRef.current[i].x(chartRef.current.scale), pointsRef.current[i].y(chartRef.current.scale)); // Move to the current point
        ctx.lineTo(pointsRef.current[i+1].x(chartRef.current.scale), pointsRef.current[i+1].y(chartRef.current.scale)); // Draw a line to the next point
        ctx.strokeStyle = 'blue'; // Set the stroke color to blue (or any color you want)
        ctx.stroke(); // Actually draw the line
        ctx.closePath();
      }

      ctx.beginPath(); // Start a new path
      // Draw a circle (dot) at the current point
      // const myp = new VisualSeriesPoint(pointsRef.current[i].x,pointsRef.current[i].y);
      //ctx.arc(pointsRef.current[i].x+originRef.current.origin_x, pointsRef.current[i].y+originRef.current.origin_y, 5, 0, 2 * Math.PI); // Draw a circle with radius 5 at x, y
      ctx.arc(pointsRef.current[i].x(chartRef.current.scale), pointsRef.current[i].y(chartRef.current.scale), 5, 0, 2 * Math.PI); // Draw a circle with radius 5 at x, y
      ctx.fillStyle = 'red'; // Set the fill color to red
      ctx.fill(); // Fill the circle
      ctx.closePath(); // Close the path
      //console.log(i);
    }

  }

  React.useEffect(() => {
    const container = document.getElementById('chart_container');
    const myc1 = container.querySelector('[data-element="crossToolCanvas"]');
    canvasRef.current = myc1;

    // const configWithDisabledAxes = {
    //   components: {
    //     yAxis: {
    //       visible: true, // disable yAxis
    //     },
    //     xAxis: {
    //       visible: true, // disable xAxis
    //     },
    //     // crossTool: {
    //     //   type: 'none', // disable CrossTool
    //     // },
    //   },
    // };
    
    const getdc = getDefaultConfig();

    getdc.rtl = true;

    //console.log(getdc)
    
    const chart = createChart(container,getdc);
    chartRef.current = chart;
    const candles = generateCandlesData();
    chart.setData({ candles });
    chart.enableUserControls();
    chart.setGridVisible(true);

    const customDrawer = {
      draw() {
        const ctx = chart.dynamicObjectsCanvasModel.ctx;
        const series = chart.chartModel.mainCandleSeries.getSeriesInViewport().flat();
        const lastCandle = series[series.length - 1];
        const startCandle = series[0];

        // to get actual coordinates for canvas we need to use scaleModel,
        // since actual coordinates in pixels depends on current zoom level and viewport (scale)
        //console.log(startCandle.x)
        const [x1, y1] = [startCandle.x(chart.scale), startCandle.y(chart.scale)];
        const [x2, y2] = [lastCandle.x(chart.scale), lastCandle.y(chart.scale)];

        ctx.save();
        drawTrendLines(ctx)
        // restore ctx state
        ctx.restore();
      },
      // this methods should return ids of canvases which this drawers uses
      getCanvasIds() {
        return [chart.dynamicObjectsCanvasModel.canvasId];
      },
    };

    chart.drawingManager.addDrawerAfter(customDrawer, 'trendLineDrawer', 'DYNAMIC_OBJECTS');  

    //console.log(chart.hitTestCanvasModel.canvasInputListener)
  
    console.log(chart)

    const context = chart.dynamicObjectsCanvasModel.ctx;
    contextRef.current = context;

  }, [])

  React.useEffect(()=>{
      const container = document.getElementById('chart_container');
      const myc1 = container.querySelector('[data-element="crossToolCanvas"]');

      console.log(myc1);

      if(myc1){
      const eventBus = new EventBus();
      const canvasInputListener = new CanvasInputListenerComponent(eventBus, myc1);
      canvasInputListenerRef.current = canvasInputListener;
      canvasInputListener.doActivate();
      }


      myc1.addEventListener("click", (e) => {
        console.log("clicked")
          if (isTrendLine.current) {
            let c_p = chartRef.current.canvasInputListener.getCurrentMousePoint();
            //console.log(chartRef.current.crosshair.observeCrossToolChanged().observed)
            //console.log(c_p)
            console.log("on click")
            let ctx = contextRef.current;
            const rect = ctx.canvas.getBoundingClientRect(); // Get canvas position relative to viewport
            const scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
            const x = e.clientX - rect.left - scrollLeft; // Mouse X relative to canvas
            const y = e.clientY - rect.top;  // Mouse Y relative to canvas
            getpoints({x,y});
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