type SliderProps = {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  children?: React.ReactNode;
};

export default function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  children,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className=" controls-slider">
      {children}
      <div className="custom-slider">
        <div className="slider-track-left" style={{ width: `${pct}%` }} />
        <div className="slider-thumb" />
        <div
          className="slider-track-right"
          style={{ width: `${100 - pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
