//acquiring dependencies
require('dotenv').config();
const mysql2 = require('mysql2');
const inquirer1 = require('inquirer');
const consoleTab = require('console.table');
const figlet = require('figlet');

//creating connection for mysql2
const connection = mysql2.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'employee_DB',
});

// Connect to the Database
connection.connect((err) => {
  if (err) throw err;
  console.log(`linked as id ${connection.threadId}\n`);
  figlet('Employee Tracker', function(err, data) {
    if (err) {
      console.log('Ascii art is not found');
    } else {
      console.log(data);
    }  
    initprompt();
  });
});

// initial prompt and question
function initprompt() {
  const firstquest = [{
    type: "list",
    name: "action",
    message: "What would you like to do?",
    loop: false,
    choices: ["View all employees", 
    "View all roles", 
    "View all departments", 
    "Add an employee", 
    "Add a role", 
    "Add a department", 
    "Update role for an employee", 
    "Update an employee's manager", 
    "View employees by manager", 
    "Delete a department", 
    "Delete an employee", 
    "View the total budget of a particular department", 
    "quit"]
  }]
  
  //all possible options from list
  inquirer1.prompt(firstquest)
  .then(response => {
    switch (response.action) {
      case "View all employees":
        viewTables("EMPLOYEE");
        break;
      case "View all roles":
        viewTables("ROLE");
        break;
      case "View all departments":
        viewTables("DEPARTMENT");
        break;
      case "Add a department":
        addNewDept();
        break;
      case "Add a role":
        addNewRole();
        break;
      case "Add an employee":
        addNewEmployee();
        break;
      case "Update role for an employee":
        updateRole();
        break;
      case "View employees by manager":
        viewTableEmployeeByManager();
        break;
      case "Update an employee's manager":
        updateManager();
        break;
      case "Delete a department":
        deleteDepartment();
        break;
      case "Delete an employee":
        deleteEmployee();
        break;
      case "View the total budget of a particular department":
        viewBudgetTable();
        break;
      default:
        connection.end();
    }
  })
  .catch(err => {
    console.error(err);
  });
}


const viewTables = (table) => {
  // query department in database
  let datarequest;
  if (table === "DEPARTMENT") {
    datarequest = `SELECT * FROM DEPARTMENT`;
  } else if (table === "ROLE") {
    datarequest = `SELECT ROLE.id AS id, title, salary, DEPARTMENT.name AS department
    FROM ROLE LEFT JOIN DEPARTMENT
    ON ROLE.department_id = DEPARTMENT.id;`;
  } else {
    // query employee
    datarequest = `SELECT EMPLOYEE.id AS id, EMPLOYEE.first_name AS first_name, EMPLOYEE.last_name AS last_name, 
    ROLE.title AS role, DEPARTMENT.name AS department, CONCAT(E.first_name, " ", E.last_name) AS manager
    FROM EMPLOYEE LEFT JOIN ROLE ON EMPLOYEE.role_id = ROLE.id
    LEFT JOIN DEPARTMENT ON ROLE.department_id = DEPARTMENT.id
    LEFT JOIN EMPLOYEE AS E ON EMPLOYEE.manager_id = E.id;`;

  }
  connection.query(datarequest, (err, res) => {
    if (err) throw err;
    console.table(res);

    initprompt();
  });
};

const addNewDept = () => {
  let questions = [
    {
      type: "input",
      name: "name",
      message: "Provide the new department name:"
    }
  ];

  inquirer1.prompt(questions)
  .then(response => {
    const query = `INSERT INTO department (name) VALUES (?)`;
    connection.query(query, [response.name], (err, res) => {
      if (err) throw err;
      console.log(`You have placed ${response.name} department as the id ${res.insertId}`);
      initprompt();
    });
  })
  .catch(err => {
    console.error(err);
  });
}

const addNewRole = () => {
  //obtain list of department
  const depts = [];
  connection.query("SELECT * FROM DEPARTMENT", (err, res) => {
    if (err) throw err;

    res.forEach(dept => {
      let theq = {
        name: dept.name,
        value: dept.id
      }
      depts.push(theq);
    });

    //Prompts when making new roles
    let allQuest = [
      {
        type: "input",
        name: "title",
        message: "Provide the title of the new role:"
      },
      {
        type: "input",
        name: "salary",
        message: "Provide the salary of the new role?"
      },
      {
        type: "list",
        name: "department",
        choices: depts,
        message: "Which department is this role in?"
      }
    ];

    inquirer1.prompt(allQuest)
    .then(response => {
      const query = `INSERT INTO ROLE (title, salary, department_id) VALUES (?)`;
      connection.query(query, [[response.title, response.salary, response.department]], (err, res) => {
        if (err) throw err;
        console.log(`You have placed ${response.title} role at the id ${res.insertId}`);
        initprompt();
      });
    })
    .catch(err => {
      console.error(err);
    });
  });
}

const addNewEmployee = () => {
  //get all the employee list to make choice of employee's manager
  connection.query("SELECT * FROM EMPLOYEE", (err, refremployee) => {
    if (err) throw err;
    const optionofemploy = [
      {
        name: 'None',
        value: 0
      }
    ]; //an employee could have no manager
    refremployee.forEach(({ first_name, last_name, id }) => {
      optionofemploy.push({
        name: first_name + " " + last_name,
        value: id
      });
    });
    
    //get all the role list to make choice of employee's role
    connection.query("SELECT * FROM ROLE", (err, refrole) => {
      if (err) throw err;
      const optionofrole = [];
      refrole.forEach(({ title, id }) => {
        optionofrole.push({
          name: title,
          value: id
          });
        });
     
      let questions = [
        {
          type: "input",
          name: "first_name",
          message: "Provide employee's first name:"
        },
        {
          type: "input",
          name: "last_name",
          message: "Provide employee's last name:"
        },
        {
          type: "list",
          name: "role_id",
          choices: optionofrole,
          message: "Provide the employee's role:"
        },
        {
          type: "list",
          name: "manager_id",
          choices: optionofemploy,
          message: "Provide the employee's manager: (could be null)"
        }
      ]
  
      inquirer1.prompt(questions)
        .then(response => {
          const query = `INSERT INTO EMPLOYEE (first_name, last_name, role_id, manager_id) VALUES (?)`;
          let manager_id = response.manager_id !== 0? response.manager_id: null;
          connection.query(query, [[response.first_name, response.last_name, response.role_id, manager_id]], (err, res) => {
            if (err) throw err;
            console.log(`You have placed the employee ${response.first_name} ${response.last_name} as the id ${res.insertId}`);
            initprompt();
          });
        })
        .catch(err => {
          console.error(err);
        });
    })
  });
}

const updateRole = () => {
  //get all the employee list 
  connection.query("SELECT * FROM EMPLOYEE", (err, refofempl) => {
    if (err) throw err;
    const optionsofEmployee = [];
    refofempl.forEach(({ first_name, last_name, id }) => {
      optionsofEmployee.push({
        name: first_name + " " + last_name,
        value: id
      });
    });
    
    //get all the role list to make choice of employee's role
    connection.query("SELECT * FROM ROLE", (err, refrole) => {
      if (err) throw err;
      const optionofchoices = [];
      refrole.forEach(({ title, id }) => {
        optionofchoices.push({
          name: title,
          value: id
          });
        });
     
      let questions = [
        {
          type: "list",
          name: "id",
          choices: optionsofEmployee,
          message: "Whose role do you want to update?"
        },
        {
          type: "list",
          name: "role_id",
          choices: optionofchoices,
          message: "Provide the employee's new role:"
        }
      ]
  
      inquirer1.prompt(questions)
        .then(response => {
          const query = `UPDATE EMPLOYEE SET ? WHERE ?? = ?;`;
          connection.query(query, [
            {role_id: response.role_id},
            "id",
            response.id
          ], (err, res) => {
            if (err) throw err;
            
            console.log("You have updated the employee's role!");
            initprompt();
          });
        })
        .catch(err => {
          console.error(err);
        });
      })
  });
}

const viewTableEmployeeByManager =  () => {
  //obtain the employee list through managers
  connection.query("SELECT * FROM EMPLOYEE", (err, refremployee) => {
    if (err) throw err;
    const optionsofEmployee = [{
      name: 'None',
      value: 0
    }];
    refremployee.forEach(({ first_name, last_name, id }) => {
      optionsofEmployee.push({
        name: first_name + " " + last_name,
        value: id
      });
    });
     
    let questions = [
      {
        type: "list",
        name: "manager_id",
        choices: optionsofEmployee,
         message: "Whose role would you want to update?"
      },
    ]
  
    inquirer1.prompt(questions)
      .then(response => {
        let manager_id, query;
        if (response.manager_id) {
          query = `SELECT EMPLOYEE.id AS id, EMPLOYEE.first_name AS first_name, EMPLOYEE.last_name AS last_name, 
          ROLE.title AS role, DEPARTMENT.name AS department, CONCAT(E.first_name, " ", E.last_name) AS manager
          FROM EMPLOYEE LEFT JOIN ROLE ON EMPLOYEE.role_id = ROLE.id
          LEFT JOIN DEPARTMENT ON ROLE.department_id = DEPARTMENT.id
          LEFT JOIN EMPLOYEE AS E ON EMPLOYEE.manager_id = E.id
          WHERE EMPLOYEE.manager_id = ?;`;
        } else {
          manager_id = null;
          query = `SELECT EMPLOYEE.id AS id, EMPLOYEE.first_name AS first_name, EMPLOYEE.last_name AS last_name, 
          ROLE.title AS role, DEPARTMENT.name AS department, CONCAT(E.first_name, " ", E.last_name) AS manager
          FROM EMPLOYEE LEFT JOIN ROLE ON EMPLOYEE.role_id = ROLE.id
          LEFT JOIN DEPARTMENT ON ROLE.department_id = DEPARTMENT.id
          LEFT JOIN EMPLOYEE AS E ON EMPLOYEE.manager_id = E.id
          WHERE EMPLOYEE.manager_id is null;`;
        }
        connection.query(query, [response.manager_id], (err, res) => {
          if (err) throw err;
          console.table(res);
          initprompt();
        });
      })
      .catch(err => {
        console.error(err);
      }); 
  });
}

const updateManager = ()=> {
  //acquire the employee list 
  connection.query("SELECT * FROM EMPLOYEE", (err, refremployee) => {
    if (err) throw err;
    const optionsofEmployee = [];
    refremployee.forEach(({ first_name, last_name, id }) => {
      optionsofEmployee.push({
        name: first_name + " " + last_name,
        value: id
      });
    });
    
    const managerChoice = [{
      name: 'None',
      value: 0
    }]; //no manager can be an option
    refremployee.forEach(({ first_name, last_name, id }) => {
      managerChoice.push({
        name: first_name + " " + last_name,
        value: id
      });
    });
     
    let questions = [
      {
        type: "list",
        name: "id",
        choices: optionsofEmployee,
        message: "Who would you want to update?"
      },
      {
        type: "list",
        name: "manager_id",
        choices: managerChoice,
        message: "Select the employee's new manager:"
      }
    ]
  //updating employee
    inquirer1.prompt(questions)
      .then(response => {
        const query = `UPDATE EMPLOYEE SET ? WHERE id = ?;`;
        let manager_id = response.manager_id !== 0? response.manager_id: null;
        connection.query(query, [
          {manager_id: manager_id},
          response.id
        ], (err, res) => {
          if (err) throw err;
            
          console.log("You have updated the employee's manager");
          initprompt();
        });
      })
      .catch(err => {
        console.error(err);
      });
  })
  
};

//deleting departments
const deleteDepartment = () => {
  const departments = [];
  connection.query("SELECT * FROM DEPARTMENT", (err, res) => {
    if (err) throw err;

    res.forEach(dep => {
      let querytheobj = {
        name: dep.name,
        value: dep.id
      }
      departments.push(querytheobj);
    });

    let questions = [
      {
        type: "list",
        name: "id",
        choices: departments,
        message: "Select a department you want to delete?"
      }
    ];

    inquirer1.prompt(questions)
    .then(response => {
      const query = `DELETE FROM DEPARTMENT WHERE id = ?`;
      connection.query(query, [response.id], (err, res) => {
        if (err) throw err;
        console.log(`${res.allimpactedrows} row(s) has been deleted!`);
        initprompt();
      });
    })
    .catch(err => {
      console.error(err);
    });
  });
};

//deleting an employee
const deleteEmployee = () => {
  connection.query("SELECT * FROM EMPLOYEE", (err, res) => {
    if (err) throw err;

    const optionsofEmployee = [];
    res.forEach(({ first_name, last_name, id }) => {
      optionsofEmployee.push({
        name: first_name + " " + last_name,
        value: id
      });
    });

    let questions = [
      {
        type: "list",
        name: "id",
        choices: optionsofEmployee,
        message: "Which employee would you want to delete?"
      }
    ];

    inquirer1.prompt(questions)
    .then(response => {
      const query = `DELETE FROM EMPLOYEE WHERE id = ?`;
      connection.query(query, [response.id], (err, res) => {
        if (err) throw err;
        console.log(`${res.allimpactedrows} row(s) successfully deleted!`);
        initprompt();
      });
    })
    .catch(err => {
      console.error(err);
    });
  });
};

//going through budgets, can be null if there are no employees in the department
const viewBudgetTable = () => {
  connection.query("SELECT * FROM DEPARTMENT", (err, res) => {
    if (err) throw err;

    const choicefromdept = [];
    res.forEach(({ name, id }) => {
      choicefromdept.push({
        name: name,
        value: id
      });
    });

    let questions = [
      {
        type: "list",
        name: "id",
        choices: choicefromdept,
        message: "Select which department's budget you want to see:"
      }
    ];

    inquirer1.prompt(questions)
    .then(response => {
      const query = `SELECT DEPARTMENT.name, SUM(salary) AS budget FROM
      EMPLOYEE LEFT JOIN ROLE
      ON EMPLOYEE.role_id = ROLE.id
      LEFT JOIN DEPARTMENT
      ON ROLE.department_id = DEPARTMENT.id
      WHERE DEPARTMENT.id = ?
      `;
      connection.query(query, [response.id], (err, res) => {
        if (err) throw err;
        console.table(res);
        initprompt();
      });
    })
    .catch(err => {
      console.error(err);
    });
  });

};