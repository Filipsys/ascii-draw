import { createSignal } from "solid-js";
import "./globals.css";

const dimensions = {
  width: 30,
  height: 10
}
function App() {
  const [map, setMap] = createSignal<string[][]>(Array(dimensions.height).fill(".").map(() => Array(dimensions.width).fill(".")));
  

  const renderMap = (map: string[][]) => {
    let renderedMap = "";

    for (const column of map) {
      for (const row of column) renderedMap += row;

      renderedMap += "\n";
    }

    return renderedMap;
  }

  return (
    <div class="bg-neutral-900 text-neutral-300 font-mono text-base h-dvh flex flex-col justify-center items-center">
      <h1 class="text-5xl text-blue-400">Vite + Solid</h1>

      <div class="p-2 border-[1px] border-white">
        <pre>
        {renderMap(map())}
        </pre>
      </div>
    </div>
  );
}

export default App;
