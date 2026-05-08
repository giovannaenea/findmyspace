import React from 'react';
import './SearchBar.css';

const FilterDropdown = ({ label, options, value, onChange }) => {
  return (
    <div className="filter-dropdown-container">
      <label>{label}</label>
      <select className="filter-dropdown" value={value} onChange={ (e) => onChange(e.target.value) }>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterDropdown;