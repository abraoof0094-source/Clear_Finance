import React from "react";
import { themeColors, ThemeColors } from "../utils/themeColors";

interface ThemePreviewProps {
  themeId: string;
  isSelected: boolean;
  onClick: () => void;
  themeName: string;
  themeDescription: string;
}

export function ThemePreview({
  themeId,
  isSelected,
  onClick,
  themeName,
  themeDescription,
}: ThemePreviewProps) {
  const colors = themeColors[themeId];

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 rounded-lg transition-colors border border-border"
    >
      <div className="flex-1">
        <div className="font-medium">{themeName}</div>
        <div className="text-sm text-muted-foreground mb-3">
          {themeDescription}
        </div>

        {/* Color Preview */}
        <div className="flex gap-2 mb-2">
          <div
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: colors.primary }}
            title="Primary"
          />
          <div
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: colors.income }}
            title="Income"
          />
          <div
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: colors.expense }}
            title="Expense"
          />
          <div
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: colors.accent }}
            title="Accent"
          />
          <div
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: colors.success }}
            title="Success"
          />
        </div>

        {/* Sample Text */}
        <div className="text-xs space-y-1">
          <div style={{ color: colors.primary }}>Headers & Navigation</div>
          <div className="flex gap-4">
            <span style={{ color: colors.income }}>+₹1,000</span>
            <span style={{ color: colors.expense }}>-₹500</span>
          </div>
        </div>
      </div>

      {isSelected && (
        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center ml-4">
          <div className="w-2 h-2 rounded-full bg-primary-foreground"></div>
        </div>
      )}
    </button>
  );
}
