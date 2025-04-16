import { /* createEffect, */ createSignal } from "solid-js";
import "./globals.css";

function App() {
  const [drawing, setDrawing] = createSignal<boolean>(false);
  const [dimensions, setDimensions] = createSignal({
    characterWidth: 30,
    characterHeight: 10,
    width: 0,
    height: 0,
  });
  const [map, _setMap] = createSignal<string[][]>(
    Array(dimensions().characterHeight)
      .fill(".")
      .map(() => Array(dimensions().characterWidth).fill(" ")),
  );

  const renderMap = (map: string[][]) => {
    let renderedMap = "";

    for (const column of map) {
      for (const row of column) renderedMap += row;

      renderedMap += "\n";
    }

    return renderedMap;
  };

  // createEffect(() => {
  //   const drawDiv = document.getElementById("draw-canvas");
  //   if (!drawDiv) return;

  //   setDimensions({
  //     ...dimensions(),
  //     width: drawDiv.clientWidth,
  //     height: drawDiv.clientHeight,
  //   });

  //   console.log(dimensions());
  // });

  return (
    <div class="bg-neutral-900 text-neutral-300 font-mono text-base h-dvh flex flex-col justify-center items-center">
      <h1 class="text-5xl text-blue-400">Vite + Solid</h1>

      <div
        id="draw-canvas"
        class="p-2 border-[1px] border-white select-none"
        on:keydown={() => setDrawing(true)}
        on:keyup={() => setDrawing(false)}
        on:mouseleave={() => setDrawing(false)}
        on:focusout={() => setDrawing(false)}
        on:mouseover={(_event) => {
          if (!drawing()) return;
        }}
      >
        <pre>{renderMap(map())}</pre>
      </div>
    </div>
  );
}

export default App;
