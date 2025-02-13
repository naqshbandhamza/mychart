import React, { useRef, useEffect } from 'react'

const Canvas = props => {

    const canvasRef = useRef(null)

    const { draw,getpoints,drawTrendLines, ...rest } = props

    useEffect(() => {
        const mycanvascontainer = document.getElementById("canvas-container");
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        canvas.width = mycanvascontainer.clientWidth;
        canvas.height = mycanvascontainer.clientHeight;
        let animationFrameId

        //Our draw came here
        const render = () => {
            draw(context)
            drawTrendLines(context);
            animationFrameId = window.requestAnimationFrame(render)
        }
        render()
      
      return () => {
        window.cancelAnimationFrame(animationFrameId)
      }

    }, [draw])

    const handleClick = e =>{
        const canvas = canvasRef.current
        let ctx = canvas.getContext('2d')
        const rect = ctx.canvas.getBoundingClientRect(); // Get canvas position relative to viewport
        const x = e.clientX - rect.left; // Mouse X relative to canvas
        const y = e.clientY - rect.top;  // Mouse Y relative to canvas
        getpoints({x,y})
    }

    return <div id="canvas-container" {...rest}><canvas ref={canvasRef} onClick={handleClick}/></div>
}

export default Canvas