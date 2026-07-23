import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

function sanitizeData(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeData);
  const copy: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    if (
      ["password", "pass", "secret", "token", "access_token", "refresh_token", "client_secret"].includes(
        key.toLowerCase(),
      )
    ) {
      copy[key] = "***REDACTED***";
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      copy[key] = sanitizeData(obj[key]);
    } else {
      copy[key] = obj[key];
    }
  }
  return copy;
}

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, originalUrl, body, query } = req;
    const ip = req.ip || req.socket?.remoteAddress || "";

    let rawResponseBody: any;
    const originalSend = res.send;

    res.send = function (content: any): Response {
      rawResponseBody = content;
      return originalSend.apply(res, arguments as any);
    };

    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      const statusColor = statusCode >= 400 ? "\x1b[31m" : "\x1b[32m";
      const resetColor = "\x1b[0m";

      this.logger.log(
        `${method} ${originalUrl} ${statusColor}${statusCode}${resetColor} +${duration}ms - IP: ${ip}`,
      );

      if (query && Object.keys(query).length > 0) {
        this.logger.log(`  🔍 Query: ${JSON.stringify(query)}`);
      }

      if (body && typeof body === "object" && Object.keys(body).length > 0) {
        this.logger.log(`  📥 Request Body: ${JSON.stringify(sanitizeData(body))}`);
      }

      if (rawResponseBody !== undefined && rawResponseBody !== null) {
        let parsedBody = rawResponseBody;
        if (typeof rawResponseBody === "string") {
          try {
            parsedBody = JSON.parse(rawResponseBody);
          } catch {
            // keep as string
          }
        }

        let bodyString =
          typeof parsedBody === "object"
            ? JSON.stringify(sanitizeData(parsedBody))
            : String(parsedBody);

        if (bodyString.length > 1500) {
          bodyString = bodyString.substring(0, 1500) + "... [truncated]";
        }

        this.logger.log(`  📤 Response Body: ${bodyString}`);
      }
    });

    next();
  }
}


