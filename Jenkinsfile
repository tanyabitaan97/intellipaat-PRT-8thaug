pipeline {

    agent any

    environment {
        DOCKERHUB_USERNAME = 'YOUR_DOCKERHUB_USERNAME'
        IMAGE_NAME = "tanyabitaan/student-app"
        IMAGE_TAG = "${BUILD_NUMBER}"
        CONTAINER_NAME = 'student-app'
        PORT = '3000'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | \
                        docker login \
                        --username "$DOCKER_USERNAME" \
                        --password-stdin
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build \
                        -t ${IMAGE_NAME}:${IMAGE_TAG} \
                        -t ${IMAGE_NAME}:latest \
                        .
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                sh '''
                    docker push ${IMAGE_NAME}:${IMAGE_TAG}
                    docker push ${IMAGE_NAME}:latest
                '''
            }
        }

        stage('Stop Existing Container') {
            steps {
                sh '''
                    docker stop ${CONTAINER_NAME} || true
                    docker rm ${CONTAINER_NAME} || true
                '''
            }
        }

        stage('Run New Container') {
            steps {
                withCredentials([
                    string(credentialsId: 'rds-host', variable: 'DB_HOST'),
                    string(credentialsId: 'rds-password', variable: 'DB_PASSWORD'),
                    string(credentialsId: 'rds-database', variable: 'DB_NAME'),
                    string(credentialsId: 'rds-username', variable: 'DB_USER')
                ]) {
                    sh '''
                        docker run -d \
                            --name ${CONTAINER_NAME} \
                            --restart unless-stopped \
                            -p ${PORT}:3000 \
                            -e PORT=3000 \
                            -e DB_HOST="${DB_HOST}" \
                            -e DB_PORT=3306 \
                            -e DB_NAME="${DB_NAME}" \
                            -e DB_USER="${DB_USER}" \
                            -e DB_PASSWORD="${DB_PASSWORD}" \
                            ${IMAGE_NAME}:${IMAGE_TAG}
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    sleep 10
                    curl -f http://localhost:${PORT}/api/health
                    echo ""
                    echo "Application is running!"
                '''
            }
        }
    }

    post {
        success {
            echo "Deployment successful: ${IMAGE_NAME}:${IMAGE_TAG}"
            echo "Application URL: http://localhost:${PORT}"
        }

        failure {
            sh 'docker logs ${CONTAINER_NAME} || true'
        }

        always {
            sh '''
                docker logout || true
                docker image prune -f || true
            '''
        }
    }
}
