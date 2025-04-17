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
    characterWidth: 70,
    characterHeight: 30,
    width: 0,
    height: 0,
  });
  const [map, setMap] = createSignal<string[][]>([]);
  const [previousCoordinates, setpreviousCoordinates] =
    createSignal<[number, number]>();
  const [checksTillNextCoordinate, setChecksTillNextCoordinate] =
    createSignal<number>(0);
  const [drawingMode, setDrawingMode] = createSignal<"draw" | "erase">("draw");

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
    <div class="bg-neutral-900 text-neutral-300 font-mono text-base h-dvh flex justify-center items-center">
      <div class="flex gap-2">
        <div
          id="draw-canvas"
          class="border-[1px] border-white/20 select-none"
          onMouseDown={() => {
            setDrawing(true);
            setpreviousCoordinates();
            setChecksTillNextCoordinate(0);
          }}
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
                return;
              }

              setpreviousCoordinates([x, y]);
              return;
            }

            setMap((previous) => {
              const newGrid = previous.map((row) => [...row]);

              const coords = previousCoordinates();
              if (!coords) return previous;

              const [prevX, prevY] = coords;
              if (newGrid[y][x] === " " || drawingMode() === "erase") {
                newGrid[y][x] =
                  drawingMode() === "draw"
                    ? getDirection(prevX, prevY, x, y)
                    : " ";

                setpreviousCoordinates();
                setChecksTillNextCoordinate(0);
              }

              return newGrid;
            });
          }}
        >
          <pre>{renderMap(map())}</pre>
        </div>

        <div class="flex flex-col gap-2">
          <button
            type="button"
            class={`size-10 flex items-center justify-center border-[1px] hover:bg-white/5 cursor-pointer ${drawingMode() === "erase" ? "border-red-500/50" : "border-white/20"}`}
            onClick={() =>
              setDrawingMode(drawingMode() === "draw" ? "erase" : "draw")
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              class={`size-5 ${drawingMode() === "erase" ? "fill-red-500/40" : "fill-white/40"}`}
            >
              <title>Pencil tool</title>
              <path d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.419a4 4 0 0 0-.885 1.343Z" />
            </svg>
          </button>

          <button
            id="submit-button"
            type="button"
            class="size-10 flex items-center justify-center border-[1px] border-white/20 hover:bg-white/5 cursor-pointer"
            onClick={() => {
              async function writeClipboardText(text: string) {
                try {
                  await navigator.clipboard.writeText(text);
                } catch {
                  console.error("Error copying to clipboard");
                }

                const submitButton = document.getElementById("submit-button");
                if (!submitButton) return;

                submitButton.classList.remove("border-white/20");
                submitButton.classList.add(
                  "border-green-500/20",
                  "bg-green-600/20",
                );
              }
              const copyText = map()
                .map((row) => `${row.join("").trimEnd()}`)
                .filter((row) => row !== "")
                .join("\n");
              writeClipboardText(copyText);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              class="size-5 fill-white/40"
            >
              <title>Export</title>
              <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
              <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
            </svg>
          </button>

          <button
            type="button"
            class="size-10 flex items-center justify-center border-[1px] border-white/20 hover:bg-white/5 cursor-pointer"
            onClick={() =>
              setMap(
                Array(dimensions().characterHeight)
                  .fill(null)
                  .map(() => Array(dimensions().characterWidth).fill(" ")),
              )
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              class="size-5 fill-white/40"
            >
              <title>Reset</title>
              <path
                fill-rule="evenodd"
                d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
