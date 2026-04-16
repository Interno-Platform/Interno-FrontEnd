# 📋 Interno Backend API Documentation
## دليل شامل لجميع API Routes

---

## 📌 جدول المحتويات
1. [Users Routes](#users-routes) - مسارات المستخدمين
2. [Admin Routes](#admin-routes) - مسارات المسؤول
3. [Company Routes](#company-routes) - مسارات الشركات
4. [Trainees Routes](#trainees-routes) - مسارات المتدربين
5. [Internship Applications Routes](#internship-applications-routes) - مسارات طلبات التدريب
6. [Skills Routes](#skills-routes) - مسارات المهارات

---

## 🔐 Users Routes
**Base URL:** `/api/users`

### 1️⃣ تسجيل حساب جديد (Register)
```
POST /api/users/register
```
**الوصف:** تسجيل حساب جديد للمتدرب أو الشركة

**متطلبات البيانات (Body):**
- **Form Data (multipart/form-data):**
  - `name` (string, required) - اسم المستخدم
  - `email` (string, required) - البريد الإلكتروني
  - `password` (string, required) - كلمة المرور
  - `role` (enum, required) - دور المستخدم: `"trainee"` أو `"company"`
  - `registration_number` (string, required **للشركات فقط**) - رقم التسجيل
  - `profile_picture` (file, optional) - صورة الملف الشخصي

**مثال البيانات:**
```json
{
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "password": "StrongPassword123!",
  "role": "trainee"
}
```

**البيانات المتطلبة للشركة:**
```json
{
  "name": "شركة التقنية",
  "email": "company@example.com",
  "password": "StrongPassword123!",
  "role": "company",
  "registration_number": "REG123456"
}
```

**الاستجابة الناجحة (201):**
```json
{
  "message": "User registered successfully",
  "user_id": 1,
  "email": "ahmed@example.com"
}
```

---

### 2️⃣ التحقق من البريد الإلكتروني (Verify Email)
```
GET /api/users/verify-code/:user_id/:token
```
**الوصف:** تفعيل البريد الإلكتروني باستخدام الرمز المرسل

**المعاملات (Path Parameters):**
- `user_id` (number) - معرف المستخدم
- `token` (string) - رمز التحقق

**مثال:**
```
GET /api/users/verify-code/1/abc123def456
```

**الاستجابة الناجحة (200):**
```json
{
  "message": "email has been activated successfully"
}
```

---

### 3️⃣ تسجيل الدخول (Login)
```
POST /api/users/login
```
**الوصف:** تسجيل الدخول وzyskanie JWT Token

**متطلبات البيانات (Body):**
```json
{
  "email": "ahmed@example.com",
  "password": "StrongPassword123!"
}
```

**الاستجابة الناجحة (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "role": "trainee"
  }
}
```

---

## 🛡️ Admin Routes
**Base URL:** `/api/admin`
**ملاحظة:** متاح فقط للمسؤولين (Admin Role)

### 1️⃣ الموافقة على الشركة (Approve Company)
```
POST /api/admin/approve-company/:company_id
```
**الوصف:** الموافقة على تسجيل شركة جديدة

**المعاملات (Path Parameters):**
- `company_id` (number) - معرف الشركة

**متطلبات البيانات (Body):**
```json
{}
```

**الاستجابة الناجحة (200):**
```json
{
  "message": "Company approved successfully",
  "company_id": 1
}
```

---

### 2️⃣ الحصول على الشركات المعتمدة (Get Approved Companies)
```
GET /api/admin/approved-companies
```
**الوصف:** الحصول على قائمة جميع الشركات المعتمدة

**معاملات الاستعلام:** لا توجد

**الاستجابة الناجحة (200):**
```json
{
  "message": "Approved companies retrieved",
  "data": [
    {
      "id": 1,
      "name": "شركة التقنية",
      "email": "company@example.com",
      "registration_number": "REG123456",
      "status": "approved"
    }
  ]
}
```

---

### 3️⃣ الحصول على الشركات المعلقة (Get Pending Companies)
```
GET /api/admin/pending-companies
```
**الوصف:** الحصول على قائمة الشركات في انتظار الموافقة

**معاملات الاستعلام:** لا توجد

**الاستجابة الناجحة (200):**
```json
{
  "message": "Pending companies retrieved",
  "data": [
    {
      "id": 2,
      "name": "شركة ناشئة",
      "email": "startup@example.com",
      "registration_number": "REG654321",
      "status": "pending",
      "created_at": "2024-01-15"
    }
  ]
}
```

---

### 4️⃣ تغيير حالة الشركة (Change Company Status)
```
POST /api/admin/account-status/:company_id
```
**الوصف:** تفعيل أو تعطيل حساب الشركة

**المعاملات (Path Parameters):**
- `company_id` (number) - معرف الشركة

**متطلبات البيانات (Body):**
```json
{
  "status": "active"
}
```
**الحالات المتاحة:** `"active"`, `"inactive"`, `"suspended"`

**الاستجابة الناجحة (200):**
```json
{
  "message": "Company status updated successfully",
  "company_id": 1,
  "new_status": "active"
}
```

---

### 5️⃣ الحصول على جميع المتدربين (Get All Trainees)
```
GET /api/admin/trainees
```
**الوصف:** الحصول على قائمة جميع المتدربين المسجلين

**معاملات الاستعلام:** لا توجد

**الاستجابة الناجحة (200):**
```json
{
  "message": "All trainees retrieved",
  "count": 50,
  "data": [
    {
      "id": 1,
      "name": "أحمد محمد",
      "email": "ahmed@example.com",
      "status": "active",
      "created_at": "2024-01-10"
    }
  ]
}
```

---

### 6️⃣ تغيير حالة التدريب (Change Internship Status)
```
POST /api/admin/internship-status
```
**الوصف:** تغيير حالة التدريب (تفعيل/رفض)

**معاملات الاستعلام (Query Parameters):**
- `company_id` (number, required) - معرف الشركة

**متطلبات البيانات (Body):**
```json
{
  "status": "active"
}
```
**الحالات المتاحة:** `"active"`, `"rejected"`

**مثال الطلب:**
```
POST /api/admin/internship-status?company_id=1
Body: { "status": "active" }
```

**الاستجابة الناجحة (200):**
```json
{
  "message": "Internship status updated",
  "status": "active"
}
```

---

### 7️⃣ الحصول على التدريبات المعلقة (Get Pending Internships)
```
GET /api/admin/pending-internships
```
**الوصف:** الحصول على التدريبات في انتظار الموافقة

**معاملات الاستعلام (Query Parameters):**
- `company_id` (number, optional) - لتصفية حسب الشركة

**مثال الطلب:**
```
GET /api/admin/pending-internships?company_id=1
```

**الاستجابة الناجحة (200):**
```json
{
  "message": "Pending internships retrieved",
  "data": [
    {
      "id": 1,
      "title": "مهندس الويب",
      "company_id": 1,
      "status": "pending",
      "created_at": "2024-01-15"
    }
  ]
}
```

---

## 🏢 Company Routes
**Base URL:** `/api/company`
**ملاحظة:** متاح للشركات والمتدربين

### 1️⃣ إنشاء تدريب جديد (Create Internship)
```
POST /api/company/create-internship
```
**الوصف:** إنشاء فرصة تدريب جديدة

**معاملات الاستعلام (Query Parameters):**
- `company_id` (number, required) - معرف الشركة

**متطلبات البيانات (Body):**
```json
{
  "title": "مهندس تطوير الويب",
  "description": "نحن نبحث عن مهندس تطوير ويب ذو خبرة في React و Node.js للعمل على مشاريع مثيرة",
  "location_type": "REMOTE",
  "duration_weeks": 12,
  "seats": 5,
  "deadline": "2024-12-31",
  "required_skills": [1, 2, 3],
  "has_exam": true
}
```

**شرح الحقول:**
- `title` (string) - عنوان التدريب (3-255 حرف)
- `description` (string) - الوصف التفصيلي (10 أحرف على الأقل)
- `location_type` (enum) - نوع الموقع: `REMOTE`, `ONSITE`, `HYBRID`
- `duration_weeks` (number) - مدة التدريب بالأسابيع
- `seats` (number) - عدد المقاعد المتاحة
- `deadline` (date) - تاريخ الإغلاق (صيغة: YYYY-MM-DD)
- `required_skills` (array) - معرفات المهارات المطلوبة
- `has_exam` (boolean) - هل يوجد امتحان فني

**مثال الطلب:**
```
POST /api/company/create-internship?company_id=1
```

**الاستجابة الناجحة (200):**
```json
{
  "message": "Internship created successfully",
  "internship_id": 5,
  "title": "مهندس تطوير الويب"
}
```

---

### 2️⃣ الحصول على التدريبات (Get Internships)
```
GET /api/company/internships
```
**الوصف:** الحصول على جميع التدريبات الخاصة بالشركة

**معاملات الاستعلام (Query Parameters):**
- `company_id` (number, required) - معرف الشركة

**مثال الطلب:**
```
GET /api/company/internships?company_id=1
```

**الاستجابة الناجحة (200):**
```json
{
  "message": "Internships retrieved",
  "count": 3,
  "data": [
    {
      "id": 1,
      "title": "مهندس تطوير الويب",
      "description": "...",
      "location_type": "REMOTE",
      "duration_weeks": 12,
      "seats": 5,
      "deadline": "2024-12-31",
      "status": "active",
      "created_at": "2024-01-10"
    }
  ]
}
```

---

### 3️⃣ إضافة امتحان فني (Add Technical Exam)
```
POST /api/company/tech-exam
```
**الوصف:** إضافة امتحان فني لتدريب معين

**متطلبات البيانات (Form Data - multipart/form-data):**
- `internship_id` (number, required) - معرف التدريب
- `task_description` (string, required) - وصف المهمة (10 أحرف على الأقل)
- `task-file` (file, required) - ملف المهمة (PDF، صورة، إلخ)
- `exam_time_limit_minutes` (number, optional) - الوقت المتاح بالدقائق
- `exam_passing_score` (number, optional) - الدرجة المطلوبة للنجاح (0-100)
- `exam_instructions` (string, optional) - تعليمات الامتحان

**معاملات الاستعلام (Query Parameters):**
- `company_id` (number, required) - معرف الشركة

**مثال الطلب:**
```
POST /api/company/tech-exam?company_id=1
Content-Type: multipart/form-data

{
  "internship_id": 1,
  "task_description": "قم بتطوير تطبيق React بسيط...",
  "exam_time_limit_minutes": 180,
  "exam_passing_score": 70,
  "exam_instructions": "يرجى اتباع التعليمات المرفقة"
}
```

**الاستجابة الناجحة (200):**
```json
{
  "message": "Technical exam added successfully",
  "exam_id": 10,
  "internship_id": 1
}
```

---

## 👨‍🎓 Trainees Routes
**Base URL:** `/api/trainees`

### 1️⃣ إدراج المهارات (Insert Skills)
```
POST /api/trainees/insert-skills/:trainee_id
```
**الوصف:** إضافة مهارات المتدرب وتحميل السيرة الذاتية

**المعاملات (Path Parameters):**
- `trainee_id` (number) - معرف المتدرب

**متطلبات البيانات (Form Data - multipart/form-data):**
- `cv_file` (file, required) - ملف السيرة الذاتية (PDF)
- `skills` (array of numbers, required) - معرفات المهارات

**مثال الطلب:**
```
POST /api/trainees/insert-skills/1
Content-Type: multipart/form-data

{
  "cv_file": <binary_file>,
  "skills": [1, 2, 3, 4]
}
```

**الاستجابة الناجحة (200):**
```json
{
  "message": "Skills inserted successfully",
  "trainee_id": 1,
  "skills_count": 4
}
```

---

### 2️⃣ إرسال إجابات الكويز (Submit Quiz Answers)
```
POST /api/trainees/submit-quiz-answers
```
**الوصف:** إرسال إجابات الاختبار السريع

**متطلبات البيانات (Body):**
```json
{
  "traineeId": 1,
  "answers": [
    {
      "question_id": 1,
      "selected_option": "A"
    },
    {
      "question_id": 2,
      "selected_option": "B"
    }
  ]
}
```

**الاستجابة الناجحة (201):**
```json
{
  "message": "Quiz answers submitted successfully",
  "submission_id": 100,
  "trainee_id": 1,
  "score": 85
}
```

---

### 3️⃣ إرسال حل الامتحان الفني (Submit Exam Solution)
```
POST /api/trainees/submit-exam-solution
```
**الوصف:** إرسال حل الامتحان الفني (كود)

**متطلبات البيانات (Body):**
```json
{
  "traineeId": 1,
  "examId": 5,
  "codeSolution": "function calculateSum(a, b) { return a + b; }",
  "language": "javascript"
}
```

**الاستجابة الناجحة (201):**
```json
{
  "message": "Exam solution submitted successfully",
  "submission_id": 50,
  "trainee_id": 1,
  "exam_id": 5
}
```

---

### 4️⃣ وضع علامة على الكويز كمكتمل (Mark Quiz Completed)
```
POST /api/trainees/mark-quiz-completed
```
**الوصف:** تحديد حالة الكويز كمكتمل وتسجيل النقاط

**متطلبات البيانات (Body):**
```json
{
  "traineeId": 1,
  "examId": 5,
  "quizScore": 42,
  "internshipId": 2
}
```

**الاستجابة الناجحة (200):**
```json
{
  "message": "Quiz marked as completed",
  "trainee_id": 1,
  "exam_id": 5,
  "score": 42,
  "status": "completed"
}
```

---

### 5️⃣ الحصول على حالة الكويز (Get Quiz Status)
```
GET /api/trainees/quiz-status/:traineeId/:examId
```
**الوصف:** الحصول على حالة الكويز الحالية للمتدرب

**المعاملات (Path Parameters):**
- `traineeId` (number) - معرف المتدرب
- `examId` (number) - معرف الامتحان

**مثال الطلب:**
```
GET /api/trainees/quiz-status/1/5
```

**الاستجابة الناجحة (200):**
```json
{
  "message": "Quiz status retrieved successfully",
  "data": {
    "trainee_id": 1,
    "exam_id": 5,
    "status": "submitted",
    "score": 42,
    "submitted_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### 6️⃣ الحصول على درجات المتدرب (Get Trainee Scores)
```
GET /api/trainees/trainee-scores/:traineeId
```
**الوصف:** الحصول على جميع درجات المتدرب في التدريبات المختلفة

**المعاملات (Path Parameters):**
- `traineeId` (number) - معرف المتدرب

**مثال الطلب:**
```
GET /api/trainees/trainee-scores/1
```

**الاستجابة الناجحة (200):**
```json
{
  "message": "Trainee scores retrieved",
  "trainee_id": 1,
  "scores": [
    {
      "internship_id": 1,
      "internship_title": "مهندس الويب",
      "total_score": 85,
      "exam_scores": [90, 80]
    }
  ]
}
```

---

### 7️⃣ الحصول على درجات مهارة معينة (Get Skill Score)
```
GET /api/trainees/skill-scores/:traineeId/:skillId
```
**الوصف:** الحصول على درجات المتدرب في مهارة معينة

**المعاملات (Path Parameters):**
- `traineeId` (number) - معرف المتدرب
- `skillId` (number) - معرف المهارة

**مثال الطلب:**
```
GET /api/trainees/skill-scores/1/3
```

**الاستجابة الناجحة (200):**
```json
{
  "message": "Skill score retrieved",
  "trainee_id": 1,
  "skill_id": 3,
  "skill_name": "React",
  "score": 85,
  "assessment_count": 5
}
```

---

### 8️⃣ الحصول على تقدم المتدرب (Get Trainee Progress)
```
GET /api/trainees/trainee-progress/:traineeId
```
**الوصف:** الحصول على نسبة تقدم المتدرب العام

**المعاملات (Path Parameters):**
- `traineeId` (number) - معرف المتدرب

**مثال الطلب:**
```
GET /api/trainees/trainee-progress/1
```

**الاستجابة الناجحة (200):**
```json
{
  "message": "Trainee progress retrieved",
  "trainee_id": 1,
  "overall_progress": 75,
  "internships_enrolled": 3,
  "internships_completed": 1,
  "average_score": 82,
  "skills": [
    {
      "skill_id": 1,
      "skill_name": "JavaScript",
      "progress": 90
    }
  ]
}
```

---

## 🎓 Internship Applications Routes
**Base URL:** `/api/applications`

### 1️⃣ التقديم على التدريب (Apply for Internship)
```
POST /api/applications/apply
```
**الوصف:** تقديم طلب للتدريب من قبل المتدرب

**متطلبات البيانات (Body):**
```json
{
  "traineeId": 1,
  "internshipId": 5,
  "coverLetter": "أنا مهتم جداً بهذه الفرصة لأنني أملك المهارات المطلوبة وأريد تطوير خبراتي..."
}
```

**الاستجابة الناجحة (201):**
```json
{
  "message": "Application submitted successfully",
  "application_id": 100,
  "trainee_id": 1,
  "internship_id": 5,
  "status": "pending"
}
```

---

### 2️⃣ الحصول على أسئلة حسب المهارات (Get Questions by Skills)
```
POST /api/applications/questions
```
**الوصف:** الحصول على أسئلة الاختبار بناءً على المهارات المطلوبة

**متطلبات البيانات (Body):**
```json
{
  "requiredSkills": [1, 2, 3],
  "internshipId": 5
}
```

**الاستجابة الناجحة (200):**
```json
{
  "message": "Questions retrieved",
  "count": 10,
  "questions": [
    {
      "id": 1,
      "skill_id": 1,
      "question_text": "ما هو الفرق بين const و let في JavaScript؟",
      "question_type": "multiple_choice",
      "options": ["الخيار أ", "الخيار ب", "الخيار ج"],
      "difficulty": "medium"
    }
  ]
}
```

---

### 3️⃣ الحصول على طلبات المتدرب (Get Trainee Applications)
```
GET /api/applications/trainee/:traineeId
```
**الوصف:** الحصول على جميع طلبات التدريب للمتدرب

**المعاملات (Path Parameters):**
- `traineeId` (number) - معرف المتدرب

**مثال الطلب:**
```
GET /api/applications/trainee/1
```

**الاستجابة الناجحة (200):**
```json
{
  "message": "Applications retrieved successfully",
  "count": 4,
  "data": [
    {
      "application_id": 100,
      "internship_id": 5,
      "internship_title": "مهندس تطوير الويب",
      "company_name": "شركة التقنية",
      "status": "pending",
      "cover_letter": "...",
      "applied_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 4️⃣ الحصول على طلبات التدريب (Get Internship Applications)
```
GET /api/applications/company/:internshipId
```
**الوصف:** الحصول على جميع الطلبات لتدريب معين (للشركة)

**المعاملات (Path Parameters):**
- `internshipId` (number) - معرف التدريب

**مثال الطلب:**
```
GET /api/applications/company/5
```

**الاستجابة الناجحة (200):**
```json
{
  "message": "Applications retrieved successfully",
  "count": 15,
  "data": [
    {
      "application_id": 100,
      "trainee_id": 1,
      "trainee_name": "أحمد محمد",
      "cover_letter": "...",
      "status": "pending",
      "applied_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 5️⃣ مراجعة الطلب (Review Application)
```
PUT /api/applications/:applicationId/review
```
**الوصف:** الموافقة على أو رفض طلب التدريب

**المعاملات (Path Parameters):**
- `applicationId` (number) - معرف الطلب

**متطلبات البيانات (Body):**
```json
{
  "status": "accepted",
  "notes": "مرحباً بك في فريقنا، تم قبول طلبك"
}
```
**الحالات المتاحة:** `"accepted"`, `"rejected"`

**ملاحظة:** يتطلب `reviewedBy` (معرف المختص بالمراجعة من البيانات المصرح بها)

**الاستجابة الناجحة (200):**
```json
{
  "message": "Application reviewed successfully",
  "application_id": 100,
  "status": "accepted",
  "notes": "مرحباً بك في فريقنا، تم قبول طلبك"
}
```

---

## 🔧 Skills Routes
**Base URL:** `/api/skills`

### 1️⃣ الحصول على جميع المهارات (Get All Skills)
```
GET /api/skills/get-skills
```
**الوصف:** الحصول على قائمة باستمرار جميع المهارات المتاحة

**معاملات الاستعلام:** لا توجد

**الاستجابة الناجحة (200):**
```json
{
  "message": "Skills retrieved successfully",
  "count": 25,
  "data": [
    {
      "id": 1,
      "name": "JavaScript",
      "description": "لغة البرمجة الأساسية للويب",
      "category": "programming",
      "level": "beginner"
    },
    {
      "id": 2,
      "name": "React",
      "description": "مكتبة JavaScript لبناء واجهات المستخدم",
      "category": "frontend",
      "level": "intermediate"
    }
  ]
}
```

---

## 🔐 معلومات مهمة عن الأمان والمصادقة

### التوثيق (Authentication)
جميع الطلبات (ما عدا التسجيل والدخول والتحقق) تتطلب:
```
Header: Authorization: Bearer <JWT_TOKEN>
```

### أدوار المستخدمين (User Roles)
1. **trainee** - المتدرب
2. **company** - الشركة
3. **admin** - المسؤول

### معاملات الاستعلام الشائعة

#### معرف المستخدم/الشركة/المتدرب
معظم الطلبات تتطلب `company_id` أو `trainee_id` في Query Parameters أو Path Parameters

---

## 📝 نصائح للمطورين

### الخطأ 400 - البيانات غير صحيحة
```json
{
  "message": "Invalid input",
  "errors": [
    "email is invalid",
    "password is required"
  ]
}
```

### الخطأ 401 - عدم التصريح
```json
{
  "message": "Unauthorized",
  "code": 401
}
```

### الخطأ 403 - الوصول مرفوع
```json
{
  "message": "only admin can access to this request",
  "code": 403
}
```

### الخطأ 404 - لم يتم العثور على المورد
```json
{
  "message": "Resource not found",
  "code": 404
}
```

### الخطأ 500 - خطأ في الخادم
```json
{
  "message": "Internal server error",
  "code": 500
}
```

---

## 🔄 أمثلة على طلبات شاملة

### مثال 1: تسجيل متدرب جديد ثم تسجيل الدخول
```bash
# الخطوة 1: التسجيل
POST /api/users/register
Content-Type: multipart/form-data
{
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "password": "SecurePassword123!",
  "role": "trainee"
}

# الخطوة 2: التحقق من البريد (يتم من خلال رابط قادم من البريد)
GET /api/users/verify-code/1/token123

# الخطوة 3: تسجيل الدخول
POST /api/users/login
Content-Type: application/json
{
  "email": "ahmed@example.com",
  "password": "SecurePassword123!"
}
# الاستجابة تحتوي على JWT Token
```

### مثال 2: إنشاء تدريب والتقديم عليه
```bash
# الخطوة 1: إنشاء تدريب (من طرف الشركة)
POST /api/company/create-internship?company_id=1
Content-Type: application/json
{
  "title": "مهندس الويب",
  "description": "فرصة رائعة للعمل مع فريق متخصص",
  "location_type": "REMOTE",
  "duration_weeks": 12,
  "seats": 5,
  "deadline": "2024-12-31",
  "required_skills": [1, 2, 3],
  "has_exam": true
}

# الخطوة 2: التقديم على التدريب (من طرف المتدرب)
POST /api/applications/apply
Authorization: Bearer JWT_TOKEN
Content-Type: application/json
{
  "traineeId": 1,
  "internshipId": 5,
  "coverLetter": "أنا متحمس للعمل معكم..."
}
```

---

## 📞 الدعم والمساعدة

إذا واجهت أي مشاكل أو لديك استفسارات، يرجى التواصل مع فريق التطوير.

**آخر تحديث:** 2024-01-15

