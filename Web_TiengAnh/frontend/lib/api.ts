// // src/lib/api.ts
// const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// export async function apiFetch(path: string, options: RequestInit = {}) {
//   const token =
//     typeof window !== "undefined" ? localStorage.getItem("token") : null;

//   const headers = {
//     "Content-Type": "application/json",
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     ...options.headers,
//   };

//   const res = await fetch(`${BASE_URL}${path}`, {
//     ...options,
//     headers,
//   });

//   if (!res.ok) {
//     const errText = await res.text();
//     throw new Error(`API Error ${res.status}: ${errText}`);
//   }

//   return res.json();
// }

// src/lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Tạo headers mới
  const headers = new Headers(options.headers);

  // QUAN TRỌNG: Nếu body là FormData → KHÔNG set Content-Type
  // Browser sẽ tự động thêm: multipart/form-data; boundary=...
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Nếu có token thì thêm Authorization
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errText = "";
    try {
      errText = await res.text();
    } catch {
      errText = "Unknown error";
    }
    throw new Error(`API Error ${res.status}: ${errText}`);
  }

  // Nếu response là JSON thì parse, không thì trả về raw
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return res; // cho trường hợp upload file thành công trả về text hoặc không có body
}
