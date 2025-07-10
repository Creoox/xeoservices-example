# xeoservices-example
This project is example how [xeoServices](https://docs.xeo.vision) can be used.
Main entrypoint is a simple CLI build with [yargs](https://yargs.js.org/)

## Hot to use this project

Install project dependencies

    pnpm install

Prepare .env file

    cp .env.example .env

Get `XEO_SERVICES_ACCESS_TOKEN` --> [Contact Us](https://docs.xeo.vision/contact/)

Check available options

    pnpm start --help

Pull xeoservices status:

    pnpm start health

Register conversion process

    pnpm start convert-ifc-xkt --input ./assets/Duplex.ifc

Check process status

    pnpm start check-process --process <process_id>
