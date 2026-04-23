import React, { useState, useEffect, useRef } from 'react';
const MultiSelectDropdown = ({ options, selected, onChange, placeholder = "Select options" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Toggle option selection
  const toggleOption = (optionId) => {
    if (selected.includes(optionId)) {
      onChange(selected.filter(id => id !== optionId));
    } else {
      onChange([...selected, optionId]);
    }
  };
  // Get selected option names for display
  const selectedNames = options
    .filter(option => selected.includes(option._id))
    .map(option => option.name)
    .join(", ");
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown trigger */}
      <div
        className="w-full px-[20px] py-[12px] bg-[#F5F6FA] rounded-[5px] outline-none border border-gray-300 cursor-pointer min-h-[44px] flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`text-sm ${selected.length === 0 ? 'text-gray-500' : 'text-gray-800'}`}>
          {selectedNames || placeholder}
        </span>
        <span className="ml-2 text-gray-500">{isOpen ? '▲' : '▼'}</span>
      </div>
      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-[5px] shadow-lg">
          {/* Search input */}
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {/* Options list */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option._id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(option._id);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option._id)}
                    onChange={() => {}}
                    className="mr-2"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm">{option.name}</span>
                </div>
              ))
            )}
          </div>
          {/* Clear all button */}
          {selected.length > 0 && (
            <div className="p-2 border-t">
              <button
                className="w-full py-1 text-sm text-red-500 hover:bg-gray-100 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([]);
                }}
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default MultiSelectDropdown;