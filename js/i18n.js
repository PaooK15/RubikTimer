/**
 * i18n.js
 * Internationalization module supporting English and Vietnamese (Tiếng Việt)
 */

import { storage } from './storage.js';

export const TRANSLATIONS = {
  en: {
    // Header & Brand
    'brand.title': 'SpeedRubik',
    'brand.subtitle': 'WCA Timer',
    'puzzle.333': '3x3x3 Cube',
    'puzzle.222': '2x2x2 Cube',
    'puzzle.444': '4x4x4 Cube',
    'puzzle.pyram': 'Pyraminx',
    'puzzle.skewb': 'Skewb',
    'nav.theme': 'Theme Colors',
    'nav.wallpaper': 'Wallpaper',
    'nav.transparency': 'Transparency',
    'nav.zen': 'Toggle Zen Distraction-Free Mode',
    'nav.sound': 'Toggle Sound Cues',
    'nav.settings': 'Open Settings',

    // Scramble Bar
    'scramble.title': 'WCA Official Scramble',
    'scramble.generating': 'Generating scramble...',
    'scramble.net': 'Scramble Net',
    'scramble.copy': 'Copy Scramble to Clipboard',
    'scramble.copied': 'Copied!',
    'scramble.next': 'Next ➔',

    // Main Timer
    'timer.status.idle': 'PRESS & HOLD SPACE / SCREEN',
    'timer.status.holding': 'HOLD...',
    'timer.status.ready': 'READY! RELEASE TO START',
    'timer.status.inspection': 'INSPECTION TIME',
    'timer.status.running': 'SOLVING... TAP ANY KEY TO STOP',
    'timer.status.stopped': 'SOLVE COMPLETE',
    'timer.hint.hold': 'Hold',
    'timer.hint.space': 'Space',
    'timer.hint.untilGreen': 'until green, then release to solve',
    'timer.solvingText': 'Solving...',

    // Stats Overview Bar
    'stats.best': 'Best Single',
    'stats.mean': 'Session Mean',
    'stats.curAo5': 'Current Ao5',
    'stats.bestAo5': 'Best Ao5',
    'stats.curAo12': 'Current Ao12',
    'stats.bestAo12': 'Best Ao12',
    'stats.count': 'Total Solves',

    // Sidebar: Solves & Sessions
    'solves.title': 'Solve History',
    'solves.newSession': '+ Session',
    'solves.exportCsv': '📥 Export CSV',
    'solves.clear': '🗑️ Clear',
    'solves.noSolves': 'No solves yet. Press Spacebar or touch the screen to start your first solve!',
    'solves.confirmClear': 'Are you sure you want to clear all solves in this session? This cannot be undone.',
    'solves.promptNewSession': 'Enter new session name (e.g. "3x3 Roux", "Practice", "BLD"):',
    'solves.clearedToast': 'Session solves cleared.',
    'solves.detailTitle': 'Solve #{idx}',
    'solves.detailTime': 'Time: {time}',
    'solves.detailPenalty': 'Penalty: {penalty}',
    'solves.detailDate': 'Date: {date}',
    'solves.detailScramble': 'Scramble:',

    // Sessions Defaults
    'session.main333': '3x3 Normal',
    'session.oh': 'One-Handed (OH)',
    'session.2x2': '2x2 Speed',
    'session.practice': 'Free Practice',

    // Modal: Theme Customizer
    'theme.modalTitle': '🎨 Theme Color Customizer',
    'theme.paletteTitle': 'Customize Palette (HTML Full Color Pickers)',
    'theme.color1': '--color-1 (Surface Highlight & Light Text)',
    'theme.color2': '--color-2 (Soft Sky Blue / Borders & Muted)',
    'theme.color3': '--color-3 (Vibrant Cerulean / Primary Interactive)',
    'theme.color4': '--color-4 (Royal Blue / Accent & Buttons)',
    'theme.color5': '--color-5 (Deep Navy Blue / Dark Base)',
    'theme.presetsTitle': 'Curated Theme Presets',
    'theme.resetBtn': '↺ Reset to Default Azure',
    'theme.importBtn': 'Import JSON',
    'theme.exportBtn': 'Export JSON',
    'theme.resetToast': 'Theme reset to default Azure palette!',
    'theme.importedToast': 'Theme imported successfully!',

    // Modal: Wallpaper & Transparency
    'wallpaper.modalTitle': '🖼️ Wallpaper & Visual Atmosphere',
    'wallpaper.tab.media': 'Wallpaper Source',
    'wallpaper.tab.position': 'Background Position',
    'wallpaper.tab.transparency': 'Block Transparency',
    'wallpaper.tab.atmosphere': 'Atmosphere & Dim',

    'wallpaper.uploadTitle': 'Upload Local Wallpaper (Image, GIF, Video)',
    'wallpaper.dropMain': 'Click or Drag & Drop File Here',
    'wallpaper.dropSub': 'Supports .PNG, .JPG, .WEBP, animated .GIF, .MP4, .WEBM video',
    'wallpaper.urlTitle': 'Or Apply via Direct Web URL',
    'wallpaper.urlApply': 'Apply',
    'wallpaper.presetsTitle': 'Built-In Dynamic Presets',
    'wallpaper.savedNotice': 'Uploaded wallpapers are preserved in IndexedDB storage.',

    // Position Tab
    'pos.gridTitle': 'Quick Alignment Grid',
    'pos.alignFocus': 'Align Focus Area',
    'pos.gridDesc': 'Click any anchor arrow to instantly pan your wallpaper or video towards that section.',
    'pos.resetBtn': '↺ Center & Reset',
    'pos.slidersTitle': 'Fine Position & Scale',
    'pos.fitMode': 'Display Fit Mode',
    'pos.fitCover': 'Cover (Fill entire screen, crop edges)',
    'pos.fitContain': 'Contain (Fit full image inside screen)',
    'pos.fitFill': 'Fill (Stretch to fit)',
    'pos.posX': 'Horizontal Position (X)',
    'pos.posY': 'Vertical Position (Y)',
    'pos.scale': 'Wallpaper Zoom / Scale',
    'pos.resetToast': 'Background framing centered and reset.',

    // Transparency Tab
    'trans.presetsTitle': 'Quick Transparency Presets',
    'trans.ghost': 'Pure Crystal Ghost (15% Solid)',
    'trans.balanced': 'Balanced Glass (60% Solid)',
    'trans.solid': 'High Contrast Solid (90% Solid)',
    'trans.globalTitle': '🌐 Master Global Cards Transparency',
    'trans.globalDesc': 'Adjusts opacity across all panels simultaneously. Set to 0% for pure transparent glass.',
    'trans.individualTitle': 'Individual Block Transparency',
    'trans.blockTimer': '⏱️ Timer & Solve Area',
    'trans.blockTimerSub': 'Central solve & complete surface',
    'trans.blockHistory': '📜 Solve History Sidebar',
    'trans.blockHistorySub': 'List of solves and sessions',
    'trans.blockScramble': '🧩 Scramble & Net Bar',
    'trans.blockScrambleSub': 'Top scramble and 2D cube net',
    'trans.blockStats': '📊 Stats Summary Bar',
    'trans.blockStatsSub': 'Bottom Ao5, Ao12, best single',
    'trans.blockHeader': '🧭 Top Navigation Header',
    'trans.blockHeaderSub': 'Logo and header buttons bar',
    'trans.blockBorder': '🔲 Card Borders Visibility',
    'trans.blockBorderSub': 'Glass border lines intensity',
    'trans.blockBlur': '❄️ Card Glass Blur (Frosted)',
    'trans.blockBlurSub': 'Backdrop blur behind cards',

    // Atmosphere Tab
    'atm.filtersTitle': 'Atmospheric Filters',
    'atm.opacity': 'Wallpaper Brightness / Opacity',
    'atm.opacitySub': 'Visibility of background media',
    'atm.blur': 'Wallpaper Blur Effect',
    'atm.blurSub': 'Soft focus on background',
    'atm.darkness': 'Dark Overlay Tint',
    'atm.darknessSub': 'Darkens wallpaper for high text readability',
    'modal.done': 'Done',
    'modal.close': 'Close',

    // Modal: Settings
    'settings.title': '⚙️ Speedcube Timer Settings',
    'settings.inspectionTitle': 'WCA 15-Second Inspection',
    'settings.inspectionDesc': 'Counts down 15s with voice/tone alert at 8s and 12s before starting',
    'settings.zenTitle': 'Zen Mode (Distraction-Free)',
    'settings.zenDesc': 'Hides scramble bar, stats and sidebar while solving',
    'settings.hideRunningTitle': 'Hide Clock While Solving',
    'settings.hideRunningDesc': 'Displays "Solving..." instead of running timer to reduce anxiety',
    'settings.soundTitle': 'Audio Synthesizer Cues',
    'settings.soundDesc': 'Ready chime, mechanical clicks, inspection warning beeps, PB fanfare',
    'settings.precisionTitle': 'Timer Precision',
    'settings.precisionDesc': 'Display milliseconds to 2 decimals (0.00) or 3 decimals (0.000)',
    'settings.footerKbd': 'Keyboard: [Space] Start/Stop, [Alt+N] Next, [Alt+Z] Zen',

    // Toasts
    'toast.pb': '🎉 NEW PERSONAL BEST! 🎉',
    'toast.zenOn': 'Zen Mode Enabled',
    'toast.zenOff': 'Zen Mode Disabled',
    'toast.wallpaperUpdated': 'Wallpaper updated: {name}',
    'toast.wallpaperUrl': 'Wallpaper applied from URL!',
    'toast.aligned': 'Background aligned to {dir}',
    'toast.langChanged': 'Language switched to English'
  },

  vi: {
    // Header & Brand
    'brand.title': 'SpeedRubik',
    'brand.subtitle': 'Đồng Hồ WCA',
    'puzzle.333': 'Rubik 3x3x3',
    'puzzle.222': 'Rubik 2x2x2',
    'puzzle.444': 'Rubik 4x4x4',
    'puzzle.pyram': 'Pyraminx',
    'puzzle.skewb': 'Skewb',
    'nav.theme': 'Màu Sắc',
    'nav.wallpaper': 'Hình Nền',
    'nav.transparency': 'Trong Suốt',
    'nav.zen': 'Bật/Tắt Chế Độ Tập Trung (Zen Mode)',
    'nav.sound': 'Bật/Tắt Âm Thanh',
    'nav.settings': 'Mở Cài Đặt',

    // Scramble Bar
    'scramble.title': 'Hoán Vị Chuẩn WCA',
    'scramble.generating': 'Đang tạo hoán vị...',
    'scramble.net': 'Lưới Khối 2D',
    'scramble.copy': 'Sao chép hoán vị vào bộ nhớ tạm',
    'scramble.copied': 'Đã Chép!',
    'scramble.next': 'Tiếp ➔',

    // Main Timer
    'timer.status.idle': 'NHẤN & GIỮ PHÍM CÁCH / MÀN HÌNH',
    'timer.status.holding': 'ĐANG GIỮ...',
    'timer.status.ready': 'SẴN SÀNG! THẢ RA ĐỂ BẮT ĐẦU',
    'timer.status.inspection': 'THỜI GIAN QUAN SÁT',
    'timer.status.running': 'ĐANG GIẢI... NHẤN PHÍM BẤT KỲ ĐỂ DỪNG',
    'timer.status.stopped': 'HOÀN THÀNH LẦN GIẢI',
    'timer.hint.hold': 'Giữ',
    'timer.hint.space': 'Phím Cách',
    'timer.hint.untilGreen': 'đến khi chuyển xanh lá, rồi thả ra để bấm giờ',
    'timer.solvingText': 'Đang giải...',

    // Stats Overview Bar
    'stats.best': 'Đơn Tốt Nhất',
    'stats.mean': 'Trung Bình Phiên',
    'stats.curAo5': 'Ao5 Hiện Tại',
    'stats.bestAo5': 'Ao5 Tốt Nhất',
    'stats.curAo12': 'Ao12 Hiện Tại',
    'stats.bestAo12': 'Ao12 Tốt Nhất',
    'stats.count': 'Tổng Lần Giải',

    // Sidebar: Solves & Sessions
    'solves.title': 'Lịch Sử Giải',
    'solves.newSession': '+ Phiên Mới',
    'solves.exportCsv': '📥 Xuất CSV',
    'solves.clear': '🗑️ Xoá Hết',
    'solves.noSolves': 'Chưa có lần giải nào. Nhấn giữ Phím Cách hoặc chạm màn hình để bắt đầu!',
    'solves.confirmClear': 'Bạn có chắc chắn muốn xoá toàn bộ lịch sử trong phiên này không? Thao tác này không thể hoàn tác.',
    'solves.promptNewSession': 'Nhập tên phiên mới (ví dụ: "3x3 Roux", "Luyện Tập", "BLD"):',
    'solves.clearedToast': 'Đã xoá lịch sử phiên giải.',
    'solves.detailTitle': 'Lần giải #{idx}',
    'solves.detailTime': 'Thời gian: {time}',
    'solves.detailPenalty': 'Phạt: {penalty}',
    'solves.detailDate': 'Thời điểm: {date}',
    'solves.detailScramble': 'Hoán vị (Scramble):',

    // Sessions Defaults
    'session.main333': '3x3 Bình Thường',
    'session.oh': 'Một Tay (OH)',
    'session.2x2': '2x2 Tốc Độ',
    'session.practice': 'Luyện Tự Do',

    // Modal: Theme Customizer
    'theme.modalTitle': '🎨 Tùy Chỉnh Màu Giao Diện',
    'theme.paletteTitle': 'Chỉnh Màu Bảng Mã (Bộ Chọn Màu HTML Đầy Đủ)',
    'theme.color1': '--color-1 (Màu Nổi Bật & Chữ Sáng)',
    'theme.color2': '--color-2 (Xanh Da Trời / Đường Viền & Nhẹ)',
    'theme.color3': '--color-3 (Xanh Dương Tươi / Tương Tác Chính)',
    'theme.color4': '--color-4 (Xanh Hoàng Gia / Nút Bấm & Thẻ)',
    'theme.color5': '--color-5 (Xanh Đêm Sâu / Nền Cơ Sở)',
    'theme.presetsTitle': 'Bộ Màu Gợi Ý Sẵn Có',
    'theme.resetBtn': '↺ Đặt Lại Màu Azure Mặc Định',
    'theme.importBtn': 'Nhập JSON',
    'theme.exportBtn': 'Xuất JSON',
    'theme.resetToast': 'Đã đặt lại về bảng màu Azure mặc định!',
    'theme.importedToast': 'Đã nhập bảng màu thành công!',

    // Modal: Wallpaper & Transparency
    'wallpaper.modalTitle': '🖼️ Hình Nền & Độ Trong Suốt Giao Diện',
    'wallpaper.tab.media': 'Nguồn Hình Nền',
    'wallpaper.tab.position': 'Vị Trí Nền',
    'wallpaper.tab.transparency': 'Độ Trong Suốt Khối',
    'wallpaper.tab.atmosphere': 'Ánh Sáng & Mờ Nền',

    'wallpaper.uploadTitle': 'Tải Lên Hình Nền Máy Cục Bộ (Ảnh, GIF, Video)',
    'wallpaper.dropMain': 'Bấm hoặc Kéo & Thả Tệp Vào Đây',
    'wallpaper.dropSub': 'Hỗ trợ .PNG, .JPG, .WEBP, ảnh động .GIF, video .MP4, .WEBM',
    'wallpaper.urlTitle': 'Hoặc Dán Đường Link (URL) Trực Tiếp',
    'wallpaper.urlApply': 'Áp Dụng',
    'wallpaper.presetsTitle': 'Hình Nền Động Tuyển Chọn Sẵn Có',
    'wallpaper.savedNotice': 'Hình nền tải lên được lưu trữ tự động trong IndexedDB của trình duyệt.',

    // Position Tab
    'pos.gridTitle': 'Lưới Căn Chỉnh Nhanh (9 Điểm)',
    'pos.alignFocus': 'Căn Trọng Tâm Hình Nền',
    'pos.gridDesc': 'Nhấp vào mũi tên bất kỳ để xoay chuyển tiêu điểm hình nền hoặc video về phía đó.',
    'pos.resetBtn': '↺ Căn Giữa & Đặt Lại',
    'pos.slidersTitle': 'Tinh Chỉnh Vị Trí & Tỉ Lệ',
    'pos.fitMode': 'Chế Độ Hiển Thị',
    'pos.fitCover': 'Bao Phủ (Lấp đầy toàn màn hình, cắt cạnh)',
    'pos.fitContain': 'Vừa Khung (Hiển thị trọn vẹn toàn bộ ảnh)',
    'pos.fitFill': 'Kéo Giãn (Lấp đầy khung)',
    'pos.posX': 'Vị Trí Chiều Ngang (X)',
    'pos.posY': 'Vị Trí Chiều Dọc (Y)',
    'pos.scale': 'Thu Phóng / Phóng To Nền',
    'pos.resetToast': 'Đã căn giữa và đặt lại khung hình nền.',

    // Transparency Tab
    'trans.presetsTitle': 'Thiết Lập Trong Suốt Nhanh',
    'trans.ghost': 'Pha Lê Trong Suốt (15% Đậm)',
    'trans.balanced': 'Kính Cân Bằng (60% Đậm)',
    'trans.solid': 'Tương Phản Đậm (90% Đậm)',
    'trans.globalTitle': '🌐 Độ Trong Suốt Tổng Thể Tất Cả Các Khối',
    'trans.globalDesc': 'Điều chỉnh độ trong suốt của tất cả bảng cùng lúc. Chỉnh 0% để thấy trọn vẹn hình nền phía sau.',
    'trans.individualTitle': 'Độ Trong Suốt Từng Khối Riêng Biệt',
    'trans.blockTimer': '⏱️ Khối Bấm Giờ & Vùng Giải',
    'trans.blockTimerSub': 'Bề mặt trung tâm bấm giờ và hoàn thành giải',
    'trans.blockHistory': '📜 Khối Lịch Sử Giải (Sidebar)',
    'trans.blockHistorySub': 'Bảng danh sách thời gian và phiên giải',
    'trans.blockScramble': '🧩 Thanh Hoán Vị & Lưới 2D',
    'trans.blockScrambleSub': 'Khu vực hiển thị công thức xáo và lưới rubik',
    'trans.blockStats': '📊 Thanh Thống Kê Tổng Quan',
    'trans.blockStatsSub': 'Thanh đáy chứa Ao5, Ao12, kỷ lục đơn',
    'trans.blockHeader': '🧭 Thanh Điều Hướng Trên Cùng',
    'trans.blockHeaderSub': 'Thanh tiêu đề, logo và các nút công cụ',
    'trans.blockBorder': '🔲 Độ Rõ Đường Viền Thẻ',
    'trans.blockBorderSub': 'Độ đậm nhạt của viền kính',
    'trans.blockBlur': '❄️ Độ Mờ Kính (Frosted Blur)',
    'trans.blockBlurSub': 'Hiệu ứng kính mờ đằng sau các thẻ',

    // Atmosphere Tab
    'atm.filtersTitle': 'Hiệu Ứng Khí Quyển Nền',
    'atm.opacity': 'Độ Sáng / Độ Hiển Thị Nền',
    'atm.opacitySub': 'Mức độ hiện rõ của hình nền',
    'atm.blur': 'Hiệu Ứng Làm Mờ Nền',
    'atm.blurSub': 'Làm mờ nền để chữ nổi bật hơn',
    'atm.darkness': 'Lớp Phủ Đen Làm Tối',
    'atm.darknessSub': 'Làm tối nền giúp tăng tương phản và dễ đọc',
    'modal.done': 'Xong',
    'modal.close': 'Đóng',

    // Modal: Settings
    'settings.title': '⚙️ Cài Đặt Đồng Hồ Speedcube',
    'settings.inspectionTitle': 'Quan Sát 15 Giây Chuẩn WCA',
    'settings.inspectionDesc': 'Đếm ngược 15 giây với âm thanh cảnh báo ở giây thứ 8 và thứ 12 trước khi giải',
    'settings.zenTitle': 'Chế Độ Tập Trung (Zen Mode)',
    'settings.zenDesc': 'Ẩn thanh hoán vị, thống kê và lịch sử giải trong khi bấm giờ',
    'settings.hideRunningTitle': 'Ẩn Đồng Hồ Khi Đang Giải',
    'settings.hideRunningDesc': 'Hiển thị "Đang giải..." thay vì số chạy liên tục để giảm áp lực tâm lý',
    'settings.soundTitle': 'Âm Thanh Báo Hiệu',
    'settings.soundDesc': 'Chuông sẵn sàng, tiếng bấm cơ học, cảnh báo quan sát, nhạc chuông PB',
    'settings.precisionTitle': 'Độ Chính Xác Chữ Số',
    'settings.precisionDesc': 'Hiển thị phần nghìn giây 2 số (0.00) hoặc 3 số (0.000)',
    'settings.footerKbd': 'Phím tắt: [Cách] Bấm/Dừng, [Alt+N] Hoán vị mới, [Alt+Z] Chế độ Zen',

    // Toasts
    'toast.pb': '🎉 KỶ LỤC CÁ NHÂN MỚI (PB)! 🎉',
    'toast.zenOn': 'Đã bật Chế độ Tập trung',
    'toast.zenOff': 'Đã tắt Chế độ Tập trung',
    'toast.wallpaperUpdated': 'Đã cập nhật hình nền: {name}',
    'toast.wallpaperUrl': 'Đã áp dụng hình nền từ liên kết!',
    'toast.aligned': 'Đã căn hình nền theo hướng {dir}',
    'toast.langChanged': 'Đã chuyển đổi ngôn ngữ sang Tiếng Việt'
  }
};

class I18nManager {
  constructor() {
    this.storageKey = 'rubik_timer_language';
    // Auto-detect browser language: if starts with 'vi', use Vietnamese; else English
    const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    const defaultLang = browserLang.startsWith('vi') ? 'vi' : 'en';

    this.currentLang = storage.get(this.storageKey, defaultLang);
    if (!['en', 'vi'].includes(this.currentLang)) {
      this.currentLang = 'en';
    }
  }

  // Get current language code ('en' | 'vi')
  getLanguage() {
    return this.currentLang;
  }

  // Set language and update all DOM elements
  setLanguage(lang) {
    if (!['en', 'vi'].includes(lang)) return;
    this.currentLang = lang;
    storage.set(this.storageKey, lang);
    this.applyTranslations();

    // Update html lang attribute
    document.documentElement.lang = lang;
  }

  // Translate a key with optional dynamic variable replacements
  t(key, vars = {}) {
    const langDict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.en;
    let text = langDict[key] || TRANSLATIONS.en[key] || key;

    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return text;
  }

  // Walk DOM and translate all elements with data-i18n, data-i18n-title, data-i18n-placeholder
  applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = this.t(key);
      }
    });

    const titleElements = document.querySelectorAll('[data-i18n-title]');
    titleElements.forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.setAttribute('title', this.t(key));
      }
    });

    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.setAttribute('placeholder', this.t(key));
      }
    });
  }
}

export const i18n = new I18nManager();
