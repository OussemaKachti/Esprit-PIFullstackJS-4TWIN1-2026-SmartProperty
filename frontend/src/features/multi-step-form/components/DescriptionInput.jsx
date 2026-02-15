const DescriptionInput = ({ value, onChange }) => {
  return (
    <div className="ss-textarea-wrap">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Your AI-generated description will appear here..."
      />
    </div>
  );
};

export default DescriptionInput;