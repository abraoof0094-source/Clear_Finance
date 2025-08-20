import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Download, Upload, AlertCircle } from "lucide-react";
import { clientStorage } from "../utils/clientStorage";

export function DataBackup() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await clientStorage.exportData();

      // Create and download file
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clear-finance-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert("Data exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const text = await file.text();
      await clientStorage.importData(text);

      alert(
        "Data imported successfully! Please refresh the page to see your data.",
      );
      window.location.reload();
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import data. Please check the file format.");
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = "";
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Data Backup & Restore</h3>

      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
          <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Important:</p>
            <p>
              Your data is stored locally in your browser. Regular backups
              ensure you don't lose your financial data if you clear browser
              data or switch devices.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Export Data</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Download all your transaction data as a JSON file for backup.
            </p>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exporting..." : "Export Data"}
            </Button>
          </div>

          <div>
            <h4 className="font-medium mb-2">Import Data</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Restore your data from a previously exported backup file.
            </p>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="import-file"
              />
              <Button
                asChild
                disabled={isImporting}
                className="w-full"
                variant="outline"
              >
                <label htmlFor="import-file" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {isImporting ? "Importing..." : "Import Data"}
                </label>
              </Button>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>
            <strong>Tips:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Export your data regularly to avoid data loss</li>
            <li>
              Keep backup files in a safe location (cloud storage, email, etc.)
            </li>
            <li>Import will replace all existing data with the backup</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
