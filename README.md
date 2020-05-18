# Cloudformation/GitHub Action Bootstrap

Given the input (where `stacks` is a comma separated list):

```yaml
      - name: Bootstrap outputs
        id: ricochet-cloudformation
        uses: ricochet-ltd/cloudformation-bootstrap@v0.0.1
        with:
          stacks: pinata,ci
```

will produce the outputs:

```
${{ steps.ricochet-cloudformation.outputs.branch }}
```

as well as putting every output from the specified CF stacks in outputs too...eg:

`${{ steps.ricochet-cloudformation.outputs.CodeDeployBucket }}`
