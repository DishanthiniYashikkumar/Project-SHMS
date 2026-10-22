from flask import Blueprint, request, jsonify
from db import get_db_connection

notifications_bp = Blueprint("notifications", __name__)

# GET all notifications (optional filter: /notifications?user_id=5)
@notifications_bp.route("/notifications", methods=["GET"])
def get_notifications():
    user_id = request.args.get("user_id")
    conn = get_db_connection()
    cur = conn.cursor()
    if user_id:
        cur.execute(
            "SELECT * FROM notifications WHERE user_id = %s ORDER BY created_at DESC;",
            (user_id,)
        )
    else:
        cur.execute("SELECT * FROM notifications ORDER BY notification_id;")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows)

# GET one notification
@notifications_bp.route("/notifications/<int:notification_id>", methods=["GET"])
def get_notification(notification_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM notifications WHERE notification_id = %s;", (notification_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if row is None:
        return jsonify({"error": "Notification not found"}), 404
    return jsonify(row)

# CREATE a notification
@notifications_bp.route("/notifications", methods=["POST"])
def create_notification():
    data = request.get_json()
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO notifications (user_id, title, message, notification_type)
           VALUES (%s, %s, %s, %s) RETURNING *;""",
        (data["user_id"], data["title"], data["message"], data.get("notification_type"))
    )
    new_row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return jsonify(new_row), 201

# MARK as read (or unread)
@notifications_bp.route("/notifications/<int:notification_id>/read", methods=["PUT"])
def mark_read(notification_id):
    data = request.get_json(silent=True) or {}
    is_read = data.get("is_read", True)
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "UPDATE notifications SET is_read = %s WHERE notification_id = %s RETURNING *;",
        (is_read, notification_id)
    )
    updated = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    if updated is None:
        return jsonify({"error": "Notification not found"}), 404
    return jsonify(updated)

# UPDATE a notification
@notifications_bp.route("/notifications/<int:notification_id>", methods=["PUT"])
def update_notification(notification_id):
    data = request.get_json()
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """UPDATE notifications
           SET title = %s, message = %s, notification_type = %s
           WHERE notification_id = %s RETURNING *;""",
        (data["title"], data["message"], data.get("notification_type"), notification_id)
    )
    updated = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    if updated is None:
        return jsonify({"error": "Notification not found"}), 404
    return jsonify(updated)

# DELETE a notification
@notifications_bp.route("/notifications/<int:notification_id>", methods=["DELETE"])
def delete_notification(notification_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "DELETE FROM notifications WHERE notification_id = %s RETURNING notification_id;",
        (notification_id,)
    )
    deleted = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    if deleted is None:
        return jsonify({"error": "Notification not found"}), 404
    return jsonify({"message": "Notification deleted"})