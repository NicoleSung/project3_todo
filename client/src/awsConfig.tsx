import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: "us-east-1_QQ0vo4TRv",
  ClientId: "3g6mpmbhvs83kue3cqq1q04nuc",
};

export default new CognitoUserPool(poolData);
