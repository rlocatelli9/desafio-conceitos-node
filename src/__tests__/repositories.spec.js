const request = require("supertest");
const app = require("../app");
const { validate: isUuid } = require("uuid");

describe("Repositories", () => {
  it("should be able to create a new repository", async () => {
    const response = await request(app)
      .post("/repositories")
      .send({
        url: "https://github.com/Rocketseat/umbriel",
        title: "Umbriel",
        techs: ["Node", "Express", "TypeScript"]
      });

    expect(isUuid(response.body.repo.id)).toBe(true);

    expect(response.body).toMatchObject({
      message: true,
      repo: {
        url: "https://github.com/Rocketseat/umbriel",
        title: "Umbriel",
        techs: ["Node", "Express", "TypeScript"],
        likes: 0
      }      
    });
  });

  it("should be able to list the repositories", async () => {
    const repository = await request(app)
      .post("/repositories")
      .send({
        url: "https://github.com/Rocketseat/umbriel",
        title: "Umbriel",
        techs: ["Node", "Express", "TypeScript"]
      });

    const response = await request(app).get("/repositories");

    expect(response.body).toEqual(
      expect.arrayContaining([
        {
          id: repository.body.repo.id,
          title: repository.body.repo.title,
          url: repository.body.repo.url,
          techs: repository.body.repo.techs,
          likes: 0
        }
      ])
    );
  });

  it("should be able to update repository", async () => {
    const repository = await request(app)
      .post("/repositories")
      .send({
        url: "https://github.com/Rocketseat/umbriel",
        title: "Umbriel",
        techs: ["Node", "Express", "TypeScript"]
      });

    const response = await request(app)
      .put(`/repositories/${repository.body.repo.id}`)
      .send({
        url: "https://github.com/Rocketseat/unform",
        title: "Unform",
        techs: ["React", "ReactNative", "TypeScript", "ContextApi"]
      });

    expect(isUuid(response.body.repo.id)).toBe(true);

    expect(response.body.repo).toMatchObject({
      url: "https://github.com/Rocketseat/unform",
      title: "Unform",
      techs: ["React", "ReactNative", "TypeScript", "ContextApi"]
    });
  });

  it("should not be able to update a repository that does not exist", async () => {
    await request(app).put(`/repositories/123`).expect(400);
  });

  it("should not be able to update repository likes manually", async () => {
    const repository = await request(app)
      .post("/repositories")
      .send({
        url: "https://github.com/Rocketseat/umbriel",
        title: "Umbriel",
        techs: ["React", "ReactNative", "TypeScript", "ContextApi"]
      });

    await request(app)
    .post(`/repositories/${repository.body.repo.id}/like`);

    const response = await request(app)
      .put(`/repositories/${repository.body.repo.id}`)
      .send({
        likes: 15
      });

    expect(response.body).toMatchObject({
      message: true,
      repo:{
        id: repository.body.repo.id,
        techs: repository.body.repo.techs,
        title: repository.body.repo.title,
        url: repository.body.repo.url,
        likes: repository.body.repo.likes+1
      }
    });
  });

  it("should be able to delete the repository", async () => {
    const response = await request(app)
      .post("/repositories")
      .send({
        url: "https://github.com/Rocketseat/umbriel",
        title: "Umbriel",
        techs: ["Node", "Express", "TypeScript"]
      });

    await request(app).delete(`/repositories/${response.body.id}`).expect(400);

    const repositories = await request(app).get("/repositories");

    const repository = repositories.body.find((r) => r.id === response.body.id);

    expect(repository).toBe(undefined);
  });

  it("should not be able to delete a repository that does not exist", async () => {
    await request(app).delete(`/repositories/123`).expect(400);
  });
});
