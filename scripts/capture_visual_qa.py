import time
import os
from playwright.sync_api import sync_playwright

VIEWPORTS = [
    {"name": "1920x1080_desktop", "width": 1920, "height": 1080},
    {"name": "1440x900_macbook", "width": 1440, "height": 900},
    {"name": "1366x768_laptop", "width": 1366, "height": 768},
    {"name": "1180x820_ipad_air", "width": 1180, "height": 820},
    {"name": "1024x768_tablet", "width": 1024, "height": 768},
    {"name": "768x1024_portrait_tablet", "width": 768, "height": 1024},
    {"name": "390x844_iphone13", "width": 390, "height": 844},
    {"name": "360x800_android", "width": 360, "height": 800},
]

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "reports", "screenshots")
os.makedirs(OUT_DIR, exist_ok=True)

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        
        for vp in VIEWPORTS:
            context = browser.new_context(viewport={"width": vp["width"], "height": vp["height"]})
            page = context.new_page()
            
            # Step 1: Fresh state -> Landing page
            page.goto("http://localhost:5500/#landing")
            page.evaluate("() => { localStorage.clear(); }")
            page.reload()
            page.wait_for_load_state("networkidle")
            time.sleep(0.5)
            
            landing_path = os.path.join(OUT_DIR, f"{vp['name']}_01_landing.png")
            page.screenshot(path=landing_path, full_page=False)
            print(f"Captured: {landing_path}")
            
            # Step 2: Open setup modal explicitly
            page.evaluate("() => { if (window.openSetupModal) window.openSetupModal(); }")
            time.sleep(0.5)
            setup_path = os.path.join(OUT_DIR, f"{vp['name']}_02_setup_modal.png")
            page.screenshot(path=setup_path, full_page=False)
            print(f"Captured: {setup_path}")
            
            # Step 3: Fill and submit setup form to create valid profile
            page.evaluate("""() => {
                const profile = {
                    targetScore: '1500+',
                    grade: '11',
                    englishLevel: 'intermediate',
                    dailyTargetMin: 45,
                    setupDate: new Date().toISOString()
                };
                const state = {
                    profile: profile,
                    skills: {},
                    errors: [],
                    flashcardState: {},
                    sessionLog: []
                };
                localStorage.setItem('nmstudio_sat_os_v3', JSON.stringify(state));
            }""")
            
            # Step 4: Route to #today
            page.goto("http://localhost:5500/#today")
            page.wait_for_load_state("networkidle")
            time.sleep(0.5)
            today_path = os.path.join(OUT_DIR, f"{vp['name']}_03_today.png")
            page.screenshot(path=today_path, full_page=False)
            print(f"Captured: {today_path}")
            
            # Step 5: Route to #practice
            page.goto("http://localhost:5500/#practice")
            page.wait_for_load_state("networkidle")
            time.sleep(0.5)
            practice_path = os.path.join(OUT_DIR, f"{vp['name']}_04_practice.png")
            page.screenshot(path=practice_path, full_page=False)
            print(f"Captured: {practice_path}")
            
            # Step 6: Route to #test
            page.goto("http://localhost:5500/#test")
            page.wait_for_load_state("networkidle")
            time.sleep(0.5)
            mock_path = os.path.join(OUT_DIR, f"{vp['name']}_05_mock.png")
            page.screenshot(path=mock_path, full_page=False)
            print(f"Captured: {mock_path}")
            
            context.close()
            
        # Step 7: Test Exam isolation mode at 1440x900
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        page.goto("http://localhost:5500/#test")
        page.evaluate("""() => {
            const profile = { targetScore: '1500+', grade: '11', englishLevel: 'intermediate', dailyTargetMin: 45 };
            localStorage.setItem('nmstudio_sat_os_v3', JSON.stringify({ profile, skills: {}, errors: [], flashcardState: {}, sessionLog: [] }));
        }""")
        page.reload()
        page.wait_for_load_state("networkidle")
        time.sleep(0.5)
        # Start a quick module
        page.evaluate("window.startMockExam('sat', 'sat-diagnostic')")
        time.sleep(1.0)
        exam_path = os.path.join(OUT_DIR, "1440x900_06_exam_isolation.png")
        page.screenshot(path=exam_path, full_page=False)
        print(f"Captured: {exam_path}")
        context.close()

        browser.close()
        print("All visual captures complete successfully!")

if __name__ == "__main__":
    run()
