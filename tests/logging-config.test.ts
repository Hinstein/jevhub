import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve("deploy/logging");
const read = (name: string) => readFileSync(join(root, name), "utf8");
const journalFiles = readdirSync(root).filter((name) => name.startsWith("journald") && name.endsWith(".conf"));
const namespaceFiles = journalFiles.filter((name) => name.startsWith("journald@"));

function settings(text: string) {
  return Object.fromEntries(text.split("\n").filter((line) => /^[A-Za-z].*=/.test(line)).map((line) => {
    const position = line.indexOf("=");
    return [line.slice(0, position), line.slice(position + 1)];
  }));
}

describe("local business logging configuration", () => {
  it("splits a sub-1-GiB journal budget instead of allocating 1 GiB per project", () => {
    const totalMiB = journalFiles.reduce((total, name) => {
      const value = settings(read(name)).SystemMaxUse;
      expect(value).toMatch(/^\d+M$/);
      return total + Number(value.slice(0, -1));
    }, 0);
    expect(totalMiB).toBe(488);
    expect(totalMiB).toBeLessThanOrEqual(512);
  });

  it("bounds every journal pool and keeps namespace output local and non-duplicated", () => {
    for (const name of journalFiles) {
      const config = settings(read(name));
      expect(config.Storage).toBe("persistent");
      expect(config.Compress).toBe("yes");
      expect(config.MaxRetentionSec).toBe("14day");
      expect(config.MaxFileSec).toBe("1day");
      expect(config.SystemKeepFree).toBe("2G");
      expect(config.RuntimeMaxUse).toMatch(/^\d+M$/);
    }
    for (const name of namespaceFiles) {
      const config = settings(read(name));
      expect(config.ForwardToSyslog).toBe("no");
      expect(config.ReadKMsg).toBe("no");
    }
    expect(settings(read("journald-default.conf")).ForwardToSyslog).toBe("yes");
  });

  it("separates InboxRevamp Web from tasks without dropping plain stderr", () => {
    const web = settings(read("units/inboxrevamp.service.conf"));
    const task = settings(read("inboxrevamp-gmail-cron.conf"));
    expect(web.LogNamespace).not.toBe(task.LogNamespace);
    expect(task.LogNamespace).toBe("inbox-jobs");
    expect(task.SyslogLevel).toBe("notice");
    expect(task.LogLevelMax).toBe("notice");
    expect(read("inboxrevamp-gmail-cron.conf")).not.toMatch(/(?:ExecStart|Environment|OnCalendar|OnUnitInactiveSec)=/);
  });

  it("maps only logging properties and references existing pool configurations", () => {
    for (const name of readdirSync(join(root, "units"))) {
      const config = settings(read(`units/${name}`));
      expect(Object.keys(config)).toEqual(["LogNamespace"]);
      expect(namespaceFiles).toContain(`journald@${config.LogNamespace}.conf`);
    }
  });

  it("checks file limits hourly and uses rsyslog reopen instead of truncation", () => {
    const timer = read("logrotate-hourly.conf");
    expect(timer).toContain("OnCalendar=\nOnCalendar=hourly");
    const config = read("logrotate-rsyslog.conf");
    expect(config).toContain("/usr/lib/rsyslog/rsyslog-rotate");
    expect(config).not.toMatch(/^\s*copytruncate\s*$/m);
    for (const name of ["rsyslog", "postgresql-common", "pgbackrest", "btmp", "wtmp"]) {
      const text = read(`logrotate-${name}.conf`);
      expect(text).toMatch(/\bmaxage 14\b/);
      expect(text).toMatch(/\bmaxsize \d+M\b/);
      expect(text).not.toMatch(/\b(?:rm|find|docker|pgbackrest expire)\b/);
    }
  });

  it("keeps Docker budgets separate from recreation authority and totals them by project", () => {
    const plan = JSON.parse(read("docker-capacity-plan.json")) as {
      note: string;
      driver: string;
      containers: { name: string; project: string; maxSizeMiB: number; maxFiles: number }[];
    };
    expect(plan.note).toContain("separately approved recreation");
    expect(plan.note).toContain("No age TTL");
    expect(plan.driver).toBe("json-file");
    expect(new Set(plan.containers.map((container) => container.name)).size).toBe(7);
    expect(plan.containers.reduce((total, container) => total + container.maxSizeMiB * container.maxFiles, 0)).toBe(120);
  });

  it("limits Compose overrides to logging without touching business settings or volumes", () => {
    const store = JSON.parse(read("compose-store-logging.json"));
    const analytics = JSON.parse(read("compose-umami-logging.json"));
    expect(Object.keys(store.services).sort()).toEqual(["jev-adapter", "new-api", "new-api-postgres", "new-api-redis"]);
    expect(Object.keys(analytics.services).sort()).toEqual(["db", "umami"]);
    for (const override of [store, analytics]) {
      expect(Object.keys(override)).toEqual(["services"]);
      for (const service of Object.values(override.services)) {
        expect(service).toEqual({ logging: { driver: "json-file", options: { "compress": "true", "max-file": "3", "max-size": "5m" } } });
      }
    }
  });

  it("does not age unknown relay files and uses only the existing diagnostic-path override", () => {
    expect(readdirSync(root)).not.toContain("tmpfiles-x-relay.conf");
    expect(read("x-relay-stdout.conf")).toBe("[Service]\nEnvironmentFile=/etc/jevhub-ops/logging/x-relay-stdout.env\n");
    expect(settings(read("x-relay-stdout.env"))).toEqual({ TWSCRAPE_RELAY_LOG_FILE: "/dev/null" });
  });

  it("does not truncate the Bot's delivery diagnostics or rotate its database", () => {
    const config = read("logrotate-goofish.conf");
    expect(config).toContain("/home/ubuntu/GoofishCredentialsBot/logs/*/*.log");
    expect(config).toContain("ifempty");
    expect(config).toContain("create 0640 ubuntu ubuntu");
    expect(config).not.toMatch(/^\s*copytruncate\s*$/m);
    expect(config).not.toMatch(/(?:data\/|\.db|\.env|\/var\/lib\/docker)/);
  });
});
