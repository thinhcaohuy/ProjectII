# 📋 Hệ thống Quản lý Tuyển dụng (Recruitment System)

Hệ thống quản lý tuyển dụng trực tuyến hoàn chỉnh với mô hình kiến trúc hiện đại, hỗ trợ tương tác giữa Nhà tuyển dụng và Người lao động.

---

## 🏗️ Kiến trúc Hệ thống

Dự án được xây dựng theo mô hình **Client-Server**:
- **Backend**: RESTful API sử dụng Spring Boot 3.x (Java 21).
- **Frontend**: Single Page Application (SPA) sử dụng React 18 & Vite.
- **Database**: Hệ quản trị cơ sở dữ liệu MySQL 8.0.

---

## 🛠️ Tech Stack & Yêu cầu

### Backend
- **Java**: 21 (LTS)
- **Framework**: Spring Boot 3.3.6
- **Data Access**: Spring Data JPA / Hibernate
- **Database**: MySQL 8.0
- **Build Tool**: Maven

### Frontend
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.x
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Visualization**: Chart.js

---

## 📂 Cơ cấu Thư mục Chính

```text
CodeProjectII/
├── backend/                # Mã nguồn Spring Boot Backend
│   ├── src/main/java/      # Logic nghiệp vụ (Controller, Service, Model, DTO)
│   ├── src/resources/      # Cấu hình hệ thống (application.properties)
│   └── pom.xml             # Quản lý thư viện Maven
├── frontend/               # Mã nguồn React Frontend
│   ├── src/                # Components, Pages, Contexts, Hooks, Services
│   ├── package.json        # Dependencies Node.js
│   └── vite.config.js      # Cấu hình Vite
├── database/               # Kịch bản khởi tạo cơ sở dữ liệu
│   └── recruitment.sql     # File SQL schema (UTF-8) và dữ liệu mẫu
└── README.md               # Tài liệu hướng dẫn chính
```

---

## 🚀 Hướng dẫn Cài đặt & Chạy nhanh

### 1. Chuẩn bị Cơ sở dữ liệu
Đảm bảo bạn đã cài đặt MySQL. Tạo database và import dữ liệu với bảng mã UTF-8:

- **Trên Linux / macOS / Windows (Command Prompt - cmd):**
  ```bash
  mysql -u root -p < database/recruitment.sql
  ```

- **Trên Windows (PowerShell - Khuyên dùng để tránh lỗi font tiếng Việt):**
  ```powershell
  mysql --default-character-set=utf8mb4 -u root -p -e "source database/recruitment.sql"
  ```

*Lưu ý:* Nếu hệ thống báo lỗi `mysql` không được nhận diện, hãy dùng đường dẫn đầy đủ đến file chạy (ví dụ mặc định trên Windows):
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" --default-character-set=utf8mb4 -u root -p -e "source database/recruitment.sql"
```

### 2. Khởi chạy Backend
```bash
cd backend
# Cấu hình lại file backend/src/main/resources/application.properties nếu cần (user/pass DB)
mvn clean compile
mvn spring-boot:run
```
*Backend sẽ chạy tại: `http://localhost:8085`*

### 3. Khởi chạy Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend sẽ chạy tại: `http://localhost:3000` (hoặc cổng hiển thị trên terminal)*

---

## ✨ Các Tính năng Chính

### 👨‍💼 Đối với Người tìm việc (Candidate)
- **Quản lý thông tin cá nhân**: Cập nhật thông tin cá nhân, địa chỉ, ảnh đại diện.
- **Tạo hồ sơ chuyên nghiệp**: Quản lý học vấn, kinh nghiệm làm việc, dự án và kỹ năng.
- **Tài liệu bổ sung**: Đính kèm liên kết Drive bổ sung cho hồ sơ ứng tuyển.
- **Tìm kiếm việc làm**: Tìm kiếm tin tuyển dụng theo từ khóa, địa điểm, ngành nghề.
- **Ứng tuyển trực tuyến**: Gửi thư giới thiệu và nộp hồ sơ trực tiếp.
- **Làm bài thi trực tuyến**: Thực hiện các đề thi kiểm tra năng lực của nhà tuyển dụng được giao tự động khi ứng tuyển.
- **Xem kết quả**: Xem lại bài làm và điểm số bài thi năng lực.

### 🏢 Đối với Nhà tuyển dụng (Employer)
- **Quản lý tin tuyển dụng**: Đăng tin, cập nhật, đóng hoặc duyệt tin.
- **Quản lý ứng viên**: Xem danh sách ứng viên, quản lý hồ sơ ứng tuyển, cập nhật trạng thái hồ sơ (Submitted, Interview, Rejected, Hired).
- **Hệ thống đề thi**: Tạo đề thi kiểm tra năng lực, thiết lập câu hỏi trắc nghiệm, thời gian và điểm số đạt tối thiểu.
- **Giao đề thi tự động**: Thiết lập luật tự động giao đề thi khi ứng viên nộp hồ sơ vào tin tuyển dụng cụ thể.
- **Báo cáo thống kê**: Xem biểu đồ thống kê kết quả tuyển dụng của công ty.

---

## 🔐 Tài khoản Kiểm thử

| Vai trò | Email | Mật khẩu |
| :--- | :--- | :--- |
| **Nhà tuyển dụng** | `employer@test.com` | `password123` |
| **Người lao động** | `candidate@test.com` | `password123` |

---

## 📝 Thiết kế Cơ sở dữ liệu mới (Relational Diagram Updates)
Cấu trúc cơ sở dữ liệu đã được tối ưu hóa theo mô hình quan hệ mới:
- Các bảng hồ sơ cá nhân (`experience`, `education`, `project`, `skill`) sử dụng khóa chính đơn UUID tự sinh để quản lý độc lập dễ dàng hơn.
- Thêm bảng tài liệu bổ sung (`supplementary_document`) thuộc sở hữu của Candidate.
- Di chuyển cột `address` vào riêng `candidate` và `employer`; cột `avatar_url` chỉ thuộc về `candidate` như sơ đồ lớp.
- Thiết lập khóa chính phức hợp (Composite Key) cho các bảng liên kết:
  - `application` (candidate_id, job_post_id)
  - `assessment_assignment` (assessment_id, candidate_id)
  - `assessment_attempt` (assessment_id, candidate_id, attempt_id)
  - `candidate_answer` (candidate_answer_id, assessment_id, candidate_id, attempt_id, question_id)
  - `assessment_option` (option_id, question_id)
