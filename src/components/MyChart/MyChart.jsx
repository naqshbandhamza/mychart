import React, { useRef, useEffect } from 'react';
import "./mychart.css";
import { createChart } from "@devexperts/dxcharts-lite";
import generateCandlesData from '@devexperts/dxcharts-lite/dist/chart/utils/candles-generator.utils';
import { getDefaultConfig } from '@devexperts/dxcharts-lite/dist/chart/chart.config';
import { VisualSeriesPoint } from '@devexperts/dxcharts-lite/dist/chart/model/data-series.model';
import CustomCrosstoolDrawer from "./drawer";

const MyChart = () => {

  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const pointsRef = useRef([]); // Storing points in a ref to avoid re-renders
  const isTrendLine = useRef(false);
  const chartRef = useRef(null);
  const candlesRef = useRef(null);
  const animationFrameRef = useRef(null);

  const getpoints = (position) => {
    const myp = new VisualSeriesPoint(position.x, position.y);
    pointsRef.current.push(myp);
    drawTrendLines(chartRef.current.dynamicObjectsCanvasModel.ctx)
  }

  const drawTrendLines = (ctx) => {

    for (let i = 0; i < pointsRef.current.length; i++) {

      if (i % 2 === 0 && i < pointsRef.current.length - 1) {
        ctx.beginPath();
        ctx.moveTo(pointsRef.current[i].x(chartRef.current.scale), pointsRef.current[i].y(chartRef.current.scale));
        ctx.lineTo(pointsRef.current[i + 1].x(chartRef.current.scale), pointsRef.current[i + 1].y(chartRef.current.scale));
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

    const chart = createChart(container, getdc);
    chartRef.current = chart;
    const candles_temp = generateCandlesData();
    candlesRef.current = candles_temp;
    chart.setData({ candles: candles_temp });
    chart.setGridVisible(true);

    const customDrawer = {
      draw() {
        const ctx = chart.dynamicObjectsCanvasModel.ctx;
        // if (pointsRef.current.length%2!==0) {
        //   ctx.beginPath();
        //   // ctx.moveTo(pointsRef.current[pointsRef.current.length-1].x(chartRef.current.scale), pointsRef.current[pointsRef.current.length-1].y(chartRef.current.scale));
        //   ctx.moveTo(pointsRef.current[pointsRef.current.length-1].x(chartRef.current.scale), pointsRef.current[pointsRef.current.length-1].y(chartRef.current.scale));
        //   ctx.lineTo(chartRef.current.canvasInputListener.currentPoint.x,chartRef.current.canvasInputListener.currentPoint.y)
        //   ctx.strokeStyle = 'yellow';
        //   ctx.stroke();
        //   ctx.closePath();
        // }
        drawTrendLines(ctx)
      },
      // this methods should return ids of canvases which this drawers uses
      getCanvasIds() {
        return [chart.dynamicObjectsCanvasModel.canvasId];
      },
    };

    const  draw = ()=>{
        const ctx = chart.backgroundCanvasModel.ctx;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
        if (pointsRef.current.length%2!==0) {
          ctx.beginPath();
          // ctx.moveTo(pointsRef.current[pointsRef.current.length-1].x(chartRef.current.scale), pointsRef.current[pointsRef.current.length-1].y(chartRef.current.scale));
          ctx.moveTo(pointsRef.current[pointsRef.current.length-1].x(chartRef.current.scale), pointsRef.current[pointsRef.current.length-1].y(chartRef.current.scale));
          ctx.lineTo(chartRef.current.canvasInputListener.currentPoint.x,chartRef.current.canvasInputListener.currentPoint.y)
          ctx.strokeStyle = 'yellow';
          ctx.stroke();
          ctx.closePath();
        }
        animationFrameRef.current = requestAnimationFrame(draw);
      }

    chart.drawingManager.addDrawerAfter(customDrawer, 'trendLineDrawer', 'DYNAMIC_OBJECTS');

    chart.crossToolComponent.registerCrossToolTypeDrawer(
      'cross-and-labels',
      new CustomCrosstoolDrawer(
        chart.config,
        chart.bounds,
        chart.chartModel,
        chart.paneManager,
      ),
    );

    const context = chart.dynamicObjectsCanvasModel.ctx;
    contextRef.current = context;

   animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

  }, [])

  React.useEffect(() => {
    const container = document.getElementById('chart_container');
    const myc1 = container.querySelector('[data-element="crossToolCanvas"]');

    if (candlesRef.current) {
      myc1.addEventListener("click", (e) => {
        if (isTrendLine.current && chartRef.current.crosshair.observeCrossToolChanged().value!==null) {
          let yop = chartRef.current.chartModel.priceFromY(chartRef.current.crosshair.observeCrossToolChanged().value.y);
          let xop = chartRef.current.chartModel.fromX(chartRef.current.crosshair.observeCrossToolChanged().value.x);
          getpoints({ x: xop, y: yop })

        }
      });
    }

  }, [])

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