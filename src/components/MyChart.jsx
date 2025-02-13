import React, { useRef, useEffect } from 'react';
import "./mychart.css";
import {createChart} from "@devexperts/dxcharts-lite";
import generateCandlesData from '@devexperts/dxcharts-lite/dist/chart/utils/candles-generator.utils';


const MyChart = ()=>{

    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const pointsRef = useRef([]); // Storing points in a ref to avoid re-renders

    const getpoints = (position) => {
      pointsRef.current = [...pointsRef.current,{ x: position.x, y: position.y }]
      }
    

    const drawTrendLines = (ctx) => {
      for (let i = 0; i < pointsRef.current.length; i++) {
          ctx.beginPath(); // Start a new path
        
          // Draw a circle (dot) at the current point
          ctx.arc(pointsRef.current[i].x, pointsRef.current[i].y, 5, 0, 2 * Math.PI); // Draw a circle with radius 5 at x, y
          ctx.fillStyle = 'red'; // Set the fill color to red
          ctx.fill(); // Fill the circle

          ctx.closePath(); // Close the path
          console.log(i);
        
          // If this is not the last point, draw a line to the next point
          if (i%2===0 && i < pointsRef.current.length - 1) {
            ctx.beginPath();
            ctx.moveTo(pointsRef.current[i].x, pointsRef.current[i].y); // Move to the current point
            ctx.lineTo(pointsRef.current[i + 1].x, pointsRef.current[i + 1].y); // Draw a line to the next point
            ctx.strokeStyle = 'blue'; // Set the stroke color to blue (or any color you want)
            ctx.stroke(); // Actually draw the line
            ctx.closePath();
          }
        }
        
  }

    React.useEffect(()=>{
      const container = document.getElementById('chart_container');
      const chart = createChart(container);
      const candles = generateCandlesData();
      chart.setData({ candles });

      const myc = container.querySelector('[data-element="crossToolCanvas"]')
      console.log(myc)
      canvasRef.current = myc;
       myc.addEventListener("click",(e) =>{
        console.log("on click")
        let ctx = contextRef.current;
        const rect = ctx.canvas.getBoundingClientRect(); // Get canvas position relative to viewport
        const x = e.clientX - rect.left; // Mouse X relative to canvas
        const y = e.clientY - rect.top;  // Mouse Y relative to canvas
        getpoints({x,y});
      }) 
      const context = myc.getContext("2d")
      contextRef.current = context;
      let animationFrameId

      const render = () => {
          console.log("in draw yo")
          drawTrendLines(contextRef.current)
          animationFrameId = window.requestAnimationFrame(render)
        }
          render()
        
        return () => {
          window.cancelAnimationFrame(animationFrameId)
        }

    },[])


    return (
        <>
          <div>
            <p>this is my chart</p>
            <div id="chart_container" ref={canvasRef}>
            </div>
          </div>
        </>
    )
}

export default MyChart;