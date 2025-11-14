/**
 * Chrome Extension Type Definitions
 * Provides type definitions for Chrome extension APIs
 */

declare namespace chrome {
  namespace sidePanel {
    interface SidePanelOptions {
      path?: string;
      enabled?: boolean;
    }

    function setOptions(options: SidePanelOptions): Promise<void>;
    function open(options?: { windowId?: number }): Promise<void>;
  }

  namespace windows {
    interface Window {
      id?: number;
      focused?: boolean;
    }

    function getAll(): Promise<Window[]>;
  }

  namespace runtime {
    interface InstalledDetails {
      reason: string;
    }
    
    const onInstalled: {
      addListener(callback: (details: InstalledDetails) => void): void;
    };

    const onStartup: {
      addListener(callback: () => void): void;
    };
  }

  namespace action {
    interface Tab {
      windowId?: number;
    }

    const onClicked: {
      addListener(callback: (tab: Tab) => void): void;
    };
  }
}

