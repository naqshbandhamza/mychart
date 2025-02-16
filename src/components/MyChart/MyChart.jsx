import React, { useRef, useEffect } from 'react';
import "./mychart.css";
import { createChart } from "@devexperts/dxcharts-lite";
import generateCandlesData from '@devexperts/dxcharts-lite/dist/chart/utils/candles-generator.utils';
import { getDefaultConfig } from '@devexperts/dxcharts-lite/dist/chart/chart.config';
//import { CanvasInputListenerComponent } from '@devexperts/dxcharts-lite/dist/chart/inputlisteners/canvas-input-listener.component';
//import EventBus from '@devexperts/dxcharts-lite/dist/chart/events/event-bus';
import { CanvasBoundsContainer } from '@devexperts/dxcharts-lite/dist/chart/canvas/canvas-bounds-container';

const MyChart = () => {

  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const pointsRef = useRef([]); // Storing points in a ref to avoid re-renders
  const isTrendLine = useRef(false);
  const chartRef = useRef(null);
  const originRef = useRef({origin_x:0,origin_y:0})
  const canvasInputListenerRef = useRef(null);

  const isDragging = useRef(false);
  let prevX = useRef(0), prevY = useRef(0);

  const getpoints = (position) => {
    pointsRef.current = [...pointsRef.current, { x: position.x, y: position.y }]
  }


  const drawTrendLines = (ctx) => {
    for (let i = 0; i < pointsRef.current.length; i++) {
      // If this is not the last point, draw a line to the next point
      if (i % 2 === 0 && i < pointsRef.current.length - 1) {
        ctx.beginPath();
        ctx.moveTo(pointsRef.current[i].x+originRef.current.origin_x, pointsRef.current[i].y+originRef.current.origin_y); // Move to the current point
        ctx.lineTo(pointsRef.current[i + 1].x+originRef.current.origin_x, pointsRef.current[i + 1].y+originRef.current.origin_y); // Draw a line to the next point
        ctx.strokeStyle = 'blue'; // Set the stroke color to blue (or any color you want)
        ctx.stroke(); // Actually draw the line
        ctx.closePath();
        //drawLine(ctx,pointsRef.current[i].x+originRef.current.origin_x, pointsRef.current[i].y+originRef.current.origin_y,pointsRef.current[i + 1].x+originRef.current.origin_x, pointsRef.current[i + 1].y+originRef.current.origin_y,1)
      }

      ctx.beginPath(); // Start a new path
      // Draw a circle (dot) at the current point
      ctx.arc(pointsRef.current[i].x+originRef.current.origin_x, pointsRef.current[i].y+originRef.current.origin_y, 5, 0, 2 * Math.PI); // Draw a circle with radius 5 at x, y
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
    //console.log({candles})
    //chart.setChartType("line");
    chart.setCrossToolVisible("none");
    chart.enableUserControls();
    chart.setGridVisible(false);

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

    console.log(chart.hitTestCanvasModel.canvasInputListener)
  
    console.log(chart)





    const context = chart.dynamicObjectsCanvasModel.ctx;
    contextRef.current = context;

  }, [])

  React.useEffect(()=>{

    if(canvasRef.current){      

      
      // originRef.current = {
      //   origin_x:canvasRef.current.width/2,
      //   origin_y:canvasRef.current.height/2
      // }
  
      //console.log(originRef.current)

      //const eventBus = new EventBus();
      //const canvasInputListener = new CanvasInputListenerComponent(eventBus, canvasRef.current);
      //canvasInputListenerRef.current = canvasInputListener;
      //canvasInputListener.doActivate();

      const container = document.getElementById('chart_container');
      const myc1 = container.querySelector('[data-element="crossToolCanvas"]');


      myc1.addEventListener("click", (e) => {
        console.log("clicked")
          if (isTrendLine.current) {
            console.log("on click")
            let ctx = contextRef.current;
            const rect = ctx.canvas.getBoundingClientRect(); // Get canvas position relative to viewport
            const x = e.clientX - rect.left; // Mouse X relative to canvas
            const y = e.clientY - rect.top;  // Mouse Y relative to canvas
            getpoints({x,y});
          }
        });
      

    //   myc1.addEventListener("mousedown", (event) => {
    //       isDragging.current = true;
    //       prevX.current = event.offsetX;
    //       prevY.current = event.offsetY;
    //   });

    //   myc1.addEventListener("mousemove", (event) => {
    //     if (!isDragging.current) return;
    
    //     let currentX = event.offsetX;
    //     let currentY = event.offsetY;

    //     //this.origin_x = this.sketch.mouseX + (this.origin_x - this.sketch.pmouseX)
    //     //this.origin_y = this.sketch.mouseY + (this.origin_y - this.sketch.pmouseY)

    //     originRef.current.origin_x = currentX + (originRef.current.origin_x - prevX.current);
    //     originRef.current.origin_y = currentY + (originRef.current.origin_y - prevY.current);
        
    //     // Update previous coordinates
    //     prevX.current = currentX;
    //     prevY.current = currentY;
    // });
    
    // myc1.addEventListener("mouseup", () => {
    //     isDragging.current = false;
    // });
    
    // myc1.addEventListener("mouseleave", () => {
    //     isDragging.current = false;
    // });
    }

    return () => {
      
    };

  },[canvasRef])

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