import { assert } from 'chai';
import * as supertest from 'supertest';
import { init, close, IApp } from '../../src';

// --------------------------------------------------
// variables

let app: IApp;
let request;

// --------------------------------------------------
// test suite

describe('\'movies\' schema', () => {
  before(async () => {
    app = await init({ hideLogs: true });
    request = supertest(`http://localhost:${app.port}`);
  });
  after(async () => {
    await close(app);
    (<any>app) = null;
    (<any>request) = null;
  });

  describe('movie', () => {
    it('returns movie', async () => {
      const res = await request.post('/graphql')
      .send({
        query: `
        {
          movie(id: "1") {
            id
            title
            year
            rating
          }
        }
        `
      })
      .expect(200);

      assert.ok(res);
      assert.ok(res.body);
      assert.ok(res.body.data);
      assert.ok(res.body.data.movie);
      assert.ok(res.body.data.movie.id);
      assert.ok(res.body.data.movie.title);
      assert.ok(res.body.data.movie.year);
      assert.ok(res.body.data.movie.rating);
    });
  });

  describe('movies', () => {
    it('returns movies without ids', async () => {
      const res = await request.post('/graphql')
      .send({
        query: `
        {
          movies {
            title
            year
            rating
            actors {
              name
              birthday
              country
              directors {
                name
                birthday
                country
              }
            }
          }
        }
        `
      })
      .expect(200);

      assert.ok(res);
      assert.ok(res.body);
      assert.ok(res.body.data);
      assert.ok(res.body.data.movies);
      assert.ok(res.body.data.movies.length > 0);

      // check if data is coming from each
      const movies = res.body.data.movies;
      for (let i = 0; i < movies.length; i += 1) {
        const movie = movies[i];
        assert.ok(movie);
        assert.ok(movie.title);
        assert.ok(movie.year);
        assert.ok(movie.rating);
        assert.ok(movie.actors);

        // check nested actors
        for (let c = 0; c < movie.actors.length; c += 1) {
          const actor = movie.actors[c];

          assert.ok(actor);
          assert.ok(actor.name);
          assert.ok(actor.birthday);
          assert.ok(actor.country);
          assert.ok(actor.directors);

          // check nested directors
          for (let d = 0; d < actor.directors.length; d += 1) {
            const director = actor.directors[d];

            assert.ok(director);
            assert.ok(director.name);
            assert.ok(director.birthday);
            assert.ok(director.country);
          }
        }
      }
    });

    it('returns movies with ids', async () => {
      const res = await request.post('/graphql')
      .send({
        query: `
        {
          movies(ids: "3") {
            title
            year
            rating
            actors {
              name
              birthday
              country
              directors {
                name
                birthday
                country
              }
            }
          }
        }
        `
      })
      .expect(200);

      assert.ok(res);
      assert.ok(res.body);
      assert.ok(res.body.data);
      assert.ok(res.body.data.movies);
      assert.ok(res.body.data.movies.length > 0);

      // check if data is coming from each
      const movies = res.body.data.movies;
      for (let i = 0; i < movies.length; i += 1) {
        const movie = movies[i];
        assert.ok(movie);
        assert.ok(movie.title);
        assert.ok(movie.year);
        assert.ok(movie.rating);
        assert.ok(movie.actors);

        // check nested actors
        for (let c = 0; c < movie.actors.length; c += 1) {
          const actor = movie.actors[c];

          assert.ok(actor);
          assert.ok(actor.name);
          assert.ok(actor.birthday);
          assert.ok(actor.country);
          assert.ok(actor.directors);

          // check nested directors
          for (let d = 0; d < actor.directors.length; d += 1) {
            const director = actor.directors[d];

            assert.ok(director);
            assert.ok(director.name);
            assert.ok(director.birthday);
            assert.ok(director.country);
          }
        }
      }
    });
  });
});
