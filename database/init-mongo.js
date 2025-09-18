  print("Starting database initialization...");

  // Create admin user in admin database (if not exists)
  db = db.getSiblingDB('admin');
  try {
    db.createUser({
      user: 'admin',
      pwd: 'password123',
      roles: [{ role: 'userAdminAnyDatabase', db: 'admin' }, { role: 'readWriteAnyDatabase', db: 'admin' }]
    });
    print("Admin user 'admin' created successfully");
  } catch (error) {
    if (error.code === 51003) { // User already exists
      print("Admin user 'admin' already exists, skipping creation");
    } else {
      throw error;
    }
  }

  // Switch to application database
  db = db.getSiblingDB('movie_watchlist');

  // Create application user (if not exists)
  try {
    db.createUser({
      user: 'username',
      pwd: 'pass123',
      roles: [{ role: 'readWrite', db: 'movie_watchlist' }]
    });
    print("Application user 'username' created successfully");
  } catch (error) {
    if (error.code === 51003) { // User already exists
      print("Application user 'username' already exists, skipping creation");
    } else {
      throw error;
    }
  }

  db.movies.createIndex({ "status": 1 });
  db.movies.createIndex({ "genre": 1 });
  db.movies.createIndex({ "created_at": 1 });
  db.movies.createIndex({ "title": 1 });

  print("Performance indexes created successfully");
  print("Database initialization completed!");
