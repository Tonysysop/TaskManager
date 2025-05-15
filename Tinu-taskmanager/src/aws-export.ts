// //import { Amplify } from "aws-amplify";
// import type { ResourcesConfig } from "aws-amplify";

// const awsConfig: ResourcesConfig = {
//   Auth: {
//     Cognito: {
//       userPoolId: "us-east-1_Z8ZwDwIaK",
//       userPoolClientId: "egnpc5ohd8rk401ik2cmn0mii",
//     },
//   },
// };

// export default awsConfig;


// import { Amplify } from "aws-amplify"; // You'll need this if you're calling Amplify.configure() elsewhere
import type { ResourcesConfig } from "aws-amplify";

const awsConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_Z8ZwDwIaK", // This is your existing User Pool ID
      userPoolClientId: "egnpc5ohd8rk401ik2cmn0mii", // This is your existing User Pool Client ID
      
      // --- THIS SECTION IS MISSING AND NEEDS TO BE ADDED ---
      loginWith: {
        oauth: {
          domain: "us-east-1z8zwdwiak.auth.us-east-1.amazoncognito.com", // e.g., your-app.auth.us-east-1.amazoncognito.com
          scopes: [
    
             // Adjust scopes as needed
          ],
          redirectSignIn: [
            "http://localhost:5173", // Example for local development
           // Example for production
          ],
          redirectSignOut: [
            "http://localhost:5173"
          ],
          responseType: "code", // Standard for web applications
        },
        // You can also specify socialProviders if you want to limit them,
        // though signInWithRedirect({ provider: 'Google' }) is more explicit.
        // socialProviders: ['Google'] 
      },
      // ----------------------------------------------------
    },
  },
};

export default awsConfig;

// Don't forget to configure Amplify with this config object, usually in your app's entry point:
// import { Amplify } from 'aws-amplify';
// Amplify.configure(awsConfig);