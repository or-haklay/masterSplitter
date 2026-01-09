# מדריך התחברות ל-MongoDB Compass

> **פרטי השרת שלך:**
> - SSH: `ssh hayotush`
> - URL: https://mastersplitter.hayotush.com
> - Database: `master_splitter`

## 🚀 התחלה מהירה

**הדרך הקלה ביותר:**

1. פתח PowerShell והרץ:
   ```powershell
   ssh hayotush -L 27017:localhost:27017 -N
   ```

2. פתח MongoDB Compass והזן:
   ```
   mongodb://localhost:27017/master_splitter
   ```

3. לחץ **Connect**

**חשוב:** שמור את חלון ה-SSH Tunnel פתוח כל זמן שאתה משתמש ב-Compass!

---

## אפשרות 1: התחברות לשרת מרוחק דרך SSH Tunnel

**שרת**: `hayotush` (https://mastersplitter.hayotush.com)

אם השרת שלך מרוחק, תצטרך ליצור SSH Tunnel כדי להתחבר אליו.

### שלב 1: בדוק את פרטי החיבור

1. התחבר לשרת דרך SSH:
```bash
ssh hayotush
```

2. בדוק את קובץ ה-.env:
```bash
cd ~/masterSplitter/backend
cat .env | grep MONGO_URI
```

3. בדוק ש-MongoDB רץ:
```bash
sudo systemctl status mongod
```

### שלב 2: הגדר MongoDB לקבל חיבורים חיצוניים (אופציונלי)

**אזהרה**: זה פותח את MongoDB לגישה חיצונית. עדיף להשתמש ב-SSH Tunnel (שלב 3).

אם בכל זאת תרצה לפתוח:
```bash
# ערוך את קובץ התצורה של MongoDB
sudo nano /etc/mongod.conf

# שנה את השורה:
# net:
#   bindIp: 127.0.0.1
# ל:
# net:
#   bindIp: 0.0.0.0

# הפעל מחדש MongoDB
sudo systemctl restart mongod
```

**חשוב**: הוסף firewall rule ב-Lightsail Console:
- Port: 27017
- Source: כתובת ה-IP שלך בלבד (לא All IPs!)

### שלב 3: יצירת SSH Tunnel (מומלץ)

#### Windows (PowerShell):

```powershell
# התחבר דרך SSH Tunnel
ssh hayotush -L 27017:localhost:27017 -N
```

**הסבר**:
- `-L 27017:localhost:27017` - יוצר tunnel מהפורט המקומי 27017 לפורט 27017 בשרת
- `-N` - לא להריץ פקודות, רק לשמור את ה-tunnel פתוח

#### Windows (PuTTY):

1. פתח PuTTY
2. ב-**Session**:
   - Host Name: `hayotush` (או ה-IP של השרת אם מוגדר ב-SSH config)
   - Port: `22`
3. ב-**Connection → SSH → Tunnels**:
   - Source port: `27017`
   - Destination: `localhost:27017`
   - בחר **Local** ו-**Auto**
   - לחץ **Add**
4. חזור ל-**Session**, שמור את ההגדרות, ולחץ **Open**

### שלב 4: התחבר ב-MongoDB Compass

1. פתח MongoDB Compass
2. בשורת החיבור, הזן:
   ```
   mongodb://localhost:27017/master_splitter
   ```
   
   או אם יש שם משתמש וסיסמה:
   ```
   mongodb://username:password@localhost:27017/master_splitter
   ```

3. לחץ **Connect**

**חשוב**: שמור את חלון ה-SSH Tunnel פתוח כל זמן שאתה משתמש ב-Compass!

---

## אפשרות 2: התחברות מקומית (אם MongoDB רץ על המחשב שלך)

אם MongoDB רץ על המחשב המקומי שלך:

1. פתח MongoDB Compass
2. הזן את ה-connection string מקובץ ה-.env:
   ```
   mongodb://localhost:27017/master_splitter
   ```
3. לחץ **Connect**

---

## אפשרות 3: התחברות ישירה לשרת (אם MongoDB פתוח לגישה חיצונית)

**לא מומלץ מסיבות אבטחה!**

אם הגדרת את MongoDB לקבל חיבורים חיצוניים:

1. פתח MongoDB Compass
2. הזן:
   ```
   mongodb://YOUR_LIGHTSAIL_IP:27017/master_splitter
   ```
   
   או עם אימות:
   ```
   mongodb://username:password@YOUR_LIGHTSAIL_IP:27017/master_splitter
   ```

---

## פתרון בעיות

### "Cannot connect to MongoDB"

1. **בדוק ש-MongoDB רץ בשרת**:
   ```bash
   ssh hayotush
   sudo systemctl status mongod
   ```

2. **בדוק שה-SSH Tunnel פעיל**:
   - Windows: `netstat -an | findstr 27017`
   - Linux/Mac: `netstat -an | grep 27017`

3. **בדוק את ה-firewall**:
   - Lightsail Console → Networking → Firewall
   - ודא ש-port 27017 פתוח (אם אתה משתמש בחיבור ישיר)

### "Authentication failed"

אם MongoDB מוגדר עם אימות:
1. בדוק את שם המשתמש והסיסמה
2. ודא שהמשתמש קיים ב-database הנכון:
   ```bash
   mongosh master_splitter
   db.getUsers()
   ```

### "Connection timeout"

1. בדוק שה-SSH Tunnel פעיל
2. בדוק את החיבור לשרת:
   ```bash
   ssh hayotush
   ```
3. ודא ש-MongoDB רץ:
   ```bash
   ssh hayotush "sudo systemctl status mongod"
   ```

---

## טיפים

1. **שמור את ה-Connection String**: ב-Compass, לחץ על **Favorite** כדי לשמור את החיבור
2. **השתמש ב-SSH Tunnel**: זה הכי בטוח ולא דורש פתיחת פורטים
3. **בדוק את ה-Logs**: אם יש בעיות, בדוק:
   ```bash
   sudo tail -f /var/log/mongodb/mongod.log
   ```

---

## דוגמאות ל-Connection Strings

### חיבור מקומי:
```
mongodb://localhost:27017/master_splitter
```

### חיבור דרך SSH Tunnel:
```
mongodb://localhost:27017/master_splitter
```
(אותו דבר, כי ה-tunnel מעביר את החיבור)

### חיבור עם אימות:
```
mongodb://myuser:mypassword@localhost:27017/master_splitter?authSource=admin
```

### חיבור ל-MongoDB Atlas (אם תשתמש):
```
mongodb+srv://username:password@cluster.mongodb.net/master_splitter
```

---

**עדכון אחרון**: ינואר 2026
