const readline = require('readline');
const chalk = require('chalk');
const { spawn } = require('child_process');

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(chalk.cyan(`💡 ${question}`), answer => {
    rl.close();
    resolve(answer.trim());
  }));
}

async function main() {
  console.clear();
  console.log(chalk.magenta.bold(`\n🎰 RugPlay Automation Launcher 🎯`));
  console.log(chalk.gray("────────────────────────────────────────────"));
  console.log(chalk.white("1. 🎯 Coinflip Mode"));
  console.log(chalk.white("2. 🎰 Slots Mode"));
  console.log(chalk.white("3. ❌ Exit"));

  const choice = await prompt("\n👉 Choose your mode (1/2/3): ");

  let script = null;

  switch (choice) {
    case '1':
      script = 'coinflip.js';
      break;
    case '2':
      script = 'slots.js';
      break;
    case '3':
      console.log(chalk.yellow("👋 Exiting..."));
      process.exit(0);
    default:
      console.log(chalk.red("❌ Invalid choice."));
      process.exit(1);
  }

  const child = spawn('node', [script], { stdio: 'inherit' });

  child.on('exit', (code) => {
    console.log(chalk.yellow(`\n⚙️ ${script} exited with code ${code}`));
    process.exit(code);
  });
}

main();
