  print("Starting database initialization...");

  // Create admin user in admin database
  db = db.getSiblingDB('admin');
  db.createUser({
    user: 'admin',
    pwd: 'password123',
    roles: [{ role: 'userAdminAnyDatabase', db: 'admin' }, { role: 'readWriteAnyDatabase', db: 'admin' }]
  });

  print("Admin user 'admin' created successfully");

  // Switch to application database
  db = db.getSiblingDB('movie_watchlist');

  // Create application user
  db.createUser({
    user: 'username',
    pwd: 'pass123',
    roles: [{ role: 'readWrite', db: 'movie_watchlist' }]
  });

  print("Application user 'username' created successfully");

  db.movies.createIndex({ "status": 1 });
  db.movies.createIndex({ "genre": 1 });
  db.movies.createIndex({ "created_at": 1 });
  db.movies.createIndex({ "title": 1 });

  print("Performance indexes created successfully");
  print("Database initialization completed!");
