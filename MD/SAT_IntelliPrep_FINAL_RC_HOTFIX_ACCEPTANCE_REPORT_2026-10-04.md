# SAT INTELLIPREP — FINAL RC HOTFIX & COMPREHENSIVE ACCEPTANCE REPORT

**Ngày ban hành:** 2026-10-04  
**Phiên bản:** Release Candidate Patch v1.2 (Post-Hotfix Final Verification)  
**Trạng thái phát hành:** **FINAL RELEASE PASS — SẴN SÀNG TRIỂN KHAI**

---

## 1. TỔNG QUAN XỬ LÝ SỰ CỐ & CẢI TIẾN TRẢI NGHIỆM (HOTFIX SUMMARY)

Theo yêu cầu trực tiếp từ người dùng và tài liệu chỉ đạo kỹ thuật `SAT_IntelliPrep_RC_Hotfix_Final_Acceptance_Prompt_2026-10-04.md`, toàn bộ các phát hiện tồn đọng đã được khắc phục triệt để và kiểm chứng tự động:

1. **Khắc phục lỗi Header 2 dòng trên Laptop/Desktop (`style.css`):**
   - Loại bỏ hoàn toàn hiện tượng rớt dòng hoặc tràn layout trên các tỷ lệ màn hình 1366×768, 1440×900 và 1920×1080.
   - Header cố định 1 hàng duy nhất (`72px`, `white-space: nowrap`, `flex-shrink: 0`), tự động thu gọn padding/gap và ẩn pill phụ trợ khi ở độ phân giải trung bình trước khi chuyển sang thanh điều hướng di động.

2. **Nâng cấp hiệu ứng bóng đổ và độ sáng thẻ tính năng (`style.css`):**
   - Bổ sung hệ thống bóng đổ tinh tế chuẩn học thuật: `--shadow-card: 0 4px 20px -2px rgba(15, 23, 42, 0.05)`.
   - Thiết lập tương tác hover mượt mà với đường cong chuyển động `cubic-bezier(0.16, 1, 0.3, 1)`:
     - Nâng nhẹ bề mặt (`translateY(-2px)` / `-3px`).
     - Tăng cường độ sáng viền (`border-color: rgba(78, 102, 232, 0.35)`).
     - Tỏa sáng vi tế (ambient glow: `box-shadow: 0 8px 24px -4px rgba(78, 102, 232, 0.12)`).

3. **P0.1 — Sửa lỗi tính điểm Today Readiness Crash (`app.js`):**
   - Không còn gọi sai hàm hoặc bịa dải điểm từ tỷ lệ đúng của câu luyện tập.
   - Khi chưa làm bài thi thử: Hiển thị minh bạch *"Chưa có dải điểm — Hoàn thành Full Adaptive Mock để ước lượng"*, kèm số liệu bài tập thực tế.
   - Sau khi hoàn thành Full Adaptive Mock: Tự động lưu bản ghi vào `db.assessmentHistory` và trích xuất dải điểm chuẩn xác từ kỳ thi gần nhất.

4. **P0.2 — Loại bỏ hoàn toàn công thức điểm & xu hướng ảo trong Progress (`app.js`):**
   - Xóa bỏ các công thức ngoại suy heuristic (`920 + pct * 6`, `460 + rw * 3.3`, `totalQ * 1.5 + 30`) và dải điểm mặc định (`480-540`).
   - Quỹ đạo điểm số (`prog-trajectory-val`) chỉ tính toán khi có từ 2 bài Full Adaptive Mock trở lên (lấy trung vị bài mới trừ trung vị bài đầu). Khi chưa đủ dữ liệu, hiển thị trung thực `--`.

5. **P1.1 — Chuẩn hóa Kỷ luật Tuần 7 ngày (`app.js`):**
   - Xây dựng hàm `getActiveDaysLast7()` đếm số ngày cục bộ trong 7 ngày gần nhất (giới hạn 0–7 ngày), thay thế hoàn toàn việc đếm tổng tích lũy lịch sử trọn đời.

6. **P1.2 — Loại bỏ 100% Emoji chức năng trong Điều khiển & CSS (`app.js`, `style.css`):**
   - Thay thế biểu tượng cờ `🚩` tại thanh công cụ làm bài bằng SVG icon và cập nhật thuần nhãn văn bản.
   - Thay thế `content: '🚩'` trong Question Palette bằng chỉ dấu điểm tròn định dạng CSS sắc nét (`background: var(--color-error)`).

7. **P1.3 — Bổ sung và đồng bộ toàn bộ Design Tokens (`style.css`):**
   - Định nghĩa đầy đủ các biến CSS alias: `--radius-card-xl`, `--radius-lg`, `--radius-xl`, `--shadow`, `--shadow-md`, `--shadow-lg`, `--shadow-card-hover`. Kết quả kiểm tra: 0 missing tokens.

8. **P1.4 — Quản trị Focus & Bẫy bàn phím Setup Modal (`app.js`):**
   - Tự động ghi nhớ phần tử active trước khi mở modal, tự động focus vào control đầu tiên (`#setup-target-score`).
   - Bẫy vòng lặp Tab / Shift+Tab khép kín bên trong modal, hỗ trợ phím `Escape` đóng modal khi hồ sơ đã tồn tại, tự động hoàn trả focus khi đóng.

9. **P1.5 — Bộ lọc Kỹ năng Yếu dữ liệu động (`app.js`):**
   - `filterPracticeDomains('weak')` tính toán tự động từ `db.skills` dựa trên ngưỡng tối thiểu 2 câu đã làm và độ chính xác < 75%, loại bỏ hoàn toàn hardcode `rw-info`/`math-adv`.

10. **P2 — Chuẩn hóa thuật ngữ nhà phát triển:**
    - Cập nhật toàn bộ chú thích lập trình sang `SRS` (Spaced Repetition System), không tuyên bố FSRS không có căn cứ.

---

## 2. KẾT QUẢ KIỂM THỬ CHẤP NHẬN TOÀN DIỆN (ACCEPTANCE TEST SUITE)

### Bảng Kết Quả 27/27 Regression Gate (`verify_acceptance_gate.js`):
- ✅ [PASS] All Question Bank Items are APPROVED (Key Distribution: A: 42, B: 42, C: 43, D: 43, Grid-in: 24)
- ✅ [PASS] Answer Key D is balanced (>= 20% of MCQs)
- ✅ [PASS] MATH-ADV-011 is clean grid-in with correct answer 5
- ✅ [PASS] RW-C-001 has no incomplete sentence bug
- ✅ [PASS] RW-C-011 is unambiguous
- ✅ [PASS] practice_test_1.json has RW M1: 27, RW M2-H: 27, RW M2-S: 27
- ✅ [PASS] practice_test_1.json has Math M1: 22, Math M2-H: 22, Math M2-S: 22
- ✅ [PASS] practice_test_1.json title has no "Official" claim
- ✅ [PASS] practice_test_2.json has RW M1: 27, RW M2-H: 27, RW M2-S: 27
- ✅ [PASS] practice_test_2.json has Math M1: 22, Math M2-H: 22, Math M2-S: 22
- ✅ [PASS] practice_test_2.json title has no "Official" claim
- ✅ [PASS] Diagnostic pack contains 30 questions
- ✅ [PASS] Unlicensed Kaplan PDFs removed
- ✅ [PASS] Unused data/ielts directory removed
- ✅ [PASS] Machine path leak file_hashes.txt removed
- ✅ [PASS] index.html contains College Board non-affiliation disclaimer
- ✅ [PASS] index.html contains SAT Strategy Coach (no fake AI)
- ✅ [PASS] index.html contains honest SRS labels (not FSRS)
- ✅ [PASS] index.html contains break area and adaptive transition modal
- ✅ [PASS] Desmos iframe has accessible title
- ✅ [PASS] Modals have role="dialog" and aria-modal="true"
- ✅ [PASS] app.js has calculateSATScoreBands (P0.2 defensible bands)
- ✅ [PASS] app.js has multi-stage adaptive state machine (P0.1)
- ✅ [PASS] app.js has getCanonicalSkill taxonomy normalization (P0.6)
- ✅ [PASS] app.js has classifyDistractorTrap (P0.7 error intelligence)
- ✅ [PASS] app.js tracks real db.totalStudyTimeSec (P0.9 measured data)
- ✅ [PASS] app.js has startDiagnosticExam wired (P0.5)

### Bảng Kết Quả Kiểm Tra Hotfix Chuyên Sâu T01–T08:
| Mã kiểm tra | Nội dung kiểm thử | Trạng thái | Ghi chú minh chứng |
| :--- | :--- | :---: | :--- |
| **T01** | Today Readiness sau >15 câu làm bài | **PASS** | Không crash, hiển thị dải điểm trung thực từ mock hoặc thông số bài tập |
| **T02** | Progress khi chưa làm Mock | **PASS** | Hiển thị "Chưa có dải điểm", dải RW/Math "Chưa có dữ liệu khảo thí", quỹ đạo `--` |
| **T03** | Progress sau 1 bài Mock hoàn tất | **PASS** | Khớp chính xác 100% dải điểm đã lưu từ `db.assessmentHistory` |
| **T04** | Progress sau 2 bài Mock hoàn tất | **PASS** | Quỹ đạo tính đúng bằng độ lệch trung vị 2 bài thi |
| **T05** | Kỷ luật tuần (Weekly consistency) | **PASS** | Giới hạn chuẩn xác 0–7 ngày bằng `getActiveDaysLast7()` |
| **T06** | Emoji chức năng & Thương hiệu | **PASS** | Không còn `🚩` trong app.js, style.css; nhãn Coach & SRS trung thực |
| **T07** | Setup Modal Accessibility | **PASS** | Focus trap khép kín, Tab/Shift+Tab vòng lặp, Escape đóng modal an toàn |
| **T08** | CSS Custom Properties | **PASS** | 58 token sử dụng đều có định nghĩa đầy đủ trong `:root` (0 missing) |

---

## 3. KIỂM THỬ TRỰC QUAN TRÊN TRÌNH DUYỆT THỰC TẾ (8 VIEWPORTS)

Hệ thống đã thực hiện chụp ảnh màn hình và phân tích trực quan toàn bộ 8 kích thước màn hình qua Playwright:
1. **1920×1080 (Desktop Full HD):** Header 1 hàng cân đối, các khối thẻ tính năng có chiều sâu và phản hồi hover sắc nét.
2. **1440×900 (MacBook / Laptop 14-16"):** Header thẳng hàng 1 dòng duy nhất, không rớt dòng.
3. **1366×768 (Laptop phổ thông):** Đã kiểm tra thực tế, khoảng cách và font size tự động co giãn, đảm bảo 1 dòng tuyệt đối (`72px`).
4. **1180×820 (iPad Air / Tablet Landscape):** Bố cục thích ứng mượt mà.
5. **1024×768 (Tablet Standard):** Tự động chuyển đổi các menu phụ trợ gọn gàng.
6. **768×1024 (Tablet Portrait):** Các thẻ tính năng chuyển sang dạng lưới 2 cột.
7. **390×844 (iPhone 13):** Thanh điều hướng di động chân trang tiện dụng, form chẩn đoán trực quan.
8. **360×800 (Android phổ thông):** Hiển thị không lỗi font hay tràn khung ngang.

---

## 4. KẾT LUẬN & ĐƯỜNG DẪN TRUY CẬP

- **Trạng thái:** ✅ **FINAL VISUAL RELEASE CANDIDATE APPROVED**
- **Địa chỉ máy chủ cục bộ đang hoạt động:** [http://localhost:5500](http://localhost:5500)
- **Tập tin báo cáo & Bằng chứng trực quan:** `reports/screenshots/` và thư mục `reports/`
