import { PartnerEventNotifier } from "./partner-event-notifier.service";
import { PartnerRewardEvent } from "../enums/partner-reward.enums";

describe("PartnerEventNotifier", () => {
  let mesh: any;
  let config: any;
  let notifier: PartnerEventNotifier;

  beforeEach(() => {
    mesh = {
      getClientId: () => "mcom-rewards",
      callPeerByClientId: jest.fn().mockResolvedValue({ ok: true }),
    };
    config = { get: jest.fn(() => undefined) };
    notifier = new PartnerEventNotifier(mesh, config);
  });

  it("pushes the event to the peer directly with a service token (no HMAC)", async () => {
    const ok = await notifier.notify(
      "fundordonate",
      PartnerRewardEvent.ISSUED,
      {
        id: "issuance-1",
      },
    );

    expect(ok).toBe(true);
    expect(mesh.callPeerByClientId).toHaveBeenCalledWith(
      "fundordonate",
      "/api/v1/partner/events",
      expect.objectContaining({
        method: "POST",
        data: expect.objectContaining({
          event: PartnerRewardEvent.ISSUED,
          source: "mcom-rewards",
          data: { id: "issuance-1" },
        }),
      }),
      "rewards:issue",
    );
    // No signed/shared-secret header ever leaves this service.
    const [, , options] = mesh.callPeerByClientId.mock.calls[0];
    expect(JSON.stringify(options.headers ?? {})).not.toContain("signature");
  });

  it("honours the configured path and scope", async () => {
    config.get.mockImplementation(
      (key: string) =>
        (
          ({
            MCOM_PARTNER_EVENT_PATH: "/custom/events",
            MCOM_PARTNER_EVENT_SCOPE: "service:write",
          }) as Record<string, string>
        )[key],
    );

    await notifier.notify("fundordonate", PartnerRewardEvent.REDEEMED, {});

    expect(mesh.callPeerByClientId).toHaveBeenCalledWith(
      "fundordonate",
      "/custom/events",
      expect.any(Object),
      "service:write",
    );
  });

  it("swallows peer failures so the local transaction never fails", async () => {
    mesh.callPeerByClientId.mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(
      notifier.notify("fundordonate", PartnerRewardEvent.EXPIRED, {}),
    ).resolves.toBe(false);
  });
});
