from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import random

import models
from database import engine, get_db

app = FastAPI(title="Quiz App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Hardcoded credentials (replace with DB in production) ---
USERS = {
    "user":  {"password": "user123",  "role": "user",  "name": "Student"},
    "admin": {"password": "admin123", "role": "admin", "name": "Administrator"},
    "tharun": {"password": "password123", "role": "admin", "name": "Tharun"},
}

# --- Data Models ---
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    name: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    role: str
    name: str
    token: str   # simple mock token for now

class Option(BaseModel):
    id: str
    text: str

class Question(BaseModel):
    id: int
    question: str
    options: List[Option]
    category: str

class SubmitAnswer(BaseModel):
    question_id: int
    selected_option_id: str

class SubmitPayload(BaseModel):
    username: str
    category: str
    answers: List[SubmitAnswer]

class LeaderboardEntry(BaseModel):
    username: str
    category: str
    score: int
    total: int

class AnswerResult(BaseModel):
    question_id: int
    correct: bool
    correct_option_id: str

class ScoreResponse(BaseModel):
    score: int
    total: int
    percentage: float
    results: List[AnswerResult]

class OptionCreate(BaseModel):
    id: str
    text: str

class QuestionCreate(BaseModel):
    category: str
    question: str
    answer: str
    options: List[OptionCreate]

# --- Question Bank ---
QUESTIONS = [
    # HTML Questions (10)
    {"id": 1, "category": "HTML", "question": "What does HTML stand for?", "answer": "a", "options": [
        {"id": "a", "text": "Hyper Text Markup Language"}, {"id": "b", "text": "Home Tool Markup Language"},
        {"id": "c", "text": "Hyperlinks and Text Markup Language"}, {"id": "d", "text": "Hyper Transfer Markup Language"}
    ]},
    {"id": 2, "category": "HTML", "question": "Which HTML attribute specifies an alternate text for an image?", "answer": "b", "options": [
        {"id": "a", "text": "title"}, {"id": "b", "text": "alt"}, {"id": "c", "text": "src"}, {"id": "d", "text": "longdesc"}
    ]},
    {"id": 3, "category": "HTML", "question": "Choose the correct HTML element for the largest heading:", "answer": "a", "options": [
        {"id": "a", "text": "<h1>"}, {"id": "b", "text": "<heading>"}, {"id": "c", "text": "<h6>"}, {"id": "d", "text": "<head>"}
    ]},
    {"id": 4, "category": "HTML", "question": "What is the correct HTML element for inserting a line break?", "answer": "b", "options": [
        {"id": "a", "text": "<lb>"}, {"id": "b", "text": "<br>"}, {"id": "c", "text": "<break>"}, {"id": "d", "text": "<tr>"}
    ]},
    {"id": 5, "category": "HTML", "question": "What is the correct HTML for adding a background color?", "answer": "c", "options": [
        {"id": "a", "text": "<background>yellow</background>"}, {"id": "b", "text": "<body bg=\"yellow\">"},
        {"id": "c", "text": "<body style=\"background-color:yellow;\">"}, {"id": "d", "text": "<color>yellow</color>"}
    ]},
    {"id": 6, "category": "HTML", "question": "Choose the correct HTML element to define important text.", "answer": "a", "options": [
        {"id": "a", "text": "<strong>"}, {"id": "b", "text": "<b>"}, {"id": "c", "text": "<important>"}, {"id": "d", "text": "<i>"}
    ]},
    {"id": 7, "category": "HTML", "question": "Choose the correct HTML element to define emphasized text.", "answer": "a", "options": [
        {"id": "a", "text": "<em>"}, {"id": "b", "text": "<i>"}, {"id": "c", "text": "<italic>"}, {"id": "d", "text": "<emp>"}
    ]},
    {"id": 8, "category": "HTML", "question": "What is the correct HTML for creating a hyperlink?", "answer": "d", "options": [
        {"id": "a", "text": "<a>http://www.w3schools.com</a>"}, {"id": "b", "text": "<a name=\"http://w3schools.com\">W3Schools.com</a>"},
        {"id": "c", "text": "<a url=\"http://w3schools.com\">W3Schools.com</a>"}, {"id": "d", "text": "<a href=\"http://w3schools.com\">W3Schools</a>"}
    ]},
    {"id": 9, "category": "HTML", "question": "Which character is used to indicate an end tag?", "answer": "c", "options": [
        {"id": "a", "text": "*"}, {"id": "b", "text": "<"}, {"id": "c", "text": "/"}, {"id": "d", "text": "^"}
    ]},
    {"id": 10, "category": "HTML", "question": "How can you open a link in a new tab/browser window?", "answer": "a", "options": [
        {"id": "a", "text": "<a href=\"url\" target=\"_blank\">"}, {"id": "b", "text": "<a href=\"url\" target=\"new\">"},
        {"id": "c", "text": "<a href=\"url\" new>"}, {"id": "d", "text": "<a href=\"url\" target=\"_new\">"}
    ]},

    # CSS Questions (10)
    {"id": 11, "category": "CSS", "question": "What does CSS stand for?", "answer": "c", "options": [
        {"id": "a", "text": "Computer Style Sheets"}, {"id": "b", "text": "Creative Style Sheets"},
        {"id": "c", "text": "Cascading Style Sheets"}, {"id": "d", "text": "Colorful Style Sheets"}
    ]},
    {"id": 12, "category": "CSS", "question": "Which CSS property is used to change the text color?", "answer": "c", "options": [
        {"id": "a", "text": "font-color"}, {"id": "b", "text": "text-color"}, {"id": "c", "text": "color"}, {"id": "d", "text": "foreground-color"}
    ]},
    {"id": 13, "category": "CSS", "question": "What is the correct CSS syntax to change the font of an element?", "answer": "a", "options": [
        {"id": "a", "text": "font-family: Arial;"}, {"id": "b", "text": "font: Arial;"}, {"id": "c", "text": "fontFamily: Arial;"}, {"id": "d", "text": "text-font: Arial;"}
    ]},
    {"id": 14, "category": "CSS", "question": "Which HTML attribute is used to define inline styles?", "answer": "b", "options": [
        {"id": "a", "text": "class"}, {"id": "b", "text": "style"}, {"id": "c", "text": "font"}, {"id": "d", "text": "styles"}
    ]},
    {"id": 15, "category": "CSS", "question": "How do you insert a comment in a CSS file?", "answer": "c", "options": [
        {"id": "a", "text": "// this is a comment"}, {"id": "b", "text": "// this is a comment //"},
        {"id": "c", "text": "/* this is a comment */"}, {"id": "d", "text": "' this is a comment"}
    ]},
    {"id": 16, "category": "CSS", "question": "Which property is used to change the background color?", "answer": "b", "options": [
        {"id": "a", "text": "color"}, {"id": "b", "text": "background-color"}, {"id": "c", "text": "bgcolor"}, {"id": "d", "text": "background-theme"}
    ]},
    {"id": 17, "category": "CSS", "question": "How do you add a background color for all <h1> elements?", "answer": "a", "options": [
        {"id": "a", "text": "h1 {background-color:#FFFFFF;}"}, {"id": "b", "text": "all.h1 {background-color:#FFFFFF;}"},
        {"id": "c", "text": "h1.all {background-color:#FFFFFF;}"}, {"id": "d", "text": "h1 {bg-color:#FFFFFF;}"}
    ]},
    {"id": 18, "category": "CSS", "question": "Which CSS property controls the text size?", "answer": "c", "options": [
        {"id": "a", "text": "text-style"}, {"id": "b", "text": "text-size"}, {"id": "c", "text": "font-size"}, {"id": "d", "text": "font-style"}
    ]},
    {"id": 19, "category": "CSS", "question": "How do you display hyperlinks without an underline?", "answer": "a", "options": [
        {"id": "a", "text": "a {text-decoration:none;}"}, {"id": "b", "text": "a {underline:none;}"},
        {"id": "c", "text": "a {text-decoration:no-underline;}"}, {"id": "d", "text": "a {decoration:no-underline;}"}
    ]},
    {"id": 20, "category": "CSS", "question": "How do you make each word in a text start with a capital letter?", "answer": "b", "options": [
        {"id": "a", "text": "text-style:capitalize;"}, {"id": "b", "text": "text-transform:capitalize;"},
        {"id": "c", "text": "transform:capitalize;"}, {"id": "d", "text": "You can't do that with CSS"}
    ]},

    # JavaScript Questions (10)
    {"id": 21, "category": "JavaScript", "question": "Inside which HTML element do we put the JavaScript?", "answer": "d", "options": [
        {"id": "a", "text": "<js>"}, {"id": "b", "text": "<scripting>"}, {"id": "c", "text": "<javascript>"}, {"id": "d", "text": "<script>"}
    ]},
    {"id": 22, "category": "JavaScript", "question": "How do you declare a JavaScript variable?", "answer": "c", "options": [
        {"id": "a", "text": "variable myVar;"}, {"id": "b", "text": "v myVar;"}, {"id": "c", "text": "var myVar;"}, {"id": "d", "text": "dim myVar;"}
    ]},
    {"id": 23, "category": "JavaScript", "question": "Which operator is used to compare values in JavaScript? (strict equality)", "answer": "c", "options": [
        {"id": "a", "text": "="}, {"id": "b", "text": "<>"}, {"id": "c", "text": "==="}, {"id": "d", "text": "==!"}
    ]},
    {"id": 24, "category": "JavaScript", "question": "Where is the correct place to insert a JavaScript?", "answer": "d", "options": [
        {"id": "a", "text": "The <head> section"}, {"id": "b", "text": "The <body> section"},
        {"id": "c", "text": "The <footer> section"}, {"id": "d", "text": "Both <head> and <body> are correct"}
    ]},
    {"id": 25, "category": "JavaScript", "question": "What is the correct syntax for referring to an external script called 'xxx.js'?", "answer": "b", "options": [
        {"id": "a", "text": "<script href=\"xxx.js\">"}, {"id": "b", "text": "<script src=\"xxx.js\">"},
        {"id": "c", "text": "<script name=\"xxx.js\">"}, {"id": "d", "text": "<script id=\"xxx.js\">"}
    ]},
    {"id": 26, "category": "JavaScript", "question": "How do you write 'Hello World' in an alert box?", "answer": "b", "options": [
        {"id": "a", "text": "msgBox(\"Hello World\");"}, {"id": "b", "text": "alert(\"Hello World\");"},
        {"id": "c", "text": "msg(\"Hello World\");"}, {"id": "d", "text": "alertBox(\"Hello World\");"}
    ]},
    {"id": 27, "category": "JavaScript", "question": "How do you create a function in JavaScript?", "answer": "a", "options": [
        {"id": "a", "text": "function myFunction()"}, {"id": "b", "text": "function:myFunction()"},
        {"id": "c", "text": "function = myFunction()"}, {"id": "d", "text": "def myFunction()"}
    ]},
    {"id": 28, "category": "JavaScript", "question": "How do you call a function named 'myFunction'?", "answer": "a", "options": [
        {"id": "a", "text": "myFunction()"}, {"id": "b", "text": "call function myFunction()"},
        {"id": "c", "text": "call myFunction()"}, {"id": "d", "text": "myFunction"}
    ]},
    {"id": 29, "category": "JavaScript", "question": "How to write an IF statement in JavaScript?", "answer": "a", "options": [
        {"id": "a", "text": "if (i == 5)"}, {"id": "b", "text": "if i = 5 then"},
        {"id": "c", "text": "if i == 5 then"}, {"id": "d", "text": "if i = 5"}
    ]},
    {"id": 30, "category": "JavaScript", "question": "How does a WHILE loop start?", "answer": "a", "options": [
        {"id": "a", "text": "while (i <= 10)"}, {"id": "b", "text": "while i = 1 to 10"},
        {"id": "c", "text": "while (i <= 10; i++)"}, {"id": "d", "text": "while i <= 10 then"}
    ]},

    # Python Questions (10)
    {"id": 31, "category": "Python", "question": "Which Python keyword is used to define a function?", "answer": "b", "options": [
        {"id": "a", "text": "function"}, {"id": "b", "text": "def"}, {"id": "c", "text": "func"}, {"id": "d", "text": "define"}
    ]},
    {"id": 32, "category": "Python", "question": "What is the correct Python syntax to print 'Hello World'?", "answer": "b", "options": [
        {"id": "a", "text": "echo('Hello World')"}, {"id": "b", "text": "print('Hello World')"},
        {"id": "c", "text": "console.log('Hello World')"}, {"id": "d", "text": "System.out.println('Hello World')"}
    ]},
    {"id": 33, "category": "Python", "question": "How do you insert comments in Python code?", "answer": "b", "options": [
        {"id": "a", "text": "//This is a comment"}, {"id": "b", "text": "#This is a comment"},
        {"id": "c", "text": "/*This is a comment*/"}, {"id": "d", "text": "<!--This is a comment-->"}
    ]},
    {"id": 34, "category": "Python", "question": "Which one is NOT a legal variable name in Python?", "answer": "a", "options": [
        {"id": "a", "text": "my-var"}, {"id": "b", "text": "my_var"}, {"id": "c", "text": "_myvar"}, {"id": "d", "text": "myvar"}
    ]},
    {"id": 35, "category": "Python", "question": "How do you create a variable with the numeric value 5?", "answer": "c", "options": [
        {"id": "a", "text": "x = int(5)"}, {"id": "b", "text": "int x = 5"}, {"id": "c", "text": "Both x = 5 and x = int(5) are correct"}, {"id": "d", "text": "x = 5"}
    ]},
    {"id": 36, "category": "Python", "question": "What is the correct file extension for Python files?", "answer": "a", "options": [
        {"id": "a", "text": ".py"}, {"id": "b", "text": ".python"}, {"id": "c", "text": ".pt"}, {"id": "d", "text": ".pyt"}
    ]},
    {"id": 37, "category": "Python", "question": "How do you create a variable with the floating number 2.8?", "answer": "b", "options": [
        {"id": "a", "text": "x = float(2.8)"}, {"id": "b", "text": "Both x = 2.8 and x = float(2.8) are correct"},
        {"id": "c", "text": "x = 2.8"}, {"id": "d", "text": "float x = 2.8"}
    ]},
    {"id": 38, "category": "Python", "question": "What is the correct syntax to output the type of a variable or object in Python?", "answer": "b", "options": [
        {"id": "a", "text": "print(typeof(x))"}, {"id": "b", "text": "print(type(x))"},
        {"id": "c", "text": "print(typeof x)"}, {"id": "d", "text": "print(type x)"}
    ]},
    {"id": 39, "category": "Python", "question": "What is the correct way to create a function in Python?", "answer": "c", "options": [
        {"id": "a", "text": "create myFunction():"}, {"id": "b", "text": "function myfunction():"},
        {"id": "c", "text": "def myFunction():"}, {"id": "d", "text": "def myFunction()"}
    ]},
    {"id": 40, "category": "Python", "question": "In Python, 'Hello', is the same as \"Hello\"", "answer": "a", "options": [
        {"id": "a", "text": "True"}, {"id": "b", "text": "False"},
        {"id": "c", "text": "Depends on the Python version"}, {"id": "d", "text": "None"}
    ]},

    # Java Questions (10)
    {"id": 41, "category": "Java", "question": "What is the size of an int variable in Java?", "answer": "b", "options": [
        {"id": "a", "text": "2 bytes"}, {"id": "b", "text": "4 bytes"}, {"id": "c", "text": "8 bytes"}, {"id": "d", "text": "Platform dependent"}
    ]},
    {"id": 42, "category": "Java", "question": "What is the default value of a local variable?", "answer": "d", "options": [
        {"id": "a", "text": "0"}, {"id": "b", "text": "null"}, {"id": "c", "text": "Depends on the data type"}, {"id": "d", "text": "Not assigned (causes compile error)"}
    ]},
    {"id": 43, "category": "Java", "question": "Which method is the entry point for any Java program?", "answer": "c", "options": [
        {"id": "a", "text": "start()"}, {"id": "b", "text": "init()"}, {"id": "c", "text": "main()"}, {"id": "d", "text": "run()"}
    ]},
    {"id": 44, "category": "Java", "question": "What is the parent class of all classes in Java?", "answer": "a", "options": [
        {"id": "a", "text": "Object"}, {"id": "b", "text": "Class"}, {"id": "c", "text": "Main"}, {"id": "d", "text": "Root"}
    ]},
    {"id": 45, "category": "Java", "question": "Which keyword is used to inherit a class in Java?", "answer": "c", "options": [
        {"id": "a", "text": "implements"}, {"id": "b", "text": "inherits"}, {"id": "c", "text": "extends"}, {"id": "d", "text": "super"}
    ]},
    {"id": 46, "category": "Java", "question": "Is Java a 100% pure Object Oriented language?", "answer": "b", "options": [
        {"id": "a", "text": "Yes"}, {"id": "b", "text": "No, because it supports primitive data types"},
        {"id": "c", "text": "No, because of static methods"}, {"id": "d", "text": "Yes, everything is an object"}
    ]},
    {"id": 47, "category": "Java", "question": "Which collection stores data in key-value pairs?", "answer": "a", "options": [
        {"id": "a", "text": "HashMap"}, {"id": "b", "text": "ArrayList"}, {"id": "c", "text": "LinkedList"}, {"id": "d", "text": "TreeSet"}
    ]},
    {"id": 48, "category": "Java", "question": "Which exception is thrown when dividing an integer by zero?", "answer": "c", "options": [
        {"id": "a", "text": "ZeroDivisionException"}, {"id": "b", "text": "MathException"},
        {"id": "c", "text": "ArithmeticException"}, {"id": "d", "text": "NumberFormatException"}
    ]},
    {"id": 49, "category": "Java", "question": "What does JVM stand for?", "answer": "b", "options": [
        {"id": "a", "text": "Java Visual Machine"}, {"id": "b", "text": "Java Virtual Machine"},
        {"id": "c", "text": "Java Version Manager"}, {"id": "d", "text": "Java Variable Mechanism"}
    ]},
    {"id": 50, "category": "Java", "question": "Which of these is a valid declaration of a boolean?", "answer": "a", "options": [
        {"id": "a", "text": "boolean b = false;"}, {"id": "b", "text": "boolean b = 'false';"},
        {"id": "c", "text": "bool b = 0;"}, {"id": "d", "text": "boolean b = False;"}
    ]},

    # React Questions (10)
    {"id": 51, "category": "React", "question": "What is React mainly used for?", "answer": "b", "options": [
        {"id": "a", "text": "Database management"}, {"id": "b", "text": "Building user interfaces"},
        {"id": "c", "text": "Routing and HTTP requests"}, {"id": "d", "text": "Operating system development"}
    ]},
    {"id": 52, "category": "React", "question": "Who developed React?", "answer": "d", "options": [
        {"id": "a", "text": "Google"}, {"id": "b", "text": "Microsoft"}, {"id": "c", "text": "Twitter"}, {"id": "d", "text": "Facebook (Meta)"}
    ]},
    {"id": 53, "category": "React", "question": "What does JSX stand for?", "answer": "c", "options": [
        {"id": "a", "text": "JavaScript Extension"}, {"id": "b", "text": "JavaScript X-ray"},
        {"id": "c", "text": "JavaScript XML"}, {"id": "d", "text": "JSON XML"}
    ]},
    {"id": 54, "category": "React", "question": "Which hook is used to manage state in functional components?", "answer": "a", "options": [
        {"id": "a", "text": "useState"}, {"id": "b", "text": "useEffect"}, {"id": "c", "text": "useContext"}, {"id": "d", "text": "useReducer"}
    ]},
    {"id": 55, "category": "React", "question": "Which hook is used to perform side effects in functional components?", "answer": "b", "options": [
        {"id": "a", "text": "useState"}, {"id": "b", "text": "useEffect"}, {"id": "c", "text": "useMemo"}, {"id": "d", "text": "useCallback"}
    ]},
    {"id": 56, "category": "React", "question": "What is the Virtual DOM?", "answer": "a", "options": [
        {"id": "a", "text": "A lightweight copy of the actual DOM"}, {"id": "b", "text": "A new HTML specification"},
        {"id": "c", "text": "A browser feature"}, {"id": "d", "text": "A CSS framework"}
    ]},
    {"id": 57, "category": "React", "question": "How do you pass data from a parent component to a child component?", "answer": "b", "options": [
        {"id": "a", "text": "Using states"}, {"id": "b", "text": "Using props"}, {"id": "c", "text": "Using elements"}, {"id": "d", "text": "Using context"}
    ]},
    {"id": 58, "category": "React", "question": "What is the default port for Create React App?", "answer": "c", "options": [
        {"id": "a", "text": "8080"}, {"id": "b", "text": "8000"}, {"id": "c", "text": "3000"}, {"id": "d", "text": "5000"}
    ]},
    {"id": 59, "category": "React", "question": "Which command establishes a new React app?", "answer": "c", "options": [
        {"id": "a", "text": "npm install -g create-react"}, {"id": "b", "text": "npm create new react"},
        {"id": "c", "text": "npx create-react-app app-name"}, {"id": "d", "text": "npm react-app create"}
    ]},
    {"id": 60, "category": "React", "question": "What does 'lifting state up' mean in React?", "answer": "a", "options": [
        {"id": "a", "text": "Moving state to a common parent component"}, {"id": "b", "text": "Making state global"},
        {"id": "c", "text": "Deleting state"}, {"id": "d", "text": "Using Redux"}
    ]},

    # Cloud Computing Questions (10)
    {"id": 61, "category": "Cloud Computing", "question": "What does AWS stand for?", "answer": "b", "options": [
        {"id": "a", "text": "Advanced Web Security"}, {"id": "b", "text": "Amazon Web Services"},
        {"id": "c", "text": "Active Web Software"}, {"id": "d", "text": "Automated Web Systems"}
    ]},
    {"id": 62, "category": "Cloud Computing", "question": "What does IaaS stand for?", "answer": "c", "options": [
        {"id": "a", "text": "Internet as a Service"}, {"id": "b", "text": "Internal as a Service"},
        {"id": "c", "text": "Infrastructure as a Service"}, {"id": "d", "text": "Intranet as a Service"}
    ]},
    {"id": 63, "category": "Cloud Computing", "question": "What does SaaS stand for?", "answer": "a", "options": [
        {"id": "a", "text": "Software as a Service"}, {"id": "b", "text": "System as a Service"},
        {"id": "c", "text": "Security as a Service"}, {"id": "d", "text": "Server as a Service"}
    ]},
    {"id": 64, "category": "Cloud Computing", "question": "Which model is Google Drive an exampe of?", "answer": "b", "options": [
        {"id": "a", "text": "IaaS"}, {"id": "b", "text": "SaaS"}, {"id": "c", "text": "PaaS"}, {"id": "d", "text": "DaaS"}
    ]},
    {"id": 65, "category": "Cloud Computing", "question": "What does EC2 stand for in AWS?", "answer": "a", "options": [
        {"id": "a", "text": "Elastic Compute Cloud"}, {"id": "b", "text": "Elastic Computer Center"},
        {"id": "c", "text": "Electronic Commercial Cloud"}, {"id": "d", "text": "Entity Custom Cloud"}
    ]},
    {"id": 66, "category": "Cloud Computing", "question": "What is a public cloud?", "answer": "b", "options": [
        {"id": "a", "text": "A cloud service exclusively for one company"}, {"id": "b", "text": "A cloud service accessible over the public internet"},
        {"id": "c", "text": "A cloud that requires no security"}, {"id": "d", "text": "A physical server in a public area"}
    ]},
    {"id": 67, "category": "Cloud Computing", "question": "Which tool is commonly used to containerize applications for the cloud?", "answer": "c", "options": [
        {"id": "a", "text": "Git"}, {"id": "b", "text": "Jenkins"}, {"id": "c", "text": "Docker"}, {"id": "d", "text": "Ansible"}
    ]},
    {"id": 68, "category": "Cloud Computing", "question": "What does PaaS stand for?", "answer": "b", "options": [
        {"id": "a", "text": "Protocol as a Service"}, {"id": "b", "text": "Platform as a Service"},
        {"id": "c", "text": "Process as a Service"}, {"id": "d", "text": "Performance as a Service"}
    ]},
    {"id": 69, "category": "Cloud Computing", "question": "What is a CDN?", "answer": "a", "options": [
        {"id": "a", "text": "Content Delivery Network"}, {"id": "b", "text": "Cloud Delivery Network"},
        {"id": "c", "text": "Computer Data Node"}, {"id": "d", "text": "Centralized Data Network"}
    ]},
    {"id": 70, "category": "Cloud Computing", "question": "Which of these is a major cloud provider?", "answer": "c", "options": [
        {"id": "a", "text": "Linux"}, {"id": "b", "text": "Apache"}, {"id": "c", "text": "Microsoft Azure"}, {"id": "d", "text": "WordPress"}
    ]}
]

ANSWER_KEY = {q["id"]: q["answer"] for q in QUESTIONS}

# --- Study Notes ---
NOTES = {
    "HTML": {
        "title": "HTML Fundamentals",
        "content": "HTML (HyperText Markup Language) is the standard markup language for documents designed to be displayed in a web browser. \n\nKey Concepts:\n- **Tags:** Elements are defined by tags (e.g., `<p>`, `<h1>`).\n- **Attributes:** Provide additional information about elements (e.g., `src` in `<img>`, `href` in `<a>`).\n- **Structure:** A standard document contains `<!DOCTYPE html>`, `<html>`, `<head>`, and `<body>`.\n- **Semantic HTML:** Using correctly named tags (like `<article>`, `<footer>`) to reinforce the meaning of the content."
    },
    "CSS": {
        "title": "CSS Styling Basics",
        "content": "CSS (Cascading Style Sheets) is used to style and layout web pages.\n\nKey Concepts:\n- **Selectors:** Target HTML elements to style (e.g., `.class`, `#id`, `element`).\n- **Properties & Values:** Define how elements look (e.g., `color: red;`, `font-size: 16px;`).\n- **Box Model:** Every element is a box with `margin`, `border`, `padding`, and the actual `content`.\n- **Flexbox & Grid:** Modern CSS layout modules that make responsive design much easier."
    },
    "JavaScript": {
        "title": "JavaScript Essentials",
        "content": "JavaScript is a programming language that allows you to implement complex features on web pages.\n\nKey Concepts:\n- **Variables:** `let` and `const` (modern) or `var` (legacy) to store data.\n- **Functions:** Reusable blocks of code. Can be declared using `function keyword` or as arrow functions `() => {}`.\n- **DOM Manipulation:** Interacting with the webpage structure using methods like `document.getElementById()`.\n- **Events:** Responding to user actions like `click`, `keyup`, or `submit`."
    },
    "Python": {
        "title": "Python for Beginners",
        "content": "Python is a high-level, interpreted programming language known for its readability and simplicity.\n\nKey Concepts:\n- **Syntax:** Uses indentation to define code blocks instead of curly braces.\n- **Variables & Data Types:** Dynamically typed. Supports int, float, str, list, dict, set, etc.\n- **Functions:** Defined using the `def` keyword.\n- **Control Flow:** `if/elif/else` statements for logic, and `for/while` loops for iteration."
    },
    "Java": {
        "title": "Java Fundamentals",
        "content": "Java is a class-based, object-oriented programming language designed to have as few implementation dependencies as possible.\n\nKey Concepts:\n- **JVM:** Java Virtual Machine allows Java programs to run on any device or operating system.\n- **OOP:** Object-Oriented Principles: Inheritance, Polymorphism, Abstraction, and Encapsulation.\n- **Classes & Objects:** Everything is encapsulated in classes. Classes act as blueprints for objects.\n- **Typing:** Strongly, statically typed, meaning you must declare the type of a variable."
    },
    "React": {
        "title": "React Architecture",
        "content": "React is a declarative, efficient, and flexible JavaScript library for building user interfaces.\n\nKey Concepts:\n- **Components:** Independent, reusable pieces of UI.\n- **JSX:** A syntax extension to JavaScript that looks like HTML and allows you to write HTML elements in JavaScript and place them in the DOM.\n- **State:** A built-in object that stores property values that belong to the component.\n- **Hooks:** Allow you to use state and other React features without writing a class (e.g., `useState`, `useEffect`)."
    },
    "Cloud Computing": {
        "title": "Cloud Computing Concepts",
        "content": "Cloud Computing is the delivery of computing services—including servers, storage, databases, networking, software—over the Internet ('the cloud').\n\nKey Service Models:\n- **IaaS:** Infrastructure as a Service (e.g., AWS EC2, Azure VMs). You manage OS and data.\n- **PaaS:** Platform as a Service (e.g., Heroku). You manage apps and data only.\n- **SaaS:** Software as a Service (e.g., Google Drive, Slack). You consume the software.\n\nDeployment Models:\n- **Public Cloud:** Owned and operated by third-party providers (AWS, Google Cloud).\n- **Private Cloud:** Used exclusively by a single business or organization."
    }
}


@app.on_event("startup")
def startup_event():
    models.Base.metadata.create_all(bind=engine)
    db = next(get_db())
    # Seed users, questions, and notes if DB is empty
    if db.query(models.User).count() == 0:
        for uname, udata in USERS.items():
            db.add(models.User(username=uname, password=udata["password"], role=udata["role"], name=udata["name"]))
        
        for q in QUESTIONS:
            new_q = models.Question(id=q["id"], category=q["category"], question=q["question"], answer=q["answer"])
            db.add(new_q)
            for opt in q["options"]:
                db.add(models.Option(option_ref=opt["id"], text=opt["text"], question_id=q["id"]))
        
        for cat, ndata in NOTES.items():
            db.add(models.Note(category=cat, title=ndata["title"], content=ndata["content"]))
        
        db.commit()


@app.post("/api/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticates a user and returns their role."""
    user = db.query(models.User).filter(models.User.username == req.username).first()
    if not user or user.password != req.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    mock_token = f"mock-token-{req.username}-role-{user.role}"
    return LoginResponse(success=True, role=user.role, name=user.name, token=mock_token)


@app.post("/api/register", response_model=LoginResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Registers a new user account (student role only)."""
    if not req.username or not req.name or not req.password:
        raise HTTPException(status_code=400, detail="All fields are required.")
    if len(req.username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters.")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    
    existing = db.query(models.User).filter(models.User.username == req.username).first()
    if existing:
        raise HTTPException(status_code=409, detail="Username already taken. Please choose another.")
    
    new_user = models.User(username=req.username, password=req.password, role="user", name=req.name)
    db.add(new_user)
    db.commit()
    mock_token = f"mock-token-{req.username}-role-user"
    return LoginResponse(success=True, role="user", name=req.name, token=mock_token)


@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    """Admin endpoint: returns question bank stats."""
    total = db.query(models.Question).count()
    qs = db.query(models.Question).all()
    categories = {}
    q_list = []
    for q in qs:
        categories[q.category] = categories.get(q.category, 0) + 1
        opts = [{"id": o.option_ref, "text": o.text} for o in q.options]
        q_list.append({
            "id": q.id, 
            "category": q.category, 
            "question": q.question,
            "answer": q.answer,
            "options": opts
        })
    return {
        "total_questions": total,
        "categories": categories,
        "questions": q_list
    }


@app.post("/api/questions", response_model=Question)
def create_question(q: QuestionCreate, db: Session = Depends(get_db)):
    """Admin endpoint: create a new question."""
    new_q = models.Question(category=q.category, question=q.question, answer=q.answer)
    db.add(new_q)
    db.commit()
    db.refresh(new_q)
    for opt in q.options:
        db.add(models.Option(option_ref=opt.id, text=opt.text, question_id=new_q.id))
    db.commit()
    return Question(
        id=new_q.id, 
        question=new_q.question, 
        options=[{"id": o.id, "text": o.text} for o in q.options], 
        category=new_q.category
    )


@app.delete("/api/questions/{q_id}")
def delete_question(q_id: int, db: Session = Depends(get_db)):
    """Admin endpoint: delete a question."""
    db_q = db.query(models.Question).filter(models.Question.id == q_id).first()
    if not db_q:
        raise HTTPException(status_code=404, detail="Question not found.")
    db.delete(db_q)
    db.commit()
    return {"message": "Question deleted successfully."}


@app.get("/api/notes/{category}")
def get_notes(category: str, db: Session = Depends(get_db)):
    """Returns study notes for a specific category."""
    note = db.query(models.Note).filter(models.Note.category == category).first()
    if not note:
        raise HTTPException(status_code=404, detail="Notes not found for this category.")
    return {"title": note.title, "content": note.content}


@app.get("/api/questions", response_model=List[Question])
def get_questions(category: str = None, shuffle: bool = True, db: Session = Depends(get_db)):
    """Returns quiz questions. Optionally filtered by category and shuffled."""
    query = db.query(models.Question)
    if category:
        query = query.filter(models.Question.category == category)
    db_qs = query.all()
    
    questions = []
    for q in db_qs:
        opts = [{"id": o.option_ref, "text": o.text} for o in q.options]
        questions.append(Question(id=q.id, question=q.question, options=opts, category=q.category))
    
    if shuffle:
        random.shuffle(questions)
    return questions


@app.post("/api/submit", response_model=ScoreResponse)
def submit_answers(payload: SubmitPayload, db: Session = Depends(get_db)):
    """Accepts user answers and returns score + per-question results."""
    results = []
    score = 0
    for answer in payload.answers:
        q = db.query(models.Question).filter(models.Question.id == answer.question_id).first()
        if not q:
            continue
        is_correct = answer.selected_option_id == q.answer
        if is_correct:
            score += 1
        results.append(AnswerResult(
            question_id=answer.question_id,
            correct=is_correct,
            correct_option_id=q.answer or ""
        ))
    total = len(payload.answers)
    percentage = round((score / total) * 100, 1) if total > 0 else 0.0

    if total > 0:
        db.add(models.Leaderboard(
            username=payload.username,
            category=payload.category,
            score=score,
            total=total
        ))
        db.commit()

    return ScoreResponse(score=score, total=total, percentage=percentage, results=results)


@app.get("/api/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(category: str = None, limit: int = 10, db: Session = Depends(get_db)):
    """Public endpoint: gets the highest scores."""
    query = db.query(models.Leaderboard)
    if category:
        query = query.filter(models.Leaderboard.category == category)
    leaders = query.order_by(models.Leaderboard.score.desc(), models.Leaderboard.total.asc()).limit(limit).all()
    return [LeaderboardEntry(username=l.username, category=l.category, score=l.score, total=l.total) for l in leaders]


@app.get("/")
def root():
    return {"message": "Quiz App API is running. Visit /docs for API documentation."}
