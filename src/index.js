const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.username = username;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const alreadyExistsUser = users.find(user => user.username === username);

  if (alreadyExistsUser) {
    return response.status(400).json({
      error: "User already exists"
    })
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const selectedUser = users.find(user => user.username === username);

  return response.status(200).json(selectedUser.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request;

  const selectedUser = users.find(user => user.username === username);

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  selectedUser.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { username } = request;

  const selectedUser = users.find(user => user.username === username);
  const selectedTodo = selectedUser.todos.find(todo => todo.id === id);

  if (!selectedTodo) {
    return response.status(404).json({
      error: "Todo doesnt exists"
    })
  }

  selectedTodo.title = title;
  selectedTodo.deadline = deadline;

  return response.status(200).json(selectedTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const selectedUser = users.find(user => user.username === username);
  const selectedTodo = selectedUser.todos.find(todo => todo.id === id);

  if (!selectedTodo) {
    return response.status(404).json({
      error: "Todo doesnt exists"
    })
  }

  selectedTodo.done = true;
  return response.status(200).json(selectedTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;

  const selectedUser = users.find(user => user.username === username);

  const deletingTodo = selectedUser.todos.findIndex(todo => todo.id === id);

  if (deletingTodo === -1) {
    return response.status(404).json({
      error: "Todo doesnt exists"
    })
  }

  selectedUser.todos.splice(deletingTodo, 1);

  return response.status(204).send();
});

module.exports = app;