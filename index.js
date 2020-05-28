const core = require("@actions/core");
const AWS = require("aws-sdk");
const cloudformation = new AWS.CloudFormation({region: process.env.AWS_DEFAULT_REGION});

async function run() {
    try {
        let stacks = core.getInput("stacks" );
        const branch = process.env.GITHUB_REF.split("/").pop();
        core.setOutput("branch", branch);

        if(!stacks) stacks = "base"
        if(!stacks.includes("base")) stacks = `base,${stacks}`

        const {Stacks} = await cloudformation.describeStacks().promise();

        const outputs = Stacks.reduce((acc, el) => {
            if(el.StackName.startsWith("base")) {
              acc.base = acc.base.concat(el.Outputs);
            } else {
              acc[el.StackName] = el.Outputs
            }

            return acc;
        }, {base:[]})

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
