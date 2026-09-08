# BSTORM LMS — Production Backend API Documentation

Dedicated Node.js + Express backend service written in **100% TypeScript (`.ts`)** with Mongoose ODM, MongoDB, JWT authentication, and Razorpay payment integration.

---

## 1. System Architecture & Base URLs

- **Backend Service**: Express 5 + TypeScript (`.ts`)
- **Default Port**: `5000`
- **Base API Endpoint**: `http://localhost:5000/api/v1`
- **Health Check**: `GET http://localhost:5000/api/health`

### Environment Variables
Configure `.env` in the `backend/` directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/bts_lms
JWT_SECRET=your-256-bit-secret-key-change-in-production
JWT_REFRESH_SECRET=your-256-bit-refresh-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
RAZORPAY_KEY_ID=rzp_test_YourKeyId
RAZORPAY_KEY_SECRET=YourRazorpaySecret
RAZORPAY_WEBHOOK_SECRET=YourRazorpayWebhookSecret
```

---

## 2. Standard API Response Formats

All responses follow a consistent envelope structure:

### Success Response (`HTTP 200 / 201`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response (`HTTP 400 / 401 / 403 / 404 / 409 / 429 / 500`)
```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters.",
    "details": ["Parameter 'courseId' must be a valid 24-character hexadecimal ObjectId."]
  }
}
```

---

## 3. Standard Error Codes

| Error Code | HTTP Status | Description |
| :--- | :--- | :--- |
| `VALIDATION_ERROR` | 400 | Missing required fields, invalid formats, or non-ObjectId URL parameters |
| `AUTHENTICATION_ERROR` | 401 | Missing, invalid, or expired JWT access token |
| `FORBIDDEN` | 403 | Insufficient role permissions or IDOR cross-user access attempt |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Resource already exists (e.g. duplicate email, duplicate enrollment) |
| `RATE_LIMIT_EXCEEDED` | 429 | IP has sent too many requests within the rate limit window |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error (stack traces hidden from client responses) |

---

## 4. API Endpoints Reference

### 4.1 Authentication (`/api/v1/auth`)

#### Register Student
- **Endpoint**: `POST /api/v1/auth/signup`
- **Access**: Public (Rate limited: 5 requests / 15 mins)
- **Request Body**:
  ```json
  {
    "name": "Arun Kumar",
    "email": "arun.kumar@gmail.com",
    "password": "Password@123",
    "college": "PSG College of Technology",
    "district": "Coimbatore",
    "state": "Tamil Nadu"
  }
  ```
- **Response**: `201 Created` with User DTO and sets HttpOnly `accessToken` & `refreshToken` cookies.

#### Login
- **Endpoint**: `POST /api/v1/auth/login`
- **Access**: Public (Rate limited: 5 requests / 15 mins)
- **Request Body**:
  ```json
  {
    "email": "student@bstorm.edu",
    "password": "password123"
  }
  ```
- **Response**: `200 OK` with User DTO and sets HttpOnly cookies.

#### Get Current Session User
- **Endpoint**: `GET /api/v1/auth/me`
- **Access**: Authenticated (Requires valid JWT)
- **Response**: `200 OK` with sanitized user profile.

#### Refresh Access Token
- **Endpoint**: `POST /api/v1/auth/refresh`
- **Access**: Public (Reads `refreshToken` cookie)
- **Response**: `200 OK` with new `accessToken`.

#### Logout
- **Endpoint**: `POST /api/v1/auth/logout`
- **Access**: Authenticated
- **Response**: `200 OK`, clears auth cookies and invalidates refresh token.

---

### 4.2 Courses Catalog (`/api/v1/courses`)

#### List Courses (Filterable & Searchable)
- **Endpoint**: `GET /api/v1/courses`
- **Query Parameters**:
  - `category`: `Frontend Development`, `Backend Architecture`, `Full-Stack Development`, `Data Science & AI`, `Cloud & DevOps`
  - `level`: `Beginner`, `Intermediate`, `Advanced`, `All Levels`
  - `search`: Case-insensitive text search on title, description, and skills
  - `sort`: `featured`, `price-asc`, `price-desc`, `rating`, `popular`
  - `page`: Page index (default: `1`)
  - `limit`: Items per page (default: `20`)
- **Response**: `200 OK` with course array and pagination metadata.

#### Get Course Details
- **Endpoint**: `GET /api/v1/courses/:courseId`
- **Validation**: `:courseId` must be 24-character hexadecimal ObjectId (returns `400` if invalid).
- **Response**: `200 OK` with course data, modules, and instructors.

#### Get Course Modules
- **Endpoint**: `GET /api/v1/courses/:courseId/modules`
- **Response**: `200 OK` with ordered module hierarchy.

#### Get Course Lessons
- **Endpoint**: `GET /api/v1/courses/:courseId/lessons`
- **Response**: `200 OK` with all lessons mapped to their modules.

#### Enroll in Course
- **Endpoint**: `POST /api/v1/courses/:courseId/enroll`
- **Access**: Authenticated Student
- **Response**: `201 Created` with initialized `Enrollment` record.

#### Get Course Assessment Test
- **Endpoint**: `GET /api/v1/courses/:courseId/test`
- **Access**: Authenticated Student
- **Security**: Questions are stripped of correct answer indices and explanations before response.
- **Response**: `200 OK` with questions, options, time limit, and passing score.

#### Submit Course Assessment Test
- **Endpoint**: `POST /api/v1/courses/:courseId/test/submit`
- **Access**: Authenticated Student
- **Request Body**:
  ```json
  {
    "answers": {
      "68a1c0000000000000000001": 2,
      "68a1c0000000000000000002": 0
    }
  }
  ```
- **Response**: `200 OK` with score percentage, pass/fail status, and generated certificate (if passed).

---

### 4.3 Student Profile, Progress & Credentials (`/api/v1/user`)

All routes in this group strictly enforce **IDOR (Insecure Direct Object Reference) Protection** by scoping all database queries directly to the authenticated caller (`req.user._id`).

#### Get Profile
- **Endpoint**: `GET /api/v1/user/profile`
- **Access**: Authenticated

#### Update Profile
- **Endpoint**: `PUT /api/v1/user/profile`
- **Access**: Authenticated
- **Security**: Strict field whitelisting. Privilege escalation attempts (`role`, `email`, `password`) are automatically rejected.

#### Get Enrolled Courses & Progress
- **Endpoint**: `GET /api/v1/user/courses`
- **Access**: Authenticated
- **Response**: `200 OK` with array of courses enrolled by the active user.

#### Get Course Progress Summary
- **Endpoint**: `GET /api/v1/user/courses/:courseId/progress`
- **Access**: Authenticated

#### Update Current Active Lesson
- **Endpoint**: `PUT /api/v1/user/courses/:courseId/progress`
- **Request Body**: `{ "currentLessonId": "68a1c0000000000000000005" }`

#### Mark Lesson Complete
- **Endpoint**: `POST /api/v1/user/courses/:courseId/lessons/:lessonId/complete`
- **Response**: `200 OK` with updated progress percentage.

#### Get Earned Certificates
- **Endpoint**: `GET /api/v1/user/certificates`
- **Access**: Authenticated

#### Generate Certificate
- **Endpoint**: `POST /api/v1/user/certificates/generate`
- **Request Body**: `{ "courseId": "68a1c0000000000000000001" }`
- **Verification**: Enforces that the student has passed the course test before issuing credential.

---

### 4.4 Payments & Razorpay Integration (`/api/v1/payments`)

#### Create Payment Order
- **Endpoint**: `POST /api/v1/payments/orders`
- **Access**: Authenticated Student (Rate limited: 10 requests / 15 mins)
- **Request Body**:
  ```json
  {
    "courseId": "68a1c0000000000000000001"
  }
  ```
- **Security**: Price is fetched server-side from MongoDB (`Course.findById`). Client price parameter is strictly ignored to prevent client price tampering.
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "orderId": "68a1d0000000000000000001",
      "razorpayOrderId": "order_mock_12345678",
      "amount": 299900,
      "currency": "INR",
      "keyId": "rzp_test_YourKeyId",
      "courseTitle": "Full-Stack Web Development Bootcamp"
    }
  }
  ```

#### Verify Payment Signature
- **Endpoint**: `POST /api/v1/payments/verify`
- **Access**: Authenticated Student
- **Request Body**:
  ```json
  {
    "orderId": "68a1d0000000000000000001",
    "razorpayOrderId": "order_mock_12345678",
    "razorpayPaymentId": "pay_mock_abcdefgh",
    "razorpaySignature": "authentic_hmac_sha256_hex_digest"
  }
  ```
- **Security**: Computes HMAC SHA-256 using `RAZORPAY_KEY_SECRET`. Compares signatures using length-guarded `crypto.timingSafeEqual`. Automatically creates course enrollment upon verification.
- **Response**: `200 OK`

#### Razorpay Webhook
- **Endpoint**: `POST /api/v1/payments/razorpay/webhook`
- **Access**: Public / Razorpay Webhook IP with `x-razorpay-signature`
- **Security**:
  - Validates signature using raw body buffer (`req.rawBody`).
  - Checks `WebhookEvent` collection for idempotency. Duplicate events are skipped safely with `200 OK`.

---

## 5. Security Architecture Summary

1. **Helmet**: Secures HTTP response headers against clickjacking, MIME sniffing, and cross-site scripting.
2. **Restricted CORS**: Restricts origins strictly to `process.env.FRONTEND_URL`.
3. **Payload Limits**: Rejects request bodies exceeding 15kb to prevent memory denial-of-service.
4. **NoSQL Injection Sanitizer**: Recursively strips dangerous operator keys (`$`, `.`) from request payloads.
5. **Pre-emptive ObjectId Validation**: Rejects invalid 24-hex string IDs with HTTP 400 before database execution.
6. **Tiered Rate Limiting**: Dedicated rate limiters for authentication endpoints, payment processing, and general API operations.
7. **Safe Logging**: Password and token fields are redacted from server logs. Stack traces are never leaked to client responses.
