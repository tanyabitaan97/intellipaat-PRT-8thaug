# Angular + AWS RDS Student Management App

## Architecture

Git push -> Jenkins -> Docker build -> Docker Hub -> docker run

The application is packaged as ONE Docker image containing:

- Angular frontend
- Node.js/Express backend

The backend connects to AWS RDS MySQL.

```text
Browser
   |
   v
Single Docker Container :3000
   |-- Angular
   |-- Express API
   |
   +----> AWS RDS MySQL
```

No Docker Compose and no EC2 deployment step are required by the Jenkinsfile.

## Local Docker run

Build:

```bash
docker build -t student-app .
```

Run:

```bash
docker run -d \
  --name student-app \
  -p 3000:3000 \
  -e PORT=3000 \
  -e DB_HOST=your-rds-endpoint \
  -e DB_PORT=3306 \
  -e DB_NAME=studentdb \
  -e DB_USER=admin \
  -e DB_PASSWORD=your-password \
  student-app
```

Open:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/health
```

## Jenkins

Create these Jenkins credentials:

- `dockerhub-credentials` — Username + Docker Hub access token
- `rds-host` — Secret text
- `rds-password` — Secret text
- `rds-database` — Secret text
- `rds-username` — Secret text

Change this in Jenkinsfile:

```groovy
DOCKERHUB_USERNAME = 'YOUR_DOCKERHUB_USERNAME'
```

The Jenkins machine must have Docker installed and permission to run Docker.

Every successful push/build:

1. Checks out the code.
2. Builds the single Docker image.
3. Pushes `student-app:<BUILD_NUMBER>` and `student-app:latest` to Docker Hub.
4. Stops/removes the old local container.
5. Runs the new container.
6. Performs `/api/health` check.

## Database

Run `backend/schema.sql` against your AWS RDS MySQL database.

Never put RDS credentials in Angular source code or commit `.env` files.
"# intellipaat-PRT-8thaug" 
