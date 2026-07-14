/**
 * Unit tests for the updateWorkspace result matrix (Phase 1).
 * Tests the pure decision logic extracted into resolveUpdateResult.
 */
import assert from "node:assert/strict";
import test from "node:test";

import { resolveUpdateResult } from "./useWorkspaces.tsx";

const WS_A = [
  {
    id: "ws-1",
    name: "Workspace A",
    relayUrl: "wss://relay-a.example.com",
    addedAt: "2024-01-01",
  },
  {
    id: "ws-2",
    name: "Workspace B",
    relayUrl: "wss://relay-b.example.com",
    addedAt: "2024-01-02",
  },
];

// ---------------------------------------------------------------------------
// 5-case matrix from the plan
// ---------------------------------------------------------------------------

test("resolveUpdateResult_untouched_submit_returns_unchanged", () => {
  // Prefilled overlay submitted with identical values — no persist, no bump.
  const result = resolveUpdateResult(WS_A, "ws-1", "ws-1", {
    name: "Workspace A",
    relayUrl: "wss://relay-a.example.com",
  });
  assert.deepEqual(result, { kind: "unchanged" });
});

test("resolveUpdateResult_name_only_edit_returns_updated_without_reinit", () => {
  // Name change persists but does NOT trigger a backend reapply.
  const result = resolveUpdateResult(WS_A, "ws-1", "ws-1", {
    name: "New Name",
  });
  assert.deepEqual(result, { kind: "updated", requiresReinit: false });
});

test("resolveUpdateResult_relay_edit_returns_updated_with_reinit", () => {
  // Relay URL change on the active workspace triggers backend reapply.
  const result = resolveUpdateResult(WS_A, "ws-1", "ws-1", {
    relayUrl: "wss://relay-c.example.com",
  });
  assert.deepEqual(result, { kind: "updated", requiresReinit: true });
});

test("resolveUpdateResult_duplicate_relay_returns_duplicate", () => {
  // Trying to set ws-1's relay to ws-2's relay URL is a duplicate.
  const result = resolveUpdateResult(WS_A, "ws-1", "ws-1", {
    relayUrl: "wss://relay-b.example.com",
  });
  assert.deepEqual(result, { kind: "duplicate-relay" });
});

test("resolveUpdateResult_not_found_returns_not_found", () => {
  const result = resolveUpdateResult(WS_A, "ws-1", "ws-nonexistent", {
    name: "Whatever",
  });
  assert.deepEqual(result, { kind: "not-found" });
});

// ---------------------------------------------------------------------------
// Additional edge cases
// ---------------------------------------------------------------------------

test("resolveUpdateResult_relay_edit_on_inactive_workspace_no_reinit", () => {
  // Relay change on a NON-active workspace persists but doesn't reinit.
  const result = resolveUpdateResult(WS_A, "ws-1", "ws-2", {
    relayUrl: "wss://relay-c.example.com",
  });
  assert.deepEqual(result, { kind: "updated", requiresReinit: false });
});

test("resolveUpdateResult_token_change_on_active_requires_reinit", () => {
  const result = resolveUpdateResult(WS_A, "ws-1", "ws-1", {
    token: "new-token",
  });
  assert.deepEqual(result, { kind: "updated", requiresReinit: true });
});

test("resolveUpdateResult_pubkey_change_does_not_require_reinit", () => {
  // pubkey is display-only — not a backend-relevant field.
  const result = resolveUpdateResult(WS_A, "ws-1", "ws-1", {
    pubkey: "newpubkey123",
  });
  assert.deepEqual(result, { kind: "updated", requiresReinit: false });
});

test("resolveUpdateResult_same_relay_url_is_not_duplicate_of_self", () => {
  // Setting the same relay URL that ws-1 already has is unchanged, not duplicate.
  const result = resolveUpdateResult(WS_A, "ws-1", "ws-1", {
    relayUrl: "wss://relay-a.example.com",
  });
  assert.deepEqual(result, { kind: "unchanged" });
});
