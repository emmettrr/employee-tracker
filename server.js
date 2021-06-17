const inquirer = require("inquirer");
const table = require("console.table");
const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  port: 8080,
  user: "root",
  password: "password",
  database: "employee_trackerDB",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("connected!");

  runTracker();
});

const runTracker = () => {
  inquirer
    .prompt({
      name: "action",
      type: "rawlist",
      message: "What would you like to do?",
      choices: [
        "View all employees",
        "View all employees by department",
        "View all employees by role",
        "Add employee",
        "View all departments",
        "Add department",
        "View all roles",
        "Add role",
        "Update employee roles",
        "EXIT",
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case "View all employees":
          employeeSearch();
          break;

        case "View all employees by department":
          departmentSearch();
          break;

        case "View all employees by role":
          roleSearch();
          break;

        case "Add employee":
          addEmployee();
          break;

        case "View all departments":
          viewDepartments();
          break;

        case "Add department":
          addDepartment();
          break;

        case "View all roles":
          viewRoles();
          break;

        case "Add role":
          addRole();
          break;

        case "Update employee roles":
          updateRole();
          break;

        case "EXIT":
          connection.end();
          break;

        default:
          console.log(`Invalid action: ${answer.action}`);
          break;
      }
    });
};
