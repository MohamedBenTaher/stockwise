import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export const KeyboardShortcutsHelp: React.FC = () => {
  const { shortcuts, showHelp, setShowHelp, formatShortcut } = useKeyboardShortcuts();

  const groupedShortcuts = {
    Navigation: shortcuts.filter(s => 
      s.description.startsWith('Go to') && !s.shiftKey
    ),
    Actions: shortcuts.filter(s => 
      s.description.includes('Add') || s.description.includes('Refresh')
    ),
    Other: shortcuts.filter(s => 
      !s.description.startsWith('Go to') && 
      !s.description.includes('Add') && 
      !s.description.includes('Refresh')
    ),
  };

  return (
    <>
      {/* Floating help button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 shadow-lg"
        onClick={() => setShowHelp(true)}
        title="Keyboard Shortcuts (Shift + ?)"
      >
        <Keyboard className="h-4 w-4" />
      </Button>

      {/* Help dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="font-semibold text-foreground mb-3">{category}</h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                    >
                      <span className="text-sm text-foreground">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1 text-xs font-mono bg-background border border-border rounded">
                        {formatShortcut(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              💡 Tip: These shortcuts work from anywhere in the app, except when typing in input fields.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
