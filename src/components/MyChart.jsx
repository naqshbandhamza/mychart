import React, { useRef, useEffect } from 'react';
import "./mychart.css";
import { createChart } from "@devexperts/dxcharts-lite";
import generateCandlesData from '@devexperts/dxcharts-lite/dist/chart/utils/candles-generator.utils';
// import { clipToBounds } from '@devexperts/dxcharts-lite/dist/chart/drawers/data-series.drawer';


const MyChart = () => {

  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const pointsRef = useRef([]); // Storing points in a ref to avoid re-renders
  const isTrendLine = useRef(false);
  const chartRef = useRef(null);

  const getpoints = (position) => {
    pointsRef.current = [...pointsRef.current, { x: position.x, y: position.y }]
  }


  const drawTrendLines = (ctx) => {
    for (let i = 0; i < pointsRef.current.length; i++) {
      // If this is not the last point, draw a line to the next point
      if (i % 2 === 0 && i < pointsRef.current.length - 1) {
        ctx.beginPath();
        ctx.moveTo(pointsRef.current[i].x, pointsRef.current[i].y); // Move to the current point
        ctx.lineTo(pointsRef.current[i + 1].x, pointsRef.current[i + 1].y); // Draw a line to the next point
        ctx.strokeStyle = 'blue'; // Set the stroke color to blue (or any color you want)
        ctx.stroke(); // Actually draw the line
        ctx.closePath();
      }

      ctx.beginPath(); // Start a new path
      // Draw a circle (dot) at the current point
      ctx.arc(pointsRef.current[i].x, pointsRef.current[i].y, 5, 0, 2 * Math.PI); // Draw a circle with radius 5 at x, y
      ctx.fillStyle = 'red'; // Set the fill color to red
      ctx.fill(); // Fill the circle
      ctx.closePath(); // Close the path
      //console.log(i);
    }

  }

  React.useEffect(() => {
    const container = document.getElementById('chart_container');
    const chart = createChart(container);
    chartRef.current = chart;
    const candles = generateCandlesData();
    chart.setData({ candles });
    chart.setChartType("line");

    // const customDrawer = {
    //   draw() {
    //     const ctx = chart.dynamicObjectsCanvasModel.ctx;
    //     const series = chart.chartModel.mainCandleSeries.getSeriesInViewport().flat();
    //     const lastCandle = series[series.length - 1];
    //     const startCandle = series[0];
    //     // to get actual coordinates for canvas we need to use scaleModel,
    //     // since actual coordinates in pixels depends on current zoom level and viewport (scale)
    //     const [x1, y1] = [startCandle.x(chart.scale), startCandle.y(chart.scale)];
    //     const [x2, y2] = [lastCandle.x(chart.scale), lastCandle.y(chart.scale)];
    //     //console.log(startCandle.x)
    //     // below we do some manipulations which modifies ctx state, so we need to save it and restore after drawing
    //     ctx.save();
    //     const bounds = chart.canvasBoundsContainer.getBounds('PANE_CHART');
    //     // clip drawing bounds to chart pane, so it will not be drawn outside of chart pane (on y-axis, for example)
    //     // clipToBounds(ctx, bounds);

    //     ctx.beginPath();
    //     ctx.lineWidth = 3;
    //     ctx.strokeStyle = 'orange';
    //     ctx.fillStyle = 'orange';
    //     // draw line
    //     ctx.moveTo(x1, y1);
    //     ctx.lineTo(x2, y2);
    //     ctx.stroke();
    //     // draw circle on the end of the line
    //     ctx.beginPath();
    //     ctx.arc(x2, y2, 5, 0, 2 * Math.PI);
    //     ctx.fill();
    //     // restore ctx state
    //     ctx.restore();
    //   },
    //   // this methods should return ids of canvases which this drawers uses
    //   getCanvasIds() {
    //     return [chart.dynamicObjectsCanvasModel.canvasId];
    //   },
    // };

    // chart.drawingManager.addDrawerAfter(customDrawer, 'arrowTrendDrawer', 'DYNAMIC_OBJECTS');

    const customDrawer = {
      draw() {
        const ctx = chart.dynamicObjectsCanvasModel.ctx;
        const series = chart.chartModel.mainCandleSeries.getSeriesInViewport().flat();
        const lastCandle = series[series.length - 1];
        const startCandle = series[0];
        // to get actual coordinates for canvas we need to use scaleModel,
        // since actual coordinates in pixels depends on current zoom level and viewport (scale)
        const [x1, y1] = [startCandle.x(chart.scale), startCandle.y(chart.scale)];
        const [x2, y2] = [lastCandle.x(chart.scale), lastCandle.y(chart.scale)];
        //console.log(startCandle.x)
        // below we do some manipulations which modifies ctx state, so we need to save it and restore after drawing
        ctx.save();
        // const bounds = chart.canvasBoundsContainer.getBounds('PANE_CHART');
        // clip drawing bounds to chart pane, so it will not be drawn outside of chart pane (on y-axis, for example)
        // clipToBounds(ctx, bounds);

        // ctx.beginPath();
        // ctx.lineWidth = 3;
        // ctx.strokeStyle = 'orange';
        // ctx.fillStyle = 'orange';
        // // draw line
        // ctx.moveTo(x1, y1);
        // ctx.lineTo(x2, y2);
        // ctx.stroke();
        // // draw circle on the end of the line
        // ctx.beginPath();
        // ctx.arc(x2, y2, 5, 0, 2 * Math.PI);
        // ctx.fill();

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

    const myc1 = container.querySelector('[data-element="crossToolCanvas"]');
    const myc = container.querySelector('[data-element="dynamicObjectsCanvas"]');
    canvasRef.current = myc;
    myc1.addEventListener("click", (e) => {
      if (isTrendLine.current) {
        console.log("on click")
        let ctx = contextRef.current;
        const rect = ctx.canvas.getBoundingClientRect(); // Get canvas position relative to viewport
        const x = e.clientX - rect.left; // Mouse X relative to canvas
        const y = e.clientY - rect.top;  // Mouse Y relative to canvas
        getpoints({ x, y });
      }
    })
    
    const context = chart.dynamicObjectsCanvasModel.ctx;
    contextRef.current = context;
    let animationFrameId

    const render = () => {
      console.log("in draw yo")
      //drawTrendLines(contextRef.current)
      animationFrameId = window.requestAnimationFrame(render)
    }
    render()

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }

  }, [])


  return (
    <>
      <div>
        <p>this is my chart</p>
        <button onClick={(e) => {
          isTrendLine.current = !isTrendLine.current;
        }}>toggle trendlines</button>
        <div id="chart_container" ref={canvasRef}>
        </div>
      </div>
    </>
  )
}

export default MyChart;