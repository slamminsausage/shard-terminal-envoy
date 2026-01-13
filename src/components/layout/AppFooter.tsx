import React, { useState } from "react";
import { Dices, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiceRoller } from "@/components/dice/DiceRoller";
import { ExportImportDialog } from "@/components/campaign/ExportImportDialog";

export default function AppFooter() {
  const [isDiceRollerOpen, setIsDiceRollerOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);

  return (
    <>
      <footer className="fixed bottom-4 right-4 flex gap-2 z-50">
        {/* Dice Roller Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDiceRollerOpen(true)}
          className="gap-2 shadow-lg"
        >
          <Dices className="w-4 h-4" />
          <span className="hidden sm:inline">Roll Dice</span>
        </Button>

        {/* Export/Import Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExportImportOpen(true)}
          className="gap-2 shadow-lg"
        >
          <FileJson className="w-4 h-4" />
          <span className="hidden sm:inline">Export/Import</span>
        </Button>
      </footer>

      <DiceRoller
        isOpen={isDiceRollerOpen}
        onClose={() => setIsDiceRollerOpen(false)}
      />

      <ExportImportDialog
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
      />
    </>
  );
}
