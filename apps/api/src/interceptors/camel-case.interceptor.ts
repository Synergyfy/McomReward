import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { isObject, isArray, camelCase } from "lodash";

@Injectable()
export class CamelCaseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return this.transformToCamelCase(data);
      }),
    );
  }

  private transformToCamelCase(data: any, parentKey?: string): any {
    if (isArray(data)) {
      return data.map((item) => this.transformToCamelCase(item, parentKey));
    }

    if (isObject(data) && data !== null && !(data instanceof Date)) {
      const isDictMap =
        parentKey &&
        [
          "tierPrices",
          "tierFeatures",
          "tierDurations",
          "tier_prices",
          "tier_features",
          "tier_durations",
        ].includes(parentKey);

      return Object.keys(data).reduce((acc, key) => {
        const newKey = isDictMap ? key : camelCase(key);
        acc[newKey] = this.transformToCamelCase(data[key], key);
        return acc;
      }, {});
    }

    return data;
  }
}
