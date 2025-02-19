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
  const mouseRef = useRef(null);

  const getpoints = (position) => {
    const myp = new VisualSeriesPoint(position.x, position.y);
    pointsRef.current.push(myp);
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
      } else {
        if (pointsRef.current.length%2!==0 && i===pointsRef.current.length-1) {
          ctx.beginPath();
          ctx.moveTo(pointsRef.current[i].x(chartRef.current.scale), pointsRef.current[i].y(chartRef.current.scale));
          ctx.lineTo(chartRef.current.canvasInputListener.getCurrentPoint().x,chartRef.current.canvasInputListener.getCurrentPoint().y)
          ctx.strokeStyle = 'yellow';
          ctx.stroke();
          ctx.closePath();
        }
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

  }, [])

  React.useEffect(() => {
    const container = document.getElementById('chart_container');
    const myc1 = container.querySelector('[data-element="crossToolCanvas"]');

    if (candlesRef.current) {

      // Capture mouse movement on the canvas
      // myc1.addEventListener('mousemove', (event) => {
      //   const rect = myc1.getBoundingClientRect();
      //   const x = event.clientX - rect.left;
      //   const y = event.clientY - rect.top;
      //   mouseRef.current = {
      //     x, y
      //   }
      // });

      myc1.addEventListener("click", (e) => {

        console.log("clicked")
        if (isTrendLine.current && chartRef.current.crosshair.observeCrossToolChanged().value!==null) {
          let yop = chartRef.current.chartModel.priceFromY(chartRef.current.crosshair.observeCrossToolChanged().value.y);
          let xop = chartRef.current.chartModel.fromX(chartRef.current.crosshair.observeCrossToolChanged().value.x);
          //console.log(yop)
          //console.log(xop)
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