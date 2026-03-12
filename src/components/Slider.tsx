export default function Slider({ value, onChange, children }) {
  return (
    <div className=" controls-slider">
      {children}
      <div className="custom-slider">
        <div className="slider-track-left" style={{ width: `${value}%` }} />
        <div className="slider-thumb" />
        <div
          className="slider-track-right"
          style={{ width: `${100 - value}%` }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
