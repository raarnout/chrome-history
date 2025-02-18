# 🚀 Chrome History Viewer

## 📌 What This App Does
This app **reads and displays your Chrome browsing history** in a table format.
It fetches the history from Chrome's **SQLite database** and presents it with **filtering options**.

✅ **Works on macOS & Windows**  
✅ **Filters history by date**  
✅ **Displays the most recent browsing history**  

> ⚠️ **Chrome must be closed to read history (Windows only)**  
> 🦊 **Use Firefox or another browser to view `localhost:3000`**

---

## 🛠️ **Installation Guide**

### 🔹 **Step 1: Clone the Repository**
```bash
git clone https://github.com/raarnout/chrome-history.git
cd chrome-history
```

### 🔹 **Step 2: Install Dependencies**
```bash
npm install
```

---

## 🚀 **How to Use the App**

### 🔹 **1. Close Chrome (Windows only)**
If you're on **Windows**, make sure **Chrome is completely closed**:
```bash
taskkill /F /IM chrome.exe
```

On **macOS**, this is **not needed**.

### 🔹 **2. Start the App**
```bash
npm run dev
```

### 🔹 **3. Open Firefox and Go to:**
```
http://localhost:3000
```

You will now see a **table with your Chrome browsing history**! 🎉  

---

## 🔍 **Troubleshooting**
- If you get **"Failed to read history"** on Windows:
  - Run `taskkill /F /IM chrome.exe` and restart the app.
  - Ensure **you have read access** to `C:\Users\YourName\AppData\Local\Google\Chrome\User Data\Default\History`.
- If the app doesn't find your history:
  - Check if your **Chrome profile** is `Default` or `Profile 1`.
  - Open `http://localhost:3000/api/history` to see raw JSON output.

---

## 🛠️ **Tech Stack**
- **Next.js 15** (App Router)
- **SQLite** (Reads Chrome history database)
- **Tailwind CSS** (For styling)
- **TypeScript** (For strong typing)

📌 **Now you're ready to track your Chrome history! 🚀**

