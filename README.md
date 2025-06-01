# 🧠 Task Executor

>
> ⚡ **שדרוג מערכת – ריפאקטור יוני 2025:** בוצע ריפאקטור למערכת על פי עקרונות Clean Architecture:
> ביצוע משיכת משימות מהתור באמצעות Event ולא Interval.
> הקוד חולק לשכבות אחראיות וברורות – controller, business logic, repository ו־processor.
> נוסף חיבור ל־SQLite, לוגינג לכל שלב, טיפול שיטתי בשגיאות, ושידור התקדמות המשימות בזמן אמת ב־SSE.
> 

---

## 📐 ארכיטקטורה

### 🎯 `tasks.controller.ts`  
קבלת משימות חדשות וסטטוס דרך API נקי, עם ולידציה ו־Swagger.

### 🧱 `task.store.ts`  
אחסון זמני של משימות בזיכרון (עדיין קיים לצד SQLite לניהול מצבי ריצה).

### 🧠 `bl/task.executor.ts`  
ולידציה לוגית והעברת משימה לביצוע (שכבת BL מופרדת מה־Service).

### 🔄 `task.queue.ts`  
תור פנימי מבוסס זיכרון, ללא BullMQ, עם בקרה על עומס מערכת.

### ⚙️ `task.processor.ts`  
רכיב המבצע בפועל את המשימות בצורה אסינכרונית.

### 🧮 `logic/task.handlers.ts`  
מימוש החישוב בפועל (חיבור / כפל), מופרד מה־BL.

### 📡 `task.events.service.ts`  
שידור עדכונים על סטטוס המשימה דרך SSE ללקוח.

### 🧊 `task.cache.ts`  
Cache לזיהוי כפילויות ובדיקות יעילות – מוכן ל־Redis.

### 🗄️ `task.entity.ts`  
מיפוי ישות משימה למסד הנתונים `SQLite` באמצעות TypeORM.

### 🧬 `task.service.ts`  
ניהול אחראי של תיאום בין רכיבי המערכת (Events, Cache, Queue, DB).

---

## 🚀 הרצה

```bash
npm install && npm run start:dev
