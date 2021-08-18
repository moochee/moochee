#!/usr/bin/env groovy
node {
    stage('Commit') {
        deleteDir()
        checkout scm
    }
    // stage('Test') {
    //     sh 'npm i && npm test'
    // }
    stage('Deploy') {
        withCredentials([
            usernamePassword(credentialsId: 'cfdeploy', passwordVariable: 'password', usernameVariable: 'username')
        ]) {
            sh '''
                cf login -u '${username}' -p '${password}' -a https://api.cf.sap.hana.ondemand.com -o cc-acdc-tools -s gorilla-quiz
                ./deploy.sh
            '''
        }
    }
}