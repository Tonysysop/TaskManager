//import { Amplify } from "aws-amplify";
import type { ResourcesConfig } from "aws-amplify";

const awsConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_Z8ZwDwIaK",
      userPoolClientId: "egnpc5ohd8rk401ik2cmn0mii",
    },
  },
};

export default awsConfig;
