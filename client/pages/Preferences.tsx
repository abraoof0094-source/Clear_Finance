import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { ArrowLeft, ChevronRight, DollarSign, RotateCcw, Sun, Moon, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Preferences() {
  const navigate = useNavigate();

  // Currency Settings
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem("app-currency") || "INR";
  });
  const [currencyPosition, setCurrencyPosition] = useState(() => {
    return localStorage.getItem("currency-position") || "start";
  });
  const [decimalPlaces, setDecimalPlaces] = useState(() => {
    return localStorage.getItem("decimal-places") || "2";
  });

  // Theme Settings
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("dark-mode") || "light";
  });

  // Carry Over Settings
  const [carryOverBudgets, setCarryOverBudgets] = useState(() => {
    return localStorage.getItem("carry-over-budgets") === "true";
  });
  const [carryOverCategories, setCarryOverCategories] = useState(() => {
    return localStorage.getItem("carry-over-categories") === "true";
  });

  // Dialog states
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [showDarkModeDialog, setShowDarkModeDialog] = useState(false);
  const [showDecimalDialog, setShowDecimalDialog] = useState(false);

  // Currency options
  const currencies = [
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
  ];


  // Appearance mode options (only Light and Dark)
  const darkModeOptions = [
    { id: "light", name: "Light", icon: Sun },
    { id: "dark", name: "Dark", icon: Moon },
  ];

  // Decimal options
  const decimalOptions = [
    { id: "0", name: "No decimals", example: "₹100" },
    { id: "1", name: "1 decimal place", example: "₹100.0" },
    { id: "2", name: "2 decimal places", example: "₹100.00" },
  ];

  const currentCurrency =
    currencies.find((c) => c.code === currency) || currencies[0];
  const currentDarkMode =
    darkModeOptions.find((m) => m.id === darkMode) || darkModeOptions[0];
  const currentDecimal =
    decimalOptions.find((d) => d.id === decimalPlaces) || decimalOptions[2];

  const handleBack = () => {
    navigate(-1);
  };


  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    localStorage.setItem("app-currency", newCurrency);
  };

  const handleDarkModeChange = (newMode: string) => {
    setDarkMode(newMode);
    localStorage.setItem("dark-mode", newMode);
    // Apply dark or light mode by toggling the 'dark' class on <html>
    if (newMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleDecimalChange = (newDecimal: string) => {
    setDecimalPlaces(newDecimal);
    localStorage.setItem("decimal-places", newDecimal);
  };

  const handleCarryOverBudgetsChange = (checked: boolean) => {
    setCarryOverBudgets(checked);
    localStorage.setItem("carry-over-budgets", checked.toString());
  };

  const handleCarryOverCategoriesChange = (checked: boolean) => {
    setCarryOverCategories(checked);
    localStorage.setItem("carry-over-categories", checked.toString());
  };

  // Initialize appearance mode on component mount
  useEffect(() => {
    handleDarkModeChange(darkMode);
  }, []);

  return (
    <Layout>
      <div className="space-y-6 py-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Configuration</h1>
        </div>

        {/* Currency Settings Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-gradient-to-br from-green-500 to-emerald-600">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold">Currency Settings</h2>
          </div>
          <Card className="p-1">
            <div className="space-y-1">
              {/* Currency */}
              <button
                className="flex items-center justify-between p-4 w-full text-left hover:bg-muted/50 rounded-md transition-colors"
                onClick={() => setShowCurrencyDialog(true)}
              >
                <div>
                  <div className="font-medium">Currency</div>
                  <div className="text-sm text-muted-foreground">
                    {currentCurrency.name} ({currentCurrency.symbol})
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Currency Position */}
              <div className="flex items-center justify-between p-4 border-t border-border">
                <div>
                  <div className="font-medium">Currency Position</div>
                  <div className="text-sm text-muted-foreground">
                    {currencyPosition === "start"
                      ? "Start of amount"
                      : "End of amount"}
                  </div>
                </div>
                <Select
                  value={currencyPosition}
                  onValueChange={setCurrencyPosition}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="start">Start</SelectItem>
                    <SelectItem value="end">End</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Decimal Places */}
              <button
                className="flex items-center justify-between p-4 w-full text-left hover:bg-muted/50 rounded-md transition-colors border-t border-border"
                onClick={() => setShowDecimalDialog(true)}
              >
                <div>
                  <div className="font-medium">Decimal Places</div>
                  <div className="text-sm text-muted-foreground">
                    {currentDecimal.name}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </Card>
        </div>

        {/* Theme Settings Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-600">
              <Palette className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold">Theme Settings</h2>
          </div>
          <Card className="p-1">
            <div className="space-y-1">
  
              {/* Dark Mode */}
              <button
                className="flex items-center justify-between p-4 w-full text-left hover:bg-muted/50 rounded-md transition-colors border-t border-border"
                onClick={() => setShowDarkModeDialog(true)}
              >
                <div>
                  <div className="font-medium">Appearance Mode</div>
                  <div className="text-sm text-muted-foreground">
                    {currentDarkMode.name}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </Card>
        </div>

        {/* Carry Over Settings Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
              <RotateCcw className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold">Carry Over Settings</h2>
          </div>
          <Card className="p-1">
            <div className="space-y-1">
              {/* Carry Over Budgets */}
              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">Carry Over Budgets</div>
                  <div className="text-sm text-muted-foreground">
                    Continue budget limits to next month
                  </div>
                </div>
                <Switch
                  checked={carryOverBudgets}
                  onCheckedChange={handleCarryOverBudgetsChange}
                />
              </div>

              {/* Carry Over Categories */}
              <div className="flex items-center justify-between p-4 border-t border-border">
                <div>
                  <div className="font-medium">Carry Over Categories</div>
                  <div className="text-sm text-muted-foreground">
                    Keep custom categories for new periods
                  </div>
                </div>
                <Switch
                  checked={carryOverCategories}
                  onCheckedChange={handleCarryOverCategoriesChange}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Currency Selection Dialog */}
        <Dialog open={showCurrencyDialog} onOpenChange={setShowCurrencyDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Select Currency</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {currencies.map((currencyOption) => (
                <button
                  key={currencyOption.code}
                  onClick={() => {
                    handleCurrencyChange(currencyOption.code);
                    setShowCurrencyDialog(false);
                  }}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-mono">
                      {currencyOption.symbol}
                    </span>
                    <div>
                      <div className="font-medium">{currencyOption.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {currencyOption.code}
                      </div>
                    </div>
                  </div>
                  {currency === currencyOption.code && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>


        {/* Dark Mode Selection Dialog */}
        <Dialog open={showDarkModeDialog} onOpenChange={setShowDarkModeDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Appearance Mode</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {darkModeOptions.map((modeOption) => {
                const IconComponent = modeOption.icon;
                return (
                  <button
                    key={modeOption.id}
                    onClick={() => {
                      handleDarkModeChange(modeOption.id);
                      setShowDarkModeDialog(false);
                    }}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{modeOption.name}</div>
                    </div>
                    {darkMode === modeOption.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        {/* Decimal Places Selection Dialog */}
        <Dialog open={showDecimalDialog} onOpenChange={setShowDecimalDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Decimal Places</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {decimalOptions.map((decimalOption) => (
                <button
                  key={decimalOption.id}
                  onClick={() => {
                    handleDecimalChange(decimalOption.id);
                    setShowDecimalDialog(false);
                  }}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <div>
                    <div className="font-medium">{decimalOption.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Example: {decimalOption.example}
                    </div>
                  </div>
                  {decimalPlaces === decimalOption.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
