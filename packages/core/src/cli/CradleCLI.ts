#!/usr/bin/env node
import yargs from 'yargs'

/**
 * The Cradle CLI supports the following commands
 * @param [Emit](_cli_commands_emit_.md)
 * @param [Verify](_cli_commands_verify_.md)
 */

/** @ignore */
export const argv = yargs
  .commandDir('./commands')
  .demandCommand()
  .help().argv
