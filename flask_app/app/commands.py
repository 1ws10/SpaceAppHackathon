import sqlite3



def createUser(email: str, password: str, phone = None):
    try:
        with sqlite3.connect('database.db') as db:
            cursor = db.cursor()
            cursor.execute("INSERT INTO User (email, password, phone) VALUES (?, ?, ?)", (email, password, phone))
            db.commit()
            db.close()
    except sqlite3.IntegrityError as e:
            raise e

    except Exception as e:
        print(f"An unexpected error occurred: {e}") 
    
    return

def createData(name: str, lat: float, long: float,  start: str, end: str, email: str, cloudCoverage: int = 0):
    try:
        with sqlite3.connect('database.db') as db:
            cursor = db.cursor()
            cursor.execute("INSERT INTO DATA (name, lat, long, cloudCoverage, startDate, endDate, email) VALUES (?, ?, ?, ?, ?, ?, ?)", (name,  lat, long, cloudCoverage, start, end, email))
            db.commit()
            db.close()
    except sqlite3.IntegrityError as e:
        print(e)
    return

def createNotification(dataID: int, timeNotify: str, timeNextPass: str, type: str):
    with sqlite3.connect('database.db') as db:
        cursor = db.cursor()
        cursor.execute("INSERT INTO Notification (dataID, timeNotify, hasNotified, timeNextPass, type) values (?, ?, FALSE, ?, ?)", (dataID, timeNotify, timeNextPass, type))
        db.commit()
        db.close()
    return

# def getPassword(email: str):
#     cursor.execute("SELECT password FROM User WHERE email = ?", (email,))
#     result = cursor.fetchone()
#     if result:  
#         return result[0]
#     else:
#         return None

def getData(email):
    with sqlite3.connect('database.db') as db:
        cursor = db.cursor()
        cursor.execute("SELECT * FROM Data WHERE email = ?", (email,))
        result = cursor.fetchone()
        if result:  
            return result
        else:
            return None

# def getDataByEmail(email: str):
#     cursor.execute("SELECT Data.* FROM Data JOIN User ON Data.userID = User.userID WHERE User.email = ?", (email,))
    
#     results = cursor.fetchall()  # Use fetchall to get all records for the user
#     return results if results else None


# Testing
createData("My_Data1", 63.12323, 85.123123, "2024-10-6", "2024-10-6", "Kyle@KyleKyle.com", 4)
# db.close()
print(getData("Kyle@KyleKyle.com"))
# print(getDataByEmail("Kyle@KyleKyle.com"))