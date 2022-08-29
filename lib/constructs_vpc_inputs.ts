
export interface vpcInputs {
    prefix?: string
    spec?: {
        maxAzs: number,
        natGateways: number
    }
}