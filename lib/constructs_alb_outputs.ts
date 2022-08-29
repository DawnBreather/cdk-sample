
import * as albv2 from "@aws-cdk/aws-elasticloadbalancingv2"

export interface albOutputs {
    prefix?: string
    alb: albv2.ApplicationLoadBalancer
}