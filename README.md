# Bassetune Reapers Server
Contains the code for the backend-game which includes the actual game instance.
It includes:
* Accepting the request for a new room from matchmaker
* Game instance
* Movement
* Abilities

### Branches
* Master - Stable Release [![Build Status](https://magnum.travis-ci.com/Eluate/Bassetune-Reapers-Server.svg?token=khX8dMkthfynyEhdz3Si&branch=master)](https://magnum.travis-ci.com/Eluate/Bassetune-Reapers-Server)
* Develop - Development Release [![Build Status](https://magnum.travis-ci.com/Eluate/Bassetune-Reapers-Server.svg?token=khX8dMkthfynyEhdz3Si&branch=develop)](https://magnum.travis-ci.com/Eluate/Bassetune-Reapers-Server)

### Development Installation Instructions
- Install Redis locally (and ensure that redis server is running)
- Install MySQL server locally
- Create the database using createDatabase.sql
- TODO: Populate database with test data using insertTestData.sql