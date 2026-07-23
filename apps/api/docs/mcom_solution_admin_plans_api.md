# MCOM Solution Admin — System Plans Management API Guide

This document details how **MCOM Solutions Central Admin** can execute full **CRUD operations** on System Plans within MCOM Rewards via HTTP requests. It includes complete **TypeScript DTOs**, **Interfaces**, **cURL requests**, and **JSON Responses**.

---

## 🔑 Authentication

All System Plan endpoints are protected by the `SystemApiKeyGuard`. Every HTTP request **MUST** include the `x-mcom-solution-api-key` header.

```http
x-mcom-solution-api-key: <YOUR_MCOM_SOLUTION_API_KEY>
```

> **Note**: Set the secret string on the server environment variable `MCOM_SOLUTION_API_KEY`.

---

## 🌐 Base URL

- **Development**: `http://localhost:3000/api/v1/system/plans`
- **Production**: `https://<your-api-domain>/api/v1/system/plans`

---

## 📐 TypeScript Interfaces & DTO Definitions

### 1. `ISystemPlanResponse` Interface

This is the standard TypeScript interface for a System Plan object returned by the API.

```typescript
export type PlanType = "STANDARD" | "TRIAL" | "SEASONAL";

export interface ISystemPlanConfiguration {
  maxDeals?: number;
  maxCampaigns?: number;
  hasAnalyticsAccess?: boolean;
  trial?: {
    trialDuration?: number;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface ISystemPlanResponse {
  id: string;
  name: string;
  description: string | null;
  monthlyPrice: number;
  quarterlyPrice: number;
  annualPrice: number;
  features: string[];
  configuration: ISystemPlanConfiguration | null;
  isActive: boolean;
  isDefault: boolean;
  type: PlanType;
  trialDuration: number | null;
  seasonId: string | null;
  stripeMonthlyPriceId: string | null;
  stripeQuarterlyPriceId: string | null;
  stripeAnnualPriceId: string | null;
  paypalMonthlyPlanId: string | null;
  paypalQuarterlyPlanId: string | null;
  paypalAnnualPlanId: string | null;
  created_at: string; // ISO 8601 Timestamp
  updated_at: string; // ISO 8601 Timestamp
}
```

---

### 2. `CreateSystemPlanDto` (Data Transfer Object)

```typescript
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsEnum,
  IsObject,
  IsBoolean,
  ValidateIf,
} from "class-validator";

export class CreateSystemPlanDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  monthlyPrice: number;

  @IsNotEmpty()
  @IsNumber()
  quarterlyPrice: number;

  @IsNotEmpty()
  @IsNumber()
  annualPrice: number;

  @IsNotEmpty()
  @IsArray()
  features: string[];

  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsEnum(["STANDARD", "TRIAL", "SEASONAL"])
  type?: "STANDARD" | "TRIAL" | "SEASONAL";

  @ValidateIf((o) => o.type === "TRIAL")
  @IsNotEmpty()
  @IsNumber()
  trialDuration?: number;

  @ValidateIf((o) => o.type === "SEASONAL")
  @IsNotEmpty()
  @IsString()
  seasonId?: string;

  @IsOptional()
  @IsString()
  stripeMonthlyPriceId?: string;

  @IsOptional()
  @IsString()
  stripeQuarterlyPriceId?: string;

  @IsOptional()
  @IsString()
  stripeAnnualPriceId?: string;

  @IsOptional()
  @IsString()
  paypalMonthlyPlanId?: string;

  @IsOptional()
  @IsString()
  paypalQuarterlyPlanId?: string;

  @IsOptional()
  @IsString()
  paypalAnnualPlanId?: string;
}
```

---

### 3. `UpdateSystemPlanDto`

```typescript
import { PartialType } from "@nestjs/swagger";
import { CreateSystemPlanDto } from "./create-system-plan.dto";

export class UpdateSystemPlanDto extends PartialType(CreateSystemPlanDto) {}
```

---

## 🛠️ CRUD Endpoints Specification

---

### 1. Create System Plan (`POST /api/v1/system/plans`)

Creates a new System Plan.

#### Request Headers
```http
Content-Type: application/json
x-mcom-solution-api-key: YOUR_MCOM_SOLUTION_API_KEY
```

#### Request Body
```json
{
  "name": "Gold Enterprise Plan",
  "description": "High-tier plan for enterprise businesses",
  "monthlyPrice": 49.99,
  "quarterlyPrice": 129.99,
  "annualPrice": 449.99,
  "features": [
    "Unlimited Campaign Creation",
    "Dedicated Analytics Dashboard",
    "Priority Merchant Support"
  ],
  "configuration": {
    "maxDeals": 50,
    "maxCampaigns": 10
  },
  "isActive": true,
  "isDefault": false,
  "type": "STANDARD",
  "stripeMonthlyPriceId": "price_1N...",
  "stripeQuarterlyPriceId": "price_1N...",
  "stripeAnnualPriceId": "price_1N...",
  "paypalMonthlyPlanId": "P-123...",
  "paypalQuarterlyPlanId": "P-456...",
  "paypalAnnualPlanId": "P-789..."
}
```

#### cURL Command
```bash
curl -X POST "https://<your-api-domain>/api/v1/system/plans" \
  -H "Content-Type: application/json" \
  -H "x-mcom-solution-api-key: YOUR_API_KEY_HERE" \
  -d '{
    "name": "Gold Enterprise Plan",
    "description": "High-tier plan for enterprise businesses",
    "monthlyPrice": 49.99,
    "quarterlyPrice": 129.99,
    "annualPrice": 449.99,
    "features": ["Unlimited Campaign Creation", "Dedicated Analytics"],
    "type": "STANDARD",
    "isActive": true
  }'
```

#### Response (`201 Created`)
```json
{
  "id": "e8d67c52-7b19-45e3-982a-3b4c10294812",
  "name": "Gold Enterprise Plan",
  "description": "High-tier plan for enterprise businesses",
  "monthlyPrice": 49.99,
  "quarterlyPrice": 129.99,
  "annualPrice": 449.99,
  "features": [
    "Unlimited Campaign Creation",
    "Dedicated Analytics Dashboard",
    "Priority Merchant Support"
  ],
  "configuration": {
    "maxDeals": 50,
    "maxCampaigns": 10
  },
  "isActive": true,
  "isDefault": false,
  "type": "STANDARD",
  "trialDuration": null,
  "seasonId": null,
  "stripeMonthlyPriceId": "price_1N...",
  "stripeQuarterlyPriceId": "price_1N...",
  "stripeAnnualPriceId": "price_1N...",
  "paypalMonthlyPlanId": "P-123...",
  "paypalQuarterlyPlanId": "P-456...",
  "paypalAnnualPlanId": "P-789...",
  "created_at": "2026-07-23T15:40:00.000Z",
  "updated_at": "2026-07-23T15:40:00.000Z"
}
```

---

### 2. Get All System Plans (`GET /api/v1/system/plans`)

Retrieves a list of all system plans ordered by creation date descending.

#### Request Headers
```http
x-mcom-solution-api-key: YOUR_MCOM_SOLUTION_API_KEY
```

#### cURL Command
```bash
curl -X GET "https://<your-api-domain>/api/v1/system/plans" \
  -H "x-mcom-solution-api-key: YOUR_API_KEY_HERE"
```

#### Response (`200 OK`)
```json
[
  {
    "id": "e8d67c52-7b19-45e3-982a-3b4c10294812",
    "name": "Gold Enterprise Plan",
    "description": "High-tier plan for enterprise businesses",
    "monthlyPrice": 49.99,
    "quarterlyPrice": 129.99,
    "annualPrice": 449.99,
    "features": [
      "Unlimited Campaign Creation",
      "Dedicated Analytics Dashboard"
    ],
    "configuration": {
      "maxDeals": 50
    },
    "isActive": true,
    "isDefault": true,
    "type": "STANDARD",
    "trialDuration": null,
    "seasonId": null,
    "stripeMonthlyPriceId": null,
    "stripeQuarterlyPriceId": null,
    "stripeAnnualPriceId": null,
    "paypalMonthlyPlanId": null,
    "paypalQuarterlyPlanId": null,
    "paypalAnnualPlanId": null,
    "created_at": "2026-07-23T15:40:00.000Z",
    "updated_at": "2026-07-23T15:40:00.000Z"
  }
]
```

---

### 3. Get System Plan By ID (`GET /api/v1/system/plans/:id`)

Retrieves details for a single plan by its UUID.

#### cURL Command
```bash
curl -X GET "https://<your-api-domain>/api/v1/system/plans/e8d67c52-7b19-45e3-982a-3b4c10294812" \
  -H "x-mcom-solution-api-key: YOUR_API_KEY_HERE"
```

#### Response (`200 OK`)
```json
{
  "id": "e8d67c52-7b19-45e3-982a-3b4c10294812",
  "name": "Gold Enterprise Plan",
  "description": "High-tier plan for enterprise businesses",
  "monthlyPrice": 49.99,
  "quarterlyPrice": 129.99,
  "annualPrice": 449.99,
  "features": [
    "Unlimited Campaign Creation",
    "Dedicated Analytics Dashboard"
  ],
  "configuration": {
    "maxDeals": 50
  },
  "isActive": true,
  "isDefault": true,
  "type": "STANDARD",
  "trialDuration": null,
  "seasonId": null,
  "stripeMonthlyPriceId": null,
  "stripeQuarterlyPriceId": null,
  "stripeAnnualPriceId": null,
  "paypalMonthlyPlanId": null,
  "paypalQuarterlyPlanId": null,
  "paypalAnnualPlanId": null,
  "created_at": "2026-07-23T15:40:00.000Z",
  "updated_at": "2026-07-23T15:40:00.000Z"
}
```

---

### 4. Update System Plan (`PATCH /api/v1/system/plans/:id`)

Updates an existing System Plan. Partial payload updates are supported.

#### Request Headers
```http
Content-Type: application/json
x-mcom-solution-api-key: YOUR_MCOM_SOLUTION_API_KEY
```

#### Request Body
```json
{
  "monthlyPrice": 39.99,
  "isActive": true,
  "features": [
    "Unlimited Campaign Creation",
    "Dedicated Analytics Dashboard",
    "24/7 Dedicated Support"
  ]
}
```

#### cURL Command
```bash
curl -X PATCH "https://<your-api-domain>/api/v1/system/plans/e8d67c52-7b19-45e3-982a-3b4c10294812" \
  -H "Content-Type: application/json" \
  -H "x-mcom-solution-api-key: YOUR_API_KEY_HERE" \
  -d '{
    "monthlyPrice": 39.99
  }'
```

#### Response (`200 OK`)
```json
{
  "id": "e8d67c52-7b19-45e3-982a-3b4c10294812",
  "name": "Gold Enterprise Plan",
  "description": "High-tier plan for enterprise businesses",
  "monthlyPrice": 39.99,
  "quarterlyPrice": 129.99,
  "annualPrice": 449.99,
  "features": [
    "Unlimited Campaign Creation",
    "Dedicated Analytics Dashboard",
    "24/7 Dedicated Support"
  ],
  "configuration": {
    "maxDeals": 50
  },
  "isActive": true,
  "isDefault": true,
  "type": "STANDARD",
  "trialDuration": null,
  "seasonId": null,
  "stripeMonthlyPriceId": null,
  "stripeQuarterlyPriceId": null,
  "stripeAnnualPriceId": null,
  "paypalMonthlyPlanId": null,
  "paypalQuarterlyPlanId": null,
  "paypalAnnualPlanId": null,
  "created_at": "2026-07-23T15:40:00.000Z",
  "updated_at": "2026-07-23T15:41:00.000Z"
}
```

---

### 5. Delete System Plan (`DELETE /api/v1/system/plans/:id`)

Soft-deletes a plan from the system.

#### cURL Command
```bash
curl -X DELETE "https://<your-api-domain>/api/v1/system/plans/e8d67c52-7b19-45e3-982a-3b4c10294812" \
  -H "x-mcom-solution-api-key: YOUR_API_KEY_HERE"
```

#### Response (`200 OK`)
```json
{
  "message": "Plan deleted successfully"
}
```

---

## ❌ Error Responses

### 1. `401 Unauthorized` (Missing or Invalid API Key)
```json
{
  "statusCode": 401,
  "message": "Invalid API key",
  "error": "Unauthorized"
}
```

### 2. `400 Bad Request` (Validation Error)
```json
{
  "statusCode": 400,
  "message": [
    "name must be a string",
    "monthlyPrice must be a number"
  ],
  "error": "Bad Request"
}
```

### 3. `404 Not Found` (Plan Does Not Exist)
```json
{
  "statusCode": 404,
  "message": "Plan not found",
  "error": "Not Found"
}
```

### 4. `409 Conflict` (Duplicate Plan Name or Multiple Trials)
```json
{
  "statusCode": 409,
  "message": "Tier with this name already exists",
  "error": "Conflict"
}
```
