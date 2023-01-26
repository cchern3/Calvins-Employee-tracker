INSERT INTO department (name)
VALUES ("engineering"),
    ("finance"),
    ("marketing"),
    ("sales");

SELECT * FROM DEPARTMENT;

INSERT INTO role (title, salary, department_id)
VALUES ("software engineer", 130000, 1),
    ("lead project manager", 100000, 1),
    ("lead engineering manager", 250000, 1),
    ("junior accountant", 60000, 2),
    ("accounting manager", 200000, 2),
    ("product marketing manager", 75000, 3),
    ("lead of marketing", 250000, 3),
    ("sales representative", 90000, 4);

SELECT * FROM ROLE;

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Laura", "Trapaga", 3, NULL),
    ("Calvin", "Chern", 3, 1),
    ("Silvana", "Gonzalez", 1, 2),
    ("Alex", "Chern", 1, 2),
    ("Jourdan", "Delacruz", 2, 1);

SELECT * FROM employee;
