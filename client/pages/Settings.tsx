import { useState } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { 
  Settings as SettingsIcon, 
  Download, 
  Database, 
  Trash2, 
  Heart, 
  HelpCircle, 
  MessageSquare,
  Moon,
  Sun
} from "lucide-react";

export function Settings() {
  const [isDarkMode, setIsDarkMode] = useState(true); // Since we're using dark mode by default

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // Here you could implement actual theme switching logic
  };

  return (
    <Layout title="Settings" showMenu={true} showSearch={false}>
      <div className="space-y-6 py-4">
        {/* App Info */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-primary mb-2">Clear Finance</h1>
          <p className="text-sm text-muted-foreground">5.8-free</p>
        </div>

        {/* Preferences Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Preferences</h2>
          </div>
          
          <Card className="p-1">
            <div className="space-y-1">
              {/* Dark Theme Toggle */}
              <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md">
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Moon className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Sun className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="font-medium">Dark Theme</span>
                </div>
                <Switch 
                  checked={isDarkMode} 
                  onCheckedChange={handleThemeToggle}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Management Section */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">Management</h3>
          <Card className="p-1">
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start p-3 h-auto"
              >
                <Download className="h-5 w-5 mr-3 text-muted-foreground" />
                <span>Export records</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start p-3 h-auto"
              >
                <Database className="h-5 w-5 mr-3 text-muted-foreground" />
                <span>Backup & Restore</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start p-3 h-auto"
              >
                <Trash2 className="h-5 w-5 mr-3 text-muted-foreground" />
                <span>Delete & Reset</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Application Section */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">Application</h3>
          <Card className="p-1">
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start p-3 h-auto"
              >
                <Heart className="h-5 w-5 mr-3 text-muted-foreground" />
                <span>Like Clear Finance</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start p-3 h-auto"
              >
                <HelpCircle className="h-5 w-5 mr-3 text-muted-foreground" />
                <span>Help</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start p-3 h-auto"
              >
                <MessageSquare className="h-5 w-5 mr-3 text-muted-foreground" />
                <span>Feedback</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
