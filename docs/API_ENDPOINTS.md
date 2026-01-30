# API Endpoints

## Auth

| Method | Endpoint             | Mô tả                   |
| ------ | -------------------- | ----------------------- |
| POST   | `/api/auth/login`    | Đăng nhập               |
| POST   | `/api/auth/register` | Đăng ký                 |
| POST   | `/api/auth/logout`   | Đăng xuất               |
| GET    | `/api/auth/me`       | Thông tin user hiện tại |

## Admin - Categories

| Method | Endpoint                    | Mô tả                |
| ------ | --------------------------- | -------------------- |
| GET    | `/api/admin/categories`     | Danh sách categories |
| GET    | `/api/admin/categories/:id` | Chi tiết category    |
| POST   | `/api/admin/categories`     | Tạo category         |
| PUT    | `/api/admin/categories/:id` | Cập nhật category    |
| DELETE | `/api/admin/categories/:id` | Xóa category         |

## Admin - Roles

| Method | Endpoint               | Mô tả                       |
| ------ | ---------------------- | --------------------------- |
| GET    | `/api/admin/roles`     | Danh sách roles             |
| GET    | `/api/admin/roles/:id` | Chi tiết role + permissions |
| POST   | `/api/admin/roles`     | Tạo role                    |
| PUT    | `/api/admin/roles/:id` | Cập nhật role + permissions |
| DELETE | `/api/admin/roles/:id` | Xóa role                    |

## Admin - Permissions

| Method | Endpoint                 | Mô tả                           |
| ------ | ------------------------ | ------------------------------- |
| GET    | `/api/admin/permissions` | Danh sách permissions (grouped) |

## Admin - Settings

| Method | Endpoint                   | Mô tả                |
| ------ | -------------------------- | -------------------- |
| GET    | `/api/admin/settings`      | Danh sách settings   |
| GET    | `/api/admin/settings/:key` | Chi tiết setting     |
| PUT    | `/api/admin/settings/:key` | Upsert setting       |
| POST   | `/api/admin/settings`      | Bulk upsert settings |
| DELETE | `/api/admin/settings/:key` | Xóa setting          |

## Admin - Users

| Method | Endpoint               | Mô tả                                        |
| ------ | ---------------------- | -------------------------------------------- |
| GET    | `/api/admin/users`     | Danh sách users (search, filter, pagination) |
| GET    | `/api/admin/users/:id` | Chi tiết user + addresses                    |
| POST   | `/api/admin/users`     | Tạo user                                     |
| PUT    | `/api/admin/users/:id` | Cập nhật user                                |
| DELETE | `/api/admin/users/:id` | Xóa user                                     |

## Public

| Method | Endpoint        | Mô tả                     |
| ------ | --------------- | ------------------------- |
| GET    | `/api/settings` | Public settings (no auth) |
