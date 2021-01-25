const express = require("express");
const cors = require("cors");

const { v4: uuid, validate: isUuid } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function logRequests(request, response, next) {
  const {method, url} = request

  const log = `✍️  [${method.toUpperCase()}]::${url}`

  console.time(log)

  next()

  console.timeEnd(log)
}

function validateId(request, response, next) {
  const { id } = request.params;

  if(!isUuid(id)){
    return response.status(400).json({
      message: "O ID informado, não é válido."
    })
  }

  next()
}

// app.use(logRequests)
// app.use('/repositories/:id', validateId)

app.get("/repositories", (request, response) => {
  const { title } = request.query

  const results = title ? repositories.filter(repo => repo.title.includes(title)) : repositories
  
  return response.json(results)
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body

  const repo = {id: uuid(), title, url, techs:[...techs], likes: 0}

  repositories.push(repo)
  
  return response.json(repo)
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params
  const {title, url, techs} = request.body;

  const index = repositories.findIndex(repo => repo.id == id)
  
  if(index < 0) {
    return response.status(400).json({
      message: "Repositório não encontrado."
    })
  }

  const repo = {
    id,
    title: title ? title : repositories[index].title,
    url: url ? url : repositories[index].url,
    techs: techs ? techs : repositories[index].techs,
    likes: repositories[index].likes
  }

  repositories[index] = repo

  return response.json(repo)

});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params

  const index = repositories.findIndex(repo => repo.id == id)
  
  if(index < 0) {
    return response.status(400).json({
      message: "Repositório não encontrado."
    })
  }

  repositories.splice(index, 1)

  return response.status(204).send()
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params

  const repo = repositories.find(repo => repo.id == id)
  
  if(!repo) {
    return response.status(400).json({
      message: "Repositório não encontrado."
    })
  }

  repo.likes += 1
  const likes = repo.likes

  return response.json({likes})

});

app.delete("/repositories/:id/like", (request, response) => {
  const { id } = request.params

  const repo = repositories.find(repo => repo.id == id)
  
  if(!repo) {
    return response.status(400).json({
      message: "Repositório não encontrado."
    })
  }

  repo.likes -= 1
  const likes = repo.likes

  return response.json({
    message: true,
    likes
  })

});

module.exports = app;
