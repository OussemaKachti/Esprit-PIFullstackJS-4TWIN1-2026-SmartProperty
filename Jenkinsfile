pipeline {
    agent any

    tools {
        nodejs 'NodeJS-18'  
    }

    environment {
        DOCKERHUB_USER = 'ilyeschrif21'
        IMAGE_BACKEND  = "${DOCKERHUB_USER}/mern-backend"
        IMAGE_FRONTEND = "${DOCKERHUB_USER}/mern-frontend"
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'coverage',
                    url: 'https://github.com/OussemaKachti/Esprit-PIFullstackJS-4TWIN1-2026-SmartProperty.git'
            }
        }

       stage('Install Dependencies') {
    parallel {
        stage('Backend deps') {
            steps {
                dir('backend') { 
                    sh 'npm ci'
                    sh 'ls node_modules/jest-circus || echo "jest-circus MISSING!"'
                }
            }
        }
        stage('Frontend deps') {
            steps {
                dir('frontend') { sh 'npm ci --legacy-peer-deps' }
            }
        }
    }
}

       stage('Test & Coverage') {
    steps {
        dir('backend') {
            sh 'npm run test:coverage'
            sh 'test -f coverage/lcov.info || (echo "ERROR: coverage/lcov.info not found!" && exit 1)'
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'backend/coverage/lcov-report/**', allowEmptyArchive: true
        }
    }
}

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonarqube') {
                    dir('backend') {
                        // Explicitly confirm the report path before scanner runs
                        sh 'ls -la coverage/lcov.info'
                        sh 'ls -la coverage/test-report.xml || echo "coverage/test-report.xml missing"'
                    }
                }
            }
        }

        stage('SonarQube Per-Controller Analysis') {
            parallel {
                stage('Sonar Feedback') {
                    steps {
                        withSonarQubeEnv('sonarqube') {
                            dir('backend') {
                                sh "${tool 'sonarqube'}/bin/sonar-scanner -Dproject.settings=sonar/sonar-feedback.properties"
                            }
                        }
                    }
                }
                stage('Sonar EasyWallet') {
                    steps {
                        withSonarQubeEnv('sonarqube') {
                            dir('backend') {
                                sh "${tool 'sonarqube'}/bin/sonar-scanner -Dproject.settings=sonar/sonar-easywallet.properties"
                            }
                        }
                    }
                }
                stage('Sonar Lease') {
                    steps {
                        withSonarQubeEnv('sonarqube') {
                            dir('backend') {
                                sh "${tool 'sonarqube'}/bin/sonar-scanner -Dproject.settings=sonar/sonar-lease.properties"
                            }
                        }
                    }
                }
                stage('Sonar Property') {
                    steps {
                        withSonarQubeEnv('sonarqube') {
                            dir('backend') {
                                sh "${tool 'sonarqube'}/bin/sonar-scanner -Dproject.settings=sonar/sonar-property.properties"
                            }
                        }
                    }
                }
                stage('Sonar Auth Middleware') {
                    steps {
                        withSonarQubeEnv('sonarqube') {
                            dir('backend') {
                                sh "${tool 'sonarqube'}/bin/sonar-scanner -Dproject.settings=sonar/sonar-auth-middleware.properties"
                            }
                        }
                    }
                }
            }
        }

        stage('Docker Compose Build') {
            steps {
                sh 'DOCKER_BUILDKIT=1 docker-compose build'
            }
        }

        stage('Push Images to DockerHub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'

                    sh "docker tag mern-pipeline-frontend ${IMAGE_FRONTEND}:${BUILD_NUMBER}"
                    sh "docker tag mern-pipeline-frontend ${IMAGE_FRONTEND}:latest"
                    sh "docker tag mern-pipeline-backend  ${IMAGE_BACKEND}:${BUILD_NUMBER}"
                    sh "docker tag mern-pipeline-backend  ${IMAGE_BACKEND}:latest"

                    sh "docker push ${IMAGE_FRONTEND}:${BUILD_NUMBER}"
                    sh "docker push ${IMAGE_FRONTEND}:latest"
                    sh "docker push ${IMAGE_BACKEND}:${BUILD_NUMBER}"
                    sh "docker push ${IMAGE_BACKEND}:latest"
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh 'kubectl apply -f k8s/'
                sh "kubectl set image deployment/backend backend=${IMAGE_BACKEND}:${BUILD_NUMBER}"
                sh "kubectl set image deployment/frontend frontend=${IMAGE_FRONTEND}:${BUILD_NUMBER}"
                sh 'kubectl rollout restart deployment/backend'
                sh 'kubectl rollout restart deployment/frontend'
            }
        }
    }

    post {
        always  { echo 'Pipeline finished.' }
        success { echo 'All stages passed. Deployment complete.' }
        failure { echo 'Pipeline failed — check the stage logs above.' }
    }
}