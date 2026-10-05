# SAT IntelliPrep v1.0 — Sổ Tay Vận Hành Thử Nghiệm (Pilot Operations Guide)

**Tài liệu:** Hướng dẫn vận hành đợt thử nghiệm học sinh THPT (10–30 Học Sinh)  
**Phiên bản hệ thống:** SAT IntelliPrep OS v1.0.0 Production Pilot  
**Cập nhật:** 2026-10-05  

---

## 1. Mục Tiêu Đợt Thử Nghiệm (Pilot Objective)

1. Kiểm chứng mức độ hiểu và hoàn thành quy trình Onboarding / Thiết lập mục tiêu của học sinh lớp 10, 11, 12.
2. Đo lường tỷ lệ hoàn thành bài kiểm tra chẩn đoán đầu vào (Diagnostic Baseline 30 câu).
3. Đánh giá tính kỷ luật và khả năng quay lại rèn luyện (D1, D3, D7 Return Rates) theo lộ trình học tập Today.
4. Thu thập dữ liệu khách quan về các câu hỏi có độ khó bất thường, bẫy nhận thức phổ biến, và mức độ tiến bộ sau khi làm lại (Retry Improvement).
5. Đo lường sự thay đổi khoảng điểm (Score-Band Movement) qua các bài thi thử Full Adaptive Mock 98 câu hoàn chỉnh.

---

## 2. Bật / Tắt Hệ Thống Telemetry (Enable / Disable Telemetry)

### Phía Người Dùng (Học Sinh)
- Tại màn hình khởi động (Setup Modal), học sinh được cung cấp quyền lựa chọn rõ ràng:
  - **`Cho phép dữ liệu Pilot`**: Kích hoạt việc gửi dữ liệu hành vi ẩn danh.
  - **`Không tham gia`**: Vô hiệu hóa toàn bộ telemetry. Học sinh vẫn sử dụng 100% tính năng ứng dụng mà không gặp bất kỳ giới hạn nào.
- Học sinh có thể thay đổi quyết định bất kỳ lúc nào bằng cách gọi:
  ```js
  window.togglePilotTelemetry(true); // hoặc false để tắt ngay lập tức
  ```

### Phía Quản Trị / Triển Khai
- Biến môi trường hệ thống:
  - `SAT_TELEMETRY_ENV=production`: Chế độ thu thập dữ liệu chính thức.
  - `SAT_TELEMETRY_ENV=local`: Chế độ phát triển nội bộ.
  - `SAT_TELEMETRY_ENV=test`: Chế độ tự động hóa kiểm thử (dữ liệu được hủy ngay, không lưu vào cơ sở dữ liệu).
- Tắt khẩn cấp telemetry từ mã nguồn: Chỉ cần đặt `this.enabled = false` trong `js/telemetry.js`.

---

## 3. Khởi Động Đợt Thử Nghiệm Cho Nhóm Học Sinh (Starting a Cohort)

1. **Chuẩn bị liên kết:** Cung cấp liên kết chính thức cho học sinh:
   `https://nmstudio-sat-intelliprep.vercel.app`
2. **Hướng dẫn bước đầu:**
   - Học sinh chọn mục tiêu điểm số (1500+, 1400+, 1300+ hoặc 1200+).
   - Chọn khối lớp (10, 11, 12) và cấp độ giải thích (Cơ bản, Trung cấp, Nâng cao).
   - Chọn làm bài Chẩn đoán đầu vào 30 câu (25 phút) để lập baseline kỹ năng.
3. **Giám sát kết nối ingestion:**
   - Mở Console trình duyệt hoặc kiểm tra bảng điều khiển `pilot_dashboard.html` để thấy sự kiện `session_started` và `setup_completed`.

---

## 4. Truy Cập Bảng Điều Khiển Nội Bộ (Opening Internal Dashboard)

- Bảng điều khiển nội bộ được cách ly hoàn toàn khỏi thanh điều hướng của học sinh.
- **Đường dẫn truy cập:**
  `https://nmstudio-sat-intelliprep.vercel.app/pilot_dashboard.html`
  (Hoặc trên Local Dev: `http://localhost:5500/pilot_dashboard.html`)
- **Bộ lọc tích hợp:**
  - Lọc theo môi trường: `Production` (mặc định), `Local Dev`, `Automated Tests`.
  - Lọc theo khoảng thời gian: `7 ngày qua`, `14 ngày qua`, `30 ngày qua`, `Toàn bộ Pilot`.

---

## 5. Định Nghĩa Các Chỉ Số Cốt Lõi (Metric Definitions)

| Chỉ số | Cách tính toán | Ý nghĩa sư phạm |
| :--- | :--- | :--- |
| **Activation Funnel** | Tỷ lệ chuyển đổi từ `App Open` $\rightarrow$ `Setup` $\rightarrow$ `Diagnostic` $\rightarrow$ `Practice` | Đánh giá độ thông suốt của trải nghiệm ban đầu |
| **Cohort Retention** | Số học sinh hoạt động lại vào ngày thứ 1, 3, 7 kể từ ngày tạo hồ sơ | Đánh giá tính bền vững của thói quen rèn luyện |
| **Median Study Time** | Trung vị thời gian thực tế học sinh tương tác với câu hỏi & bài giảng | Đo lường mức độ tập trung thật (không tính thời gian treo máy) |
| **P-Correct** | $\frac{\text{Số lượt trả lời đúng}}{\text{Tổng số lượt giải}} \times 100\%$ | Độ khó thực tế của câu hỏi trong ngân hàng |
| **Score-Band Midpoint Delta** | $\frac{\text{Band Max mới} + \text{Band Min mới}}{2} - \frac{\text{Band Max cũ} + \text{Band Min cũ}}{2}$ | Độ tiến bộ thực chất giữa 2 bài Full Mock |

---

## 6. Giới Hạn Của Quy Mô Mẫu Thử Nghiệm (Sample-Size Limitations)

- **Quy tắc mẫu nhỏ ($N < 100$):**
  - Mọi câu hỏi có số lượt làm $< 10$ được hiển thị dưới nhãn `INSUFFICIENT_DATA (<10 attempts)`.
  - Không kết luận câu hỏi là "quá dễ" hay "quá khó" dựa trên cảm tính hoặc chỉ một vài học sinh đầu tiên.
  - Tuyệt đối không quy đổi tỷ lệ chính xác bài tập thông thường (Practice Accuracy) thành điểm số SAT chính thức. Điểm số chỉ được ghi nhận từ bài thi **Full Adaptive Mock Tests**.

---

## 7. Xuất Báo Cáo & Xóa Dữ Liệu Học Sinh (Data Export & Deletion)

### Xuất dữ liệu tổng hợp
- Nhấp nút **`Xuất JSON`** trên thanh công cụ của `pilot_dashboard.html`.
- Hoặc chạy lệnh định kỳ hàng tuần:
  ```bash
  npm run pilot:report
  ```

### Xóa dữ liệu học sinh theo yêu cầu (Right to be Forgotten)
- Nếu học sinh yêu cầu hủy bỏ dữ liệu ẩn danh của mình, quản trị viên sử dụng hàm trong `db/pilot_telemetry_schema.sql`:
  ```sql
  SELECT purge_pilot_participant('c8f94e12-32a1-4ef4-9842-123456789abc');
  ```
- Hoặc học sinh tự đặt lại toàn bộ tiến độ và xóa UUID ẩn danh ngay trên máy của mình bằng nút **Đặt lại toàn bộ tiến độ** trong tab Progress.

---

## 8. Đóng Và Lưu Trữ Đợt Thử Nghiệm (Archiving the Pilot)

1. Tải bản sao lưu toàn bộ cơ sở dữ liệu `pilot_events` ra file JSON/CSV nén.
2. Chạy hàm dọn dẹp dữ liệu quá hạn 90 ngày:
   ```sql
   SELECT purge_expired_pilot_telemetry(90);
   ```
3. Tổng kết báo cáo nghiệm thu cuối cùng theo mẫu `reports/pilot/Pilot_Week_YYYY-MM-DD.md`.
