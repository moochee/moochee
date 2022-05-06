# gorilla

A multi-person interactive quiz app: https://gorilla.cfapps.eu12.hana.ondemand.com/ (sso required)

The name is to honor the [first computer game of which one of the authors looked and debugged into the source code](https://archive.org/details/GorillasQbasic).

## Add New Quiz?

There are 2 types of quiz:
- **Private Quiz** is available only to its creator
  - Click the icon ⚙️ on the top right corner after sso
- **Public Quiz** is available to all who can login via sso
  - All public quizzes are located in [/quiz](https://github.tools.sap/learning-experience/gorilla-quiz/tree/main/quiz) as JSON. New one can be added by [sending a pull request](https://github.tools.sap/learning-experience/gorilla-quiz/new/master/quiz). 

## Dev How-To

After cloning you can:
- Run the tests: `npm test`
- Start the server: `npm run start:dev`

If you want to run locally with same bindings as in production, e.g. enabling security:
- Copy `app.profile.sample` to `app.profile`
- Assign proper values to `clientid`, `clientsecret` and `url`
- Source the app.profile / export the environment variables
- Start the server: `npm start`

Besides Node.js, no extra tools are needed, cause big toolchains suck.

## Learnings

This app was created for two reasons:
- we run a lot of trainings and workshops, and existing Quiz Apps either are costly, bear licensing issues, or don't offer what we needed
- since our trainings and workshops are also covering engineering topics like cloud-native development, we need to keep our tech know-how up-to date

_For the second reason, we compiled a list of our learnings here!_

**Things we tried out here**
- React + JSX
- ES6 modules - both on UI and server (Node.js)
- Service worker
- CSS transitions & animations
- WebSockets / socket.io
- Custom visuals and widgets using SVG
- UI5 Web Components (worked really well, discarded later just because we wanted to try making our own widgets)
- Git hooks
- QR codes for URLs
- **The most important one:** be _absolutely minimalistic regarding tools_ - and demonstrate things are super performant while still ultra simple & elegant at the same time
- Preact with HTM (tagged template strings) to replace React and JSX
- Zero-Downtime deployment of a stateful app
- CD pipeline with bare shell script and without extra tools, can try Github Actions or even do our own CD server

**Our findings**
- Most of the technology vendors try to sell you their tools _the_ thing needed to keep things simple or performant. They try to sell you that things are hard to do yourself, and therefore you need their stuff to do "magic". None of it is true:
  - Our Node server only needs Express and WebSockets
  - Our UI only needs Preact and a QR code generator
  - Since we're using Preact instead of React, we don't even need a build process / JSX compiler, Preact has something much nicer called htm
  - Installing a Git hook is a one-liner, you don't need tools like Husky to do this
  - Doing a zero-downtime deployment is just 5 lines of shell script, in our case it's a bit more, cause we have a stateful game, so doing a zero-downtime update is a bit more tricky, and you won't even get support for this from 3rd party tools/frameworks
  - There is no ugly or complex thing in the code despite all the tools we are _not_ using, and the app is super fast, without extra tools or further optimizations, which makes me think: _"Despite or because of?"_
- Socket.io is nice, but nowadays you can do well without it
- When you trigger a `cf stop`, Cloud Foundry will only give the app 5 seconds to respond to SIGTERM, after this it will kill the process (SIGKILL), and it's only configurable globally by platform operators  - not really helpful for game apps, where you cannot just stop a running game
- Emojis are a super nice source of visuals, using SVG you can also include them directly as [svg-favicon](public/favicon.svg)
- On iPhone (and probably also Android), you cannot control the volume from the page, as volume control is always left to the user through the hardware buttons
- There's a nasty extra thing at least on iPhone that can cause rendering glitches for your responsive app: if the native browser navigation buttons like back/forward/share/bookmarks are displayed on your phone, they influence the viewport. There's a height difference between the visual viewport (`window.visualViewport`) and the viewport, which can cause y-positioning to be slightly off. Be aware of that especially if you use the css3 `vh` property! If you're able to use `%` instead, it might fix the issue!
- Safari Tech Preview allows you to connect the Web Inspector from your Laptop directly to the Safari browser on your iPhone, so you can debug and deeply analyze those nasty issues that you cannot reproduce using simulators
- CSS animations are a hell load of fun
- ES6 modules and JSX don't work nicely together
- JSX (part of React) sucks a bit cause it forces you to introduce additional tools like Babel or even a server-side build
- Compiling JSX is super duper fast, people claiming you need a server side build for such things are propbably just too much used to poorly crafted applications that are slow for millions of reasons, and therefore need questionable optimizations like server side build, minification, etc., all adding complexity - they would better just make their code clean instead, then it's fast without any extra thing on top
- Service worker is an amazing thing that can make your application loading fast like crazy and gives you full control over everything, without any questionable magic
- It's a bit tricky to get Service Worker configured correctly
  - If you have something like a compilation of JSX, that requires your application to bootstrap really only once the Service Worker is active - see https://stackoverflow.com/questions/68781638/service-worker-serviceworker-ready-event-waituntil-not-orchestrating-as-expec
  - When you're online, you probably want to update your cached resources in the Service Worker, consider deferring that a bit as otherwise it might delay the connection to your server for the data loading. _If you get that right your app can be rendering the UI AND data in less than 50ms_.
- Regular ES6 import has the drawback that it doesn't allow for lazy loading
- UI5 Web Components work really nice, and if you don't like server-side build tools you can load it as a [single-file bundle](https://sap.github.io/ui5-webcomponents/assets/js/ui5-webcomponents/bundle.es5.js (so if you're developing a Java app, you can use UI5 Web Components without being needed to use Node.js), and at least together with React we didn't even feel a need for using the extra UI5 Web Component - React wrapper.
- Preact and HTM are awesome, especially if you look for something really simple, it can be used with build tools or completely client-standalone
- Doing routing yourself is a pretty simple thing, you may be able to do well without a thirdparty lib like (p)react-router
- Never try to argue against writing a test even if the scenario is meaningful - you might be surprised, and if not and you indeed found it has no value-added, you can still delete again :-P
- Golang has really some nice and interesting concepts like the way structs/classes are done
- Golang does not have try/catch, so error handling is really different

## License Info

### Music

Music was taken from https://www.freesoundslibrary.com/positive-funny-background-music-for-video-games/

```
"Free Sounds Library"
Free Sound Effects Site.
Licence: License: Attribution 4.0 International (CC BY 4.0). You are allowed to use sound effects free of charge and royalty free in your multimedia projects for commercial or non-commercial purposes.
```

- http://www.freesoundslibrary.com
- https://creativecommons.org/licenses/by/4.0/
- https://creativecommons.org/licenses/by/4.0/legalcode

### Visuals

- Avatats are standard built emojis
- Cloud Curriculum and Agile+Cloud Development Competencies logo are our own logo
- Other visuals are taken from https://pixabay.com/ or from https://freesvg.org/ and subject to the licenses below

```
Simplified Pixabay License (https://pixabay.com/service/license/)
Our license empowers creators and protects our community. We want to keep it as simple as possible. Here is an overview of what Pixabay content can and can't be used for.

What is allowed?
✓	All content on Pixabay can be used for free for commercial and noncommercial use across print and digital, except in the cases mentioned in "What is not allowed".
✓	Attribution is not required. Giving credit to the contributor or Pixabay is not necessary but is always appreciated by our community.
✓	You can make modifications to content from Pixabay.
What is not allowed?
This section only applies to image users and not to the appropriate image authors.

✕	Don't redistribute or sell someone else's Pixabay images or videos on other stock or wallpaper platforms.
✕	Don't sell unaltered copies of an image. e.g. sell an exact copy of a stock photo as a poster, print or on a physical product.
✕	Don't portray identifiable people in a bad light or in a way that is offensive.
✕	Don't use images with identifiable brands to create a misleading association with a product or service.
```

```
CC0 1.0 Universal (CC0 1.0) (https://creativecommons.org/publicdomain/zero/1.0/)
Public Domain Dedication
This is a human-readable summary of the Legal Code (full text: https://creativecommons.org/publicdomain/zero/1.0/legalcode).

No Copyright
The person who associated a work with this deed has dedicated the work to the public domain by waiving all of his or her rights to the work worldwide under copyright law, including all related and neighboring rights, to the extent allowed by law.

You can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission. See Other Information below.
```
