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
  { hex: "#E6E6E6", name: "gray" },
  { hex: "#83868B", name: "dark gray" },
  { hex: "#181818", name: "black" },
  { hex: "#10E41A", name: "green" },
];

function App() {
  const [selectedColor, setSelectedColor] = useState("#E6E6E6");
  const [sliders, setSliders] = useState({
    ropeStiffness: 1,
    ropeThickness: 4,
    prop3: 50,
    cols: 11,
    rows: 11,
    gap: 10,
  });

  // const activeRef = useRef({ id: null, mode: "" });
  const [active, setActive] = useState({
    id: null,
    mode: "",
  });

  const handleSetActive = useCallback((val) => setActive(val), []);

  const [activeButton, setActiveButton] = useState("connect");

  return (
    <main className="main">
      {/* <MatterSketch /> */}
      <div className="controls">
        <div className="controls-title">
          <p>style of boxes</p>
        </div>
        <div className="controls-colors">
          <div className="colors-text">
            <p>color</p>
            <p
              className="color-name"
              style={{ backgroundColor: selectedColor }}
            >
              {colors.find((c) => c.hex === selectedColor)?.name}
            </p>
          </div>
          <div className="color-selector">
            {colors.map((c) => (
              <button
                key={c.hex}
                className={`btn-color ${selectedColor === c.hex ? "selected-color" : ""}`}
                style={{
                  backgroundColor: c.hex,
                  outline:
                    selectedColor === c.hex ? `1px solid ${c.hex}` : "none",
                }}
                onClick={() => setSelectedColor(c.hex)}
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
            value={sliders.cols}
            min={5}
            max={15}
            onChange={(val: number) => setSliders({ ...sliders, cols: val })}
          >
            <p>columns</p>
          </Slider>
          <Slider
            value={sliders.rows}
            min={5}
            max={15}
            onChange={(val: number) => setSliders({ ...sliders, rows: val })}
          >
            <p>rows</p>
          </Slider>
          <Slider
            value={sliders.gap}
            min={5}
            max={25}
            onChange={(val: number) => setSliders({ ...sliders, gap: val })}
          >
            <p>gap</p>
          </Slider>
          <div className="">
            {active.id} {active.mode}
          </div>
        </div>
        <div className="controls-download">
          <button className="btn btn-download">
            <div className="download-dot"></div>
            <p className="download-text">download image</p>
          </button>
        </div>
      </div>
      <div className="canvas-container">
        <div className="canvas-wrapper">
          <Boxes
            ropeStiffness={sliders.ropeStiffness}
            ropeThickness={sliders.ropeThickness}
            cols={sliders.cols}
            rows={sliders.rows}
            gap={sliders.gap}
            setActive={handleSetActive}
          />
        </div>

        <div className="box-controls">
          {/* <p>add a box</p> */}
          <p>box 1</p>
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
            <button
              className="btn-box-icons"
              onClick={() => setActiveButton("disconnect")}
            >
              <img src={DisconnectIcon} alt="disconnect" />
              {activeButton === "disconnect" ? (
                <div className="selected-icon" />
              ) : (
                ""
              )}
            </button>
            <button
              className="btn-box-icons"
              onClick={() => setActiveButton("text")}
            >
              <img src={TextIcon} alt="text" />
              {activeButton === "text" ? <div className="selected-icon" /> : ""}
            </button>
            <button
              className="btn-box-icons"
              onClick={() => setActiveButton("textLeft")}
            >
              <img src={TextLeftIcon} alt="text left" />
              {activeButton === "textLeft" ? (
                <div className="selected-icon" />
              ) : (
                ""
              )}
            </button>
            <button
              className="btn-box-icons"
              onClick={() => setActiveButton("textCenter")}
            >
              <img src={TextCenterIcon} alt="text center" />
              {activeButton === "textCenter" ? (
                <div className="selected-icon" />
              ) : (
                ""
              )}
            </button>
            <button
              className="btn-box-icons"
              onClick={() => setActiveButton("delete")}
            >
              <img src={DeleteIcon} alt="delete" />
              {activeButton === "delete" ? (
                <div className="selected-icon" />
              ) : (
                ""
              )}
            </button>
          </div>

          <div className="btn btn-box-controls">
            <span className="plus-symbol-1"></span>
            <span className="plus-symbol-2"></span>
          </div>
        </div>
      </div>
    </main>
  );
}

function AdtiveDisplay({ activeRef }) {
  const [display, setDisplay] = useState({ id: null, mode: "" });

  return (
    <div>
      {display.id}
      {display.mode}
    </div>
  );
}

export default App;
