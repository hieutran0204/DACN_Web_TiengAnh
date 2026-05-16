# 🚀 IELTS Knowledge Graph - Neo4j Cheatsheet

Dưới đây là các lệnh Cypher phổ biến để bạn truy xuất dữ liệu từ đồ thị tri thức trong dự án. Bạn có thể dán vào giao diện Neo4j Browser tại: http://localhost:7474

---

## 1. Truy vấn cơ bản (Basic Queries)

### Xem toàn bộ dữ liệu (Chỉ dùng khi dữ liệu ít)
```cypher
MATCH (n) RETURN n LIMIT 100
```

### Đếm tổng số Node theo từng loại (Label)
```cypher
MATCH (n) 
RETURN labels(n) AS Label, count(*) AS Total 
ORDER BY Total DESC
```

### Kiểm tra Schema của Đồ thị
```cypher
CALL db.schema.visualization()
```

---

## 2. Truy xuất nội dung chi tiết (Content Retrieval)

### Xem nội dung các đoạn tri thức (Knowledge Chunks) đã nạp
```cypher
MATCH (c:KnowledgeChunk) 
RETURN c.text AS Content, c.category AS Category 
ORDER BY Category
```

### Xem nội dung bài viết (Essay) của học viên
```cypher
MATCH (e:Essay) 
RETURN e.essayId AS ID, e.timestamp AS Time, e.studentId AS Student, e.content AS FullText
ORDER BY e.timestamp DESC
```

### Xem danh sách các khái niệm (Concepts) kèm mô tả
```cypher
MATCH (c:Concept)
RETURN c.name AS ConceptName, c.description AS Description, c.category AS Category
```

---

## 3. Truy xuất thông tin học tập (Student Insights)

### Tìm 5 lỗi mà một học viên hay mắc phải nhất
```cypher
MATCH (s:Student {studentId: 'STUDENT_ID'})-[r:MAKES_ERROR]->(e:ErrorType)
RETURN e.name AS Error, r.count AS Frequency, r.lastSeen AS LastTime
ORDER BY r.count DESC 
LIMIT 5
```

### Xem lộ trình tiến bộ (Lỗi giảm dần theo thời gian)
```cypher
MATCH (s:Student {studentId: 'STUDENT_ID'})-[:WROTE]->(e:Essay)-[:HAS_ERROR]->(err:ErrorType)
RETURN e.timestamp AS Time, collect(err.name) AS ErrorsInThisEssay
ORDER BY e.timestamp ASC
```

### Tìm các từ vựng/thành ngữ "ruột" của học viên (Mastered)
```cypher
MATCH (s:Student {studentId: 'STUDENT_ID'})-[r:MASTERED]->(v)
RETURN v.name AS Vocabulary, r.count AS TimesUsed
ORDER BY r.count DESC
```

---

## 3. Truy xuất tri thức hệ thống (Knowledge Base)

### Xem các khái niệm liên quan đến một IELTS Criteria (ví dụ: GRA)
```cypher
MATCH (crit:IELTS_Criteria {name: 'GRA'})<-[:VIOLATES|REQUIRED_FOR]-(c)
RETURN crit, c
```

### Tìm bài mẫu (Sample Essay) có dùng một cấu trúc ngữ pháp cụ thể
```cypher
MATCH (se:SampleEssay)-[:EXEMPLIFIES]->(c:Concept {name: 'Inversion'})
RETURN se.title, se.content
```

---

## 4. Lệnh Nâng cao (Advanced - Dành cho báo cáo)

### 🛣️ Tìm đường đi ngắn nhất giữa 2 khái niệm
(Ví dụ: Tại sao lỗi "Subject-Verb Agreement" lại ảnh hưởng đến điểm "GRA"?)
```cypher
MATCH (start:Concept {name: 'Subject-Verb Agreement'}), (end:IELTS_Criteria {name: 'GRA'})
MATCH p = shortestPath((start)-[*..5]-(end))
RETURN p
```

### 🏝️ Tìm các khái niệm "cô đơn" (Chưa được kết nối với tri thức nào)
```cypher
MATCH (n:Concept)
WHERE NOT (n)--()
RETURN n.name
```

### 👥 Cluster Analysis: Tìm các học viên hay mắc lỗi giống nhau
```cypher
MATCH (s1:Student)-[:MAKES_ERROR]->(e:ErrorType)<-[:MAKES_ERROR]-(s2:Student)
WHERE s1 <> s2
RETURN s1.studentId, s2.studentId, count(e) AS CommonErrors
ORDER BY CommonErrors DESC
```

---

## 5. Quản lý và Dọn dẹp (Maintenance)

### Xóa toàn bộ dữ liệu (CẨN THẬN)
```cypher
MATCH (n) DETACH DELETE n
```

### Xóa bài viết trùng lặp (nếu có)
```cypher
MATCH (e:Essay)
WITH e.essayId AS id, collect(e) AS nodes
WHERE size(nodes) > 1
FOREACH (n in tail(nodes) | DETACH DELETE n)
```

---
💡 **Ghi chú cho Đồ án:** Khi demo, hãy nhấn vào biểu tượng **Fullscreen** trong Neo4j Browser để hiển thị đồ thị toàn màn hình, thầy cô sẽ rất ấn tượng với mạng lưới tri thức mà bạn đã xây dựng!
