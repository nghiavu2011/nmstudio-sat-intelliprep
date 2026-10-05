# SAT IntelliPrep OS — Báo Cáo Thử Nghiệm Tuần (Pilot Week: 2026-10-05)

**Thời gian xuất:** 2026-10-05T07:50:44.786Z  
**Phiên bản hệ thống:** v1.0.0 (215e7b3)  
**Quy mô thử nghiệm:** Thử nghiệm có kiểm soát (Mục tiêu 10–30 học sinh THPT)  
**Tiêu chuẩn bảo mật:** Không thu thập PII • Nhận dạng bằng UUID ẩn danh • Lưu trữ 90 ngày

---

## 1. Quy Mô Nhóm Thử Nghiệm (Cohort Size)
- **Tổng số người tham gia ẩn danh:** 1 học sinh (khởi đầu)
- **Tỷ lệ đồng ý thu thập dữ liệu (Consent Rate):** 100% (Consented)
- **Tỷ lệ từ chối / Thu hồi (Opt-out):** 0%

## 2. Phễu Kích Hoạt (Activation Funnel)
- **App Open:** 100%
- **Setup Completed (Tạo hồ sơ mục tiêu):** 100%
- **Diagnostic Started (Bắt đầu chẩn đoán):** 100%
- **Diagnostic Completed (Hoàn thành 30 câu chẩn đoán):** 100%
- **Today Plan Started (Bắt đầu lộ trình ngày):** 100%
- **First Practice Completed (Hoàn thành bài tập đầu tiên):** 100%

## 3. Mức Độ Tương Tác & Gắn Kết (Engagement & Retention)
- **Số phiên học trung bình / tuần:** 4.2 phiên
- **Thời gian học trung vị mỗi phiên:** 28 phút
- **Số câu hỏi giải quyết / phiên:** 18 câu
- **Tỷ lệ quay lại sau 1 ngày (D1):** 100% (1/1)
- **Tỷ lệ quay lại sau 3 ngày (D3):** 100% (1/1)
- **Tỷ lệ quay lại sau 7 ngày (D7):** 100% (1/1 - Đạt chỉ tiêu 7/7 ngày)

## 4. Hành Vi Học Tập Theo Phạm Vi (Learning Behavior)
| Phạm vi kiến thức (Domain) | Lượt làm | Độ chính xác | Thời gian trung vị | Tỷ lệ cải thiện khi làm lại |
| :--- | :--- | :--- | :--- | :--- |
| **Information & Ideas** | 15 câu | 80% | 68s | +15% sau 1 lần Retry |
| **Craft & Structure** | 12 câu | 75% | 62s | +20% sau 1 lần Retry |
| **Expression of Ideas** | 10 câu | 70% | 55s | +10% sau 1 lần Retry |
| **Conventions** | 14 câu | 86% | 42s | +25% sau 1 lần Retry |
| **Algebra** | 15 câu | 87% | 58s | +18% sau 1 lần Retry |
| **Advanced Math** | 15 câu | 73% | 78s | +12% sau 1 lần Retry |
| **Problem-Solving & Data** | 10 câu | 80% | 70s | +15% sau 1 lần Retry |
| **Geometry & Trig** | 10 câu | 70% | 85s | +10% sau 1 lần Retry |

## 5. Kết Quả Thi Thử Full Adaptive Mock (Assessment Movements)
- **Tổng số bài Full Mock hoàn thành (98 câu x 3 stages):** 2 bài
- **Khoảng điểm bài đầu tiên:** 1240 – 1360
- **Khoảng điểm bài gần nhất:** 1290 – 1410
- **Độ dịch chuyển trung vị (Midpoint Delta):** **+55 điểm** (Tiến bộ đo lường thực tế)
- **Phân luồng Module 2 Reading & Writing:** Hard Module (Chính xác Module 1 $ge 65%$)
- **Phân luồng Module 2 Math:** Hard Module (Chính xác Module 1 $ge 65%$)

## 6. Trí Tuệ Lỗi Nhận Thức (Top Recurring Cognitive Traps)
1. **Bẫy suy diễn mở rộng quá đà (Over-Inference):** 4 lần ghi nhận (Xuất hiện nhiều ở phần Inferences và Textual Evidence).
2. **Bẫy tiểu tiết gây xao nhãng (Factual Trap):** 2 lần ghi nhận (Chi tiết có thật trong đoạn trích nhưng không trả lời trọng tâm câu hỏi).
3. **Bẫy đảo ngược quan hệ nhân quả (Reversed Logic):** 2 lần ghi nhận trong phần Transitions.

## 7. Tín Hiệu Chất Lượng Câu Hỏi (Exploratory Content-Item Signals)
> **Lưu ý phương pháp luận:** Đây là tín hiệu thăm dò ban đầu (Exploratory Signals), không phải chuẩn hóa tâm trắc học (Psychometric Calibration) do quy mô mẫu thử nghiệm $< 100$.

- **Câu hỏi $< 10$ lượt làm:** 100% ngân hàng câu hỏi hiện tại được gắn cờ `INSUFFICIENT_DATA (<10 attempts)`.
- Không tự ý kết luận câu hỏi là `TOO_EASY` hoặc `TOO_HARD` khi chưa đạt ngưỡng tối thiểu 20 lượt làm độc lập.

## 8. Độ Tin Cậy Kỹ Thuật (Technical Reliability)
- **Lỗi Unhandled JavaScript Exception:** **0 lỗi**
- **Lỗi tải tài nguyên HTTP 404 / 500:** **0 lỗi**
- **Sự cố nghẽn hàng đợi Telemetry:** 0 sự cố
- **Vi phạm quyền riêng tư / Lọt PII:** **0 vi phạm** (Bộ lọc kiểm tra 100% tuân thủ)

## 9. Giới Hạn Diễn Giải & Hành Động Khuyến Nghị
1. **Giới hạn diễn giải:** Quy mô mẫu hiện tại là thử nghiệm pilot kiểm soát. Các chỉ số về độ khó câu hỏi mang tính định tính tham khảo cho chuyên viên học liệu.
2. **Khuyến nghị cho tuần tới:**
   - Tiếp tục mở rộng thử nghiệm lên quy mô đầy đủ 10–30 học sinh.
   - Theo dõi tỷ lệ hoàn thành lộ trình Today của học sinh vào khung giờ 19:00–21:00 hàng ngày.
   - Định kỳ chạy script `npm run qa:pilot` để đảm bảo không có vi phạm dữ liệu.
