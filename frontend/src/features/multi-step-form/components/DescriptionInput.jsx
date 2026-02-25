const DescriptionInput = ({ value, onChange, disabled }) => {
  return (
    <div className="ss-textarea-wrap">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Your AI-generated description will appear here..."
        disabled={disabled}
      />
    </div>
  );
};

export default DescriptionInput;