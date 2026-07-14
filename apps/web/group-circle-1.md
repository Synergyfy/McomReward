# Group Circle Documentation

The **Group Circle** resource allows businesses to create and manage collective financial or social groups (like ROSCA/Smart Money or simple community groups) with their network contacts.

## Roles & Access Control
- **Access**: All endpoints are restricted to users with the `Business` role.
- **Ownership**: Businesses can only access and manage circles they have created.

## Key Entities
- **GroupCircle**: The core group entity.
- **GroupCircleMember**: Links a network contact to a circle.
- **GroupCircleContribution**: Tracks payments for Smart Money circles.
- **GroupMessage**: Chat history (Group and Direct messages).
- **GroupActivity**: Audit log of events.

---

## API Endpoints & Data Examples

### 1. Circles Management

#### `POST /group-circles`
Create a new circle.
- **Payload**: `CreateGroupCircleDto`
  ```json
  {
    "name": "Savings Group 1",
    "description": "Weekly savings circle",
    "type": "Enums: MARKETING, ADVERTISING, NEARBY, HYPERLOCAL, NATIONAL, GLOBAL, SMART_MONEY",
    "duration": "Enums: 90, 180, 270, 360",
    "visibility": " PRIVATE, INVITE_ONLY ",
    "interactionLevel": "READ, MESSAGE, COLLABORATE",
    "contributionAmount": 50,
    "networkIds": [
      "550e8400-e29b-41d4-a716-446655440000",
      "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
    ]
  }
  ```
- **Response Data**:
  ```json
  {
    "id": "circle-uuid",
    "name": "Savings Group 1",
    "description": "Weekly savings circle",
    "type": "SMART_MONEY",
    "duration": 90,
    "visibility": "PRIVATE",
    "interactionLevel": "READ",
    "status": "ACTIVE",
    "contributionAmount": 50,
    "payoutFrequency": "WEEKLY",
    "currentRound": 0,
    "startDate": "2023-10-27T10:00:00Z",
    "members": [
      {
        "id": "member-uuid",
        "role": "PERIPHERAL",
        "drawDate": "2023-11-03T10:00:00Z",
        "network": { "id": "net-uuid", "fullName": "John Doe" }
      }
    ]
  }
  ```

#### `GET /group-circles`
List all circles owned by the business.

- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Number of items per page (default: 10)
- **Response Data Example**:
  ```json
  {
   {
  "data": [
    {
      "id": "808db07c-e503-4d69-b73f-e7c8169c47c3",
      "createdAt": "2025-12-19T15:29:34.372Z",
      "updatedAt": "2025-12-19T15:29:34.372Z",
      "deletedAt": null,
      "name": "Climax",
      "description": "new cofee",
      "type": "NEARBY",
      "duration": 90,
      "visibility": "PRIVATE",
      "interactionLevel": "READ",
      "status": "active",
      "contributionAmount": "30",
      "payoutFrequency": null,
      "currentRound": 0,
      "startDate": "2025-12-19T15:29:34.366Z",
      "members": [
        {
          "id": "611e1df1-3de4-470a-8546-43eb18bf8c77",
          "createdAt": "2025-12-19T15:29:34.435Z",
          "updatedAt": "2025-12-19T15:29:34.435Z",
          "deletedAt": null,
          "role": "PERIPHERAL",
          "drawDate": null,
          "network": {
            "id": "8418fb28-76ed-4a01-97c0-36d92a558110",
            "createdAt": "2025-12-13T09:40:08.399Z",
            "updatedAt": "2025-12-13T11:01:30.362Z",
            "deletedAt": null,
            "hasSharingPermission": true,
            "fullName": "mark man",
            "businessName": "Frank Business",
            "email": "okeyemesinwa@gmail.com",
            "phone": "+2349024913156",
            "locationTag": "nearby",
            "relationshipTag": "customer",
            "status": "pending",
            "permission": "pending",
            "isOnboarded": false,
            "onboardedType": null,
            "onboardedBusinessId": null,
            "onboardedPartnerId": null
          }
        }
      ]
    },
    {
      "id": "cf738b8d-0a00-4ae4-a660-77c59a432cdc",
      "createdAt": "2025-12-19T14:43:53.302Z",
      "updatedAt": "2025-12-19T14:43:53.302Z",
      "deletedAt": null,
      "name": "string",
      "description": "string",
      "type": "MARKETING",
      "duration": 90,
      "visibility": "PRIVATE",
      "interactionLevel": "READ",
      "status": "active",
      "contributionAmount": "30",
      "payoutFrequency": null,
      "currentRound": 0,
      "startDate": "2025-12-19T14:43:53.295Z",
      "members": [
        {
          "id": "6886eeb4-78e2-4593-8e23-dc0d0fcab7a0",
          "createdAt": "2025-12-19T14:43:53.411Z",
          "updatedAt": "2025-12-19T14:43:53.411Z",
          "deletedAt": null,
          "role": "PERIPHERAL",
          "drawDate": null,
          "network": {
            "id": "8418fb28-76ed-4a01-97c0-36d92a558110",
            "createdAt": "2025-12-13T09:40:08.399Z",
            "updatedAt": "2025-12-13T11:01:30.362Z",
            "deletedAt": null,
            "hasSharingPermission": true,
            "fullName": "mark man",
            "businessName": "Frank Business",
            "email": "okeyemesinwa@gmail.com",
            "phone": "+2349024913156",
            "locationTag": "nearby",
            "relationshipTag": "customer",
            "status": "pending",
            "permission": "pending",
            "isOnboarded": false,
            "onboardedType": null,
            "onboardedBusinessId": null,
            "onboardedPartnerId": null
          }
        }
      ]
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "lastPage": 1,
    "nextPage": null,
    "prevPage": null
  }
}
  }
  ```

#### `GET /group-circles/:id`
Get full details of a specific circle.
- **Response Data**: Same as `POST /group-circles` response.

#### `PATCH /group-circles/:id`
Update basic info.
- **Request body (schema)**: UpdateGroupCircleDto{
name	string
description	string
type	string
Enum:
[ MARKETING, ADVERTISING, NEARBY, HYPERLOCAL, NATIONAL, GLOBAL, SMART_MONEY ]
duration	number
Enum:
[ 90, 180, 270, 360 ]
visibility	string
Enum:
[ PRIVATE, INVITE_ONLY ]
interactionLevel	string
Enum:
[ READ, MESSAGE, COLLABORATE ]
networkIds	[
List of Network IDs to add to the circle

string]
contributionAmount	number
}.

---

### 2. Member Management

#### `POST /group-circles/:id/members`
Add a member.

- **Request body (schema)**: AddMemberDto{

networkId*	string
role	string
Enum:
[ CORE, PERIPHERAL, BANKER, PARTNER ]

}
- **Response Data example**:
  ```json
 {
  "role": "CORE",
  "groupCircle": {
    "id": "808db07c-e503-4d69-b73f-e7c8169c47c3",
    "createdAt": "2025-12-19T15:29:34.372Z",
    "updatedAt": "2025-12-19T17:58:05.326Z",
    "deletedAt": null,
    "name": "test",
    "description": "test",
    "type": "MARKETING",
    "duration": 90,
    "visibility": "PRIVATE",
    "interactionLevel": "READ",
    "status": "active",
    "contributionAmount": "0",
    "payoutFrequency": null,
    "currentRound": 0,
    "startDate": "2025-12-19T15:29:34.366Z",
    "members": [
      {
        "id": "611e1df1-3de4-470a-8546-43eb18bf8c77",
        "createdAt": "2025-12-19T15:29:34.435Z",
        "updatedAt": "2025-12-19T15:29:34.435Z",
        "deletedAt": null,
        "role": "PERIPHERAL",
        "drawDate": null,
        "network": {
          "id": "8418fb28-76ed-4a01-97c0-36d92a558110",
          "createdAt": "2025-12-13T09:40:08.399Z",
          "updatedAt": "2025-12-13T11:01:30.362Z",
          "deletedAt": null,
          "hasSharingPermission": true,
          "fullName": "mark man",
          "businessName": "Frank Business",
          "email": "okeyemesinwa@gmail.com",
          "phone": "+2349024913156",
          "locationTag": "nearby",
          "relationshipTag": "customer",
          "status": "pending",
          "permission": "pending",
          "isOnboarded": false,
          "onboardedType": null,
          "onboardedBusinessId": null,
          "onboardedPartnerId": null
        }
      }
    ]
  },
  "network": {
    "id": "6f97e82c-69c1-49b7-9f13-f4bb7ebcc183",
    "createdAt": "2025-12-19T17:50:55.297Z",
    "updatedAt": "2025-12-19T17:50:55.297Z",
    "deletedAt": null,
    "hasSharingPermission": true,
    "fullName": "john doe",
    "businessName": "synergyfy",
    "email": "frankemesinwa@gmail.com",
    "phone": "+2347064890703",
    "locationTag": "hyperlocal",
    "relationshipTag": "supplier",
    "status": "pending",
    "permission": "pending",
    "isOnboarded": false,
    "onboardedType": null,
    "onboardedBusinessId": null,
    "onboardedPartnerId": null
  },
  "drawDate": null,
  "id": "b9f9b3bf-5509-4da0-8adc-db7227abc783",
  "createdAt": "2025-12-20T07:02:09.804Z",
  "updatedAt": "2025-12-20T07:02:09.804Z",
  "deletedAt": null
}
  ```

#### `DELETE /group-circles/:id/members/:memberId`
Remove a member.
- **Response**: `200 OK` (No content).

#### `POST /group-circles/:id/assign-banker`
Assign a banker.
- **Response Data**:
  ```json
  { "id": "member-uuid", "role": "BANKER", ... }
  ```

#### `POST /group-circles/:id/swap-draw-dates`
Swap payout dates.
- **Response Data**:
  ```json
  { "message": "Draw dates swapped" }
  ```

---

### 3. Contributions (Smart Money Only)

#### `POST /group-circles/{id}/contributions/initiate`
Record manual contribution.
- **Parameters**:
  - `id`: Circle id (required)

- **Request body (schema)**: InitiateContributionDto{
memberId*	string
amount*	number
provider*	string
Enum:
[ STRIPE, PAYPAL, MANUAL ]
round*	number
}
- **Response Data**:
  ```json
  {
  "clientSecret": "...",
  "orderId": "..."

  }
  ```

#### `POST /group-circles/:id/contributions/initiate`
Initiate online payment.
- **Response Data (Stripe)**:
  ```json
  { "clientSecret": "pi_123_secret_abc" }
  ```
- **Response Data (PayPal)**:
  ```json
  { "orderId": "ORD-12345" }
  ```

#### `POST /group-circles/:id/contributions/verify`
Verify/Record online transaction.

- **Parameters**:
  - `id`: Circle id (required)

- **Request body schema**: VerifyContributionDto{
memberId*	string
amount*	number
round*	number
provider*	string
Enum:
[ STRIPE, PAYPAL, MANUAL ]
transactionId*	string
}
- **Response Data**: {
  "id": "string",
  "created_at": "2025-12-20T15:37:27.173Z",
  "updated_at": "2025-12-20T15:37:27.173Z",
  "deleted_at": "2025-12-20T15:37:27.173Z",
  "amount": 0,
  "round": 0,
  "status": "PENDING",
  "paidAt": "2025-12-20T15:37:27.173Z",
  "provider": "STRIPE",
  "transactionId": "string"
}

#### `GET /group-circles/contributions`
All contributions for the business.
- **Response Data**:
  ```json
  {
    "data": [ { "id": "uuid", "amount": 50, "groupCircle": { "name": "Circle 1" }, ... } ],
    "meta": {
       "total": 1,
       "page": 1,
       "limit": 20,
       "lastPage": 1,
       "nextPage": null,
       "prevPage": null
    }
  }
  ```

---

### 4. Messaging & Activity

#### `POST /group-circles/:id/messages`
Send message.

- **Params**:
  ```json
  {
    "id": "circle-uuid"
  }
  ```
- **Request body (schema)**:
  ```json
  {
    SendMessageDto{
content*	string
Message content

recipientId	string
ID of the recipient member for Direct Messages (optional)

senderId	string
ID of the sender (optional, defaults to authenticated user)

}
  }
  ```
- **Response Data**:
  ```json
  {
    "id": "msg-uuid",
    "content": "Hello!",
    "type": "GROUP",
    "senderName": "Business Owner",
    "senderId": "bus-uuid",
    "created_at": "..."
  }
  ```

#### `GET /group-circles/:id/messages`
Get message history.

- **Params**

id *
string
(path)
id
page *
number
(query)
The page number.

Default value : 1

1
limit *
number
(query)
The number of items per page.

Default value : 10

10
type
string
(query)
Filter by message type (GROUP or DIRECT)

Available values : GROUP, DIRECT


--
memberId
string
(query)
Filter messages involving a specific member (sender or recipient)

memberId

- **Response Data**:
  ```json
  {
    "data": [ { "id": "uuid", "content": "Hello", ... }, ... ],
    "meta": {
       "total": 10,
       "page": 1,
       "limit": 20,
       "lastPage": 1,
       "nextPage": null,
       "prevPage": null
    }
  }
  ```

#### `GET /group-circles/:id/activities`
Get activity log.
- **Response Data**:
  ```json
  {
    "data": [
      {
        "id": "activity-uuid",
        "action": "MEMBER_ADDED",
        "details": { "networkId": "net-uuid" },
        "created_at": "..."
      }
    ]
  }
  ```
