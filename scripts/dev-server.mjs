#!/usr/bin/env node

import { execFileSync, spawn } from "node:child_process";
import net from "node:net";
import process from "node:process";

const args = process.argv.slice(2);
const portFlagIndex = args.indexOf("--port");
const port = portFlagIndex >= 0 ? Number(args[portFlagIndex + 1]) : 4000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function findWindowsListeners(targetPort) {
  const output = execFileSync("netstat", ["-ano", "-p", "tcp"], { encoding: "utf8" });
  const pids = new Set();

  for (const line of output.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.includes("LISTENING")) continue;

    const columns = trimmed.split(/\s+/);
    const localAddress = columns[1] || "";
    const pid = columns[columns.length - 1];
    if (!pid || pid === String(process.pid)) continue;

    if (localAddress.endsWith(`:${targetPort}`)) {
      pids.add(pid);
    }
  }

  return [...pids];
}

function findUnixListeners(targetPort) {
  const commands = [
    ["lsof", ["-ti", `tcp:${targetPort}`]],
    ["fuser", ["-n", "tcp", String(targetPort)]],
  ];

  for (const [command, commandArgs] of commands) {
    try {
      const output = execFileSync(command, commandArgs, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
      const pids = output
        .split(/\s+/)
        .map((item) => item.trim())
        .filter((item) => item && item !== String(process.pid));
      if (pids.length) return [...new Set(pids)];
    } catch {
      // Try the next command.
    }
  }

  return [];
}

function killPid(pid) {
  if (process.platform === "win32") {
    execFileSync("taskkill", ["/PID", pid, "/T", "/F"], { stdio: "ignore" });
    return;
  }

  try {
    process.kill(Number(pid), "SIGTERM");
  } catch {
    return;
  }
}

async function canListen(targetPort) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(targetPort);
  });
}

async function waitForPort(targetPort, timeoutMs = 5000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await canListen(targetPort)) return true;
    await sleep(250);
  }
  return false;
}

async function clearPort(targetPort) {
  if (!Number.isFinite(targetPort)) return;

  const pids = process.platform === "win32" ? findWindowsListeners(targetPort) : findUnixListeners(targetPort);
  if (!pids.length) return;

  console.log(`[dev] Port ${targetPort} is in use by PID${pids.length > 1 ? "s" : ""} ${pids.join(", ")}. Stopping old dev server...`);
  for (const pid of pids) {
    try {
      killPid(pid);
    } catch (error) {
      console.warn(`[dev] Could not stop PID ${pid}.`, error);
    }
  }

  const released = await waitForPort(targetPort);
  if (!released) {
    console.warn(`[dev] Port ${targetPort} still appears busy. Next.js may fail to start.`);
  }
}

await clearPort(port);

const nextCommand = process.platform === "win32" ? "next.cmd" : "next";
const child = spawn(nextCommand, ["dev", ...args], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
