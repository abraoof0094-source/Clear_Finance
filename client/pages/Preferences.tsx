import { useState } from "react";
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
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Preferences() {
  const navigate = useNavigate();
  
  // State for various preferences
  const [currencyPosition, setCurrencyPosition] = useState("start");
  const [decimalPlaces, setDecimalPlaces] = useState("2");
  const [theme, setTheme] = useState("original");
  const [uiMode, setUiMode] = useState("system");
  const [currencySign, setCurrencySign] = useState("inr");
  const [remindEveryday, setRemindEveryday] = useState(true);
  const [crashReporting, setCrashReporting] = useState(false);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [showUIModeDialog, setShowUIModeDialog] = useState(false);

  // Theme options
  const themes = [
    { id: "original", name: "Original", description: "Classic dark theme" },
    { id: "modern", name: "Modern", description: "Clean minimal design" },
    { id: "vibrant", name: "Vibrant", description: "Colorful and energetic" },
    { id: "nature", name: "Nature", description: "Green and earth tones" },
  ];

  const currentTheme = themes.find(t => t.id === theme) || themes[0];

  const handleBack = () => {
    navigate(-1);
  };

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
          <h2 className="text-lg font-semibold text-yellow-500 mb-4">Appearance</h2>
          <Card className="p-1">
            <div className="space-y-1">
              {/* Theme */}
              <button
                className="flex items-center justify-between p-4 w-full text-left hover:bg-muted/50 rounded-md transition-colors"
                onClick={() => setShowThemeDialog(true)}
              >
                <div>
                  <div className="font-medium">Theme</div>
                  <div className="text-sm text-muted-foreground">{currentTheme.name}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* UI Mode */}
              <div className="flex items-center justify-between p-4 border-t border-border">
                <div>
                  <div className="font-medium">UI mode</div>
                  <div className="text-sm text-muted-foreground">System default</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Currency Sign */}
              <div className="flex items-center justify-between p-4 border-t border-border">
                <div>
                  <div className="font-medium">Currency sign</div>
                  <div className="text-sm text-muted-foreground">Indian Rupee - INR</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Currency Position */}
              <div className="flex items-center justify-between p-4 border-t border-border">
                <div>
                  <div className="font-medium">Currency position</div>
                  <div className="text-sm text-muted-foreground">At start of amount</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Decimal Places */}
              <div className="flex items-center justify-between p-4 border-t border-border">
                <div>
                  <div className="font-medium">Decimal places</div>
                  <div className="text-sm text-muted-foreground">2 (eg. 10.45)</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </Card>
        </div>

        {/* Security Section */}
        <div>
          <h2 className="text-lg font-semibold text-yellow-500 mb-4">Security</h2>
          <Card className="p-1">
            <div className="p-4">
              <div className="font-medium">Passcode protection (Pro version)</div>
              <div className="text-sm text-muted-foreground mt-1">
                Requires a Passcode to enter MyMoney app
              </div>
            </div>
          </Card>
        </div>

        {/* Notification Section */}
        <div>
          <h2 className="text-lg font-semibold text-yellow-500 mb-4">Notification</h2>
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

        {/* About Section */}
        <div>
          <h2 className="text-lg font-semibold text-yellow-500 mb-4">About</h2>
          <Card className="p-1">
            <div className="space-y-1">
              {/* Crash and Usage Statistics */}
              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">Send crash and usage statistics</div>
                  <div className="text-sm text-muted-foreground">
                    Automatically send crash and usage report to improve MyMoney.
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
                <div className="font-medium">MyMoney : 5.8-free</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Developed by Ananta Raha
                </div>
                <div className="text-sm text-muted-foreground">
                  contact.ananta.raha@gmail.com
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
            <div className="space-y-2">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.id}
                  onClick={() => {
                    setTheme(themeOption.id);
                    setShowThemeDialog(false);
                  }}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 rounded-lg transition-colors border border-border"
                >
                  <div>
                    <div className="font-medium">{themeOption.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {themeOption.description}
                    </div>
                  </div>
                  {theme === themeOption.id && (
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary-foreground"></div>
                    </div>
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
