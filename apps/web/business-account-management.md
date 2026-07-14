# Business Account Management Endpoints

This document details the endpoints available for business owners to manage their account, subscription, and view billing history.

## 1. Get Subscription Level

Retrieves the current subscription level and status for the authenticated business.

- **URL:** `/membership/my-membership`
- **Method:** `GET`
- **Auth Required:** Yes (Bearer Token)
- **Role:** `Business`

### Success Response

**Code:** `200 OK`

**Content:**

```json
{
  "id": "a614a9c4-d83c-4951-be59-8cd2f5b55262",
  "createdAt": "2025-11-26T22:01:36.929Z",
  "updatedAt": "2025-11-27T14:14:03.008Z",
  "deletedAt": null,
  "userId": "18b10af1-9b57-408e-8245-0977819d74db",
  "userType": "Business",
  "status": "active",
  "planType": "quarterly",
  "startsAt": "2025-11-27T14:14:02.985Z",
  "expiresAt": "2026-02-27T14:14:02.827Z",
  "isTrial": false,
  "tier": {
    "id": "64ec4e2f-b496-478d-a15f-b2d246407ad9",
    "createdAt": "2025-11-26T21:32:01.911Z",
    "updatedAt": "2025-11-26T21:32:01.911Z",
    "deletedAt": null,
    "name": "Silver",
    "monthlyPrice": "100.00",
    "annualPrice": "1200.00",
    "quarterlyPrice": "300.00",
    "features": [
      "Testing 1",
      "Testing 2",
      "Testing 3",
      "Testing 4"
    ],
    "status": "draft",
    "stripeMonthlyPriceId": null,
    "stripeQuarterlyPriceId": null,
    "stripeAnnualPriceId": null,
    "paypalMonthlyPlanId": null,
    "paypalQuarterlyPlanId": null,
    "paypalAnnualPlanId": null,
    "qrCodeCount": 0
  }
}
```

### Error Response

**Code:** `401 Unauthorized`

**Content:**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## 2. Get Billing History

Retrieves the billing history for the authenticated business, ordered by date (newest first).

- **URL:** `/membership/my-payment-history`
- **Method:** `GET`
- **Auth Required:** Yes (Bearer Token)
- **Role:** `Business`

### Success Response

**Code:** `200 OK`

**Content:**

```json
[
  {
    "id": "cc322e7b-1445-4264-8728-a262bb8fddb7",
    "createdAt": "2025-11-27T14:14:03.089Z",
    "updatedAt": "2025-11-27T14:14:03.089Z",
    "deletedAt": null,
    "userType": "Business",
    "amount": "300.00",
    "paymentProvider": "stripe",
    "transactionId": "pi_3SY5q67EcmCfbEvl0eK0hao7",
    "status": "succeeded",
    "membership": {
      "id": "a614a9c4-d83c-4951-be59-8cd2f5b55262",
      "createdAt": "2025-11-26T22:01:36.929Z",
      "updatedAt": "2025-11-27T14:14:03.008Z",
      "deletedAt": null,
      "userId": "18b10af1-9b57-408e-8245-0977819d74db",
      "userType": "Business",
      "status": "active",
      "planType": "quarterly",
      "startsAt": "2025-11-27T14:14:02.985Z",
      "expiresAt": "2026-02-27T14:14:02.827Z",
      "isTrial": false,
      "tier": {
        "id": "64ec4e2f-b496-478d-a15f-b2d246407ad9",
        "createdAt": "2025-11-26T21:32:01.911Z",
        "updatedAt": "2025-11-26T21:32:01.911Z",
        "deletedAt": null,
        "name": "Silver",
        "monthlyPrice": "100.00",
        "annualPrice": "1200.00",
        "quarterlyPrice": "300.00",
        "features": [
          "Testing 1",
          "Testing 2",
          "Testing 3",
          "Testing 4"
        ],
        "status": "draft",
        "stripeMonthlyPriceId": null,
        "stripeQuarterlyPriceId": null,
        "stripeAnnualPriceId": null,
        "paypalMonthlyPlanId": null,
        "paypalQuarterlyPlanId": null,
        "paypalAnnualPlanId": null,
        "qrCodeCount": 0
      }
    }
  }
]
```


