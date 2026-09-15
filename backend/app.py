from flask import Flask, request
import psycopg2

app = Flask(__name__)

def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="ocean dbs",
        user="postgres",
        password="your password",
        port="5432"
    )
    return conn

@app.route("/")
def test_connection():
    try:
        conn = get_db_connection()
        conn.close()
        return "PostgreSQL Connected Successfully!"
    except Exception as e:
        return f"Connection Failed: {e}"

# ======================
#Guest API
# ======================
@app.route("/guests")
def get_guests():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM guest")

    guests = cursor.fetchall()

    cursor.close()
    conn.close()

    return {"guests": guests}

# ==================== 
#login API
#user + role
# ====================     

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT u.user_id, u.username, u.password_hash,
               u.first_name, u.last_name,
               r.role_id, r.role_name
        FROM "user" u
        JOIN role r ON u.role_id = r.role_id
        WHERE u.username = %s
    """, (username,))

    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if user is None:
        return {"message": "User not found"}, 404

    if password != user[2]:
        return {"message": "Incorrect password"}, 401

    return {
        "message": "Login successful",
        "user_id": user[0],
        "username": user[1],
        "role_id": user[5],
        "role": user[6]
    }
# ======================
#Room API
# ======================

@app.route("/rooms")
def get_rooms():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT room_id, room_number, room_type_id, status
        FROM room
        ORDER BY room_id
    """)

    rooms = cursor.fetchall()

    cursor.close()
    conn.close()

    return {"rooms": rooms}

# ======================
#Room Facilities
# ======================

@app.route("/roomfacilities")
def get_room_facilities():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT room_facility_id, room_id, facility_id
        FROM room_facility
        ORDER BY room_facility_id
    """)

    room_facilities = cursor.fetchall()

    cursor.close()
    conn.close()

    return {"room_facilities": room_facilities}

# ======================
#Room types
# ======================

@app.route('/roomtypes', methods=['GET'])
def get_room_types():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM room_type ORDER BY room_type_id")
    room_types = cur.fetchall()

    cur.close()
    conn.close()

    return {'room_types': room_types}

# ======================
# Facility API
# ======================

@app.route("/facilities")
def get_facilities():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT facility_id, facility_name, description, availability_status
        FROM facility
        ORDER BY facility_id
    """)

    facilities = cursor.fetchall()

    cursor.close()
    conn.close()

    return {"facilities": facilities}

# ======================
# Staff API
# ======================

@app.route("/staff")
def get_staff():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT staff_id, user_id, position, department,
               employment_date, employment_status
        FROM staff
        ORDER BY staff_id
    """)

    staff = cursor.fetchall()

    cursor.close()
    conn.close()

    return {"staff": staff} 

# ======================
# Reservation API
# ======================

@app.route("/reservations")
def get_reservations():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT reservation_id, guest_id, reservation_date,
               check_in_date, check_out_date, number_of_guests,
               reservation_status, special_requests, total_amount
        FROM reservation
        ORDER BY reservation_id
    """)

    reservations = cursor.fetchall()

    cursor.close()
    conn.close()

    return {"reservations": reservations}  

# ======================
# Reservation Room API
# ======================

@app.route("/reservationrooms")
def get_reservation_rooms():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT reservation_room_id, reservation_id, room_id,
               room_rate, number_of_nights
        FROM reservation_room
        ORDER BY reservation_room_id
    """)

    reservation_rooms = cursor.fetchall()

    cursor.close()
    conn.close()

    return {"reservation_rooms": reservation_rooms}





if __name__ == "__main__":
    app.run(debug=True)