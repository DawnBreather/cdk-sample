import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as albv2 from "@aws-cdk/aws-elasticloadbalancingv2"
import {albInputs} from "./constructs_alb_inputs";
import {albOutputs} from "./constructs_alb_outputs";


export class alb extends cdk.Construct{

    private readonly _outputs: albOutputs
    private readonly inputs: albInputs
    private readonly scope: cdk.Construct


    get outputs(): albOutputs {
        return this._outputs;
    }

    constructor(scope: cdk.Construct, id: string, properties: albInputs) {
        super(scope, id);

        this.scope = scope
        this.inputs = properties
        this._outputs = {} as albOutputs

        this.
            createAlb()
    }

    private createAlb(): alb {
        this._outputs.alb = new albv2.ApplicationLoadBalancer(this.scope, "alb", {
            vpc: this.inputs.spec?.vpc ?? ec2.Vpc.fromLookup(this, 'DefaultVpc', {
                isDefault: true
            }),
            internetFacing: this.inputs.spec?.internetFacing ?? false
        })
        return this
    }
}