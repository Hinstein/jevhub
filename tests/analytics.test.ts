import { afterEach, describe, expect, it, vi } from "vitest";
import { trackEvent } from "@/lib/analytics";

const originalWindow = globalThis.window;

afterEach(() => {
  if (originalWindow) {
    globalThis.window = originalWindow;
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
});

describe("analytics event dispatch", () => {
  it("sends custom events to GA4 and Umami when both are available", () => {
    const gtag = vi.fn();
    const umami = { track: vi.fn() };

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { gtag, umami },
    });

    trackEvent("store_click", { destination: "jevhub.store" });

    expect(gtag).toHaveBeenCalledWith("event", "store_click", {
      destination: "jevhub.store",
    });
    expect(umami.track).toHaveBeenCalledWith("store_click", {
      destination: "jevhub.store",
    });
  });

  it("does not throw when no analytics provider is configured", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {},
    });

    expect(() => trackEvent("calculator_used")).not.toThrow();
  });
});
