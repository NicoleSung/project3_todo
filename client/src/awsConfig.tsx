import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: "us-east-1_QQ0vo4TRv",
  ClientId: "2j7j8tflnfc41ns06v2eds46fl",
};

export default new CognitoUserPool(poolData);
