const core = require("@actions/core");
const AWS = require("aws-sdk");
const cloudformation = new AWS.CloudFormation({region: process.env.AWS_DEFAULT_REGION});

async function run() {
    try {
        let stacks = core.getInput("stacks" );
        const branch = process.env.GITHUB_REF.split("/").pop();
        core.setOutput("branch", branch);

        if(!stacks) stacks = "ci"
        if(!stacks.includes("ci")) stacks = `ci,${stacks}`

        for(const stack of stacks.split(",")) {
            core.info(`Getting outputs from ${stack.trim()}`);
            const {Stacks: [{Outputs}]} = await cloudformation.describeStacks({
                StackName: stack.trim()
            }).promise();

            for(const {OutputKey, OutputValue} of Outputs) {
                core.info(`Setting ${OutputKey} as output...`);
                core.setOutput(OutputKey, OutputValue);
            }
        }
    } catch (error) {
        console.log(error);
        core.setFailed(error.message);

        const showStackTrace = process.env.SHOW_STACK_TRACE;

        if (showStackTrace === 'true') {
            throw(error)
        }

    }
}

(async () => {
    await run();

    console.log("done");
})();
