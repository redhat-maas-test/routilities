node {
    checkout scm
    sh 'rm -rf scripts && git clone https://github.com/redhat-maas-test/scripts.git'
    stage ('build') {
        sh 'make'
    }
    stage ('docker image') {
        sh 'make build'
    }
    stage ('docker image push') {
        withCredentials([usernamePassword(credentialsId: 'a9bc53ba-716c-45de-9d74-dd5d003f83c3', passwordVariable: 'DOCKER_PASSWD', usernameVariable: 'DOCKER_USER')]) {
            sh 'docker login -u $DOCKER_USER -p $DOCKER_PASSWD $DOCKER_REGISTRY'
            sh 'make push'
        }
    }
    stage('system tests') {
        withCredentials([usernamePassword(credentialsId: '8957fba6-7473-40f6-8593-efefa9e42251', passwordVariable: 'OPENSHIFT_PASSWD', usernameVariable: 'OPENSHIFT_USER')]) {
            withEnv(['SCRIPTS=https://raw.githubusercontent.com/EnMasseProject/travis-scripts/master']) {
                sh 'rm -rf systemtests && git clone https://github.com/EnMasseProject/systemtests.git'
                sh 'rm -rf enmasse && git clone https://github.com/redhat-maas-test/enmasse.git'
//                sh 'export OPENSHIFT_PROJECT=$BUILD_TAG; curl -s ${SCRIPTS}/run-tests.sh | bash //
//                /dev/stdin "" enmasse/install jboss-amqmaas-1-tech-preview/amqmaas10-console-openshift'
//                junit 'systemtests/target/surefire-reports/TEST-*.xml'
            }
        }
    }
    stage('docker snapshot') {
        sh 'make snapshot'
    }
}
