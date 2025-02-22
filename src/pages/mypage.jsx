import React,{useRef} from "react";
import Canvas from "../components/Canvas/Canvas";


const MyPage = () => {

    const pointsRef = useRef([]); // Storing points in a ref to avoid re-renders

    const draw = ctx => {
        console.log("in draw yo")
        ctx.fillStyle = 'yellow'
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    }

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

    return (
        <>
            <div>
                <p>ok here</p>
                <Canvas draw={draw} getpoints={getpoints} drawTrendLines={drawTrendLines} style={{ width: "100vw", height: "600px" }} />
            </div>
        </>
    )
}

export default MyPage;