// Minimal RESP client for CI's disposable localhost Redis service.
import { createConnection } from "node:net";
type Parsed = { value: unknown; offset: number };
function parse(data: Buffer, offset = 0): Parsed | null {
  const end = data.indexOf("\r\n", offset);
  if (end < 0) return null;
  const type = String.fromCharCode(data[offset]),
    line = data.toString("utf8", offset + 1, end);
  let next = end + 2;
  if (type === "+") return { value: line, offset: next };
  if (type === "-") throw new Error(line);
  if (type === ":") return { value: Number(line), offset: next };
  if (type === "$") {
    const size = Number(line);
    if (size === -1) return { value: null, offset: next };
    if (data.length < next + size + 2) return null;
    return {
      value: data.toString("utf8", next, next + size),
      offset: next + size + 2,
    };
  }
  if (type === "*") {
    const values = [];
    for (let i = 0; i < Number(line); i++) {
      const item = parse(data, next);
      if (!item) return null;
      values.push(item.value);
      next = item.offset;
    }
    return { value: values, offset: next };
  }
  throw new Error("Unexpected Redis test response.");
}
export function redisCommand(command: (string | number)[]): Promise<unknown> {
  const port = Number(process.env.REDIS_TEST_PORT);
  if (!port)
    throw new Error("The disposable Redis test service is not configured.");
  return new Promise((resolve, reject) => {
    const socket = createConnection({ host: "127.0.0.1", port });
    let received = Buffer.alloc(0);
    socket.setTimeout(5000, () =>
      socket.destroy(new Error("Redis test timed out.")),
    );
    socket.on("error", reject);
    socket.on("connect", () => {
      const parts = command.map(String);
      socket.write(
        "*" +
          parts.length +
          "\r\n" +
          parts
            .map(
              (value) =>
                "$" + Buffer.byteLength(value) + "\r\n" + value + "\r\n",
            )
            .join(""),
      );
    });
    socket.on("data", (chunk) => {
      received = Buffer.concat([received, chunk]);
      try {
        const result = parse(received);
        if (result) {
          socket.end();
          resolve(result.value);
        }
      } catch (error) {
        socket.destroy();
        reject(error);
      }
    });
  });
}
