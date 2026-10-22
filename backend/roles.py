from flask import Blueprint, request, jsonify
from db import get_db_connection

roles_bp = Blueprint("roles", __name__)

# GET all roles
@roles_bp.route("/roles", methods=["GET"])
def get_roles():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM roles ORDER BY role_id;")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows)

# GET one role
@roles_bp.route("/roles/<int:role_id>", methods=["GET"])
def get_role(role_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM roles WHERE role_id = %s;", (role_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if row is None:
        return jsonify({"error": "Role not found"}), 404
    return jsonify(row)

# CREATE a role
@roles_bp.route("/roles", methods=["POST"])
def create_role():
    data = request.get_json()
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO roles (role_name, description) VALUES (%s, %s) RETURNING *;",
        (data["role_name"], data.get("description"))
    )
    new_role = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return jsonify(new_role), 201

# UPDATE a role
@roles_bp.route("/roles/<int:role_id>", methods=["PUT"])
def update_role(role_id):
    data = request.get_json()
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "UPDATE roles SET role_name = %s, description = %s WHERE role_id = %s RETURNING *;",
        (data["role_name"], data.get("description"), role_id)
    )
    updated = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    if updated is None:
        return jsonify({"error": "Role not found"}), 404
    return jsonify(updated)

# DELETE a role
@roles_bp.route("/roles/<int:role_id>", methods=["DELETE"])
def delete_role(role_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM roles WHERE role_id = %s RETURNING role_id;", (role_id,))
    deleted = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    if deleted is None:
        return jsonify({"error": "Role not found"}), 404
    return jsonify({"message": "Role deleted"})