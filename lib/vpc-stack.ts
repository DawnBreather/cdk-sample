import * as cdk from '@aws-cdk/core';
import {vpc} from "./constructs_vpc";
import {alb} from "./constructs_alb"

export class VpcStack extends cdk.Stack {
  get applicationLoadBalancer(): alb {
    return this._applicationLoadBalancer;
  }

  get vpc(): vpc {
    return this._vpc;
  }

  private readonly _applicationLoadBalancer: alb
  private readonly _vpc: vpc


  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this._vpc = new vpc(this, "_vpc", {})

    this._applicationLoadBalancer = new alb(this, "_alb", {
      spec: {
        vpc: this._vpc.outputs.vpc,
        internetFacing: true
      }
    })

  }
}
