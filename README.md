# Moochee

A multi-person interactive quiz game

## DEV How-To

After cloning you can:
- Run the tests: `npm test`
- Start the server: `npm run dev`

If you want to run locally with same bindings as in production, e.g. enabling security:
- Copy `app.profile.sample` to `app.profile`
- Assign proper values to `clientid`, `clientsecret` and `url`
- Source the app.profile / export the environment variables
- Start the server: `npm start`

Besides Node.js, no extra tools are needed, cause big toolchains suck.
