import { useEffect, useRef } from "react";
import Matter from "matter-js";
// import { disconnect, delete } from "process";

const HANDLE_EYELET = 10;
const GAP = 10;

const ROWS = 11;
const COLS = 11;
const SEGMENTS = 28;
const SEG_LEN = 13;
const LINK_R = 3.5;
let eyeletFill = null;

const LIGHT_GREY = "#E6E6E6";
const MEDIUM_GREY = "#B8BABC33"; //transparency
const DARK_GREY = "#B8BABC";
const GREEN = "#10e41a";
const BLACK = "#181818";

function getTheme(color) {
  switch (color) {
    case "grey":
      return {
        box: DARK_GREY,
        bg: LIGHT_GREY,
        eyelet: LIGHT_GREY,
        rope: LIGHT_GREY,
        text: LIGHT_GREY,
        grid: MEDIUM_GREY,
        border: BLACK,
        active: BLACK,
      };

    case "green":
      return {
        box: GREEN,
        bg: LIGHT_GREY,
        eyelet: GREEN,
        rope: GREEN,
        text: BLACK,
        grid: MEDIUM_GREY,
        border: BLACK,
        active: BLACK,
      };

    case "dark grey":
      return {
        box: "#83868B", // no constant defined for this one
        bg: LIGHT_GREY,
        eyelet: "#83868B",
        rope: "#83868B",
        text: BLACK,
        grid: MEDIUM_GREY,
        border: BLACK,
        active: GREEN,
      };

    default: // grey
      return {
        box: DARK_GREY,
        bg: LIGHT_GREY,
        eyelet: LIGHT_GREY,
        rope: LIGHT_GREY,
        text: LIGHT_GREY,
        grid: MEDIUM_GREY,
        active: BLACK,
      };
  }
}

export default function PhysicsCanvas({
  ropeThickness,
  ropeStiffness,
  gap,
  color,
  eyeletRadius,
  eyeletPadding,
  active,
  setActive,
  mode,
  setMode,
  textMode,
  onReady,
  activeButton,
  fontSize,
}) {
  const canvasRef = useRef(null);
  const themeRef = useRef(color);
  const applyThemeRef = useRef(null);
  const ropeThicknessRef = useRef(ropeThickness);
  const ropeStiffnessRef = useRef(ropeStiffness);
  const eyeletRadiusRef = useRef(eyeletRadius);
  const eyeletPaddingRef = useRef(eyeletPadding);
  const gapRef = useRef(gap);
  const activeRef = useRef(active);
  const setActiveRef = useRef(setActive);
  const appliedGapRef = useRef(gap);
  const modeRef = useRef(mode);
  const setModeRef = useRef(setMode);
  const textModeRef = useRef(textMode);
  const activeButtonRef = useRef(activeButton);
  const activeBoxFigureRef = useRef(null);
  const fontSizeRef = useRef(fontSize);

  useEffect(() => {
    themeRef.current = getTheme(color);
    applyThemeRef.current?.();
  }, [color]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    if (active.id === null) {
      activeBoxFigureRef.current = null;
    }
  }, [active]);

  useEffect(() => {
    setActiveRef.current = setActive;
  }, [setActive]);

  useEffect(() => {
    setModeRef.current = setMode;
  }, [setMode]);

  useEffect(() => {
    textModeRef.current = textMode;
  }, [textMode]);

  useEffect(() => {
    gapRef.current = gap;
  }, [gap]);

  useEffect(() => {
    fontSizeRef.current = fontSize;
  }, [fontSize]);

  useEffect(() => {
    ropeStiffnessRef.current = ropeStiffness;
    ropeThicknessRef.current = ropeThickness;
  }, [ropeStiffness, ropeThickness]);

  useEffect(() => {
    eyeletRadiusRef.current = eyeletRadius;
    eyeletPaddingRef.current = eyeletPadding;
  }, [eyeletRadius, eyeletPadding]);

  useEffect(() => {
    modeRef.current = mode;
    activeButtonRef.current = activeButton;

    if (mode === "modify") {
      if (activeButton === "text") {
        eyeletFill = themeRef.current.box;
      } else if (activeButton === "connect") {
        eyeletFill = themeRef.current.eyelet;
      } else {
        eyeletFill = themeRef.current.eyelet;
      }
    } else {
      // mode === "create" or "default"
      eyeletFill = themeRef.current.box;
    }

    console.log(activeButton);
  }, [mode, activeButton]);

  useEffect(() => {
    document.fonts.load('16px "SuisseMono"').then(() => {
      console.log("Font loaded");
    });
  }, []);

  useEffect(() => {
    const {
      Engine,
      Render,
      Runner,
      Bodies,
      Body,
      Composite,
      Constraint,
      Events,
    } = Matter;

    applyThemeRef.current = applyThemeToScene;
    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    let W = container.clientWidth;
    let H = container.clientHeight;

    const dpr = window.devicePixelRatio || 1;

    // --- State ---
    let mousePos = null;
    let hovered = [];
    let gridBoxes = [];
    let firstBox = null;
    let secondBox = null;
    let lastSecondBox = null;
    let boxFigures = [];
    let eyeletFigures = [];
    let firstEyelet = null;
    let secondEyelet = null;
    let ropeFigures = [];
    let tempRope = null;
    // let activeBoxFigureRef = null;
    let nextFigureId = 0;
    let nextEyeletId = 0;
    let nextRopeId = 0;
    // let mode = "select";

    // --- Engine ---
    const engine = Engine.create({ gravity: { y: 1.5 } });
    const world = engine.world;

    const render = Render.create({
      canvas,
      engine,
      options: {
        width: W,
        height: H,
        wireframes: false,
        background: themeRef.current.bg,
        pixelRatio: dpr,
      },
    });

    canvas.width = W * dpr;
    canvas.height = H * dpr;

    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    render.context.setTransform(dpr, 0, 0, dpr, 0, 0);

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // --- Grid ---
    const MARGIN = 1;
    const gridW = W - MARGIN * 2;
    const gridH = H - MARGIN * 2;
    const boxW = Math.floor((gridW - GAP * (COLS - 1)) / COLS);
    const boxH = Math.floor((gridH - GAP * (ROWS - 1)) / ROWS);
    const ox = Math.floor((W - gridW) / 2);
    const oy = Math.floor((H - gridH) / 2);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = ox + c * (boxW + GAP);
        const y = oy + r * (boxH + GAP);
        gridBoxes.push({
          x,
          y,
          row: r,
          col: c,
          free: true,
          corners: [
            { x: x, y: y, i: 1 },
            { x: x + boxW, y: y, i: 2 },
            { x: x, y: y + boxH, i: 3 },
            { x: x + boxW, y: y + boxH, i: 4 },
          ],
        });
      }
    }

    gridBoxes.forEach((box) => {
      const body = Bodies.rectangle(
        box.x + boxW / 2,
        box.y + boxH / 2,
        boxW,
        boxH,
        {
          isStatic: true,
          render: { fillStyle: themeRef.current.grid },
        },
      );
      box.body = body;
      Composite.add(world, body);
    });

    function applyThemeToScene() {
      const theme = themeRef.current;

      // --- Grid ---
      for (const box of gridBoxes) {
        if (!box.body) continue;
        box.body.render.fillStyle = theme.bg;
      }

      // --- Box figures ---
      for (const fig of boxFigures) {
        if (fig.body) {
          fig.body.render.fillStyle = theme.box;
        }
      }

      // --- Eyelets ---
      for (const eyelet of eyeletFigures) {
        if (!eyelet.body) continue;

        eyelet.body.render.fillStyle =
          eyelet.disabled || activeButtonRef.current === "text"
            ? theme.box
            : theme.eyelet;
      }

      // --- Background ---
      render.options.background = theme.bg;
    }

    applyThemeRef.current = applyThemeToScene;

    // --- Helpers ---
    function canvasPos(e) {
      const r = canvas.getBoundingClientRect();
      const src = e.touches ? e.touches[0] : e;
      return { x: src.clientX - r.left, y: src.clientY - r.top };
    }

    function selectBoxFigure(pos) {
      const eyelet = selectEyelet();
      const selected = boxFigures.find(
        ({ absCoor: { TL, BR } }) =>
          pos.x >= TL.x && pos.x <= BR.x && pos.y >= TL.y && pos.y <= BR.y,
      );
      if (eyelet && eyelet.figureId === activeBoxFigureRef.current?.id)
        return 1;

      return selected ?? null;
    }

    function selectBox(pos) {
      return (
        gridBoxes.find((box) => {
          const xs = box.corners.map((c) => c.x);
          const ys = box.corners.map((c) => c.y);
          return (
            pos.x >= Math.min(...xs) &&
            pos.x <= Math.max(...xs) &&
            pos.y >= Math.min(...ys) &&
            pos.y <= Math.max(...ys) &&
            box.free === true
          );
        }) ?? null
      );
    }

    function selectEyelet() {
      return (
        eyeletFigures.find(
          (eye) =>
            !eye.disabled &&
            Math.hypot(
              mousePos.x - eye.body.position.x,
              mousePos.y - eye.body.position.y,
            ) <
              eyeletRadiusRef.current + HANDLE_EYELET,
        ) ?? null
      );
    }

    function absBoxesCoor(fBox = firstBox, sBox = secondBox) {
      return {
        minCol: Math.min(fBox.col, sBox.col),
        maxCol: Math.max(fBox.col, sBox.col),
        minRow: Math.min(fBox.row, sBox.row),
        maxRow: Math.max(fBox.row, sBox.row),
      };
    }

    function hoveredBoxes() {
      const { minCol, maxCol, minRow, maxRow } = absBoxesCoor();
      return gridBoxes.filter(
        (box) =>
          box.col >= minCol &&
          box.col <= maxCol &&
          box.row >= minRow &&
          box.row <= maxRow,
      );
    }

    function setActiveBoxReference() {
      if (activeBoxFigureRef.current) {
        setActiveRef.current({
          id: activeBoxFigureRef.current.id,
          mode: "active",
          textTop: activeBoxFigureRef.current.textTop || "",
          textBottom: activeBoxFigureRef.current.textBottom || "",
          textMode: activeBoxFigureRef.current.textMode || "center",
        });
        setModeRef.current("modify");
      } else {
        setActiveRef.current({
          id: null,
          mode: "",
          textTop: "",
          textBottom: "",
        });
        setModeRef.current("default");
      }
    }

    // --- Rope ---
    function createRopeFigure() {
      tempRope = {
        id: nextRopeId,
        startEyelet: firstEyelet,
        endEyelet: null,
        links: [],
        constraints: [],
      };
      const start = firstEyelet.body.position;
      const dist = Math.hypot(mousePos.x - start.x, mousePos.y - start.y);
      const segLen = Math.max(dist * 10, SEGMENTS * 1) / SEGMENTS;

      for (let i = 0; i < SEGMENTS; i++) {
        const isEnd = i === 0 || i === SEGMENTS - 1;
        const link = Bodies.circle(start.x, start.y, LINK_R, {
          isStatic: isEnd,
          frictionAir: 0.05,
          collisionFilter: { mask: 0 },
          render: { fillStyle: "transparent" },
        });
        tempRope.links.push(link);
        Composite.add(world, link);
      }

      for (let i = 0; i < SEGMENTS - 1; i++) {
        const constraint = Constraint.create({
          bodyA: tempRope.links[i],
          bodyB: tempRope.links[i + 1],
          length: SEG_LEN,
          stiffness: 0.7,
          damping: 0.08,
          render: { visible: false },
        });
        tempRope.constraints.push(constraint);
        Composite.add(world, constraint);
      }
    }

    function updateRopeSlack(rope) {
      const a = rope.links[0].position;
      const b = rope.links[SEGMENTS - 1].position;
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const segLen = (dist * ropeStiffnessRef.current) / (SEGMENTS - 1);
      for (const c of rope.constraints) c.length = segLen;
    }

    // --- Eyelets ---
    function createBoxEyelet(corner, figureId) {
      const radius = eyeletRadiusRef.current;
      const padding = eyeletPaddingRef.current;

      const offsets = {
        1: { x: padding + radius, y: padding + radius },
        2: { x: -padding - radius, y: padding + radius },
        3: { x: padding + radius, y: -padding - radius },
        4: { x: -padding - radius, y: -padding - radius },
      };

      const offset = offsets[corner.i];

      const body = Bodies.circle(
        corner.x + offset.x,
        corner.y + offset.y,
        radius,
        {
          isStatic: true,
          label: "eyelet",
          render: { fillStyle: themeRef.current.box, strokeStyle: "none" },
          collisionFilter: { mask: 0 },
        },
      );

      Composite.add(world, body);
      return {
        id: nextEyeletId++,
        figureId,
        corner,
        offset,
        body,
        radius: radius,
        free: true,
      };
    }

    function syncEyelets() {
      const radius = eyeletRadiusRef.current;
      const padding = eyeletPaddingRef.current;
      const offsets = {
        1: { x: padding + radius, y: padding + radius },
        2: { x: -padding - radius, y: padding + radius },
        3: { x: padding + radius, y: -padding - radius },
        4: { x: -padding - radius, y: -padding - radius },
      };

      for (const eyelet of eyeletFigures) {
        const newOffset = offsets[eyelet.corner.i];
        eyelet.offset = newOffset;

        const parentFig = boxFigures.find((f) => f.id === eyelet.figureId);
        const isLeftEyelet = eyelet.corner.i === 1 || eyelet.corner.i === 3;
        const isDisabled = parentFig?.textMode === "left" && isLeftEyelet;
        eyelet.disabled = isDisabled;

        Composite.remove(world, eyelet.body);
        eyelet.body = Bodies.circle(
          eyelet.corner.x + newOffset.x,
          eyelet.corner.y + newOffset.y,
          radius,
          {
            isStatic: true,
            label: "eyelet",
            render: {
              fillStyle: eyelet.disabled
                ? themeRef.current.box
                : (eyeletFill ?? themeRef.current.eyelet),
              strokeStyle: "none",
            },
            collisionFilter: { mask: 0 },
          },
        );
        Composite.add(world, eyelet.body);
      }
    }

    // --- Box figures ---
    function createBoxFigure() {
      const { minCol, maxCol, minRow, maxRow } = absBoxesCoor();

      const unavailable = gridBoxes.some(
        (box) =>
          box.col >= minCol &&
          box.col <= maxCol &&
          box.row >= minRow &&
          box.row <= maxRow &&
          !box.free,
      );
      if (unavailable) return;

      // console.log({ minCol, maxCol, minRow, maxRow });
      const boxSize = (maxCol - minCol) * (maxRow - minRow);
      // console.log(boxSize);
      if (boxSize < 1) return;

      const eyelets = [
        createBoxEyelet(
          gridBoxes
            .find((b) => b.col === minCol && b.row === minRow)
            .corners.find((c) => c.i === 1),
          nextFigureId,
        ),
        createBoxEyelet(
          gridBoxes
            .find((b) => b.col === maxCol && b.row === minRow)
            .corners.find((c) => c.i === 2),
          nextFigureId,
        ),
        createBoxEyelet(
          gridBoxes
            .find((b) => b.col === minCol && b.row === maxRow)
            .corners.find((c) => c.i === 3),
          nextFigureId,
        ),
        createBoxEyelet(
          gridBoxes
            .find((b) => b.col === maxCol && b.row === maxRow)
            .corners.find((c) => c.i === 4),
          nextFigureId,
        ),
      ];
      eyeletFigures.push(...eyelets);

      const boxTL = gridBoxes.find((b) => b.col === minCol && b.row === minRow);
      const boxBR = gridBoxes.find((b) => b.col === maxCol && b.row === maxRow);

      const boxFig = {
        id: nextFigureId++,
        start: { box: firstBox },
        end: { box: secondBox },
        absCoor: { TL: boxTL.corners[0], BR: boxBR.corners[3] },
        body: null,
        eyelets,
        textTop: "",
        textBottom: "",
        textMode: textModeRef.current,
      };

      gridBoxes.forEach((box) => {
        if (
          box.col >= minCol &&
          box.col <= maxCol &&
          box.row >= minRow &&
          box.row <= maxRow
        )
          box.free = false;
      });

      boxFigures.push(boxFig);
      syncBoxFigureBody();
    }

    function syncBoxFigureBody() {
      if (boxFigures.length === 0) return;
      for (const fig of boxFigures) {
        const { TL, BR } = fig.absCoor;
        const cx = (TL.x + BR.x) / 2,
          cy = (TL.y + BR.y) / 2;
        const w = Math.abs(BR.x - TL.x),
          h = Math.abs(BR.y - TL.y);

        if (fig.body) {
          Body.setPosition(fig.body, { x: cx, y: cy });
          const bw = fig.body.bounds.max.x - fig.body.bounds.min.x;
          const bh = fig.body.bounds.max.y - fig.body.bounds.min.y;
          if (Math.abs(bw - w) > 1 || Math.abs(bh - h) > 1) {
            Composite.remove(world, fig.body);
            fig.body = null;
          }
        }

        if (!fig.body) {
          fig.body = Bodies.rectangle(cx, cy, w, h, {
            isStatic: true,
            render: { fillStyle: themeRef.current.box, opacity: 1 },
          });
          Composite.add(world, fig.body);
          for (const eyelet of fig.eyelets) {
            Composite.remove(world, eyelet.body);
            Composite.add(world, eyelet.body);
          }
        }
      }

      syncEyelets();
    }

    function deleteBoxFigure() {
      if (!activeBoxFigureRef.current) return;
      deleteBoxRopes();
      Composite.remove(world, activeBoxFigureRef.current.body);

      for (let i = eyeletFigures.length - 1; i >= 0; i--) {
        if (eyeletFigures[i].figureId === activeBoxFigureRef.current.id) {
          Composite.remove(world, eyeletFigures[i].body);
          eyeletFigures.splice(i, 1);
        }
      }

      const { minCol, maxCol, minRow, maxRow } = absBoxesCoor(
        activeBoxFigureRef.current.start.box,
        activeBoxFigureRef.current.end.box,
      );
      gridBoxes.forEach((box) => {
        if (
          box.col >= minCol &&
          box.col <= maxCol &&
          box.row >= minRow &&
          box.row <= maxRow
        )
          box.free = true;
      });

      const idx = boxFigures.findIndex(
        (f) => f.id === activeBoxFigureRef.current.id,
      );
      if (idx !== -1) boxFigures.splice(idx, 1);
      activeBoxFigureRef.current = null;
      setActiveBoxReference();
    }

    function deleteBoxRopes() {
      if (!activeBoxFigureRef.current) return;
      for (let i = ropeFigures.length - 1; i >= 0; i--) {
        const rope = ropeFigures[i];
        if (
          rope.startEyelet.figureId === activeBoxFigureRef.current.id ||
          rope.endEyelet.figureId === activeBoxFigureRef.current.id
        ) {
          rope.links.forEach((link) => Composite.remove(world, link));
          rope.constraints.forEach((c) => Composite.remove(world, c));
          rope.startEyelet.free = true;
          rope.endEyelet.free = true;
          ropeFigures.splice(i, 1);
        }
      }
    }

    function deleteLeftEyeletRopesForFigure(fig) {
      for (let i = ropeFigures.length - 1; i >= 0; i--) {
        const rope = ropeFigures[i];
        const startIsLeft =
          rope.startEyelet.figureId === fig.id &&
          (rope.startEyelet.corner.i === 1 || rope.startEyelet.corner.i === 3);
        const endIsLeft =
          rope.endEyelet.figureId === fig.id &&
          (rope.endEyelet.corner.i === 1 || rope.endEyelet.corner.i === 3);

        if (startIsLeft || endIsLeft) {
          rope.links.forEach((link) => Composite.remove(world, link));
          rope.constraints.forEach((c) => Composite.remove(world, c));
          rope.startEyelet.free = true;
          rope.endEyelet.free = true;
          ropeFigures.splice(i, 1);
        }
      }
    }

    // --- Sync ---
    function syncRopeFigures() {
      for (const rope of ropeFigures) {
        Body.setPosition(rope.links[0], {
          x: rope.startEyelet.body.position.x,
          y: rope.startEyelet.body.position.y,
        });
        Body.setPosition(rope.links[SEGMENTS - 1], {
          x: rope.endEyelet.body.position.x,
          y: rope.endEyelet.body.position.y,
        });
      }
    }

    function syncGridBoxColors() {
      const hoveredSet = new Set(
        hovered.map(({ row, col }) => `${row},${col}`),
      );
      for (const box of gridBoxes) {
        if (modeRef.current !== "create") {
          box.body.render.fillStyle = themeRef.current.bg;
        } else {
          if (!box.body) continue;
          box.body.render.fillStyle = hoveredSet.has(`${box.row},${box.col}`)
            ? themeRef.current.box
            : themeRef.current.grid;
        }
      }
    }

    function syncGrid() {
      const currentGap = gapRef.current;
      if (currentGap === appliedGapRef.current) return;
      appliedGapRef.current = currentGap;

      const newBoxW = Math.floor((gridW - currentGap * (COLS - 1)) / COLS);
      const newBoxH = Math.floor((gridH - currentGap * (ROWS - 1)) / ROWS);

      for (const box of gridBoxes) {
        const x = ox + box.col * (newBoxW + currentGap);
        const y = oy + box.row * (newBoxH + currentGap);

        box.x = x;
        box.y = y;

        box.corners[0].x = x;
        box.corners[0].y = y;
        box.corners[1].x = x + newBoxW;
        box.corners[1].y = y;
        box.corners[2].x = x;
        box.corners[2].y = y + newBoxH;
        box.corners[3].x = x + newBoxW;
        box.corners[3].y = y + newBoxH;

        Composite.remove(world, box.body);
        box.body = Bodies.rectangle(
          x + newBoxW / 2,
          y + newBoxH / 2,
          newBoxW,
          newBoxH,
          { isStatic: true, render: { fillStyle: themeRef.current.grid } },
        );
        Composite.add(world, box.body);
      }

      for (const fig of boxFigures) {
        if (fig.body) {
          Composite.remove(world, fig.body);
          fig.body = null;
        }
      }
    }

    // --- Draw ---
    function drawRope(ctx, links, strokeStyle) {
      ctx.beginPath();
      ctx.moveTo(links[0].position.x, links[0].position.y);
      for (let i = 1; i < links.length - 1; i++) {
        const c = links[i].position,
          n = links[i + 1].position;
        ctx.quadraticCurveTo(c.x, c.y, (c.x + n.x) / 2, (c.y + n.y) / 2);
      }
      ctx.lineTo(
        links[SEGMENTS - 1].position.x,
        links[SEGMENTS - 1].position.y,
      );
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = ropeThicknessRef.current;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      for (const ep of [links[0], links[SEGMENTS - 1]]) {
        ctx.beginPath();
        ctx.arc(
          ep.position.x,
          ep.position.y,
          eyeletRadiusRef.current,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = strokeStyle;
        ctx.fill();
      }
    }

    function drawRopeFigures(ctx) {
      for (const rope of ropeFigures) {
        ctx.save();
        drawRope(ctx, rope.links, themeRef.current.rope);
        ctx.restore();
      }
    }

    function drawDraggingRope(ctx) {
      if (!tempRope || tempRope.links.length === 0) return;
      ctx.save();
      drawRope(ctx, tempRope.links, themeRef.current.rope);
      ctx.restore();
    }

    function drawactiveBoxFigureRef(ctx) {
      if (!activeBoxFigureRef.current) return;
      const { TL, BR } = activeBoxFigureRef.current.absCoor;
      ctx.save();
      ctx.strokeStyle =
        modeRef.current === "create"
          ? themeRef.current.box
          : themeRef.current.active;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(TL.x, TL.y, BR.x - TL.x, BR.y - TL.y);
      ctx.restore();
    }

    function drawBoxText(ctx) {
      for (const fig of boxFigures) {
        const { TL, BR } = fig.absCoor;
        const centerX = (TL.x + BR.x) / 2;
        const centerY = (TL.y + BR.y) / 2;

        ctx.save();

        const boxHeight = BR.y - TL.y;
        const fontSize = fontSizeRef.current;

        ctx.font = `400 ${fontSize}px "SuisseMono"`;
        ctx.letterSpacing = `${-0.02 * fontSize}px`;
        ctx.fillStyle = themeRef.current.text;
        ctx.textAlign = "center";

        const PADDING = eyeletPaddingRef.current;
        const textMode = fig.textMode ?? "center";

        const textX = textMode === "left" ? TL.x + PADDING : centerX;
        ctx.textAlign = textMode;

        const hasTop = !!fig.textTop;
        const hasBottom = !!fig.textBottom;

        const getTextHeight = (text) => {
          const m = ctx.measureText(text);
          return {
            above: m.actualBoundingBoxAscent,
            below: m.actualBoundingBoxDescent,
            total: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent,
          };
        };

        if (hasTop && hasBottom) {
          const top = getTextHeight(fig.textTop);
          const bot = getTextHeight(fig.textBottom);

          ctx.textBaseline = "alphabetic";
          ctx.fillText(fig.textTop, textX, TL.y + PADDING + top.above);

          ctx.fillText(fig.textBottom, textX, BR.y - PADDING - bot.below);
        } else if (hasTop || hasBottom) {
          const text = fig.textTop || fig.textBottom;
          ctx.textBaseline = "middle";
          ctx.fillText(text, textX, centerY);
        }

        ctx.restore();
      }
    }

    // --- Event handlers ---
    function onDown(e) {
      const pos = canvasPos(e);

      if (modeRef.current === "create") {
        firstBox = selectBox(pos);
        secondBox = selectBox(pos);
        return;
      }

      if (
        modeRef.current === "modify" &&
        activeButtonRef.current === "connect"
      ) {
        const eyelet = selectEyelet();
        firstEyelet = eyelet?.free ? eyelet : null;

        if (firstEyelet) createRopeFigure();
      }

      const clickedFig = selectBoxFigure(pos);
      if (clickedFig === 1) return;
      activeBoxFigureRef.current =
        clickedFig?.id === activeBoxFigureRef.current?.id ? null : clickedFig;
      setActiveBoxReference();
    }

    function onUp() {
      if (firstBox && secondBox) {
        createBoxFigure();
        // activeBoxFigureRef.current = boxFigures[boxFigures.length - 1];
        // setActiveBoxReference();
      }

      if (tempRope) {
        if (
          secondEyelet &&
          secondEyelet !== firstEyelet &&
          secondEyelet.figureId !== firstEyelet.figureId
        ) {
          Body.setPosition(tempRope.links[SEGMENTS - 1], {
            x: secondEyelet.body.position.x,
            y: secondEyelet.body.position.y,
          });
          tempRope.endEyelet = secondEyelet;
          firstEyelet.free = false;
          secondEyelet.free = false;
          ropeFigures.push(tempRope);
        } else {
          tempRope.links.forEach((link) => Composite.remove(world, link));
        }
      }

      tempRope = null;
      firstBox = null;
      secondBox = null;
      firstEyelet = null;
      secondEyelet = null;
      hovered = [];
    }

    function onMove(e) {
      mousePos = canvasPos(e);
      secondBox = selectBox(mousePos) ?? lastSecondBox;

      if (firstBox && secondBox) {
        lastSecondBox = secondBox;
        hovered = hoveredBoxes();
      }

      if (firstEyelet) secondEyelet = selectEyelet();

      if (tempRope?.links.length > 0) {
        Body.setPosition(tempRope.links[SEGMENTS - 1], {
          x: mousePos.x,
          y: mousePos.y,
        });
      }
    }

    onReady?.({
      disconnect: () => {
        deleteBoxRopes();
      },
      delete: () => {
        deleteBoxFigure();
      },
      setText: (position, value) => {
        if (!activeBoxFigureRef.current) return;

        const formatted = value.toUpperCase();

        if (position === "top") {
          activeBoxFigureRef.current.textTop = formatted;
        } else {
          activeBoxFigureRef.current.textBottom = formatted;
        }
      },
      setTextMode: (textMode) => {
        if (!activeBoxFigureRef.current) return;
        activeBoxFigureRef.current.textMode = textMode;

        if (textMode === "left") {
          deleteLeftEyeletRopesForFigure(activeBoxFigureRef.current);
          syncEyelets();
        }
      },
    });

    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseup", onUp);
    canvas.addEventListener("mouseleave", onUp);
    // document.addEventListener("keydown", onKeydown);

    Events.on(render, "afterRender", () => {
      const ctx = render.context;
      syncGrid();
      syncGridBoxColors();
      syncBoxFigureBody();
      syncRopeFigures();
      if (tempRope) updateRopeSlack(tempRope);
      ropeFigures.forEach(updateRopeSlack);

      drawBoxText(ctx);
      drawactiveBoxFigureRef(ctx);
      drawRopeFigures(ctx);
      if (firstEyelet) drawDraggingRope(ctx);
      ctx.beginPath();
    });

    const observer = new ResizeObserver(([entry]) => {
      const dpr = window.devicePixelRatio || 1;

      W = entry.contentRect.width;
      H = entry.contentRect.height;

      canvas.width = W * dpr;
      canvas.height = H * dpr;

      canvas.style.width = W + "px";
      canvas.style.height = H + "px";

      render.options.width = W;
      render.options.height = H;

      render.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    });

    observer.observe(container);

    // --- Cleanup ---
    return () => {
      observer.disconnect();
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("mouseleave", onUp);
      // document.removeEventListener("keydown", onKeydown);
      Events.off(render, "afterRender");
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
    };
  }, []);

  return <canvas ref={canvasRef} id="boxes-canvas" />;
}
