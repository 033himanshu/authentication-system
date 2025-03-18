# Authentication System API Documentation

This document provides details about the Authentication System API endpoints, including request URLs, methods, and sample data for easy integration and testing.

## Base URL

```
https://localhost:3002/api/v1/user/
```

---

## **Routes and Usage**

### **User Routes**

### **1. Register**

**POST** `/register`

**Sample Request Body:**

```json
{
    "name": "one",
    "email": "one@one.com",
    "password": "OneOne@1"
}
```

---

### **2. Update Profile Picture**

**POST** `/update-profile-picture`

**Sample Request Body:** (Form-Data)

- **Key:** `profilePicture`
- **Value:** `/path/to/image.jpg`

---

### **3. Get Profile Details**

**GET** `/me`

---

### **4. Delete Profile Picture**

**POST** `/delete-profile-picture`

---

### **5. Delete Account**

**POST** `/delete-account`

**Sample Request Body:**

```json
{
    "email": "two@two.com",
    "password": "Pass@25d3"
}
```

---

### **6. Update Profile**

**POST** `/update-profile`

**Sample Request Body:**

```json
{
    "name": "one",
    "email": "one@one.com"
}
```

---

### **7. Forgot Password**

**POST** `/forgot-password`

**Sample Request Body:**

```json
{
    "email": "one@one.com"
}
```

---

### **8. Reset Password**

**POST** `/reset-password/{token}`

**Sample Request Body:**

```json
{
    "password": "OneOne@12"
}
```

---

### **9. Change Password**

**POST** `/change-password`

**Sample Request Body:**

```json
{
    "currentPassword": "Pass@25d3",
    "newPassword": "OneOne@1"
}
```

---

### **10. Resend Email Verification**

**POST** `/resend-email`

**Sample Request Body:**

```json
{
    "email": "himanshuupa.raj@gmail.com"
}
```

---

### **11. Verify Email**

**GET** `/verify/{token}`

---

### **12. Login**

**POST** `/login`

**Sample Request Body:**

```json
{
    "email": "one@one.com",
    "password": "OneOne@1"
}
```

---

### **13. Logout**

**POST** `/logout`

---

### **14. Home**

**GET** `/home`

---

## **Usage Instructions**

- Ensure your environment variables are correctly configured (e.g., `NODEMAILER_USER`, `NODEMAILER_PASS`).
- For secure endpoints,  in the request headers:

```json
{
    "Authorization": "Bearer <your_token_here>"
}
```

### **15. Refresh Access Token**
**POST** `/refresh-access-token`
---
Description: Generate new access and refresh tokens and save them in cookies.
---
feel free to reach out! 🚀

