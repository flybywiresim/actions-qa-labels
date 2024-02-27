import { Octokit } from "@octokit/rest";
import core from '@actions/core';

let acceptableKeywords = [
    "ready to test",
    "ready for test",
    "ready for testing",
    "ready for qa",
    "ready for quality assurance",
    "ready for quality assurance testing",
    "rtt",
    "qa report",
    "quality assurance tester report",
    "quality assurance trainee report",
    "qa tester report",
    "qa trainee report",
    "quality assurance report"
];

//Function to fetch the comments from a PR
async function fetchComments(octo, owner, repo, issue_number) {

    try {

        const comments = await octo.issues.listComments({
            owner: owner,
            repo: repo,
            issue_number: issue_number
        });

        return comments.data;

    } catch (error) {

        core.setFailed(error);
        throw new Error(error);

    };

};

//Function to retrieve the last comment from the PR
async function getLastComment(octo, owner, repo, issue_number) {

    try {

        const comments = await fetchComments(octo, owner, repo, issue_number);

        return comments[comments.length - 1];

    } catch (error) {

        core.setFailed(error);
        throw new Error(error);

    };

};

//Function to check if the comment contains the straing "Ready to Test", "Ready for Testing", "Ready for QA", "Ready for Quality Assurance", "Ready for Quality Assurance Testing", "RTT"
function isRTTComment(comment) {

    const commentBody = comment.body.toLowerCase();

    if (commentBody.includes("ready to test") || commentBody.includes("ready for testing") || commentBody.includes("ready for qa") || commentBody.includes("ready for quality assurance") || commentBody.includes("ready for quality assurance testing") || commentBody.includes("rtt")) {
        return true;
    } else {
        return false;
    };

};

//Function to check if the comment contains the string "QA Report" or "Quality Assurance Tester Report" or "Quality Assurance Trainee Report"
function isValidComment(comment) {

    const commentBody = comment.body.toLowerCase();

    //Check if the comment contains any of the acceptable keywords
    for (let i = 0; i < acceptableKeywords.length; i++) {
            
        if (commentBody.includes(acceptableKeywords[i])) {
            return true;
        };

    };

    return false;

};

//Function to check if the comment contains the string "Testing Results"
function hasTestingResults(comment) {

    const commentBody = comment.body.toLowerCase();

    if (commentBody.includes("testing results") || commentBody.includes("test results") ) {
        return true;
    } else {
        return false;
    };

};

//Function to check if the comment contains the string "Passed" after "Testing Results"
function isPassed(comment) {

    const commentBody = comment.body.toLowerCase();

    if (commentBody.includes("not passed")) {
        return false;
    } else if (commentBody.includes("passed")) {
        return true;
    };

};

//Main 'function'
try {

    //Variable so we can check if the comment is either QA or RTT and if not then we can fail the action
    let isValidQAComment = false;

    //Get variables from the workflow
    const token = core.getInput('github-token');
    const repoOwner = core.getInput('repo-owner');
    const repoName = core.getInput('repo-name');
    const prNumber = core.getInput('pr-number');
    const labelPass = core.getInput('label-pass');
    const labelFail = core.getInput('label-fail');
    const labelRTT = core.getInput('label-rtt');
    const failNoComment = core.getInput('fail-action-if-no-qacomment');
    const failNoPass = core.getInput('fail-action-if-qa-failed');

    console.log(`Starting actions-qa-labels V1.0.0 - https://github.com/flybywiresim/actions-qa-labels`);

    //Create an Octokit instance and authenticate 
    const octokit = new Octokit({
        auth: token
    });
  
    console.log(`Fetching comments from ${repoOwner}/${repoName} PR#${prNumber}`);

    //Get the last comment from the PR
    const comment = await getLastComment(octokit, repoOwner, repoName, prNumber);

    console.log(`Last comment found, by ${comment.user.login}`);

    //Check if the comment is valid 
    if (!isValidComment(comment)) {
            
        console.log(`Not a QA comment`);

        //Lock
        isValidQAComment = false;

        //Check if the action should fail if the comment is not a QA comment
        if (failNoComment) {

            console.log(`Action failed`);
            core.setFailed(`Not a QA comment`);

        };

    } else {
            
        console.log(`QA comment found`);
        isValidQAComment = true;
    };

    //Check if the comment is RTT 
    if (isRTTComment(comment) && isValidQAComment) {

        console.log(`QA RTT comment found`); 

        //Now we want to add a label to the PR if we have the label-rtt input
        if (labelRTT) {

            console.log(`Adding RTT label to PR#${prNumber}`);
            await octokit.issues.addLabels({
                owner: repoOwner,
                repo: repoName,
                issue_number: prNumber,
                labels: [labelRTT]
            });

            console.log(`RTT label added to PR#${prNumber}`);
            console.log(`Action completed successfully`);

        };

    //Comment is not RTT so we can check if it is QA
    } else if (!isRTTComment(comment) && isValidQAComment && hasTestingResults(comment)) {

        console.log(`QA Report comment found`);

        //Check if the comment has passed or not
        if (!isPassed(comment)) { //Command has not passed

            //Now we can fail the action
            console.log(`QA Reported as NOT PASSED`);

            //Add a fail label if enabled
            if (labelFail) {

                await octokit.issues.addLabels({
                    owner: repoOwner,
                    repo: repoName,
                    issue_number: prNumber,
                    labels: [labelFail]
                });

                console.log(`Fail label added to PR#${prNumber}`);

                //If we have the label-pass input then we want to remove it
                if (labelPass) {

                    await octokit.issues.removeLabel({
                        owner: repoOwner,
                        repo: repoName,
                        issue_number: prNumber,
                        name: [labelPass]
                    });

                    console.log(`Pass label removed from PR#${prNumber}`);

                };

                

            };

            //Fail action if enabled
            if (failNoPass) {
                
                console.log(`Action failed`);
                core.setFailed(`QA Reported as NOT PASSED`);

            };

            console.log(`Action completed successfully`);

        
        } else { //Comment has passed

            //Now we can pass the action
            console.log(`QA Reported as PASSED`);

            //Add a pass label if enabled
            if (labelPass) {

                //Now we want to add a label to the PR if we have the label-pass input
                await octokit.issues.addLabels({
                    owner: repoOwner,
                    repo: repoName,
                    issue_number: prNumber,
                    labels: [labelPass]
                });

                console.log(`Pass label added to PR#${prNumber}`);

                //If we have the label-fail input then we want to remove it
                if (labelFail) {

                    await octokit.issues.removeLabel({
                        owner: repoOwner,
                        repo: repoName,
                        issue_number: prNumber,
                        name: [labelFail]
                    });

                    console.log(`Fail label removed from PR#${prNumber}`);

                };

                
                

            };

            //Remove the RTT label if enabled
            if (labelRTT) {

                await octokit.issues.removeLabel({
                    owner: repoOwner,
                    repo: repoName,
                    issue_number: prNumber,
                    name: [labelRTT]
                });

                console.log(`RTT label removed from PR#${prNumber}`);

            };

            console.log(`Action completed successfully`);

        };

    };

//Catch any errors during the action and fail the action
} catch (error) {

  core.setFailed(error.message);

};
