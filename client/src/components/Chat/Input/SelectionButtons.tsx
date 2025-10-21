import React, { useState, useEffect } from 'react';
import { cn } from '~/utils';

interface SelectionButtonsProps {
  options: string[];
  selectedOptions: string[];
  onSelectionChange: (selected: string[]) => void;
  disabled?: boolean;
}

const SelectionButtons: React.FC<SelectionButtonsProps> = ({
  options,
  selectedOptions,
  onSelectionChange,
  disabled = false,
}) => {
  const handleOptionClick = (option: string) => {
    if (disabled) return;
    
    const isSelected = selectedOptions.includes(option);
    if (isSelected) {
      // Remove from selection
      onSelectionChange(selectedOptions.filter(opt => opt !== option));
    } else {
      // Add to selection
      onSelectionChange([...selectedOptions, option]);
    }
  };

  if (options.length === 0) {
    return null;
  }

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {options.map((option, index) => {
        const isSelected = selectedOptions.includes(option);
        return (
          <button
            key={index}
            type="button"
            disabled={disabled}
            onClick={() => handleOptionClick(option)}
            className={cn(
              'rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200',
              'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              isSelected
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
};

export default SelectionButtons;
