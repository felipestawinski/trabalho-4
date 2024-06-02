from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from sqlite3 import Error

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

DATABASE = 'tasks.db'

def create_connection():
    conn = None
    try:
        conn = sqlite3.connect(DATABASE)
    except Error as e:
        print(e)
    return conn

def create_table():
    conn = create_connection()
    try:
        sql = '''CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    importance INTEGER CHECK(importance >= 1 AND importance <= 5),
                    category TEXT,
                    deadline DATE
                );'''
        conn.execute(sql)
        conn.commit()
    except Error as e:
        print(e)
    finally:
        if conn:
            conn.close()

@app.route('/tasks', methods=['GET'])
def get_tasks():
    conn = create_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tasks")
    rows = cur.fetchall()
    tasks = []
    for row in rows:
        task = {
            'id': row[0],
            'name': row[1],
            'description': row[2],
            'importance': row[3],
            'category': row[4],
            'deadline': row[5]
        }
        tasks.append(task)
    conn.close()
    return jsonify(tasks)

@app.route('/tasks', methods=['POST'])
def create_task():
    task = request.get_json()
    conn = create_connection()
    sql = '''INSERT INTO tasks(name, description, importance, category, deadline)
             VALUES(?,?,?,?,?)'''
    cur = conn.cursor()
    cur.execute(sql, (task['name'], task['description'], task['importance'], task['category'], task['deadline']))
    conn.commit()
    task_id = cur.lastrowid
    conn.close()
    return jsonify({'id': task_id}), 201

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = request.get_json()
    conn = create_connection()
    sql = '''UPDATE tasks
             SET name = ?,
                 description = ?,
                 importance = ?,
                 category = ?,
                 deadline = ?
             WHERE id = ?'''
    cur = conn.cursor()
    cur.execute(sql, (task['name'], task['description'], task['importance'], task['category'], task['deadline'], task_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Task updated successfully'})

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    conn = create_connection()
    sql = 'DELETE FROM tasks WHERE id = ?'
    cur = conn.cursor()
    cur.execute(sql, (task_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Task deleted successfully'})

if __name__ == '__main__':
    create_table()
    app.run(debug=True)
