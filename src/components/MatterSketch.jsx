import { useEffect, useRef, useState } from "react";
// import Matter from "https://cdn.jsdelivr.net/npm/matter-js@0.19.0/build/matter.min.js";
import Matter from "matter-js";

const SHAPES = ["circle", "box", "triangle", "pentagon"];
const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#FFE66D",
  "#A29BFE",
  "#FD79A8",
  "#55EFC4",
];

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function createShape(type, x, y) {
  const color = getRandomColor();
  const opts = {
    restitution: 0.6,
    friction: 0.1,
    render: { fillStyle: color },
  };
  switch (type) {
    case "circle":
      return Matter.Bodies.circle(x, y, 30 + Math.random() * 20, opts);
    case "box":
      return Matter.Bodies.rectangle(
        x,
        y,
        50 + Math.random() * 30,
        50 + Math.random() * 30,
        opts,
      );
    case "triangle":
      return Matter.Bodies.polygon(x, y, 3, 40 + Math.random() * 20, opts);
    case "pentagon":
      return Matter.Bodies.polygon(x, y, 5, 40 + Math.random() * 20, opts);
    default:
      return Matter.Bodies.circle(x, y, 30, opts);
  }
}

export default function MatterSketch() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const worldRef = useRef(null);
  const [selectedShape, setSelectedShape] = useState("circle");
  const [gravity, setGravity] = useState(1);
  const [count, setCount] = useState(0);
  z;

  useEffect(() => {
    const { Engine, Render, Runner, Bodies, World, Events } = Matter;

    const engine = Engine.create();
    const world = engine.world;
    engineRef.current = engine;
    worldRef.current = world;

    const W = 700,
      H = 500;

    const render = Render.create({
      canvas: canvasRef.current,
      engine,
      options: {
        width: W,
        height: H,
        wireframes: false,
        background: "#0f0e17",
      },
    });

    // Walls
    const walls = [
      Bodies.rectangle(W / 2, H + 25, W, 50, {
        isStatic: true,
        render: { fillStyle: "#1a1a2e" },
      }),
      Bodies.rectangle(-25, H / 2, 50, H, {
        isStatic: true,
        render: { fillStyle: "#1a1a2e" },
      }),
      Bodies.rectangle(W + 25, H / 2, 50, H, {
        isStatic: true,
        render: { fillStyle: "#1a1a2e" },
      }),
    ];
    World.add(world, walls);

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(world);
      Engine.clear(engine);
    };
  }, []);

  // Sync gravity
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.world.gravity.y = gravity;
    }
  }, [gravity]);

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const shape = createShape(selectedShape, x, y);
    Matter.World.add(worldRef.current, shape);
    setCount((c) => c + 1);
  };

  const handleClear = () => {
    const { World, Bodies } = Matter;
    World.clear(worldRef.current);
    const W = 700,
      H = 500;
    const walls = [
      Bodies.rectangle(W / 2, H + 25, W, 50, {
        isStatic: true,
        render: { fillStyle: "#1a1a2e" },
      }),
      Bodies.rectangle(-25, H / 2, 50, H, {
        isStatic: true,
        render: { fillStyle: "#1a1a2e" },
      }),
      Bodies.rectangle(W + 25, H / 2, 50, H, {
        isStatic: true,
        render: { fillStyle: "#1a1a2e" },
      }),
    ];
    World.add(worldRef.current, walls);
    setCount(0);
  };

  return (
    <div
      style={{
        fontFamily: "'Courier New', monospace",
        background: "#0f0e17",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        color: "#fffffe",
      }}
    >
      <h1
        style={{
          fontSize: "1.8rem",
          letterSpacing: "0.2em",
          marginBottom: "4px",
          color: "#ff8906",
        }}
      >
        MATTER SANDBOX
      </h1>
      <p
        style={{
          fontSize: "0.75rem",
          letterSpacing: "0.15em",
          color: "#a7a9be",
          marginBottom: "20px",
        }}
      >
        CLICK CANVAS TO SPAWN · {count} BODIES
      </p>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "14px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {SHAPES.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedShape(s)}
            style={{
              padding: "8px 18px",
              border: `2px solid ${selectedShape === s ? "#ff8906" : "#3d3d5c"}`,
              background: selectedShape === s ? "#ff8906" : "transparent",
              color: selectedShape === s ? "#0f0e17" : "#fffffe",
              cursor: "pointer",
              letterSpacing: "0.1em",
              fontSize: "0.75rem",
              fontFamily: "inherit",
              textTransform: "uppercase",
              transition: "all 0.15s",
            }}
          >
            {s}
          </button>
        ))}
        <button
          onClick={handleClear}
          style={{
            padding: "8px 18px",
            border: "2px solid #ff6b6b",
            background: "transparent",
            color: "#ff6b6b",
            cursor: "pointer",
            letterSpacing: "0.1em",
            fontSize: "0.75rem",
            fontFamily: "inherit",
            textTransform: "uppercase",
          }}
        >
          CLEAR
        </button>
      </div>

      {/* Gravity slider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "14px",
          fontSize: "0.75rem",
          letterSpacing: "0.1em",
        }}
      >
        <span style={{ color: "#a7a9be" }}>GRAVITY</span>
        <input
          type="range"
          min="-5"
          max="10"
          step="0.1"
          value={gravity}
          onChange={(e) => setGravity(parseFloat(e.target.value))}
          style={{ width: "140px", accentColor: "#ff8906" }}
        />
        <span style={{ color: "#ff8906", width: "30px" }}>
          {gravity.toFixed(1)}
        </span>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          border: "2px solid #3d3d5c",
          cursor: "crosshair",
          display: "block",
        }}
      />
    </div>
  );
}
