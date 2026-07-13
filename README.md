# 🌌 Ketesa Matrix Stack Manager

یک پنل مدیریتی تمام‌عیار، مدرن و شکیل با معماری فول‌استک برای استقرار، پیکربندی و مدیریت سرورهای چت سازمانی **Matrix (Synapse)** و کلاینت **Element Web**. این پروژه دارای رابط کاربری شیشه‌ای (Dark Glass UI) تعاملی و معماری جدید **عامل‌محور (Agent-Based)** برای مدیریت متمرکز سرورهای ماتریکس مجزا و توزیع‌شده در گستره شبکه بدون نیاز به افشای دسترسی مستقیم دیتابیس یا SSH است.

A premium, modern, full-featured full-stack management panel to deploy, configure, and manage corporate **Matrix (Synapse)** homeservers and **Element Web** clients. Complete with an interactive glassmorphic dashboard and a highly secure, decentralized **Agent-Based Architecture** to centralize management over multiple distributed remote Matrix nodes without exposing direct DB or SSH credentials.

---

## 🏗️ معماری نوین عامل‌محور | Remote Server Management Architecture

مدل مدیریت سنتی که نیاز به ارتباط مستقیم SSH و پورت باز پایگاه‌داده داشت، با یک **ساختار کاملاً ماژولار و مبتنی بر عامل (Agent-Based)** جایگزین شده است:

The legacy management approach requiring direct, open SSH and database ports has been upgraded to a **modular, decentralized Agent-Based design**:

1. **مدیریت متمرکز (Central Panel)**: پنل وب به عنوان یک ایستگاه کنترل مرکزی کار می‌کند و دستورات مدیریتی را در قالب تسک‌ها به صف جاب‌‌ها (Job Queue) ارسال می‌نماید.
2. **عامل‌های لینوکس هوشمند (Remote Python Agents)**: روی گره‌های دوردست، یک اسکریپت سبک پایتون به عنوان عامل اجرا می‌شود که وظیفه پایش سیستم (System Telemetry) و اجرای وظایف محلی (اعم از اجرای دستورات، خواندن/نوشتن تنظیمات، کوئری‌های PostgreSQL و کنترل وب‌سرورها) را برعهده دارد.
3. **امنیت پیشرفته (High-Grade Security)**: ارتباطات میان عامل و پنل وب از طریق یک وب‌سرویس امن مجهز به توکن ثبت‌نام و کلیدهای دسترسی رمزنگاری‌شده (API Keys) انجام می‌شود تا امنیت اطلاعات به حداکثر برسد.

---

## 🇮🇷 راهنمای نصب سریع پنل مرکزی (فارسی)

شما می‌توانید کل پروژه (شامل کلاینت پنل و سرور بک‌اند) را روی هر سرور ابری یا VPS خام (لینوکس اوبونتو یا دبیان) به سادگی با اجرای یک دستور تک‌خطی زیر نصب کنید:

```bash
curl -sSL https://raw.githubusercontent.com/shahbazimasoud/clonematrixtest/master/setup-panel.sh | sudo bash
```

### 📋 مراحل نصب تعاملی پنل:
۱. **دامنه یا IP**: اسکریپت آدرس دامنه یا آی‌پی پنل شما را می‌پرسد.
۲. **پورت شبکه**: پورت اجرای پنل (به صورت پیش‌فرض ۳۰۰۰) را وارد می‌کنید.
۳. **اطلاعات ادمین اصلی (Owner)**: نام کاربری، ایمیل و رمز عبور ادمین اولیه از شما پرسیده می‌شود.
۴. **راه‌اندازی خودکار**: اسکریپت به طور خودکار آخرین نسخه پایدار Node.js 22 LTS، ابزارهای کامپایل و Git را نصب کرده، دیتابیس لوکال را با رمز ادمین هش‌شده بذرپاشی (Seed) می‌کند و یک وب‌سرویس پس‌زمینه پایدار با استفاده از `systemd` ایجاد می‌نماید.

---

## 🇬🇧 Quick Central Panel Installation Guide (English)

Deploy the entire full-stack Matrix Stack Manager panel on any fresh Ubuntu/Debian VPS with a single interactive command:

```bash
curl -sSL https://raw.githubusercontent.com/shahbazimasoud/clonematrixtest/master/setup-panel.sh | sudo bash
```

### 📋 How the Interactive Setup Works:
1. **Interactive Prompts**: It asks you for the Panel's domain or public IP, access port, and your target Administrator (**Owner**) credentials.
2. **Auto-Dependency Installation**: Verifies and installs Node.js 22 LTS, `npm`, `git`, and other essential system tools.
3. **Network Resilience**: Features an automatic fallback system optimized to guarantee successful setup even behind restrictive firewalls or slower networks.
4. **Secure Daemon**: Creates and registers a robust `systemd` service called `matrix-manager.service` to keep the panel running persistently on system reboots.

---

## 🚀 راهنمای راه‌اندازی عامل مدیریتی روی سرورهای دوردست | Remote Agent Installation

جهت افزودن و مدیریت سرورهای ماتریکس مجزا از طریق پنل مرکزی، کافیست عامل سبک پایتون را روی سرور ماتریکس مقصد به راحتی با اجرای دستور تعاملی زیر نصب و فعال نمایید:

To connect and manage any external Matrix node, install the lightweight Python Agent on the target Matrix server by running the interactive shell command:

```bash
# جایگزین کردن <PANEL_URL> با آدرس پنل مرکزی و <REGISTRATION_TOKEN> با توکن دریافتی از بخش مدیریت اتصالات
# Replace <PANEL_URL> with your central panel URL and <REGISTRATION_TOKEN> with the token generated from Connection Manager
curl -sSL http://<PANEL_URL>/install-agent.sh | sudo bash -s -- --url http://<PANEL_URL> --token <REGISTRATION_TOKEN>
```

### ویژگی‌های عامل هوشمند | Agent Highlights:
* **Telemetry & Heartbeat**: پایش مداوم منابع سرور (حافظه، پردازنده، دیسک) و ارسال سیگنال حیات (Heartbeat) هر ۳۰ ثانیه به پنل مرکزی.
* **Service Control**: کنترل کامل سرویس‌ها نظیر راه‌اندازی مجدد Matrix Synapse، Nginx و PostgreSQL.
* **Zero Open Inbound Ports**: عدم نیاز به پورت‌های ورودی باز روی سرور دوردست؛ عامل به صورت خروجی با پنل ارتباط برقرار می‌کند و فرآیند پایش بسیار امن را به ارمغان می‌آورد.

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

## 🔒 ساختار دایرکتوری‌های ماژولار | Modular Project Directories

پروژه به صورت کاملا تفکیک‌شده و ماژولار برای ارتقای امنیت و خوانایی معماری بازنویسی شده است:
The project has been refactored into modular sub-systems for superior performance and safety:

* **`/server.ts`**: هماهنگ‌کننده و نقطه شروع اجرای وب سرور با ماژول‌های مجزا.
* **`/server/db.ts`**: هسته پایگاه داده ادمین‌ها، تنظیمات پیش‌فرض شبیه‌سازی محلی (Virtual Sandbox)، ارتباطات SSH و دسترسی فایل سرور.
* **`/server/agent.ts`**: کنترل‌کننده مرکزی ثبت‌نام و تعامل با گره‌های دوردست، مدیریت توکن‌های ثبت‌نام، پینگ‌های حیات و ارسال تسک‌ها به صف جاب‌ها (Job Queue).
* **`/opt/matrix-manager/sandbox`**: محیط مجازی تست و استقرار محلی.
* **`/opt/matrix-manager/sandbox/db/panel_data.json`**: بانک اطلاعاتی ادمین‌ها و تنظیمات پنل.

---

## ⚙️ توسعه محلی | Local Manual Development

اگر قصد توسعه پنل روی لوکال یا ویرایش سورس‌کد را دارید:
If you want to run or build the code locally for development purposes:

1. کلون کردن ریپازیتوری | Clone the repository:
   ```bash
   git clone https://github.com/shahbazimasoud/clonematrixtest.git
   cd clonematrixtest
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
