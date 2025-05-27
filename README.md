🧠 Task Executor

שרת NestJS להרצת משימות אסינכרוניות, עם תור פנימי, בדיקת עומס מערכת, קאש, שכבת לוגיקה עסקית, וחיבור ל־SQLite.

📐 ארכיטקטורה
🎯 tasks.controller.ts – קבלת משימות חדשות וסטטוס דרך API

🧱 task.store.ts – אחסון זמני של משימות בזיכרון

🧠 bl/task.executor.ts – ולידציה לוגית והעברת משימה לביצוע

🔄 task.queue.ts – תור פנימי למשימות בהמתנה

⚙️ task.processor.ts – ביצוע משימות באופן אסינכרוני

🧮 logic/task.handlers.ts – לוגיקת חישוב (sum / multiply)

📡 task.events.service.ts – שידור אירועי סטטוס

🧊 task.cache.ts – זיהוי משימות כפולות בעזרת Cache

🗄️ task.entity.ts – מיפוי ישות משימה למסד הנתונים SQLite

🧬 task.service.ts – גישה למסד נתונים SQLite (CRUD)

🚀 הרצה

npm install && npm run start:dev
