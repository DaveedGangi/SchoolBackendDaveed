
const express = require("express");

const app=express();

app.use(express.json());

const cors = require("cors");

app.use(cors());

const path=require("path");

const bcrypt = require("bcrypt");
const jwt=require("jsonwebtoken");

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const dbPath = path.join(__dirname, "userData.db");

let db;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // create table for user registration 
    await db.run(`CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        password TEXT,
        role TEXT
      )`);
   
    // create table for students 
    await db.run(`CREATE TABLE IF NOT EXISTS student (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        age INTEGER,
        gender TEXT,
        standard INTEGER,
        marks INTEGER,
        user_id INTEGER,
        FOREIGN key (user_id) REFERENCES user(id)
      )`);

    // create table for teachers
    await db.run(`CREATE TABLE IF NOT EXISTS teacher (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        age INTEGER,
        gender TEXT,
        subject TEXT,
        experience INTEGER,
        user_id INTEGER,
        FOREIGN key (user_id) REFERENCES user(id)
        )`);





    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};


initializeDbAndServer();



app.post("/register", async (request, response) => {
  const { name, password, role } = request.body;
  console.log(name, password, role);
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM user WHERE name = '${name}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
const createUserQuery = `
     INSERT INTO
      user (name, password, role)
     VALUES
      (
       '${name}',
       '${hashedPassword}',
       '${role}'
      );`;
    await db.run(createUserQuery);
    response.send("User created successfully");
  }
  else {
        
    response.send("User already exists");
  }
  });


app.post("/login", async (request, response) => {
  const { name, password } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE name = '${name}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched === true) {
        const payload = {
          name: name
        };

      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      response.send({jwtToken:jwtToken,username:dbUser.name,role:dbUser.role,id:dbUser.id});
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});



app.post("/students", async (request, response) => {
  const { name, age, gender, standard, marks, user_id } = request.body;
  const createStudentQuery = `
  INSERT INTO
    student (name, age, gender, standard, marks, user_id)
  VALUES
    (
      '${name}',
       ${age},
      '${gender}',
       ${standard},
       ${marks},
       ${user_id}
    );`;
  await db.run(createStudentQuery);
  response.send("Student Successfully Added");
});

app.get("/students", async (request, response) => {
  const getStudentsQuery = `SELECT * FROM student`;
  const students = await db.all(getStudentsQuery);
  response.send(students);
});

app.get("/students/:studentId", async (request, response) => {
  const { studentId } = request.params;
  const getStudentQuery = `SELECT * FROM student WHERE id = ${studentId}`;
  const student = await db.get(getStudentQuery);
  response.send(student);
});

app.put("/students/:studentId", async (request, response) => {
  const { studentId } = request.params;
  const { name, age, gender, standard, marks } = request.body;
  const updateStudentQuery = `
  UPDATE
    student
  SET
    name='${name}',
    age=${age},
    gender='${gender}',
    standard=${standard},
    marks=${marks}
  WHERE
    id = ${studentId};`;

    await db.run(updateStudentQuery);
    response.send("Student Details Updated");
});

app.delete("/students/:studentId", async (request, response) => {
    const { studentId } = request.params;
    const deleteStudentQuery = `
    DELETE FROM
      student
    WHERE
      id = ${studentId};`;
    await db.run(deleteStudentQuery);
    response.send("Student Removed");


});

app.post("/teachers", async (request, response) => {
  const { name, age, gender, subject, experience, user_id } = request.body;
  const createTeacherQuery = `
  INSERT INTO
    teacher (name, age, gender, subject, experience, user_id)
  VALUES
    (
      '${name}',
       ${age},
      '${gender}',
      '${subject}',
       ${experience},
       ${user_id}
    );`;
  await db.run(createTeacherQuery);
  response.send("Teacher Successfully Added");
});

app.get("/teachers", async (request, response) => {
  const getTeachersQuery = `SELECT * FROM teacher`;
  const teachers = await db.all(getTeachersQuery);
  response.send(teachers);
});

app.get("/teachers/:teacherId", async (request, response) => {
  const { teacherId } = request.params;
  const getTeacherQuery = `SELECT * FROM teacher WHERE id = ${teacherId}`;
  const teacher = await db.get(getTeacherQuery);
  response.send(teacher);
});

app.put("/teachers/:teacherId", async (request, response) => {
  const { teacherId } = request.params;
  const { name, age, gender, subject, experience } = request.body;
  const updateTeacherQuery = `
  UPDATE
    teacher
  SET
    name='${name}',
    age=${age},
    gender='${gender}',
    subject='${subject}',
    experience=${experience}
  WHERE
    id = ${teacherId};`;
    await db.run(updateTeacherQuery);
    response.send("Teacher Details Updated");
    });

app.delete("/teachers/:teacherId", async (request, response) => {
  const { teacherId } = request.params;
  const deleteTeacherQuery = `
  DELETE FROM
    teacher
  WHERE
    id = ${teacherId};`;
  await db.run(deleteTeacherQuery);
  response.send("Teacher Removed");
});


