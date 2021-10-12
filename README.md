# gorilla

A multi-person interactive quiz app: https://acdc-gorilla.cfapps.sap.hana.ondemand.com/ (sso required)

The name is to honor the [first computer game of which one of the authors looked and debugged into the source code](https://archive.org/details/GorillasQbasic).

## Add New Quiz?

All quizzes are located in [/quiz](https://github.tools.sap/acdc/gorilla/tree/master/quiz) folder as JSON file. New quiz can be added by [sending a pull request](https://github.tools.sap/acdc/gorilla/new/master/quiz). 

## Dev How-To

After cloning you can:
- Copy `.env.sample` to `.env.dev`
  - Assign values to environment variables in `.env.dev`
- Run the tests: `npm test`
- Start the server: `npm run dev`

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

**Things we're still trying out or want to try out**
- Golang as alternative server implementation
- Zero-Downtime deployment of a stateful app
- CD pipeline with bare shell script and without extra tools, can try Github Actions or even do our own CD server

**Our findings**
- Most of the technology vendor try to sell you their tools as necessary to keep things simple or performant. They try to sell you that things are hard to do yourself, and therefore you need their stuff to do "magic". None of it is true.
  - Our Node server only needs Express and socket.io, and since we're not using much of them, we could even consider getting rid of them entirely, especially socket.io if we purely switch to WebSockets
  - Our UI only needs React, a JSX compiler, a QR code generator and the socket.io client. As mentioned we could and probably will eliminate socket.io later. The JSX compiler is nice to have because we like JSX, but we could absolutely do without if we wanted to. And QR code...well, we're just lazy, but even [generating a QR code yourself is a fairly simple thing](https://medium.com/@facucarbonel_97514/how-to-create-a-qr-generator-using-javascript-4b5ce1b6ec27), and probably later we will give it a go
  - Installing a Git hook is a one-liner
  - Doing a zero-downtime deployment is just 5 lines of shell script
  - There is no ugly or complex thing in our code despite all these tools we are _not_ using, and our app is super fast
- Emojis are a super nice source of visuals, using SVG you can also include them directly as [svg-favicon](public/favicon.svg)
- On iPhone (and probably also Android), you cannot control the volume from the page, as volume control is always left to the user through the hardware buttons
- There's a nasty extra thing at least on iPhone that can cause rendering glitches for your responsive app: if the native browser navigation buttons like back/forward/share/bookmarks are displayed on your phone, they influence the viewport. There's a height difference between the visual viewport (`window.visualViewport`) and the viewport, which can cause y-positioning to be slightly off. Be aware of that especially if you use the css3 `vh` property! If you're able to use `%` instead, it might fix the issue!
- Safari Tech Preview allows you to connect the Web Inspector from your Laptop directly to the Safari browser on your iPhone, so you can debug and deeply analyze those nasty issues that you cannot reproduce using simulators
- CSS animations are a hell load of fun
- ES6 modules and JSX don't work nicely together, but you have nice options
- Compiling JSX is a super duper fast, people claiming you need a server side build for such things are propbably just too much used to poorly crafted applications that are slow for millions of reasons, and therefore need questionable optimizations like server side build, minification, etc., all adding complexity - they would better just make their code clean instead, then it's fast without any extra thing on top
- Service worker is an amazing thing that can make your application loading fast like crazy and gives you full control over everything, without any questionable magic
- It's a bit tricky to get Service Worker configured correctly
  - If you have something like a compilation of JSX, that requires your application to bootstrap really only once the Service Worker is active - see https://stackoverflow.com/questions/68781638/service-worker-serviceworker-ready-event-waituntil-not-orchestrating-as-expec
  - When you're online, you probably want to update your cached resources in the Service Worker, consider deferring that a bit as otherwise it might delay the connection to your server for the data loading. _If you get that right your app can be rendering the UI AND data in less than 50ms_.
- Regular ES6 import has the drawback that it doesn't allow for lazy loading
- UI5 Web Components work really nice, and if you don't like server-side build tools you can load it as a [single-file bundle](https://sap.github.io/ui5-webcomponents/assets/js/ui5-webcomponents/bundle.es5.js (so if you're developing a Java app, you can use UI5 Web Components without being needed to use Node.js), and at least together with React we didn't even feel a need for using the extra UI5 Web Component - React wrapper.
- You can do zero-downtime deployment also if your app is stateful, and it's actually not complicated using sticky sessions ([also supported by CF](https://docs.cloudfoundry.org/concepts/http-routing.html#sessions)), if your app does gracefully shutdown correctly
- Preact and HTM are awesome, especially if you look for something really simple, it can be used with build tools or completely client-standalone
- Doing routing yourself is a pretty simple thing in React, you may be able to do well without a thirdparty lib like (p)react-router
- Never try to argue against writing a test :-P
- Monospace font does apply for emojis
- Golang has really some nice and interesting concepts like the way structs/classes are done
- Golang does not have try/catch, so error handling is really different
