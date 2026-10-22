import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const authHeader = req.headers.get("authorization");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  // 1. First try forwarding to FastAPI backend
  try {
    const res = await fetch(`${BACKEND_URL}/api/subscription/dev-reset`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
  } catch (error: any) {
    console.warn("Backend server unreachable for dev-reset, falling back to direct database execution:", error?.message);
  }

  // 2. Fallback: Direct database reset via Python virtual environment
  try {
    const userId = body.user_id || "demo_user";
    const email = body.email || "";
    const backendDir = path.resolve(process.cwd(), "../backend");
    const pythonPath = path.join(backendDir, "venv", "bin", "python3");

    const pythonCode = `
import sys
sys.path.append('${backendDir}')
import database
import json

res = database.dev_reset_user_billing('${userId}', '${email}')
print(json.dumps(res))
`;

    const { stdout } = await execFileAsync(pythonPath, ["-c", pythonCode], { cwd: backendDir });
    const lines = stdout.trim().split("\n");
    const jsonLine = lines.find((l) => l.trim().startsWith("{") && l.trim().endsWith("}")) || "{}";
    const data = JSON.parse(jsonLine);

    return NextResponse.json(data, { status: 200 });
  } catch (fallbackError: any) {
    console.error("Direct fallback reset error:", fallbackError);
    return NextResponse.json(
      { detail: "Failed to process developer reset request: " + fallbackError?.message },
      { status: 500 }
    );
  }
}
