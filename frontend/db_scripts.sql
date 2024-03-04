-- DB & tables
CREATE DATABASE menu_manager IF NOT EXISTS;

CREATE TABLE tasklists ( 
	id UUID PRIMARY KEY, 
	name VARCHAR(100) NOT NULL,
	position INTEGER NOT NULL CHECK (position >= 0), 
	tasks UUID[] DEFAULT '{}' 
	) IF NOT EXISTS;

CREATE TABLE tasks ( 
	id UUID PRIMARY KEY, 
	text VARCHAR(200) NOT NULL,
	position INTEGER NOT NULL CHECK (position >= 0), 
	tasklist_id UUID REFERENCES tasklists 
	) IF NOT EXISTS;

-- User (actions: SELECT, INSERT, UPDATE, DELETE)
CREATE ROLE tm_admin LOGIN ENCRYPTED PASSWORD 'admin';
GRANT SELECT, INSERT, UPDATE, DELETE ON tasklists, tasks TO tm_admin;

-- SQL Queries
SELECT * FROM tasklists ORDER BY position;
SELECT * FROM tasks ORDER BY tasklist_id, position;

INSERT INTO tasklists (id, name, position) VALUES (<id›, <name>, <pos>);

INSERT INTO tasks (id, text, position, tasklist_id) VALUES (‹task_id›, <name>, <pos>, <tasklist_id>);
UPDATE tasklists SET tasks = array_append(tasks, <task_id>) WHERE id = <tasklist_ id>;

UPDATE tasks SET text = <text>, position = <position> WHERE id = <id>;

SELECT tasklist_id FROM tasks WHERE id = <task_id>;
DELETE FROM tasks WHERE id = <task_id>;
UPDATE tasklists SET tasks = array_remove(tasks, <task_id>) WHERE id = <tasklist_id>;

UPDATE tasks SET tasklist_id = <dest_tasklist_id> WHERE id = <task_id>;
UPDATE tasklists SET tasks = array_append(tasks, <task_id>) WHERE id = <dest_tasklist_id>;
UPDATE tasklists SET tasks = array_remove(tasks, <task_id>) WHERE id = <src_tasklist_id>;