const fs = require('fs');
const axios = require('axios');
const readline = require('readline');
const chalk = require('chalk');
const { WebhookClient, EmbedBuilder } = require('discord.js');

const CONFIG_PATH = './config.json';
const HISTORY_PATH = './history.json';
const API_URL = 'https://rugplay.com/api/gambling/coinflip';

let config = null;
let running = false;

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(chalk.cyan(`💡 ${question}`), answer => {
    rl.close();
    resolve(answer.trim());
  }));
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function showBanner() {
  console.clear();
  console.log(chalk.blue(`
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                                                                          ║
║  ██████╗ ██╗   ██╗ ██████╗ ██████╗ ██╗      █████╗ ██╗   ██╗    ██████╗  ██████╗ ████████╗                                               ║
║  ██╔══██╗██║   ██║██╔════╝ ██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝    ██╔══██╗██╔═══██╗╚══██╔══╝                                               ║
║  ██████╔╝██║   ██║██║  ███╗██████╔╝██║     ███████║ ╚████╔╝     ██████╔╝██║   ██║   ██║                                                  ║
║  ██╔══██╗██║   ██║██║   ██║██╔═══╝ ██║     ██╔══██║  ╚██╔╝      ██╔══██╗██║   ██║   ██║                                                  ║
║  ██║  ██║╚██████╔╝╚██████╔╝██║     ███████╗██║  ██║   ██║       ██████╔╝╚██████╔╝   ██║                                                  ║
║  ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝       ╚═════╝  ╚═════╝    ╚═╝                                                  ║
║                                                                                                                                          ║
║                                      🎯 Enhanced Smart Coinflip Bot v2.0 🎯                                                             ║
║                                                                                                                                          ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
  `));
}

function showMainMenu() {
  console.log(chalk.yellow("\n🎮 Main Menu:"));
  console.log(chalk.white("1. 🎯 Start Bot"));
  console.log(chalk.white("2. ⚙️  Configure Settings"));
  console.log(chalk.white("3. 📊 View Statistics"));
  console.log(chalk.white("4. 🗂️  View/Clear History"));
  console.log(chalk.white("5. ❌ Exit"));
  console.log(chalk.gray("─".repeat(50)));
}

function showConfigMenu() {
  console.log(chalk.yellow("\n⚙️ Configuration Menu:"));
  console.log(chalk.white("1. 🎲 Basic Settings (Bet, Max Bet, etc.)"));
  console.log(chalk.white("2. 🛡️  Safety Settings (Stop Loss, Win Streak, etc.)"));
  console.log(chalk.white("3. 🔗 Connection Settings (Cookie, Webhook)"));
  console.log(chalk.white("4. 📋 View Current Config"));
  console.log(chalk.white("5. 🔄 Reset Configuration"));
  console.log(chalk.white("6. 🔙 Back to Main Menu"));
  console.log(chalk.gray("─".repeat(50)));
}

async function configureBasicSettings() {
  console.log(chalk.cyan("\n🎲 Basic Bot Configuration:"));
  
  const side = await prompt("Preferred side (heads/tails) [default: heads]: ") || 'heads';
  const initialBet = parseFloat(await prompt("Initial bet amount: "));
  const maxBet = parseFloat(await prompt("Maximum bet amount: "));
  const maxAttempts = parseInt(await prompt("Maximum attempts (0 = unlimited): ")) || 0;
  const bettingStrategy = await prompt("Betting strategy (martingale/conservative/aggressive) [default: conservative]: ") || 'conservative';
  const delayBetween = parseInt(await prompt("Delay between bets in milliseconds [default: 1500]: ")) || 1500;
  
  return {
    side,
    initialBet,
    maxBet,
    maxAttempts,
    bettingStrategy,
    delayBetween
  };
}

async function configureSafetySettings() {
  console.log(chalk.cyan("\n🛡️ Safety Configuration:"));
  
  const maxLossStreak = parseInt(await prompt("Maximum loss streak before stopping: "));
  const stopOnWinStreak = parseInt(await prompt("Stop after win streak (0 = disabled): ")) || 0;
  const stopProfit = parseFloat(await prompt("Stop at profit amount (0 = disabled): ")) || 0;
  const stopLoss = parseFloat(await prompt("Stop at loss amount (0 = disabled): ")) || 0;
  const pauseOnLoss = await prompt("Pause after each loss? (y/n) [default: n]: ") === 'y';
  const emergencyStop = parseFloat(await prompt("Emergency stop at balance threshold (0 = disabled): ")) || 0;
  const targetBalance = parseFloat(await prompt("Stop when balance reaches this amount (0 = disabled): ")) || 0;
  
  return {
    maxLossStreak,
    stopOnWinStreak,
    stopProfit,
    stopLoss,
    pauseOnLoss,
    emergencyStop,
    targetBalance
  };
}

async function configureConnectionSettings() {
  console.log(chalk.cyan("\n🔗 Connection Configuration:"));
  
  const cookie = await prompt("RugPlay authentication cookie: ");
  const webhook = await prompt("Discord webhook URL: ");
  const sendDetailedLogs = await prompt("Send detailed logs to Discord? (y/n) [default: y]: ") !== 'n';
  
  return {
    cookie,
    webhook,
    sendDetailedLogs
  };
}

function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_PATH));
    } catch (e) {
      console.warn(chalk.yellow("⚠️ Failed to load config, using defaults."));
      return null;
    }
  }
  return null;
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  console.log(chalk.green("✅ Configuration saved successfully!"));
}

function viewCurrentConfig() {
  const config = loadConfig();
  if (!config) {
    console.log(chalk.red("❌ No configuration found. Please configure the bot first."));
    return;
  }
  
  console.log(chalk.cyan("\n📋 Current Configuration:"));
  console.log(chalk.white("Basic Settings:"));
  console.log(`  Side: ${config.side || 'heads'}`);
  console.log(`  Initial Bet: ${config.initialBet || 'Not set'}`);
  console.log(`  Max Bet: ${config.maxBet || 'Not set'}`);
  console.log(`  Max Attempts: ${config.maxAttempts || 'Unlimited'}`);
  console.log(`  Strategy: ${config.bettingStrategy || 'conservative'}`);
  console.log(`  Delay: ${config.delayBetween || 1500}ms`);
  
  console.log(chalk.white("\nSafety Settings:"));
  console.log(`  Max Loss Streak: ${config.maxLossStreak || 'Not set'}`);
  console.log(`  Stop on Win Streak: ${config.stopOnWinStreak || 'Disabled'}`);
  console.log(`  Stop Profit: ${config.stopProfit || 'Disabled'}`);
  console.log(`  Stop Loss: ${config.stopLoss || 'Disabled'}`);
  console.log(`  Emergency Stop: ${config.emergencyStop || 'Disabled'}`);
  console.log(`  Target Balance: ${config.targetBalance || 'Disabled'}`);
  
  console.log(chalk.white("\nConnection:"));
  console.log(`  Cookie: ${config.cookie ? '✅ Set' : '❌ Not set'}`);
  console.log(`  Webhook: ${config.webhook ? '✅ Set' : '❌ Not set'}`);
}

function viewStatistics() {
  if (!fs.existsSync(HISTORY_PATH)) {
    console.log(chalk.red("❌ No history data found."));
    return;
  }
  
  const history = JSON.parse(fs.readFileSync(HISTORY_PATH));
  if (history.length === 0) {
    console.log(chalk.red("❌ No trading history available."));
    return;
  }
  
  const wins = history.filter(h => h.result === 'win').length;
  const losses = history.filter(h => h.result === 'loss').length;
  const totalProfit = history[history.length - 1].profit || 0;
  const winRate = ((wins / (wins + losses)) * 100).toFixed(1);
  
  console.log(chalk.cyan("\n📊 Statistics:"));
  console.log(`Total Trades: ${history.length}`);
  console.log(`Wins: ${chalk.green(wins)}`);
  console.log(`Losses: ${chalk.red(losses)}`);
  console.log(`Win Rate: ${chalk.magenta(winRate)}%`);
  console.log(`Total Profit: ${totalProfit >= 0 ? chalk.green('+') : chalk.red('')}${totalProfit.toFixed(2)}`);
  console.log(`Last Balance: ${history[history.length - 1].balance}`);
}

function predictNextSide(history, strategy = 'conservative') {
  const recent = history.slice(-10);
  const heads = recent.filter(e => e.side === 'heads' && e.result === 'win').length;
  const tails = recent.filter(e => e.side === 'tails' && e.result === 'win').length;
  
  switch (strategy) {
    case 'martingale':
      return Math.random() < 0.5 ? 'heads' : 'tails';
    case 'aggressive':
      return heads > tails ? 'heads' : 'tails';
    default: 
      if (Math.abs(heads - tails) < 2) return Math.random() < 0.5 ? 'heads' : 'tails';
      return heads > tails ? 'tails' : 'heads';
  }
}

function calculateNextBet(currentBet, initialBet, maxBet, winStreak, lossStreak, strategy) {
  let nextBet = currentBet;
  
  switch (strategy) {
    case 'martingale':
      nextBet = lossStreak > 0 ? currentBet * 2 : initialBet;
      break;
    case 'aggressive':
      nextBet = winStreak > 0 ? currentBet * 1.5 : initialBet * Math.pow(2, lossStreak);
      break;
    default: 
      if (winStreak > 0) {
        nextBet = initialBet * Math.pow(1.2, winStreak);
      } else if (lossStreak >= 2) {
        nextBet = initialBet;
      }
      break;
  }
  
  return Math.max(initialBet, Math.min(nextBet, maxBet));
}

async function sendBet(side, amount, cookie) {
  try {
    const res = await axios.post(API_URL, { side, amount }, {
      headers: { Cookie: cookie, 'Content-Type': 'application/json' }
    });
    return res.data;
  } catch (err) {
    console.error(chalk.red("❌ API Request Failed:"), err.response?.data || err.message);
    return null;
  }
}

function makeEmbed(res, actualSide, bet, winStreak, lossStreak, wins, losses, balanceCurrent, balanceStart, attempts, maxAttempts, config) {
  const profit = balanceCurrent - balanceStart;
  const netProfit = profit.toFixed(2);
  const winPercent = ((wins / (wins + losses)) * 100).toFixed(1);

  return new EmbedBuilder()
    .setTitle("🎯 Smart Investor Running")
    .setColor(res.won ? 0x57F287 : 0xED4245)
    .addFields(
      { name: "Result", value: `${res.result.toUpperCase()} — ${res.won ? "✅ Win" : "❌ Loss"}`, inline: true },
      { name: "Bet", value: `${bet.toFixed(2)}`, inline: true },
      { name: "Side", value: `${actualSide.toUpperCase()}`, inline: true },
      { name: "Win Streak", value: `${winStreak}`, inline: true },
      { name: "Loss Streak", value: `${lossStreak}`, inline: true },
      { name: "Win Rate", value: `${winPercent}%`, inline: true },
      { name: "Balance", value: `${balanceCurrent.toFixed(2)}`, inline: true },
      { name: "Net Profit", value: `${netProfit >= 0 ? '+' : ''}${netProfit}`, inline: true },
      { name: "Attempts", value: `${attempts}${maxAttempts ? `/${maxAttempts}` : ''}`, inline: true }
    )
    .setFooter({ text: `Strategy: ${config.bettingStrategy} | Max Bet: ${config.maxBet}` })
    .setTimestamp();
}

async function runBot() {
  config = loadConfig();
  if (!config || !config.cookie || !config.webhook || !config.initialBet) {
    console.log(chalk.red("❌ Bot not configured properly. Please configure first."));
    return;
  }

  const webhookClient = new WebhookClient({ url: config.webhook });
  const { 
    side, initialBet, maxBet, maxAttempts, maxLossStreak, stopProfit, stopLoss, 
    cookie, bettingStrategy, delayBetween, stopOnWinStreak, emergencyStop, pauseOnLoss 
  } = config;

  let currentBet = initialBet;
  let attempts = 0, lossStreak = 0, winStreak = 0, wins = 0, losses = 0;
  let balanceStart = null, balanceCurrent = null;
  let totalLoss = 0;

  let history = fs.existsSync(HISTORY_PATH) ? JSON.parse(fs.readFileSync(HISTORY_PATH)) : [];

  running = true;
  console.log(chalk.yellow("🚀 Starting Enhanced Smart Investor Bot...\n"));

  while (running) {
    if (maxAttempts && attempts >= maxAttempts) {
      console.log(chalk.yellow("🛑 Maximum attempts reached!"));
      break;
    }
    if (lossStreak >= maxLossStreak) {
      console.log(chalk.red("🛑 Maximum loss streak reached!"));
      break;
    }
    if (stopOnWinStreak && winStreak >= stopOnWinStreak) {
      console.log(chalk.green("🎯 Win streak target reached!"));
      break;
    }
    if (config.targetBalance && balanceCurrent !== null && balanceCurrent >= config.targetBalance) {
      console.log(chalk.green(`🏁 Target balance of ${config.targetBalance} reached!`));
      break;
    }
    if (balanceCurrent !== null) {
      const currentProfit = balanceCurrent - balanceStart;
      const currentLoss = balanceStart - balanceCurrent;
      
      if (stopProfit && currentProfit >= stopProfit) {
        console.log(chalk.green("🎯 Profit target reached!"));
        break;
      }
      if (stopLoss && currentLoss >= stopLoss) {
        console.log(chalk.red("🛑 Stop loss triggered!"));
        break;
      }
      if (emergencyStop && balanceCurrent <= emergencyStop) {
        console.log(chalk.red("🚨 Emergency stop triggered!"));
        break;
      }
    }

    const actualSide = config.side || predictNextSide(history, bettingStrategy);
    const bet = Math.min(currentBet, maxBet);
    
    console.log(chalk.cyan(`\n🎲 Attempt ${attempts + 1}: Betting ${bet.toFixed(2)} on ${actualSide.toUpperCase()}`));

    const res = await sendBet(actualSide, bet, cookie);
    if (!res) {
      console.log(chalk.red("❌ Failed to place bet. Stopping bot."));
      break;
    }

    if (balanceStart === null) balanceStart = res.newBalance + res.amountWagered;
    balanceCurrent = res.newBalance;
    attempts++;

    if (res.won) {
      wins++;
      lossStreak = 0;
      winStreak++;
      console.log(chalk.green(`✅ WIN! Result: ${res.result.toUpperCase()} | Payout: ${res.payout.toFixed(2)}`));
    } else {
      losses++;
      lossStreak++;
      winStreak = 0;
      totalLoss += bet;
      console.log(chalk.red(`❌ LOSS! Result: ${res.result.toUpperCase()}`));
      
      if (pauseOnLoss) {
        await prompt("Press Enter to continue after loss...");
      }
    }

    currentBet = calculateNextBet(currentBet, initialBet, maxBet, winStreak, lossStreak, bettingStrategy);

    const profit = balanceCurrent - balanceStart;
    history.push({
      timestamp: new Date().toISOString(),
      side: actualSide,
      result: res.won ? 'win' : 'loss',
      amount: bet,
      balance: +balanceCurrent.toFixed(2),
      profit: +profit.toFixed(2)
    });
    
    if (history.length > 10000) {
      history = history.slice(-10000);
    }
    fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));

    if (config.sendDetailedLogs) {
      const embed = makeEmbed(res, actualSide, bet, winStreak, lossStreak, wins, losses, balanceCurrent, balanceStart, attempts, maxAttempts, config);
      try {
        await webhookClient.send({ embeds: [embed] });
      } catch (err) {
        console.warn(chalk.yellow("⚠️ Failed to send Discord webhook"));
      }
    }

    console.log(chalk.gray("─".repeat(60)));
    console.log(`${res.won ? chalk.green('✅ Win') : chalk.red('❌ Loss')} | Bet: ${chalk.yellow(bet.toFixed(2))} | Balance: ${chalk.cyan(balanceCurrent.toFixed(2))} | Net: ${profit >= 0 ? chalk.green('+') : chalk.red('')}${chalk.bold(profit.toFixed(2))} | Win%: ${chalk.magenta(((wins / (wins + losses)) * 100).toFixed(1))}%`);
    console.log(`Win Streak: ${chalk.green(winStreak)} | Loss Streak: ${chalk.red(lossStreak)} | Next Bet: ${chalk.yellow(currentBet.toFixed(2))} | Total: ${chalk.blue(wins)}W/${chalk.red(losses)}L`);
    console.log(chalk.gray("─".repeat(60)));

    await delay(delayBetween);
  }

  if (balanceCurrent !== null) {
    const finalProfit = balanceCurrent - balanceStart;
    const summary = new EmbedBuilder()
      .setTitle("📊 Final Trading Summary")
      .setColor(finalProfit >= 0 ? 0x57F287 : 0xED4245)
      .addFields(
        { name: "Total Attempts", value: `${attempts}`, inline: true },
        { name: "Wins", value: `${wins}`, inline: true },
        { name: "Losses", value: `${losses}`, inline: true },
        { name: "Final Balance", value: `${balanceCurrent.toFixed(2)}`, inline: true },
        { name: "Net Profit", value: `${finalProfit >= 0 ? '+' : ''}${finalProfit.toFixed(2)}`, inline: true },
        { name: "Win Rate", value: `${((wins / (wins + losses)) * 100).toFixed(1)}%`, inline: true },
        { name: "Strategy Used", value: `${bettingStrategy}`, inline: true }
      )
      .setTimestamp();
    
    try {
      await webhookClient.send({ embeds: [summary] });
    } catch (err) {
      console.warn(chalk.yellow("⚠️ Failed to send final summary"));
    }

    console.log(chalk.green("\n✅ Session completed successfully!"));
    console.log(chalk.blue("📈 Final Balance:"), chalk.yellow(balanceCurrent.toFixed(2)));
    console.log(chalk.blue("💰 Net Profit:"), finalProfit >= 0 ? chalk.green(`+${finalProfit.toFixed(2)}`) : chalk.red(finalProfit.toFixed(2)));
    console.log(chalk.blue("🎯 Win Rate:"), chalk.magenta(`${((wins / (wins + losses)) * 100).toFixed(1)}%`));
    console.log(chalk.blue("📊 Total Trades:"), chalk.white(`${attempts} (${wins}W/${losses}L)`));
  }

  running = false;
}

async function mainLoop() {
  showBanner();
  
  while (true) {
    showMainMenu();
    const choice = await prompt("Select option: ");
    
    switch (choice) {
      case '1':
        await runBot();
        break;
      case '2':
        await configurationLoop();
        break;
      case '3':
        viewStatistics();
        break;
      case '4':
        await historyLoop();
        break;
      case '5':
        console.log(chalk.yellow("👋 Goodbye!"));
        process.exit(0);
        break;
      default:
        console.log(chalk.red("❌ Invalid option. Please try again."));
    }
    
    if (choice !== '2' && choice !== '4') {
      await prompt("Press Enter to continue...");
    }
  }
}

async function configurationLoop() {
  let config = loadConfig() || {};
  
  while (true) {
    showConfigMenu();
    const choice = await prompt("Select option: ");
    
    switch (choice) {
      case '1':
        const basicSettings = await configureBasicSettings();
        config = { ...config, ...basicSettings };
        saveConfig(config);
        break;
      case '2':
        const safetySettings = await configureSafetySettings();
        config = { ...config, ...safetySettings };
        saveConfig(config);
        break;
      case '3':
        const connectionSettings = await configureConnectionSettings();
        config = { ...config, ...connectionSettings };
        saveConfig(config);
        break;
      case '4':
        viewCurrentConfig();
        break;
      case '5':
        if (await prompt("Are you sure you want to reset all configuration? (y/n): ") === 'y') {
          if (fs.existsSync(CONFIG_PATH)) {
            fs.unlinkSync(CONFIG_PATH);
            console.log(chalk.green("✅ Configuration reset successfully!"));
          }
        }
        break;
      case '6':
        return;
      default:
        console.log(chalk.red("❌ Invalid option. Please try again."));
    }
    
    if (choice !== '4') {
      await prompt("Press Enter to continue...");
    }
  }
}

async function historyLoop() {
  while (true) {
    console.log(chalk.yellow("\n🗂️ History Management:"));
    console.log(chalk.white("1. 📊 View Recent History"));
    console.log(chalk.white("2. 🗑️  Clear History"));
    console.log(chalk.white("3. 💾 Export History"));
    console.log(chalk.white("4. 🔙 Back to Main Menu"));
    console.log(chalk.gray("─".repeat(50)));
    
    const choice = await prompt("Select option: ");
    
    switch (choice) {
      case '1':
        viewStatistics();
        break;
      case '2':
        if (await prompt("Are you sure you want to clear all history? (y/n): ") === 'y') {
          if (fs.existsSync(HISTORY_PATH)) {
            fs.unlinkSync(HISTORY_PATH);
            console.log(chalk.green("✅ History cleared successfully!"));
          }
        }
        break;
      case '3':
        if (fs.existsSync(HISTORY_PATH)) {
          const exportPath = `./history_export_${Date.now()}.json`;
          fs.copyFileSync(HISTORY_PATH, exportPath);
          console.log(chalk.green(`✅ History exported to ${exportPath}`));
        } else {
          console.log(chalk.red("❌ No history to export."));
        }
        break;
      case '4':
        return;
      default:
        console.log(chalk.red("❌ Invalid option. Please try again."));
    }
    
    if (choice !== '1') {
      await prompt("Press Enter to continue...");
    }
  }
}

process.on('SIGINT', () => {
  console.log(chalk.yellow('\n🛑 Gracefully shutting down...'));
  running = false;
  process.exit(0);
});

mainLoop().catch(err => {
  console.error(chalk.red('💥 Fatal Error:'), err.message);
  process.exit(1);
});