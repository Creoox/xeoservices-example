#!/usr/bin/env node
import { checkProcessCommand, checkServicesHealthCommand, convertIfcXktCommand } from "./commands";
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';

const scriptName = 'xeoservices';
yargs(hideBin(process.argv))
  .scriptName(scriptName)
  .usage(`Usage: ${scriptName} <command> [options]`)
  .command(checkServicesHealthCommand)
  .command(convertIfcXktCommand)
  .command(checkProcessCommand)
  .help('help')
  .alias('help', 'h')
  .parse();
