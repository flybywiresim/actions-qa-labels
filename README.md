# actions-qa-labels
A GitHub action to automatically add labels to pull requests based on QA report comments.  

## Installation in repositories 

Add this to your workflow file (e.g. `.github/workflows/qa-labels-for-prs.yml`):

```yaml
on: issue_comment

jobs:
  pr_commented:
    name: "QA Labels for PRs"
    if: ${{ github.event.issue.pull_request }} # This job only runs for pull request comments 
    runs-on: "ubuntu-latest" 
    permissions: # This is required for the action to be able to add labels to the pull request
      pull-requests: write # For adding labels, otherwise set to 'read'
    steps:
      - name: "PR QA Comments Labeler"
        uses: "flybywiresim/actions-qa-labels@master" # Make sure to use the latest version available!
        with:
          repo-owner: "${{ github.event.repository.owner.login }}" # Do not change this - this will automatically be set to the owner of the repository
          repo-name: "${{ github.event.repository.name }}" # Do not change this - this will automatically be set to the name of the repository
          pr-number: "${{ github.event.issue.number }}" # Do not change this - this will automatically be set to the number of the pull request
          github-token: "${{ secrets.GITHUB_TOKEN }}" # Do not change this - this will automatically be set to the GITHUB_TOKEN secret so that the action can add labels to the pull request - if you want to use a personal access token instead (e.g. for a bot), you can set it here
          label-pass: "QA Passed" # The label to add if the QA report comment contains the string "QA Passed"
          label-fail: "QA Failed" # The label to add if the QA report comment contains the string "QA Failed"
          label-rtt: "QA Ready to Test" # The label to add if the QA report comment contains the string "QA Ready to Test"
          # fail-action-if-no-qacomment: true # Uncomment this line if you want the action to fail if there is no QA report comment
          # fail-action-if-qa-failed: true # [Recommended] Uncomment this line if you want the action to fail if the QA report comment contains the string "QA Failed" 
```

**Configuration Details**
| Value                         | Description                                                                                                                                                                                                                                                                      | Default                                        | Required | Type      |
|-------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------|----------|-----------|
| `repo-owner`                  | The owner of the repository. Leave the default value for automatic parsing (Recommended)                                                                                                                                                                                         | `"${{ github.event.repository.owner.login }}"` | **Yes**  | `string`  |
| `repo-name`                   | The name of the repository. Leave the default value for automatic parsing (Recommended)                                                                                                                                                                                          | `"${{ github.event.repository.name }}"`        | **Yes**  | `string`  |
| `pr-number`                   | The number of the pull request. Leave the default value for automatic parsing (Recommended)                                                                                                                                                                                      | `"${{ github.event.issue.number }}"`           | **Yes**  | `string`  |
| `github-token`                | The GitHub token to use for adding labels to the pull request. Leave the default for a 'GitHub Actions' account (Recommended)  If you want to use a personal access token instead for your own account to perform these actions or when using a bot account, you can set it here | `"${{ secrets.GITHUB_TOKEN }}"`                | **Yes**  | `string`  |
| `label-pass`                  | The label name to add if an acceptable PR comment triggers the "QA Passed" condition                                                                                                                                                                                             | `"QA Passed"`                                  | No       | `string`  |
| `label-fail`                  | The label name to add if an acceptable PR comment triggers the "QA Failed" condition                                                                                                                                                                                             | `"QA Failed"`                                  | No       | `string`  |
| `label-rtt`                   | The label name to add if an acceptable PR comment triggers the "Ready To Test" condition                                                                                                                                                                                         | `"QA Ready to Test"`                           | No       | `string`  |
| `fail-action-if-no-qacomment` | Whether to fail the action if there is no QA report comment Uuseful if you want to make sure that the QA report comment is added for every pull request                                                                                                                          | `false`                                        | No       | `boolean` |
| `fail-action-if-qa-failed`    | Whether to fail the action if an acceptable PR comment triggers the "QA Failed" condition Useful if you want to make sure that the QA report comment is added for every pull request                                                                                             | `false`                                        | No       | `boolean` |

## Usage in a repository (Trigger Conditions)

This action will automatically add labels (as well as fail if configured so) to pull requests based on comments posted on the PR.

The wording & trigger conditions are based on the [FlyByWire QA Report Template](https://docs.flybywiresim.com/dev-corner/qa-process/#reporting-on-tests).

In addition, comments such as "Ready To Test" (and similar) will add the "RTT" labeled as set in the action settings. 

## Building

If you want to build this action yourself, you can do so by running `npm run build` in the root directory of this project.
This will create a `dist` folder with the built action.

Please note that the build script requires `ncc` to be installed globally, you can install it by running `npm install -g @vercel/ncc`.

--- 

If you have questions about this repo, using it, etc. contact @alepouna on the FBW Discord :)
actions-qa-labels is originally based on https://github.com/auroraisluna/qa-labels-for-prs licensed under GNU GENERAL PUBLIC LICENSE v3. 
