import * as React from "react";

import { useWorkspaces } from "../useWorkspaces";
import { WorkspaceEditForm } from "./WorkspaceEditForm";

type WorkspaceChangeOverlayProps = {
  onClose: () => void;
};

export function WorkspaceChangeOverlay({
  onClose,
}: WorkspaceChangeOverlayProps) {
  const { activeWorkspace, updateWorkspace } = useWorkspaces();
  const [error, setError] = React.useState<string | null>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);

  // Focus trap: focus the overlay on mount
  React.useEffect(() => {
    overlayRef.current?.focus();
  }, []);

  // Escape key closes the overlay
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = React.useCallback(
    (name: string, relayUrl: string) => {
      if (!activeWorkspace) return;
      setError(null);
      const result = updateWorkspace(activeWorkspace.id, { name, relayUrl });
      switch (result.kind) {
        case "unchanged":
          onClose();
          break;
        case "updated":
          // If reinit is needed, the workspaceKey change will trigger a remount.
          // If not (name-only), just close.
          if (!result.requiresReinit) {
            onClose();
          }
          // If requiresReinit, the tree remounts — overlay unmounts naturally.
          break;
        case "duplicate-relay":
          setError("Another workspace already uses this relay URL.");
          break;
        case "not-found":
          setError("Workspace not found.");
          break;
      }
    },
    [activeWorkspace, onClose, updateWorkspace],
  );

  if (!activeWorkspace) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      data-testid="workspace-change-overlay"
      ref={overlayRef}
      role="dialog"
      tabIndex={-1}
    >
      {/* Background click closes */}
      <div aria-hidden="true" className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-2xl">
        <h2 className="text-xl font-semibold tracking-tight">
          Change workspace
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Update your workspace name or relay URL.
        </p>
        <div className="mt-6">
          <WorkspaceEditForm
            initialName={activeWorkspace.name}
            initialRelayUrl={activeWorkspace.relayUrl}
            onCancel={onClose}
            onSubmit={handleSubmit}
            submitLabel="Save changes"
          />
        </div>
        {error ? (
          <p className="mt-4 text-center text-sm text-destructive">{error}</p>
        ) : null}
      </div>
    </div>
  );
}
