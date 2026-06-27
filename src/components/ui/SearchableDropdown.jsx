import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export default function SearchableDropdown({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  renderOption,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIdx, setHighlightIdx] = useState(0);
  const ref = useRef(null);
  const inputRef = useRef(null);

  const filtered = options.filter(opt => {
    const label = typeof opt === 'string' ? opt : opt.label || opt.name || '';
    return label.toLowerCase().includes(search.toLowerCase());
  });

  const selectedOption = options.find(opt => {
    const val = typeof opt === 'string' ? opt : opt.id || opt.value;
    return val === value;
  });

  const selectedLabel = selectedOption
    ? typeof selectedOption === 'string'
      ? selectedOption
      : selectedOption.label || selectedOption.name
    : '';

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setHighlightIdx(0);
  }, [search]);

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlightIdx]) {
        const val = typeof filtered[highlightIdx] === 'string'
          ? filtered[highlightIdx]
          : filtered[highlightIdx].id || filtered[highlightIdx].value;
        onChange(val);
        setIsOpen(false);
        setSearch('');
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearch('');
    }
  };

  return (
    <div ref={ref} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg
          border text-sm text-left transition-all duration-150
          ${disabled
            ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-white border-slate-200 hover:border-primary-400 focus-ring cursor-pointer'
          }
          ${isOpen ? 'border-primary-400 ring-2 ring-primary-100' : ''}
        `}
      >
        <span className={selectedLabel ? 'text-text-primary' : 'text-text-muted'}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-slide-down">
          {/* Search Input */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg bg-slate-50 border-none outline-none focus:bg-slate-100"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-text-muted text-center">No results found</div>
            ) : (
              filtered.map((opt, idx) => {
                const optValue = typeof opt === 'string' ? opt : opt.id || opt.value;
                const optLabel = typeof opt === 'string' ? opt : opt.label || opt.name;
                const optIcon = typeof opt === 'object' ? opt.icon : null;
                const isSelected = optValue === value;
                const isHighlighted = idx === highlightIdx;

                return (
                  <button
                    key={optValue}
                    type="button"
                    onClick={() => {
                      onChange(optValue);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    onMouseEnter={() => setHighlightIdx(idx)}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors
                      ${isHighlighted ? 'bg-primary-50' : ''}
                      ${isSelected ? 'text-primary-600 font-medium' : 'text-text-primary'}
                    `}
                  >
                    {optIcon && <span className="text-base">{optIcon}</span>}
                    <span className="flex-1">{renderOption ? renderOption(opt) : optLabel}</span>
                    {isSelected && <Check className="w-4 h-4 text-primary-600" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
