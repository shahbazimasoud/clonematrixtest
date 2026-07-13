# 🌌 Ketesa Matrix Stack Manager

یک پنل مدیریتی تمام‌عیار، مدرن و شکیل با معماری فول‌استک برای استقرار، پیکربندی و مدیریت سرورهای چت سازمانی **Matrix (Synapse)** و کلاینت **Element Web**. این پروژه دارای رابط کاربری شیشه‌ای (Dark Glass UI) تعاملی و یک بک‌اند مستحکم است.

A premium, modern, full-featured full-stack management panel to deploy, configure, and manage corporate **Matrix (Synapse)** homeservers and **Element Web** clients. Complete with an interactive glassmorphic dashboard and a robust production-ready backend.

---

## 🇮🇷 راهنمای نصب سریع (فارسی)

شما می‌توانید کل پروژه (شامل کلاینت پنل و سرور بک‌اند) را روی هر سرور ابری یا VPS خام (لینوکس اوبونتو یا دبیان) به سادگی با اجرای یک دستور تک‌خطی زیر نصب کنید:

```bash
curl -sSL https://raw.githubusercontent.com/shahbazimasoud/matrix-manager/master/setup-panel.sh | sudo bash
```

### 📋 مراحل نصب تعاملی:
۱. **دامنه یا IP**: اسکریپت آدرس دامنه یا آی‌پی پنل شما را می‌پرسد.
۲. **پورت شبکه**: پورت اجرای پنل (به صورت پیش‌فرض ۳۰۰۰) را وارد می‌کنید.
۳. **اطلاعات ادمین اصلی (Owner)**: نام کاربری، ایمیل و رمز عبور ادمین اولیه از شما پرسیده می‌شود.
۴. **راه‌اندازی خودکار**: اسکریپت به طور خودکار Node.js 18+، ابزارهای کامپایل و Git را نصب کرده، دیتابیس لوکال را با رمز ادمین هش‌شده بذرپاشی (Seed) می‌کند و یک وب‌سرویس پس‌زمینه پایدار با استفاده از `systemd` ایجاد می‌نماید.

پس از پایان فرآیند، مشخصات دسترسی و دستورات مدیریتی با رنگ‌های متمایز در ترمینال چاپ می‌شود.

---

## 🇬🇧 Quick Installation Guide (English)

Deploy the entire full-stack Matrix Stack Manager panel on any fresh Ubuntu/Debian VPS with a single interactive command:

```bash
curl -sSL https://raw.githubusercontent.com/shahbazimasoud/matrix-manager/master/setup-panel.sh | sudo bash
```

### 📋 How the Interactive Setup Works:
1. **Interactive Prompts**: It asks you for the Panel's domain or public IP, access port, and your target Administrator (**Owner**) credentials (**Username**, **Email**, and **Password**).
2. **Auto-Dependency Installation**: Verifies and installs Node.js LTS (18+), `npm`, `git`, and other essential system compilation tools.
3. **Secure Password Hashing**: Cryptographically hashes your specified password using `bcrypt` and pre-seeds the secure panel database (`/opt/matrix-manager/sandbox/db/panel_data.json`).
4. **Daemon Deployment**: Creates and registers a robust `systemd` service called `matrix-manager.service` to keep the panel running persistently on system reboots.

---

## 🛠️ مدیریت سرویس پنل | Service Management

پس از اتمام نصب، برای مدیریت سرویس پس‌زمینه پنل از دستورات زیر استفاده کنید:
Once installed, use standard systemd commands to inspect and control the daemon process:

* **مشاهده وضعیت سرویس | Check Service Status**:
  ```bash
  sudo systemctl status matrix-manager
  ```
* **مشاهده لاگ‌های زنده سرور | Inspect Live Logs**:
  ```bash
  sudo journalctl -u matrix-manager -f -n 100
  ```
* **راه‌اندازی مجدد پنل | Restart the Panel**:
  ```bash
  sudo systemctl restart matrix-manager
  ```
* **توقف اجرای پنل | Stop the Panel**:
  ```bash
  sudo systemctl stop matrix-manager
  ```

---

## 🔒 ساختار دایرکتوری‌ها | Configuration & Directories

- **مسیر اصلی پروژه | Project Installation Path**: `/opt/matrix-manager`
- **محیط مجازی تست و استقرار | Virtual Sandbox Directory**: `/opt/matrix-manager/sandbox`
- **بانک اطلاعاتی محلی ادمین‌ها | Panel Local Database**: `/opt/matrix-manager/sandbox/db/panel_data.json`
- **فایل متغیرهای محیطی | Application Environment File**: `/opt/matrix-manager/.env`
- **اسکریپت خودکار استقرار ماتریکس | Synapse Production Installer Script**: `/opt/matrix-manager/install-matrix-stack.sh`

---

## ⚙️ توسعه محلی | Local Manual Development

اگر قصد توسعه پنل روی لوکال یا ویرایش سورس‌کد را دارید:
If you want to run or build the code locally for development purposes:

1. کلون کردن ریپازیتوری | Clone the repository:
   ```bash
   git clone https://github.com/shahbazimasoud/matrix-manager.git
   cd matrix-manager
   ```
2. نصب پیش‌نیازها | Install dependencies:
   ```bash
   npm install
   ```
3. اجرای نسخه توسعه | Run development server:
   ```bash
   npm run dev
   ```
4. ساخت و کامپایل نسخه نهایی تولید | Compile production bundle:
   ```bash
   npm run build
   ```
