pipeline {
  agent any
  stages {
    stage('Setup') {
      environment {
        GH_TOKEN=credentials("githubGkFacebookBot")
      }
      steps {
        nvm(nvmInstallURL: 'https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh', nvmIoJsOrgMirror: 'https://iojs.org/dist', nvmNodeJsOrgMirror: 'https://nodejs.org/dist', version: '8') {
          sh 'npm install -g greenkeeper-lockfile@1'
          sh 'GIT_BRANCH="origin/${BRANCH_NAME}" GIT_URL=`git config --get remote.origin.url` greenkeeper-lockfile-update'
          sh 'npm i'
        }
      }
    }
    stage('Test') {
      steps {
        timeout(time: 1, unit: 'HOURS') {
          nvm(nvmInstallURL: 'https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh', nvmIoJsOrgMirror: 'https://iojs.org/dist', nvmNodeJsOrgMirror: 'https://nodejs.org/dist', version: '8') {
            sh 'npm test'
          }
        }
      }
    }
    stage('Teardown') {
      environment {
        GH_TOKEN=credentials("githubGkFacebookBot")
      }
      steps{
        nvm(nvmInstallURL: 'https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh', nvmIoJsOrgMirror: 'https://iojs.org/dist', nvmNodeJsOrgMirror: 'https://nodejs.org/dist', version: '8') {
          sh 'npm install -g greenkeeper-lockfile@1'
          sh 'echo ${GIT_URL}'
          sh 'GIT_BRANCH="origin/${BRANCH_NAME}" GIT_URL=`git config --get remote.origin.url` greenkeeper-lockfile-upload'
        }
      }
    }
  }
}
