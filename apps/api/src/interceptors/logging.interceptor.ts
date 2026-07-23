import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

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
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const delay = Date.now() - now;
          const statusCode = response.statusCode;

          this.logger.log(`<-- ${method} ${url} [${statusCode}] +${delay}ms`);

          if (data !== undefined) {
            let resStr =
              typeof data === "object"
                ? JSON.stringify(sanitizeData(data))
                : String(data);
            if (resStr.length > 800) {
              resStr = resStr.substring(0, 800) + "... [truncated]";
            }
            this.logger.log(`    Response Body: ${resStr}`);
          }
        },
        error: (error) => {
          const delay = Date.now() - now;
          const status = error.status || error.statusCode || 500;
          const errorResponse = error.response || error.message || error;

          this.logger.error(
            `<-- ${method} ${url} [${status}] +${delay}ms`,
          );
          this.logger.error(
            `    Response Error: ${JSON.stringify(sanitizeData(errorResponse))}`,
          );
        },
      }),
    );
  }
}

