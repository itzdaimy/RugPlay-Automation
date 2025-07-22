const prompts = require("prompts");
const chalk = require("chalk");
const gradient = require("gradient-string");
const { spawn } = require("child_process");

function logHeader() {
  console.clear();
  console.log(gradient.pastel.multiline(`
╔════════════════════════════════════════════╗
║         RugPlay Automation Launcher        ║
╚════════════════════════════════════════════╝
`));
}

async function main() {
  logHeader();

  const { script } = await prompts({
    type: "select",
    name: "script",
    message: "Choose your mode",
    choices: [
      { title: "🎯 Coinflip Mode", value: "coinflip.js" },
      { title: "🎰 Slots Mode", value: "slots.js" },
      { title: "❌ Exit", value: "exit" },
    ],
  });

  if (!script || script === "exit") {
    console.log(chalk.yellow("👋 Goodbye!"));
    process.exit(0);
  }

  const child = spawn("node", [script], { stdio: "inherit" });

  child.on("exit", (code) => {
    console.log(chalk.yellow(`\n⚙️  ${script} exited with code ${code}`));
    process.exit(code);
  });
}

main().catch(err => {
    console.log(chalk.red('An unexpected error occurred.', err));
    process.exit(1);
});
