"use client";

import { Printer } from "lucide-react";
import { Button } from "./Button";

export function PrintButton() {
  return (
    <Button variant="secondary" size="sm" onClick={() => window.print()} className="no-print">
      <Printer className="h-4 w-4" />
      הדפסה / שמירה כ-PDF
    </Button>
  );
}
