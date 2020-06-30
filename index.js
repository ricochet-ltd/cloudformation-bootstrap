const core = require("@actions/core");
const AWS = require("aws-sdk");
const cloudformation = new AWS.CloudFormation({region: process.env.AWS_DEFAULT_REGION});

async function run() {
    try {
        let stacks = core.getInput("stacks" );
        const BASE_STACK_NAME = core.getInput("BASE_STACK_NAME" ) || "tros";
        const branch = process.env.GITHUB_REF.split("/").pop();
        const environment = (branch === "master") ? "production" : "staging";

        core.setOutput("branch", branch);
        core.setOutput("environment", environment);

        if(!stacks) stacks = BASE_STACK_NAME
        if(!stacks.includes(BASE_STACK_NAME)) stacks = `${BASE_STACK_NAME},${stacks}`

        const {Stacks} = await cloudformation.describeStacks().promise();

        const outputs = Stacks.reduce((acc, el) => {
            if(el.StackName.startsWith(BASE_STACK_NAME)) {
              acc[BASE_STACK_NAME] = acc.tros.concat(el.Outputs);
            } else {
              acc[el.StackName] = el.Outputs
            }

            return acc;
        }, {[BASE_STACK_NAME]:[]})

        for(const stack of stacks.split(",")) {
            core.info(`Getting outputs from ${stack.trim()}`);

            for(const {OutputKey, OutputValue} of outputs[stack]) {
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
