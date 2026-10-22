"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check, X } from "lucide-react";
import { INDIAN_STATES_AND_UTS } from "@/constants/indianStates";
import styles from "./PayUCheckoutModal.module.css";

interface StateSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
}

export function StateSelect({
  id = "checkout-stateName",
  value,
  onChange,
  onBlur,
  error,
  placeholder = "Select State / UT"
}: StateSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filteredStates = INDIAN_STATES_AND_UTS.filter((st) =>
    st.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery("");
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        if (onBlur) onBlur();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, onBlur]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[highlightedIndex]) {
        (items[highlightedIndex] as HTMLElement).scrollIntoView({
          block: "nearest"
        });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (st: string) => {
    onChange(st);
    setIsOpen(false);
    setSearchQuery("");
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      if (onBlur) onBlur();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredStates.length - 1 ? prev + 1 : 0
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredStates.length - 1
      );
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredStates.length) {
        handleSelect(filteredStates[highlightedIndex]);
      } else if (filteredStates.length === 1) {
        handleSelect(filteredStates[0]);
      }
    }
  };

  return (
    <div className={styles.stateDropdownContainer} ref={containerRef}>
      {/* Hidden input for form serialization & programmatic inspection */}
      <input
        type="hidden"
        name="billing_state"
        value={value}
      />

      {/* Accessible Interactive Trigger Button */}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Billing State or Union Territory"
        className={`${styles.stateSelectTrigger} ${
          error ? styles.inputFieldError : ""
        } ${isOpen ? styles.stateSelectTriggerOpen : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
      >
        <span
          className={value ? styles.stateSelectValue : styles.stateSelectPlaceholder}
        >
          {value || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`${styles.stateSelectChevron} ${
            isOpen ? styles.stateSelectChevronOpen : ""
          }`}
        />
      </button>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div
          className={styles.stateDropdownMenu}
          role="listbox"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Real-time search box */}
          <div className={styles.stateSearchWrapper}>
            <Search size={14} color="#9CA3AF" style={{ flexShrink: 0 }} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              placeholder="Search Indian State or UT..."
              className={styles.stateSearchInput}
              onKeyDown={handleKeyDown}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className={styles.stateClearSearchBtn}
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Options list */}
          <ul ref={listRef} className={styles.stateOptionsList}>
            {filteredStates.length > 0 ? (
              filteredStates.map((st, idx) => {
                const isSelected = value === st;
                const isHighlighted = idx === highlightedIndex;
                return (
                  <li
                    key={st}
                    role="option"
                    aria-selected={isSelected}
                    className={`${styles.stateOptionItem} ${
                      isSelected ? styles.stateOptionItemSelected : ""
                    } ${
                      isHighlighted && !isSelected
                        ? styles.stateOptionItemHighlighted
                        : ""
                    }`}
                    onClick={() => handleSelect(st)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                  >
                    <span>{st}</span>
                    {isSelected && (
                      <Check size={14} color="#059669" style={{ flexShrink: 0 }} />
                    )}
                  </li>
                );
              })
            ) : (
              <li className={styles.stateNoResults}>
                No state or UT matching &quot;{searchQuery}&quot;
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
