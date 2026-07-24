"use client";

import React from 'react';

interface Option {
  label: string;
  value: string;
  color: string;
  shape: string;
}

interface PersonalityCrystalsProps {
  options: Option[];
  onSelect: (value: string) => void;
}

export function PersonalityCrystals({ options, onSelect }: PersonalityCrystalsProps) {
  // A temporary 2D fallback so the build passes and the UI works
  // until the real 3D component is pushed to the repository.
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className="px-8 py-4 rounded-xl font-medium text-white transition-transform hover:scale-105 shadow-lg"
          style={{ backgroundColor: opt.color }}
        >
          {opt.label} ({opt.shape})
        </button>
      ))}
    </div>
  );
}
