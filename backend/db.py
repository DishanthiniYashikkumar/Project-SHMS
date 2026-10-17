import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="Ocean Stays DB",
        user="postgres",
        password="your password",
        port="5432",
        cursor_factory=RealDictCursor  # rows come back as dicts, easy for jsonify
    )