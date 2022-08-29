import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import {vpcInputs} from "./constructs_vpc_inputs";
import {vpcOutputs} from "./constructs_vpc_outputs";


export class vpc extends cdk.Construct{

    private readonly _outputs: vpcOutputs
    private readonly inputs: vpcInputs
    private readonly  scope: cdk.Construct


    get outputs(): vpcOutputs {
        return this._outputs;
    }

    constructor(scope: cdk.Construct, id: string, properties: vpcInputs) {
        super(scope, id);

        this.scope = scope
        this.inputs = properties
        this._outputs = {} as vpcOutputs

        this.
            createVpc()
    }

    private createVpc(): vpc {
        this._outputs.vpc = new ec2.Vpc(this.scope, "vpc", {
            maxAzs: this.inputs?.spec?.maxAzs ?? 99,
            natGateways: this.inputs?.spec?.natGateways ?? 1
        })
        return this
    }
}