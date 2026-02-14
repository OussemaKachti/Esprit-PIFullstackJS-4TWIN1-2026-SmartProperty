const ToneSwitcher = ({ selectedTone, onToneChange }) => {
  return (
    <div className="ss-tones">
      {["Modern", "Luxury", "Professional"].map((tone) => (
        <div
          key={tone}
          className={`ss-tone ${selectedTone === tone ? "active" : ""}`}
          onClick={() => onToneChange(tone)}
        >
          {tone}
        </div>
      ))}
    </div>
  );
};

export default ToneSwitcher;