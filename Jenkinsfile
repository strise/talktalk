defaultPodTemplate {
    nodeTemplate {
      node('node') {
        def scmVars

        stage("Checkout source") {
          scmVars = checkout scm
        }

        stage("Greenkeeper pre") {
          gkPreStep branch: scmVars.GIT_BRANCH, url: scmVars.GIT_URL
        }

        stage("Install") {
          npm 'install'
        }

        stage("Test") {
          npm 'test'
        }

        stage("Greenkeeper post") {
          gkPostStep branch: scmVars.GIT_BRANCH, url: scmVars.GIT_URL
        }
    }
  }
}
