## TODO
* High priority
  * Ensure the Cloudformation custom resource correctly handles create, update, and delete events
  * Find an efficient way to interact with Rekognition from the UI (api-gateway => rekognition directly or with lambda in between?)
  * Create an S3 bucket to be publicly referenced inside the generated Cloudformation template for static artefacts (quickstart style)
  * Ensure we follow the best security practices by restricting role policies
* Low priority
  * Rewrite the UI in order to be more user-friendly
  * Add functionality for uploading profiles to the rekognition Collection
  * Setup CI/CD Travis pipeline
  * Add tests to Lambdas/Frontend