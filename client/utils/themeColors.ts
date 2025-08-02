// Theme Color Utility for Clear Finance
// Manages font colors across different themes

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  income: string;
  expense: string;
  neutral: string;
  muted: string;
}

export const themeColors: Record<string, ThemeColors> = {
  original: {
    primary: "#FBBF24", // Golden yellow
    secondary: "#F59E0B", // Amber
    accent: "#EAB308", // Yellow
    success: "#10B981", // Emerald
    warning: "#F59E0B", // Amber
    error: "#EF4444", // Red
    income: "#22C55E", // Green
    expense: "#F87171", // Light red
    neutral: "#F3F4F6", // Light gray
    muted: "#9CA3AF", // Gray
  },

  modern: {
    primary: "#3B82F6", // Blue
    secondary: "#6366F1", // Indigo
    accent: "#8B5CF6", // Purple
    success: "#06D6A0", // Teal green
    warning: "#FFD60A", // Bright yellow
    error: "#FF006E", // Hot pink
    income: "#06D6A0", // Teal green
    expense: "#FF8CC8", // Pink
    neutral: "#E5E7EB", // Cool gray
    muted: "#6B7280", // Medium gray
  },

  vibrant: {
    primary: "#FF6B35", // Orange red
    secondary: "#F7931E", // Orange
    accent: "#FFD23F", // Bright yellow
    success: "#4ECDC4", // Turquoise
    warning: "#FFE66D", // Light yellow
    error: "#FF3B30", // Bright red
    income: "#4ECDC4", // Turquoise
    expense: "#FF6B6B", // Coral red
    neutral: "#FFF8E1", // Cream
    muted: "#95A5A6", // Steel gray
  },

  nature: {
    primary: "#16A085", // Teal
    secondary: "#27AE60", // Green
    accent: "#F39C12", // Orange
    success: "#2ECC71", // Bright green
    warning: "#F1C40F", // Yellow
    error: "#E74C3C", // Red
    income: "#27AE60", // Green
    expense: "#E67E22", // Orange
    neutral: "#ECF0F1", // Light blue-gray
    muted: "#7F8C8D", // Blue-gray
  },
};

class ThemeManager {
  private currentTheme: string = "original";
  private styleElement: HTMLStyleElement | null = null;

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme() {
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem("selected-theme") || "original";
    this.setTheme(savedTheme);
  }

  public setTheme(themeId: string) {
    if (!themeColors[themeId]) {
      console.warn(`Theme "${themeId}" not found, using original`);
      themeId = "original";
    }

    this.currentTheme = themeId;
    localStorage.setItem("selected-theme", themeId);
    this.applyThemeColors();
    this.notifyThemeChange();
  }

  public getCurrentTheme(): string {
    return this.currentTheme;
  }

  public getThemeColors(themeId?: string): ThemeColors {
    const theme = themeId || this.currentTheme;
    return themeColors[theme] || themeColors.original;
  }

  private applyThemeColors() {
    const colors = this.getThemeColors();

    // Remove existing style element
    if (this.styleElement) {
      this.styleElement.remove();
    }

    // Create new style element
    this.styleElement = document.createElement("style");
    this.styleElement.id = "theme-colors";

    // Define CSS custom properties for the theme
    const cssRules = `
      :root {
        --theme-primary: ${colors.primary};
        --theme-secondary: ${colors.secondary};
        --theme-accent: ${colors.accent};
        --theme-success: ${colors.success};
        --theme-warning: ${colors.warning};
        --theme-error: ${colors.error};
        --theme-income: ${colors.income};
        --theme-expense: ${colors.expense};
        --theme-neutral: ${colors.neutral};
        --theme-muted: ${colors.muted};
      }

      /* Apply theme colors to specific elements */
      .theme-primary { color: var(--theme-primary) !important; }
      .theme-secondary { color: var(--theme-secondary) !important; }
      .theme-accent { color: var(--theme-accent) !important; }
      .theme-success { color: var(--theme-success) !important; }
      .theme-warning { color: var(--theme-warning) !important; }
      .theme-error { color: var(--theme-error) !important; }
      .theme-income { color: var(--theme-income) !important; }
      .theme-expense { color: var(--theme-expense) !important; }
      .theme-neutral { color: var(--theme-neutral) !important; }
      .theme-muted { color: var(--theme-muted) !important; }

      /* Section headers */
      .section-header { color: var(--theme-primary) !important; }
      
      /* Amount displays */
      .amount-income { color: var(--theme-income) !important; }
      .amount-expense { color: var(--theme-expense) !important; }
      
      /* Success/Error states */
      .status-success { color: var(--theme-success) !important; }
      .status-error { color: var(--theme-error) !important; }
      .status-warning { color: var(--theme-warning) !important; }

      /* Navigation and buttons */
      .nav-primary { color: var(--theme-primary) !important; }
      .text-accent { color: var(--theme-accent) !important; }

      /* Specific overrides for existing yellow classes */
      .text-yellow-500 { color: var(--theme-primary) !important; }
      .text-green-400 { color: var(--theme-income) !important; }
      .text-red-400 { color: var(--theme-expense) !important; }
      .text-blue-500 { color: var(--theme-secondary) !important; }
      .text-purple-500 { color: var(--theme-accent) !important; }
    `;

    this.styleElement.textContent = cssRules;
    document.head.appendChild(this.styleElement);
  }

  private notifyThemeChange() {
    // Dispatch custom event for components to react to theme changes
    const event = new CustomEvent("themeChanged", {
      detail: { theme: this.currentTheme, colors: this.getThemeColors() },
    });
    window.dispatchEvent(event);
  }

  // Utility methods for components
  public getPrimaryColor(): string {
    return this.getThemeColors().primary;
  }

  public getIncomeColor(): string {
    return this.getThemeColors().income;
  }

  public getExpenseColor(): string {
    return this.getThemeColors().expense;
  }

  public getSuccessColor(): string {
    return this.getThemeColors().success;
  }

  public getErrorColor(): string {
    return this.getThemeColors().error;
  }
}

// Create singleton instance
export const themeManager = new ThemeManager();

// Utility function to get theme classes
export const getThemeClasses = (type: keyof ThemeColors) => {
  return `theme-${type}`;
};

// React hook for theme colors
export const useThemeColors = () => {
  const colors = themeManager.getThemeColors();
  const currentTheme = themeManager.getCurrentTheme();

  return {
    colors,
    currentTheme,
    setTheme: (themeId: string) => themeManager.setTheme(themeId),
    getPrimaryColor: () => themeManager.getPrimaryColor(),
    getIncomeColor: () => themeManager.getIncomeColor(),
    getExpenseColor: () => themeManager.getExpenseColor(),
  };
};
