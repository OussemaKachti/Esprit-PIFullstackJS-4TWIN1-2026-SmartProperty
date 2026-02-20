const PricingSection = ({
  listingType, setListingType,
  price, setPrice,
  period, setPeriod,
  errors, setErrors,
}) => {
  const clearError = (key) => setErrors((p) => ({ ...p, [key]: "" }));

  return (
    <>
      <div className={`ts-field ${errors.listingType ? "error" : ""}`}>
        <label className="ts-label">LISTING TYPE</label>
        <div className={`ts-input-wrapper ${errors.listingType ? "error" : ""}`}>
          <select
            value={listingType}
            onChange={(e) => { setListingType(e.target.value); clearError("listingType"); }}
          >
            <option value="">Select listing type</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </div>
        {errors.listingType && <div className="ts-error-text">{errors.listingType}</div>}
      </div>

      {/* Price */}
      <div className={`ts-field ${errors.price ? "error" : ""}`}>
        <label className="ts-label">PRICE</label>
        <div className={`ts-input-wrapper ${errors.price ? "error" : ""}`}>
          <span className="ts-input-prefix">TND</span>
          <input
            type="number"
            placeholder="e.g. 285,000"
            value={price}
            min="0"
            onChange={(e) => { setPrice(e.target.value); clearError("price"); }}
          />
        </div>
        {errors.price && <div className="ts-error-text">{errors.price}</div>}
      </div>

      {listingType === "rent" && (
        <div className={`ts-field ${errors.period ? "error" : ""}`}>
          <label className="ts-label">RENTAL PERIOD</label>
          <div className={`ts-input-wrapper ${errors.period ? "error" : ""}`}>
            <select
              value={period}
              onChange={(e) => { setPeriod(e.target.value); clearError("period"); }}
            >
              <option value="">Select period</option>
              <option value="night">Per Night</option>
              <option value="week">Per Week</option>
              <option value="month">Per Month</option>
              <option value="year">Per Year</option>
            </select>
          </div>
          {errors.period && <div className="ts-error-text">{errors.period}</div>}
        </div>
      )}
    </>
  );
};

export default PricingSection;