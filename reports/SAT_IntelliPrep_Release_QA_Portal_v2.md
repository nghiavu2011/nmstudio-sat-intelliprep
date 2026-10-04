# SAT INTELLIPREP — RELEASE QA PORTAL V2 REPORT

**Thời điểm ban hành:** 2026-10-04T23:25:00+07:00  
**Phiên bản:** Release QA Portal v2.0 (Internal Inspection Surface)  
**Tập tin chính:** `sat_interactive_review.html`  
**Dữ liệu trạng thái phát hành:** `reports/release_status.json`

---

## 1. TỔNG QUAN NÂNG CẤP (CHANGELOG)

Thực hiện chuẩn xác chỉ đạo kỹ thuật từ **MASTER PROMPT**: nâng cấp `sat_interactive_review.html` thành cổng thẩm định phát hành nội bộ chuyên nghiệp (**Internal Release QA Portal**), phân định rõ ràng giữa:
1. **Dữ liệu kiểm thử tự động (Automated Verification Evidence)**
2. **Trải nghiệm ứng dụng thực tế trực tiếp (Live Product Inspection)**
3. **Đánh giá định tính của chuyên gia (Expert Qualitative Assessment)**

### Các cải tiến kỹ thuật cốt lõi:

* **Loại bỏ Hardcoded Localhost:**
  * Thay thế toàn bộ địa chỉ cứng `http://localhost:5500` bằng logic giải quyết URL động:
    ```js
    const APP_URL = params.get('app') || window.REVIEW_CONFIG?.productionUrl || 'https://nmstudio-sat-intelliprep.vercel.app';
    ```
  * Hỗ trợ xem trực tiếp Production (`sat_interactive_review.html`) hoặc Local Dev (`sat_interactive_review.html?app=http://localhost:5500`).
  * Có nhãn chỉ báo nguồn rõ ràng: `SOURCE: PRODUCTION` hoặc `SOURCE: LOCAL DEV`, kèm nút 1-click chuyển đổi nhanh nguồn xem.
* **Loại bỏ hoàn toàn dev-only Tailwind CDN:**
  * Thay thế bằng hệ thống CSS ngữ nghĩa thuần túy, nhúng trực tiếp, độc lập 100%, không phụ thuộc thư viện ngoài, tối ưu tốc độ và không bị lỗi CSP.
* **Mô hình trạng thái phát hành dựa trên chứng cứ (`reports/release_status.json`):**
  * Xây dựng script `scripts/generate_release_status.js` tự động trích xuất Git commit (`79b8ca3`), branch (`main`), thời gian kiểm tra và tự động kiểm kê tài nguyên kho đề.
  * Hiển thị bảng tổng kết 5 cổng chất lượng: Regression (27/27), Runtime (8/8), Visual QA (8/8), Console (0 errors), Accessibility (Keyboard focus trap).
* **Kiểm kê ngân hàng câu hỏi có thể tái lập (Source Inventory):**
  * Không dùng số liệu áng chừng hay hardcode `185 câu`.
  * Số liệu kiểm đếm thực tế từ kho lưu trữ:
    * `Unique Authored Items`: **194 câu**
    * `Approved Bank Items`: **194 câu**
    * `Diagnostic Pool`: **30 câu**
    * `Full Mock Forms`: **3 bộ đề**
    * `Mock Placements`: **375 lượt vị trí câu hỏi**
* **Tách bạch Nhận định chuyên gia (Qualitative Opinion):**
  * Ghi rõ nhãn `Expert qualitative assessment`, chấm điểm minh bạch (8.8/10 và 9.2/10), không trình bày như điểm đo lường tự động.
  * Chuẩn hóa từ ngữ: thay thế các tuyên bố phóng đại như `100% Bluebook` thành `closer interaction parity with the Digital SAT testing experience`; không tuyên bố `WCAG AAA` khi chưa đo lường.
* **Bộ điều khiển Viewport & Route hoàn chỉnh:**
  * Hỗ trợ 8 tỷ lệ màn hình chuẩn: `1920×1080`, `1440×900`, `1366×768`, `1180×820`, `1024×768`, `768×1024`, `390×844`, `360×800` và chế độ `Fit`.
  * Tích hợp điều hướng nhanh 6 màn hình chính: `Today`, `Practice`, `Mock Test`, `SRS Review`, `Progress`, `Landing`.
* **Lộ trình các phiên bản tiếp theo (Open Issues Table):**
  * Trình bày bảng theo dõi các tính năng V1.1 (Exam Interactivity: Cross-out, Highlighter), V1.2 (Content Scale: 600+ câu), V1.3 (Psychometric Calibration).

---

## 2. KẾT QUẢ KIỂM THỬ TRỰC QUAN

Đã chụp ảnh màn hình và kiểm chứng giao diện Portal v2:
* **Desktop (1440×900):** `reports/screenshots/portal_v2_desktop_1440.png`
* **Mobile (390×844):** `reports/screenshots/portal_v2_mobile_390.png`

Portal hoạt động trơn tru, không có thanh cuộn ngang ngoài ý muốn trên thiết bị di động, điều khiển bàn phím chuẩn chỉ và hiển thị ứng dụng sắc nét.
