import { createSignal, onMount, createEffect } from "solid-js";
import "./globals.css";

const checks = 4;
const asciiSymbols = {
  "0,1": "|",
  "1,1": "/",
  "1,0": "-",
  "1,-1": "\\",
  "0,-1": "|",
  "-1,1": "/",
  "-1,0": "-",
  "-1,-1": "\\",
  "0,0": ".",
};

function App() {
  const [drawing, setDrawing] = createSignal<boolean>(false);
  const [dimensions, setDimensions] = createSignal({
    characterWidth: 60,
    characterHeight: 30,
    width: 0,
    height: 0,
  });
  const [map, setMap] = createSignal<string[][]>([]);
  const [previousCoordinates, setpreviousCoordinates] =
    createSignal<[number, number]>();
  const [checksTillNextCoordinate, setChecksTillNextCoordinate] =
    createSignal<number>(0);

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

  const getDirection = (
    firstX: number,
    firstY: number,
    secondX: number,
    secondY: number,
  ) => {
    let XDirection = 0;
    let YDirection = 0;

    if (firstX - secondX < 0) XDirection = 1;
    else if (firstX - secondX === 0) XDirection = 0;
    else XDirection = -1;

    if (firstY - secondY < 0) YDirection = 1;
    else if (firstY - secondY === 0) YDirection = 0;
    else YDirection = -1;

    // XDirection = firstX - secondX < 0 ? 1 : -1;
    // YDirection = firstY - secondY < 0 ? -1 : 1;

    console.log(`${XDirection},${YDirection}`);
    return asciiSymbols[
      `${XDirection},${YDirection}` as keyof typeof asciiSymbols
    ];
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
        class="border-[1px] border-white/20 select-none"
        onMouseDown={() => setDrawing(true)}
        onMouseUp={() => setDrawing(false)}
        onMouseLeave={() => setDrawing(false)}
        onBlur={() => setDrawing(false)}
        onMouseOut={() => setDrawing(false)}
        onFocusOut={() => setDrawing(false)}
        onMouseMove={(event) => {
          if (!drawing()) return;
          const { x, y } = getLocation(event.offsetX, event.offsetY);

          if (previousCoordinates() === undefined) {
            if (checksTillNextCoordinate() < checks) {
              setChecksTillNextCoordinate(checksTillNextCoordinate() + 1);
              console.log("Checks lower");

              return;
            }
            console.log("Checks higher");
            setpreviousCoordinates([x, y]);
            return;
          }

          setMap((previous) => {
            const newGrid = previous.map((row) => [...row]);

            const coords = previousCoordinates();
            if (!coords) return previous;

            const [prevX, prevY] = coords;
            if (newGrid[y][x] === " ") {
              newGrid[y][x] = getDirection(prevX, prevY, x, y);

              setpreviousCoordinates();
              setChecksTillNextCoordinate(0);
            }

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
