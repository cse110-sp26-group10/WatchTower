**Important: Test Evidence Log Template [here](#test-evidence-log-template)**

<!-- task description from task tracker delete after-->
Things to include: 
- [ ] Write a short early testing plan for the prototype.  
- [ ] Include what can be unit tested later and what E2E flow should be demonstrated.  
- [ ] How testing evidence will be shown in the repo

# Testing Plan
1. Look at the different features and underlying code to get a better understanding of how and what to unit test. 
2. Write unit tests as functions are added. Concurrently, begin planning for E2E test scenarios and also add unit tests to GitHub Actions workflow. 
3. Write E2E tests and add them to GitHub Actions.
<!-- unsure if we should add e2e tests to github actions. if something is failing somewhere else, can't merge -->

<!-- idea: we can add a subdirectory specifically for testing logs.-->


## Things to Unit Test: 
- User App input (real time / passive)
- Data Retrieval and Processing (Retrieving relevant data from the collected app data)
<!--Display of logs and analytics -->



## End to End Flows to Tests:
- User input -> Process data -> Display logs and analytics
- Do a test to get passive time app data, process it, display logs and analytics
<!--Do a test to get real time app data, process it, display logs and analytics-->

## Test Evidence Log Template: 
<!-- Maybe also collect data like name, date, sprint #, role?-->
Type of test run: Unit/E2E  
[File Tested]()

Description <!--things to include: what passed and what failed, what was done to correct the fails-->:

Log of Test Output: <!-- maybe also add photos, but photos will have to be added to the repo as well. -->
