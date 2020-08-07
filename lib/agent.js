"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("@aws-cdk/core");
const iam = require("@aws-cdk/aws-iam");
class AgentStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const account = cdk.Stack.of(this).account;
        const region = cdk.Stack.of(this).region;
        const s3Permissions = new iam.PolicyStatement();
        s3Permissions.addResources(`arn:aws:s3:::aws-codepipeline-${account}-${region}/*`);
        s3Permissions.addActions('s3:Get*', 's3:List*');
        const deployPolicy = new iam.Policy(this, 'CodeDeployS3BucketPolicy', {
            statements: [
                s3Permissions
            ]
        });
        const deployUser = new iam.User(this, 'LightSailCodeDeployUser', {
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchFullAccess')
            ]
        });
        deployPolicy.attachToUser(deployUser);
    }
}
exports.AgentStack = AgentStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhZ2VudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUFxQztBQUNyQyx3Q0FBd0M7QUFFeEMsTUFBYSxVQUFXLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDdkMsWUFBWSxLQUFvQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUNsRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDM0MsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDO1FBRXpDLE1BQU0sYUFBYSxHQUFHLElBQUksR0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ2hELGFBQWEsQ0FBQyxZQUFZLENBQ3hCLGlDQUFpQyxPQUFPLElBQUksTUFBTSxJQUFJLENBQ3ZELENBQUM7UUFDRixhQUFhLENBQUMsVUFBVSxDQUN0QixTQUFTLEVBQ1QsVUFBVSxDQUNYLENBQUM7UUFFRixNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLDBCQUEwQixFQUFFO1lBQ3BFLFVBQVUsRUFBRTtnQkFDVixhQUFhO2FBQ2Q7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLHlCQUF5QixFQUFFO1lBQy9ELGVBQWUsRUFBRTtnQkFDZixHQUFHLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLHNCQUFzQixDQUFDO2FBQ25FO1NBQ0YsQ0FBQyxDQUFDO1FBQ0gsWUFBWSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN4QyxDQUFDO0NBQ0Y7QUE3QkQsZ0NBNkJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ0Bhd3MtY2RrL2F3cy1pYW0nO1xuXG5leHBvcnQgY2xhc3MgQWdlbnRTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCBhY2NvdW50ID0gY2RrLlN0YWNrLm9mKHRoaXMpLmFjY291bnQ7XG4gICAgY29uc3QgcmVnaW9uID0gY2RrLlN0YWNrLm9mKHRoaXMpLnJlZ2lvbjtcblxuICAgIGNvbnN0IHMzUGVybWlzc2lvbnMgPSBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCgpO1xuICAgIHMzUGVybWlzc2lvbnMuYWRkUmVzb3VyY2VzKFxuICAgICAgYGFybjphd3M6czM6Ojphd3MtY29kZXBpcGVsaW5lLSR7YWNjb3VudH0tJHtyZWdpb259LypgXG4gICAgKTtcbiAgICBzM1Blcm1pc3Npb25zLmFkZEFjdGlvbnMoXG4gICAgICAnczM6R2V0KicsXG4gICAgICAnczM6TGlzdConXG4gICAgKTtcblxuICAgIGNvbnN0IGRlcGxveVBvbGljeSA9IG5ldyBpYW0uUG9saWN5KHRoaXMsICdDb2RlRGVwbG95UzNCdWNrZXRQb2xpY3knLCB7XG4gICAgICBzdGF0ZW1lbnRzOiBbXG4gICAgICAgIHMzUGVybWlzc2lvbnNcbiAgICAgIF1cbiAgICB9KTtcblxuICAgIGNvbnN0IGRlcGxveVVzZXIgPSBuZXcgaWFtLlVzZXIodGhpcywgJ0xpZ2h0U2FpbENvZGVEZXBsb3lVc2VyJywge1xuICAgICAgbWFuYWdlZFBvbGljaWVzOiBbXG4gICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnQ2xvdWRXYXRjaEZ1bGxBY2Nlc3MnKVxuICAgICAgXVxuICAgIH0pO1xuICAgIGRlcGxveVBvbGljeS5hdHRhY2hUb1VzZXIoZGVwbG95VXNlcik7XG4gIH1cbn1cbiJdfQ==