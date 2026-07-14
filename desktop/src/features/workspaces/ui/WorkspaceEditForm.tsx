import * as React from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Spinner } from "@/shared/ui/spinner";

export type WorkspaceEditFormProps = {
  cancelLabel?: string;
  initialName: string;
  initialRelayUrl: string;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (name: string, relayUrl: string) => void;
  submitLabel: string;
};

export function WorkspaceEditForm({
  cancelLabel = "Cancel",
  initialName,
  initialRelayUrl,
  isSubmitting = false,
  onCancel,
  onSubmit,
  submitLabel,
}: WorkspaceEditFormProps) {
  const [name, setName] = React.useState(initialName);
  const [relayUrl, setRelayUrl] = React.useState(initialRelayUrl);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmedName = name.trim();
      const trimmedUrl = relayUrl.trim();
      if (!trimmedName) {
        setError("Please enter a workspace name.");
        return;
      }
      if (!trimmedUrl) {
        setError("Please enter a workspace URL.");
        return;
      }
      onSubmit(trimmedName, trimmedUrl);
    },
    [name, onSubmit, relayUrl],
  );

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
      <div className="space-y-1.5 text-left">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="ws-edit-name"
        >
          Workspace name
        </label>
        <Input
          autoFocus
          className="h-10 bg-background"
          id="ws-edit-name"
          onChange={(event) => {
            setName(event.target.value);
            setError(null);
          }}
          placeholder="Design team"
          type="text"
          value={name}
        />
      </div>

      <div className="space-y-1.5 text-left">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="ws-edit-url"
        >
          Workspace URL
        </label>
        <Input
          className="h-10 bg-background"
          id="ws-edit-url"
          onChange={(event) => {
            setRelayUrl(event.target.value);
            setError(null);
          }}
          placeholder="wss://relay.example.com"
          type="text"
          value={relayUrl}
        />
      </div>

      <div className="flex w-full flex-col gap-3 pt-1">
        <Button
          className="h-10 w-full"
          disabled={isSubmitting || !name.trim() || !relayUrl.trim()}
          type="submit"
        >
          {isSubmitting ? (
            <Spinner aria-label="Saving" className="h-4 w-4 border-2" />
          ) : (
            submitLabel
          )}
        </Button>

        <Button
          className="h-10 w-full text-muted-foreground hover:text-accent-foreground"
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
          variant="ghost"
        >
          {cancelLabel}
        </Button>

        {error ? (
          <p className="text-center text-sm text-destructive">{error}</p>
        ) : null}
      </div>
    </form>
  );
}
