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
    "Delete a role", 
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
      case "Delete a role":
        deleteRole();
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

