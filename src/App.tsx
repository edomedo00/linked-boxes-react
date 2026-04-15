import Boxes from "./components/Boxes";
import Slider from "./components/Slider";
import ConnectionIcon from "./assets/connection.svg";
import DisconnectIcon from "./assets/disconnect.svg";
import DeleteIcon from "./assets/delete.svg";
import TextIcon from "./assets/text.svg";
import TextLeftIcon from "./assets/text-left.svg";
import TextCenterIcon from "./assets/text-center.svg";
import { useCallback, useRef, useState } from "react";

const colors = [
  { hex: "#E6E6E6", name: "grey" },
  { hex: "#83868B", name: "dark grey" },
  { hex: "#181818", name: "black" },
  { hex: "#10E41A", name: "green" },
];

interface BoxControls {
  disconnect: () => void;
  delete: () => void;
  setText: (position: string, value: string) => void;
  setTextMode: (textMode: string) => void;
}

function App() {
  const [selectedColor, setSelectedColor] = useState("grey");
  const [sliders, setSliders] = useState({
    ropeStiffness: 1,
    ropeThickness: 4,
    eyeletRadius: 8,
    eyeletPadding: 7,
    gap: 10,
    fontSize: 20,
  });

  const [mode, setMode] = useState("default");

  // const activeRef = useRef({ id: null, mode: "" });
  const [active, setActive] = useState({
    id: null,
    mode: "",
    textTop: "",
    textBottom: "",
    textMode: "",
  });

  const boxControls = useRef<BoxControls | null>(null);

  const handleSetActive = useCallback(
    (val: typeof active) => setActive(val),
    [],
  );

  const resetActive = () =>
    setActive({
      id: null,
      mode: "",
      textTop: "",
      textBottom: "",
      textMode: "",
    });

  // const handleSetActiveTextMode = useCallback(
  //   (val: typeof active) => setActiveTextMode(val),
  //   [],
  // );

  const handleSetMode = useCallback((val: typeof mode) => {
    setMode(val);
  }, []);

  const [activeButton, setActiveButton] = useState("connect");
  // const [activeTextMode, setActiveTextMode] = useState("center");

  return (
    <main className="main">
      {/* <MatterSketch /> */}
      <div className="controls">
        <div className="controls-title">
          <p>style of boxes</p>
        </div>
        <div className="controls-colors">
          <div className="colors-text">
            <p>color theme</p>
            <p
              className="color-name"
              style={{
                backgroundColor: colors.find((c) => c.name === selectedColor)
                  ?.hex,
                color:
                  colors.find((c) => c.name === selectedColor)?.name ===
                    "black" ||
                  colors.find((c) => c.name === selectedColor)?.name ===
                    "dark grey"
                    ? "#ffffff"
                    : "#12161c",
              }}
            >
              {colors.find((c) => c.name === selectedColor)?.name}
            </p>
          </div>
          <div className="color-selector">
            {colors.map((c) => (
              <button
                key={c.name}
                className={`btn-color ${selectedColor === c.name ? "selected-color" : ""}`}
                style={{
                  backgroundColor: c.hex,
                  outline:
                    selectedColor === c.name ? `1px solid ${c.hex}` : "none",
                }}
                onClick={() => setSelectedColor(c.name)}
              ></button>
            ))}
          </div>
        </div>
        <div className="controls-ropes">
          <Slider
            value={sliders.ropeStiffness}
            min={0.5}
            max={1.5}
            step={0.1}
            onChange={(val: number) =>
              setSliders({ ...sliders, ropeStiffness: val })
            }
          >
            <p>rope stiffness</p>
          </Slider>
          <Slider
            value={sliders.ropeThickness}
            min={1}
            max={10}
            onChange={(val: number) =>
              setSliders({ ...sliders, ropeThickness: val })
            }
          >
            <p>rope thickness</p>
          </Slider>
        </div>
        <div className="controls-boxes">
          <Slider
            value={sliders.gap}
            min={5}
            max={25}
            step={1}
            onChange={(val: number) => setSliders({ ...sliders, gap: val })}
          >
            <p>gap</p>
          </Slider>
          <Slider
            value={sliders.eyeletRadius}
            min={2}
            max={15}
            step={0.5}
            onChange={(val: number) =>
              setSliders({ ...sliders, eyeletRadius: val })
            }
          >
            <p>eyelet size</p>
          </Slider>
          <Slider
            value={sliders.eyeletPadding}
            min={2}
            max={20}
            step={0.5}
            onChange={(val: number) =>
              setSliders({ ...sliders, eyeletPadding: val })
            }
          >
            <p>padding</p>
          </Slider>
        </div>
        <div className="controls-text">
          <Slider
            value={sliders.fontSize}
            min={15}
            max={30}
            step={1}
            onChange={(val: number) =>
              setSliders({ ...sliders, fontSize: val })
            }
          >
            <p>font size</p>
          </Slider>
        </div>
        <div className="controls-download">
          <button
            className="btn btn-download"
            onClick={() => {
              const canvas = document.getElementById("boxes-canvas");
              if (!(canvas instanceof HTMLCanvasElement)) return;

              const scale = 3;

              const tempCanvas = document.createElement("canvas");
              tempCanvas.width = canvas.width * scale;
              tempCanvas.height = canvas.height * scale;

              const ctx = tempCanvas.getContext("2d");
              if (!ctx) return;

              ctx.scale(scale, scale);
              ctx.imageSmoothingEnabled = true;

              ctx.fillStyle = "#E6E6E6";
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              ctx.drawImage(canvas, 0, 0);

              const link = document.createElement("a");
              link.download = "boxes.png";
              link.href = tempCanvas.toDataURL("image/png", 1.0);
              link.click();
            }}
          >
            <div className="download-dot"></div>
            <p className="download-text">download image</p>
          </button>
        </div>
      </div>
      <div className="canvas-container">
        <div className="canvas-wrapper">
          <Boxes
            color={selectedColor}
            gap={sliders.gap}
            ropeStiffness={sliders.ropeStiffness}
            ropeThickness={sliders.ropeThickness}
            eyeletRadius={sliders.eyeletRadius}
            eyeletPadding={sliders.eyeletPadding}
            active={active}
            setActive={handleSetActive}
            mode={mode}
            setMode={handleSetMode}
            // textMode={activeTextMode}
            onReady={(controls: BoxControls) =>
              (boxControls.current = controls)
            }
            activeButton={activeButton}
            fontSize={sliders.fontSize}
          />
        </div>

        {activeButton === "text" && active.id !== null ? (
          <div className="text-input">
            <div className="text-input-top">
              <div className="text-input-number">1</div>
              <input
                value={active.textTop}
                type="text"
                name="text-top"
                id="text-top"
                placeholder="type something"
                className="text-input-input"
                onChange={(e) => {
                  const val = e.target.value;
                  boxControls.current?.setText("top", val);
                  setActive((prev) => ({
                    ...prev,
                    textTop: val.toUpperCase(),
                  }));
                }}
              />
            </div>
            <div className="text-input-top">
              <div className="text-input-number">2</div>
              <input
                value={active.textBottom}
                type="text"
                name="text-top"
                id="text-top"
                placeholder="type something"
                className="text-input-input"
                onChange={(e) => {
                  const val = e.target.value;
                  boxControls.current?.setText("bottom", val);
                  setActive((prev) => ({
                    ...prev,
                    textBottom: val.toUpperCase(),
                  }));
                }}
              />
            </div>
          </div>
        ) : (
          <></>
        )}

        <div
          className={`box-controls ${mode === "create" ? "box-controls-create-mode" : ""}`}
        >
          {/* <p>add a box</p> */}

          {(() => {
            if (mode === "create") {
              return "";
            }
            if (mode === "default") {
              return <p>add a box</p>;
            }
            if (mode === "modify" && active.id !== null) {
              return <p>{`box ${active.id + 1}`}</p>;
            }
          })()}

          {/* {(() => {
            if (active.id && mode !== "create") {
              return <p>{`box ${active.id + 1}`}</p>;
            }
            if (mode === "default") {
              return <p>add a box</p>;
            }
            return "";
          })()} */}

          {(() => {
            if (mode === "modify" && active.id !== null) {
              return (
                <>
                  <span className="controls-box-divider"></span>
                  <div className="box-controls-icons">
                    <button
                      className="btn-box-icons"
                      onClick={() => setActiveButton("connect")}
                    >
                      <img src={ConnectionIcon} alt="connection" />
                      {activeButton === "connect" ? (
                        <div className="selected-icon" />
                      ) : (
                        ""
                      )}
                    </button>
                    {activeButton === "connect" ? (
                      <button
                        className="btn-box-icons"
                        onClick={() => boxControls.current?.disconnect()}
                      >
                        <img src={DisconnectIcon} alt="disconnect" />
                      </button>
                    ) : (
                      <></>
                    )}
                    <button
                      className="btn-box-icons"
                      onClick={() => setActiveButton("text")}
                    >
                      <img src={TextIcon} alt="text" />
                      {activeButton === "text" ? (
                        <div className="selected-icon" />
                      ) : (
                        ""
                      )}
                    </button>
                    {activeButton === "text" ? (
                      <>
                        <button
                          className="btn-box-icons"
                          onClick={() => {
                            boxControls.current?.setTextMode("left");
                            setActive((prev) => ({
                              ...prev,
                              textMode: "left",
                            }));
                          }}
                        >
                          <img src={TextLeftIcon} alt="text left" />
                          {active.textMode === "left" ? (
                            <div className="selected-icon" />
                          ) : (
                            ""
                          )}
                        </button>
                        <button
                          className="btn-box-icons"
                          onClick={() => {
                            boxControls.current?.setTextMode("center");
                            setActive((prev) => ({
                              ...prev,
                              textMode: "center",
                            }));
                          }}
                        >
                          <img src={TextCenterIcon} alt="text center" />
                          {active.textMode === "center" ? (
                            <div className="selected-icon" />
                          ) : (
                            ""
                          )}
                        </button>
                      </>
                    ) : (
                      <></>
                    )}
                    <button
                      className="btn-box-icons"
                      onClick={() => boxControls.current?.delete()}
                    >
                      <img src={DeleteIcon} alt="delete" />
                      {activeButton === "delete" ? (
                        <div className="selected-icon" />
                      ) : (
                        ""
                      )}
                    </button>
                  </div>
                </>
              );
            }
            return <></>;
          })()}

          <button
            className={`btn btn-box-controls ${mode === "create" || active.id !== null ? "active" : ""}`}
            onClick={() => {
              setMode(mode === "default" ? "create" : "default");
              resetActive();
            }}
          >
            <span className="plus-symbol-1"></span>
            <span className="plus-symbol-2"></span>
          </button>
        </div>
      </div>
    </main>
  );
}

// function AdtiveDisplay({ activeRef }) {
//   const [display, setDisplay] = useState({ id: null, mode: "" });

//   return (
//     <div>
//       {display.id}
//       {display.mode}
//     </div>
//   );
// }

export default App;
