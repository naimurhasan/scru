import type { PendingWebhookDelivery } from "@scru/db";
import { describe, expect, it, vi } from "vitest";
import {
  createWebhookProcessor,
  type WebhookDeps,
} from "./createWebhookProcessor.ts";

const createdAt = new Date("2026-10-13T10:00:00.000Z");

const pending: PendingWebhookDelivery = {
  secret: "whsec_test",
  delivery: {
    id: "delivery-1",
    workspaceId: "workspace-1",
    taskId: "task-1",
    url: "https://example.com/hook",
    event: "task.completed",
    status: "pending",
    attempts: 0,
    httpStatus: null,
    lastError: null,
    createdAt,
    deliveredAt: null,
  },
  task: {
    id: "task-1",
    workspaceId: "workspace-1",
    apiKeyId: null,
    taskType: "GOOGLE",
    status: "COMPLETED",
    priority: 1,
    idempotencyKey: null,
    payload: { query: "best crm" },
    result: { organicResults: [] },
    errorCode: null,
    errorMessage: null,
    creditsCharged: 3,
    webhookUrl: null,
    createdAt,
    startedAt: createdAt,
    completedAt: createdAt,
  },
};

const createDeps = () => ({
  findDelivery: vi.fn<WebhookDeps["findDelivery"]>(async () => pending),
  recordAttempt: vi.fn<WebhookDeps["recordAttempt"]>(async () => undefined),
  send: vi.fn<WebhookDeps["send"]>(async () => ({
    ok: true,
    httpStatus: 200,
    error: null,
  })),
  isAllowedUrl: vi.fn<WebhookDeps["isAllowedUrl"]>(() => true),
});

const attempt = { deliveryId: "delivery-1", isLastAttempt: false };

describe("createWebhookProcessor", () => {
  it("sends the task with its event and records the delivery", async () => {
    const deps = createDeps();
    await createWebhookProcessor(deps)(attempt);

    expect(deps.send).toHaveBeenCalledWith({
      url: "https://example.com/hook",
      secret: "whsec_test",
      payload: {
        event: "task.completed",
        task: expect.objectContaining({
          id: "task-1",
          status: "COMPLETED",
          result: { organicResults: [] },
          creditsCharged: 3,
        }),
      },
    });
    expect(deps.recordAttempt).toHaveBeenCalledWith("delivery-1", {
      status: "delivered",
      httpStatus: 200,
      error: null,
    });
  });

  it("keeps the delivery pending and asks for a retry when the endpoint fails", async () => {
    const deps = createDeps();
    deps.send.mockResolvedValue({
      ok: false,
      httpStatus: 500,
      error: "The endpoint answered 500",
    });

    await expect(createWebhookProcessor(deps)(attempt)).rejects.toThrow(
      "The endpoint answered 500",
    );
    expect(deps.recordAttempt).toHaveBeenCalledWith("delivery-1", {
      status: "pending",
      httpStatus: 500,
      error: "The endpoint answered 500",
    });
  });

  it("marks the delivery failed after the last attempt", async () => {
    const deps = createDeps();
    deps.send.mockResolvedValue({
      ok: false,
      httpStatus: null,
      error: "fetch failed",
    });

    await expect(
      createWebhookProcessor(deps)({ ...attempt, isLastAttempt: true }),
    ).rejects.toThrow();
    expect(deps.recordAttempt.mock.calls[0]?.[1].status).toBe("failed");
  });

  it("never calls an address that is not allowed, and does not retry", async () => {
    const deps = createDeps();
    deps.isAllowedUrl.mockReturnValue(false);

    await createWebhookProcessor(deps)(attempt);

    expect(deps.send).not.toHaveBeenCalled();
    expect(deps.recordAttempt.mock.calls[0]?.[1].status).toBe("failed");
  });

  it("skips a delivery that already succeeded or no longer exists", async () => {
    const delivered = createDeps();
    delivered.findDelivery.mockResolvedValue({
      ...pending,
      delivery: { ...pending.delivery, status: "delivered" },
    });
    const missing = createDeps();
    missing.findDelivery.mockResolvedValue(null);

    await createWebhookProcessor(delivered)(attempt);
    await createWebhookProcessor(missing)(attempt);

    expect(delivered.send).not.toHaveBeenCalled();
    expect(missing.send).not.toHaveBeenCalled();
  });
});
