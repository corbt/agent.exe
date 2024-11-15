interface Window {
  electron: {
    process: {
      env: Record<string, string>;
    };
    // ... existing definitions ...
    windowControls: {
      minimize: () => Promise<void>;
      maximize: () => Promise<void>;
      close: () => Promise<void>;
    };
  };
}
