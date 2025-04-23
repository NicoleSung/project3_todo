'''
Description: This script transfers data from a SQLite database to a DynamoDB table.
    It connects to a SQLite database, retrieves data from the 'users' and 'tasks' tables,
    and inserts that data into the corresponding DynamoDB tables.
Data Created: 23 April, 2025
'''

import sqlite3
import boto3
from decimal import Decimal

def main():
    # Connect to SQLite
    conn = sqlite3.connect('new_schema.db')
    cursor = conn.cursor()

    # Connect to DynamoDB
    dynamodb = boto3.resource('dynamodb')
    users_table = dynamodb.Table('Users')
    tasks_table = dynamodb.Table('Tasks')

    # Transfer Users
    for row in cursor.execute("SELECT * FROM users"):
        item = {
            'id': int(row[0]),
            'username': row[1],
            'user_key': row[2],
            'default_view': row[3],
            'notifications_enabled': bool(row[4])
        }
        users_table.put_item(Item=item)

    # Transfer Tasks
    for row in cursor.execute("SELECT * FROM tasks"):
        item = {
            'id': int(row[0]),
            'user_id': int(row[1]),
            'task_title': row[2],
            'task_details': row[3],
            'priority_lev': int(row[4]),
            'est_hour': int(row[5]),
            'est_min': int(row[6]),
            'due_dates': row[7],
            'notification_yes': bool(row[8]),
            'scheduled_time': row[9],
            'end_time': row[10],
            'last_updated': row[11],
            'note_creation_time': row[12],
            'creation_timezone': row[13],
            'note_deletion_time': row[14],
            'deletion_location': row[15],
            'active_note': bool(row[16]),
            'note_life': int(((sqlite3.datetime.datetime.fromisoformat(row[14]) -
                            sqlite3.datetime.datetime.fromisoformat(row[12])).total_seconds() / 60))
            if row[14] and row[12] else None
        }

        # Convert all None to avoid DynamoDB NULL issues
        item = {k: v for k, v in item.items() if v is not None}
        tasks_table.put_item(Item=item)

    print("All data migrated to DynamoDB.")
    conn.close()
    exit(0)

if __name__ == "__main__":
    main()