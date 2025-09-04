import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);

  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: "d",
      ctrlKey: true,
      description: "Go to Dashboard",
      action: () => navigate("/dashboard"),
    },
    {
      key: "h",
      ctrlKey: true,
      description: "Go to Holdings",
      action: () => navigate("/dashboard/holdings"),
    },
    {
      key: "i",
      ctrlKey: true,
      description: "Go to Insights",
      action: () => navigate("/dashboard/insights"),
    },
    {
      key: "r",
      ctrlKey: true,
      description: "Go to Risk Analysis",
      action: () => navigate("/dashboard/risk"),
    },
    {
      key: "c",
      ctrlKey: true,
      description: "Go to Charts",
      action: () => navigate("/dashboard/charts"),
    },
    {
      key: "n",
      ctrlKey: true,
      description: "Go to News",
      action: () => navigate("/dashboard/news"),
    },

    // Action shortcuts
    {
      key: "n",
      ctrlKey: true,
      shiftKey: true,
      description: "Add New Holding",
      action: () => navigate("/dashboard/holdings/add"),
    },
    {
      key: "r",
      ctrlKey: true,
      shiftKey: true,
      description: "Refresh Page",
      action: () => window.location.reload(),
    },

    // Search shortcut
    {
      key: "k",
      ctrlKey: true,
      description: "Open Search",
      action: () => {
        const searchInput = document.querySelector(
          "[data-search-input]"
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
    },

    // Help shortcut
    {
      key: "?",
      shiftKey: true,
      description: "Show Keyboard Shortcuts",
      action: () => {
        setShowHelp((prev) => !prev);
      },
    },
  ];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === "true"
      ) {
        return;
      }

      const matchingShortcut = shortcuts.find((shortcut) => {
        const keyMatches =
          event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
        const metaMatches = !!shortcut.metaKey === event.metaKey;
        const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
        const altMatches = !!shortcut.altKey === event.altKey;

        return (
          keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches
        );
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    },
    [shortcuts, navigate]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const parts = [];
    if (shortcut.ctrlKey) parts.push("Ctrl");
    if (shortcut.metaKey) parts.push("Cmd");
    if (shortcut.shiftKey) parts.push("Shift");
    if (shortcut.altKey) parts.push("Alt");
    parts.push(shortcut.key.toUpperCase());
    return parts.join(" + ");
  };

  return {
    shortcuts,
    showHelp,
    setShowHelp,
    formatShortcut,
  };
}

// Hook for command palette functionality
export function useCommandPalette() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const commands = [
    // Navigation commands
    {
      id: "nav-dashboard",
      label: "Go to Dashboard",
      action: () => navigate("/dashboard"),
    },
    {
      id: "nav-holdings",
      label: "Go to Holdings",
      action: () => navigate("/dashboard/holdings"),
    },
    {
      id: "nav-insights",
      label: "Go to Insights",
      action: () => navigate("/dashboard/insights"),
    },
    {
      id: "nav-risk",
      label: "Go to Risk Analysis",
      action: () => navigate("/dashboard/risk"),
    },
    {
      id: "nav-charts",
      label: "Go to Charts",
      action: () => navigate("/dashboard/charts"),
    },
    {
      id: "nav-news",
      label: "Go to News",
      action: () => navigate("/dashboard/news"),
    },

    // Action commands
    {
      id: "add-holding",
      label: "Add New Holding",
      action: () => navigate("/dashboard/holdings/add"),
    },
    {
      id: "refresh",
      label: "Refresh Page",
      action: () => window.location.reload(),
    },

    // Quick actions
    {
      id: "clear-cache",
      label: "Clear Cache",
      action: () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
      },
    },
  ];

  const filteredCommands = commands.filter((command) =>
    command.label.toLowerCase().includes(query.toLowerCase())
  );

  const executeCommand = (command: (typeof commands)[0]) => {
    command.action();
    setIsOpen(false);
    setQuery("");
  };

  // Open command palette with Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isOpen,
    setIsOpen,
    query,
    setQuery,
    commands: filteredCommands,
    executeCommand,
  };
}
