# S3 File Upload Dashboard

This is a simple dashboard that lets you upload files from your local system to a designated S3 Bucket.

## Website

Website built to be hosted on S3.

Tech Stack based on Vanila `HTML`, `JS`, `CSS` and uses `AWS JS SDK v2`


Running the server locally using python HTTP server

```
$ npm start

-- OR --

$ python3 -m http.server
```

---


## Prerequisite Tasks
To set up and run this project, you must first complete the below tasks:

1. Create an Amazon S3 bucket. This bucket will be utilized to store the files 
    >Configured in `script.js`

2. Create an Amazon Cognito identity pool using Federated Identities with access enabled for unauthenticated users to the S3 bucket.
    >Configured in `script.js`

3. Add the following policy to IAM role attached to the identity pool to grant users write permissions to the S3 bucket. 


    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "s3:PutObject",
                    "s3:PutObjectAcl"
                ],
                "Resource": [            
                    "arn:aws:s3:::BUCKET_NAME",
                    "arn:aws:s3:::BUCKET_NAME/*"
                ]
            }
        ]
    }
    ```

    >--- Warning ---
    >
    > Granting access for unauthenticated users means you're giving write privileges to the bucket to individuals worldwide.
4. Configure CORS policy of the bucket to allow network calls

    ```json
    [
        {
            "AllowedHeaders": [
                "*"
            ],
            "AllowedMethods": [
                "HEAD",
                "PUT",
                "POST",
            ],
            "AllowedOrigins": [
                "*"
            ],
            "ExposeHeaders": [
                "ETag"
            ]
        }
    ]
    ```
