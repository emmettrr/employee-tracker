const inquirer = require("inquirer");
const mysql = require("mysql");
const util = require("util");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "employee_trackerDB",
});

connection.query = util.promisify(connection.query);

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

const employeeSearch = () => {
  const query = `SELECT employee.id, employee.first_name, employee.last_name, role.id AS role_id, role.title, role.salary, department.name AS department, department.id AS department_id, employee.manager_id
        FROM employee
        INNER JOIN role ON (role.id = employee.role_id)
        INNER JOIN department ON (department.id = role.department_id)
        ORDER BY employee.id;`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log("\n");
    console.log("VIEW ALL EMPLOYEES");
    console.table(res);
    runTracker();
  });
};

const departmentSearch = () => {
  const query = `SELECT employee.id, employee.first_name, employee.last_name, role.id AS role_id, role.title, role.salary, department.name AS department, department.id AS department_id, employee.manager_id
        FROM employee
        INNER JOIN role ON (role.id = employee.role_id)
        INNER JOIN department ON (department.id = role.department_id)
        ORDER BY department.id;`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log("VIEW ALL EMPLOYEES BY DEPARTMENT");
    console.log("\n");
    console.table(res);
    runTracker();
  });
};

const roleSearch = () => {
  const query = `SELECT employee.id, employee.first_name, employee.last_name, role.id AS role_id, role.title, role.salary, department.name AS department, department.id AS department_id, employee.manager_id
      FROM employee
      INNER JOIN role ON (role.id = employee.role_id)
      INNER JOIN department ON (department.id = role.department_id)
      ORDER BY role.id;`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log("VIEW ALL EMPLOYEES BY ROLE");
    console.log("\n");
    console.table(res);
    runTracker();
  });
};

const addEmployee = () => {
  connection.query("SELECT * FROM role", function (err, result) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "firstName",
          type: "input",
          message: "What is the employee's first name?",
        },
        {
          name: "lastName",
          type: "input",
          message: "What is the employee's last name?",
        },
        {
          name: "roleName",
          type: "list",
          message: "What role does this employee have?",
          choices: function () {
            rolesArray = [];
            result.forEach((result) => {
              rolesArray.push(result.title);
            });
            return rolesArray;
          },
        },
      ])
      .then(function (answer) {
        console.log(answer);
        const role = answer.roleName;
        connection.query("SELECT * FROM role", function (err, res) {
          if (err) throw err;
          let filteredRole = res.filter(function (res) {
            return res.title == role;
          });
          let roleId = filteredRole[0].id;
          connection.query("SELECT * FROM employee", function (err, res) {
            inquirer
              .prompt([
                {
                  name: "manager",
                  type: "list",
                  message: "Who is your manager?",
                  choices: function () {
                    managerArray = [];
                    res.forEach((res) => {
                      managerArray.push(res.last_name);
                    });
                    return managerArray;
                  },
                },
              ])
              .then(function (managerAnswer) {
                const manager = managerAnswer.manager;
                connection.query("SELECT * FROM employee", function (err, res) {
                  if (err) throw err;
                  let filteredManager = res.filter(function (res) {
                    return res.last_name == manager;
                  });
                  let managerId = filteredManager[0].id;
                  console.log(managerAnswer);
                  let query =
                    "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
                  let values = [
                    answer.firstName,
                    answer.lastName,
                    roleId,
                    managerId,
                  ];
                  console.log(values);
                  connection.query(query, values, function (err, res, fields) {
                    console.log(
                      `You have added the employee: ${values[0].toUpperCase()}.`
                    );
                  });
                  viewEmployees();
                });
              });
          });
        });
      });
  });
};

const viewDepartments = () => {
  const query = `SELECT department.name AS department, department.id AS department_id
      FROM department
      ORDER BY department.id;`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log("VIEW ALL DEPARTMENTS");
    console.log("\n");
    console.table(res);
    runTracker();
  });
};

const addDepartment = () => {
  inquirer
    .prompt({
      name: "department",
      type: "input",
      message: "What is the name of the new department?",
    })
    .then(function (answer) {
      const query = "INSERT INTO department (name) VALUES ( ? )";
      connection.query(query, answer.department, function (err, res) {
        console.log(`You have added: ${answer.department.toUpperCase()}.`);
      });
      viewDepartments();
    });
};

const viewRoles = () => {
  const query = `SELECT role.title, role.id AS role_id
        FROM role
        ORDER BY role.id;`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log("VIEW ALL ROLES");
    console.log("\n");
    console.table(res);
    runTracker();
  });
};

const addRole = () => {
  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "title",
          type: "input",
          message: "What is the title of the new role?",
        },
        {
          name: "salary",
          type: "input",
          message: "What is the salary of the new role?",
        },
        {
          name: "departmentName",
          type: "list",
          message: "Which department does this role fall into?",
          choices: function () {
            const choicesArray = [];
            res.forEach((res) => {
              choicesArray.push(res.name);
            });
            return choicesArray;
          },
        },
      ])
      .then(function (answer) {
        const department = answer.departmentName;
        connection.query("SELECT * FROM DEPARTMENT", function (err, res) {
          if (err) throw err;
          let filteredDept = res.filter(function (res) {
            return res.name == department;
          });
          let id = filteredDept[0].id;
          let query =
            "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)";
          let values = [answer.title, parseInt(answer.salary), id];
          console.log(values);
          connection.query(query, values, function (err, res, fields) {
            console.log(`You have added the role: ${values[0].toUpperCase()}.`);
          });
          viewRoles();
        });
      });
  });
}
  const updateRole = () => {
    connection.query("SELECT * FROM employee", function (err, result) {
      if (err) throw err;
      inquirer
        .prompt([
          {
            name: "employeeName",
            type: "list",
            message: "which employee's role would you like to change?",
            choices: function () {
              employeeArray = [];
              result.forEach((result) => {
                employeeArray.push(result.last_name);
              });
              return employeeArray;
            },
          },
        ])
        .then(function (answer) {
          console.log(answer);
          const name = answer.employeeName;
          connection.query("SELECT * FROM role", function (err, res) {
            inquirer
              .prompt([
                {
                  name: "role",
                  type: "list",
                  message: "What is their new role?",
                  choices: function () {
                    rolesArray = [];
                    res.forEach((res) => {
                      rolesArray.push(res.title);
                    });
                    return rolesArray;
                  },
                },
              ])
              .then(function (rolesAnswer) {
                const role = rolesAnswer.role;
                console.log(rolesAnswer.role);
                connection.query(
                  "SELECT * FROM role WHERE title = ?",
                  [role],
                  function (err, res) {
                    if (err) throw err;
                    let roleId = res[0].id;
                    let query =
                      "UPDATE employee SET role_id ? WHERE last_name ?";
                    let values = [roleId, name];
                    console.log(values);
                    connection.query(
                      query,
                      values,
                      function (err, res, fields) {
                        console.log(
                          `You have updated ${name}'s role to ${role}.`
                        );
                      }
                    );
                    viewEmployees();
                  }
                );
              });
          });
        });
    });
  };
