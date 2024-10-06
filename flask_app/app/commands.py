import sqlite3

db = sqlite3.connect('database.db')
cursor = db.cursor()

def createUser(email: str, password: str, phone = None):
    try:
        cursor.execute("INSERT INTO User (email, password, phone) VALUES (?, ?, ?)", (email, password, phone))
        db.commit()
    except sqlite3.IntegrityError as e:
            raise e

    except Exception as e:
        print(f"An unexpected error occurred: {e}") 
    
    return

def createData(userID: int, name: str, lat: float, long: float,  start: str, end: str, cloudCoverage: int = 0):
    cursor.execute("INSERT INTO DATA (userID, name, lat, long, cloudCoverage, startDate, endDate) VALUES (?, ?, ?, ?, ?, ?, ?)", (userID, name,  lat, long, cloudCoverage, start, end))
    db.commit()
    return

def createNotification(dataID: int, timeNotify: str, timeNextPass: str, type: str):
    cursor.execute("INSERT INTO Notification (dataID, timeNotify, hasNotified, timeNextPass, type) values (?, ?, FALSE, ?, ?)", (dataID, timeNotify, timeNextPass, type))
    db.commit()
    return

def getPassword(email: str):
    cursor.execute("SELECT password FROM User WHERE email = ?", (email,))
    result = cursor.fetchone()
    if result:  
        return result[0]
    else:
        return None

def getData(userID):
    cursor.execute("SELECT * FROM Data WHERE userID = ?", (userID,))
    result = cursor.fetchone()
    if result:  
        return result
    else:
        return None

def getDataByEmail(email: str):
    cursor.execute("SELECT Data.* FROM Data JOIN User ON Data.userID = User.userID WHERE User.email = ?", (email,))
    
    results = cursor.fetchall()  # Use fetchall to get all records for the user
    return results if results else None


# Testing
# createData(1, "My_Data1", 63.12323, 85.123123, "2024-10-6", "2024-10-6")
# db.close()
# print(getData(1))
# print(getDataByEmail("Kyle@KyleKyle.com"))