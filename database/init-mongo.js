  print("Starting database initialization...");

  db = db.getSiblingDB('movie_watchlist');

  db.createUser({
    user: 'app_user',
    pwd: 'app_password',
    roles: [{ role: 'readWrite', db: 'movie_watchlist' }]
  });

  print("Application user 'app_user' created successfully");

  db.movies.createIndex({ "status": 1 });
  db.movies.createIndex({ "genre": 1 });
  db.movies.createIndex({ "created_at": 1 });
  db.movies.createIndex({ "title": 1 });

  print("Performance indexes created successfully");
  print("Database initialization completed!");
