import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { themeManager } from "../utils/themeColors";
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
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PhoneStorageStatus } from "../components/PhoneStorageStatus";
import { ThemePreview } from "../components/ThemePreview";

export function Preferences() {
  const navigate = useNavigate();

  // State for various preferences
  const [currencyPosition, setCurrencyPosition] = useState("start");
  const [decimalPlaces, setDecimalPlaces] = useState("2");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('selected-theme') || 'original';
  });
  const [uiMode, setUiMode] = useState("system");
  const [currencySign, setCurrencySign] = useState("inr");
  const [remindEveryday, setRemindEveryday] = useState(true);
  const [crashReporting, setCrashReporting] = useState(false);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [showUIModeDialog, setShowUIModeDialog] = useState(false);
  const [showDecimalPlacesDialog, setShowDecimalPlacesDialog] = useState(false);

  // Theme options
  const themes = [
    { id: "original", name: "Original", description: "Classic dark theme" },
    { id: "modern", name: "Modern", description: "Clean minimal design" },
    { id: "vibrant", name: "Vibrant", description: "Colorful and energetic" },
    { id: "nature", name: "Nature", description: "Green and earth tones" },
  ];

  // UI mode options
  const uiModes = [
    { id: "light", name: "Light" },
    { id: "dark", name: "Dark" },
    { id: "system", name: "System default" },
  ];

  // Decimal places options
  const decimalOptions = [
    { id: "0", name: "0 (eg. 10)" },
    { id: "1", name: "1 (eg. 10.1)" },
    { id: "2", name: "2 (eg. 10.45)" },
  ];

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];
  const currentUIMode = uiModes.find((m) => m.id === uiMode) || uiModes[2];
  const currentDecimalPlaces =
    decimalOptions.find((d) => d.id === decimalPlaces) || decimalOptions[2];

  const handleBack = () => {
    navigate(-1);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    themeManager.setTheme(newTheme);
  };

  // Initialize theme on component mount
  useEffect(() => {
    themeManager.setTheme(theme);
  }, []);

  return (
    <Layout>
      <div className="space-y-6 py-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Preferences</h1>
        </div>

        {/* Appearance Section */}
        <div>
          <h2 className="text-lg font-semibold section-header mb-4">
            Appearance
          </h2>
          <Card className="p-1">
            <div className="space-y-1">
              {/* Theme */}
              <button
                className="flex items-center justify-between p-4 w-full text-left hover:bg-muted/50 rounded-md transition-colors"
                onClick={() => setShowThemeDialog(true)}
              >
                <div>
                  <div className="font-medium">Theme</div>
                  <div className="text-sm text-muted-foreground">
                    {currentTheme.name}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* UI Mode */}
              <button
                className="flex items-center justify-between p-4 w-full text-left hover:bg-muted/50 rounded-md transition-colors border-t border-border"
                onClick={() => setShowUIModeDialog(true)}
              >
                <div>
                  <div className="font-medium">UI mode</div>
                  <div className="text-sm text-muted-foreground">
                    {currentUIMode.name}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Currency Sign */}
              <div className="flex items-center justify-between p-4 border-t border-border">
                <div>
                  <div className="font-medium">Currency sign</div>
                  <div className="text-sm text-muted-foreground">
                    Indian Rupee - INR
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Currency Position */}
              <div className="flex items-center justify-between p-4 border-t border-border">
                <div>
                  <div className="font-medium">Currency position</div>
                  <div className="text-sm text-muted-foreground">
                    At start of amount
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Decimal Places */}
              <button
                className="flex items-center justify-between p-4 w-full text-left hover:bg-muted/50 rounded-md transition-colors border-t border-border"
                onClick={() => setShowDecimalPlacesDialog(true)}
              >
                <div>
                  <div className="font-medium">Decimal places</div>
                  <div className="text-sm text-muted-foreground">
                    {currentDecimalPlaces.name}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </Card>
        </div>

        {/* Security Section */}
        <div>
          <h2 className="text-lg font-semibold section-header mb-4">
            Security
          </h2>
          <Card className="p-1">
            <div className="p-4">
              <div className="font-medium">
                Passcode protection (Pro version)
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Requires a Passcode to enter Clear Finance app
              </div>
            </div>
          </Card>
        </div>

        {/* Notification Section */}
        <div>
          <h2 className="text-lg font-semibold section-header mb-4">
            Notification
          </h2>
          <Card className="p-1">
            <div className="space-y-1">
              {/* Remind Everyday */}
              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">Remind everyday</div>
                  <div className="text-sm text-muted-foreground">
                    Remind to add expenses occasionally
                  </div>
                </div>
                <Switch
                  checked={remindEveryday}
                  onCheckedChange={setRemindEveryday}
                />
              </div>

              {/* Notification Settings */}
              <div className="flex items-center justify-between p-4 border-t border-border">
                <div className="font-medium">Notification settings</div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </Card>
        </div>

        {/* Phone Storage Status Section */}
        <div>
          <h2 className="text-lg font-semibold section-header mb-4">Phone Storage</h2>
          <PhoneStorageStatus />
        </div>

        {/* Data Management Section */}
        <div>
          <h2 className="text-lg font-semibold section-header mb-4">Data Management</h2>
          <Card className="p-1">
            <div className="space-y-1">
              {/* Export Records */}
              <button
                className="flex items-center justify-between p-4 w-full text-left hover:bg-muted/50 rounded-md transition-colors"
                onClick={() => navigate('/export-records')}
              >
                <div>
                  <div className="font-medium">Export Records</div>
                  <div className="text-sm text-muted-foreground">
                    Export transactions as CSV/Excel files
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Backup & Restore */}
              <button
                className="flex items-center justify-between p-4 w-full text-left hover:bg-muted/50 rounded-md transition-colors border-t border-border"
                onClick={() => navigate('/backup-restore')}
              >
                <div>
                  <div className="font-medium">Backup & Restore</div>
                  <div className="text-sm text-muted-foreground">
                    Create backups and restore data
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </Card>
        </div>

        {/* About Section */}
        <div>
          <h2 className="text-lg font-semibold section-header mb-4">About</h2>
          <Card className="p-1">
            <div className="space-y-1">
              {/* Crash and Usage Statistics */}
              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">
                    Send crash and usage statistics
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Automatically send crash and usage report to improve Clear
                    Finance.
                  </div>
                </div>
                <Switch
                  checked={crashReporting}
                  onCheckedChange={setCrashReporting}
                />
              </div>

              {/* Privacy Policy */}
              <div className="flex items-center justify-between p-4 border-t border-border">
                <div className="font-medium">Privacy policy</div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* App Version */}
              <div className="p-4 border-t border-border">
                <div className="font-medium">Clear Finance: 1.0</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Developed by Adam Asher
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Theme Selection Dialog */}
        <Dialog open={showThemeDialog} onOpenChange={setShowThemeDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Select Theme</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {themes.map((themeOption) => (
                <ThemePreview
                  key={themeOption.id}
                  themeId={themeOption.id}
                  themeName={themeOption.name}
                  themeDescription={themeOption.description}
                  isSelected={theme === themeOption.id}
                  onClick={() => {
                    handleThemeChange(themeOption.id);
                    setShowThemeDialog(false);
                  }}
                />
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* UI Mode Selection Dialog */}
        <Dialog open={showUIModeDialog} onOpenChange={setShowUIModeDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>UI mode</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {uiModes.map((modeOption) => (
                <button
                  key={modeOption.id}
                  onClick={() => {
                    setUiMode(modeOption.id);
                    setShowUIModeDialog(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <div className="relative">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        uiMode === modeOption.id
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {uiMode === modeOption.id && (
                        <div className="w-2 h-2 rounded-full bg-primary-foreground"></div>
                      )}
                    </div>
                  </div>
                  <div className="font-medium">{modeOption.name}</div>
                </button>
              ))}

              {/* Cancel Button */}
              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowUIModeDialog(false)}
                  className="px-8"
                >
                  CANCEL
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Decimal Places Selection Dialog */}
        <Dialog
          open={showDecimalPlacesDialog}
          onOpenChange={setShowDecimalPlacesDialog}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Decimal places</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {decimalOptions.map((decimalOption) => (
                <button
                  key={decimalOption.id}
                  onClick={() => {
                    setDecimalPlaces(decimalOption.id);
                    setShowDecimalPlacesDialog(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <div className="relative">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        decimalPlaces === decimalOption.id
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {decimalPlaces === decimalOption.id && (
                        <div className="w-2 h-2 rounded-full bg-primary-foreground"></div>
                      )}
                    </div>
                  </div>
                  <div className="font-medium">{decimalOption.name}</div>
                </button>
              ))}

              {/* Cancel Button */}
              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDecimalPlacesDialog(false)}
                  className="px-8"
                >
                  CANCEL
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
