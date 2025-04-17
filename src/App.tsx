import { createSignal, onMount, createEffect } from "solid-js";
import "./globals.css";

function App() {
  const [drawing, setDrawing] = createSignal<boolean>(false);
  const [dimensions, setDimensions] = createSignal({
    characterWidth: 60,
    characterHeight: 30,
    width: 0,
    height: 0,
  });
  const [map, setMap] = createSignal<string[][]>([]);

  onMount(() => {
    setMap(
      Array(dimensions().characterHeight)
        .fill(null)
        .map(() => Array(dimensions().characterWidth).fill(" ")),
    );
  });

  const renderMap = (map: string[][]) => {
    let renderedMap = "";

    for (const column of map) {
      for (const row of column) renderedMap += row;

      renderedMap += "\n";
    }

    return renderedMap;
  };

  const getLocation = (currentX: number, currentY: number) => {
    const { width, height, characterWidth, characterHeight } = dimensions();

    return {
      x: Math.floor(currentX / (width / characterWidth)),
      y: Math.floor(currentY / (height / characterHeight)),
    };
  };

  createEffect(() => {
    onMount(() => {
      const drawDiv = document.getElementById("draw-canvas");
      if (!drawDiv) return;

      setDimensions({
        ...dimensions(),
        width: drawDiv.clientWidth,
        height: drawDiv.clientHeight,
      });
    });
  });

  return (
    <div class="bg-neutral-900 text-neutral-300 font-mono text-base h-dvh flex flex-col justify-center items-center">
      <div
        id="draw-canvas"
        class="p-2 border-[1px] border-white/20 select-none"
        onMouseDown={() => setDrawing(true)}
        onMouseUp={() => setDrawing(false)}
        onMouseLeave={() => setDrawing(false)}
        onBlur={() => setDrawing(false)}
        onMouseOut={() => setDrawing(false)}
        onFocusOut={() => setDrawing(false)}
        onMouseMove={(event) => {
          if (!drawing()) return;

          const { x, y } = getLocation(event.offsetX, event.offsetY);
          setMap((previous) => {
            const newGrid = previous.map((row) => [...row]);
            newGrid[y][x] = ".";

            return newGrid;
          });
        }}
      >
        <pre>{renderMap(map())}</pre>
      </div>
    </div>
  );
}

export default App;
