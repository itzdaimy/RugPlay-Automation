const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const chalk = require("chalk");
const gradient = require("gradient-string");
const prompts = require("prompts");
const { WebhookClient, EmbedBuilder } = require("discord.js");

const CONFIG_PATH = path.join(__dirname, "config.json");
const HISTORY_PATH = path.join(__dirname, "history.json");
const API_URL = "https://rugplay.com/api/gambling/coinflip";

let config = {};
let running = false;

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function logHeader(title) {
  console.clear();
  const styledTitle = title.padEnd(38, " ").padStart(44, " ");
  console.log(gradient.pastel.multiline(`
╔════════════════════════════════════════════╗
║${styledTitle}║
╚════════════════════════════════════════════╝
`));
}

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return fs.readJsonSync(CONFIG_PATH);
    }
  } catch (e) {
    console.log(chalk.yellow("⚠️  Could not read config.json, using defaults."));
  }
  return {};
}

function saveConfig() {
  fs.writeJsonSync(CONFIG_PATH, config, { spaces: 2 });
}

async function configureSettings() {
    while (true) {
        logHeader("Configuration Menu");
        const { choice } = await prompts({
            type: 'select',
            name: 'choice',
            message: 'What do you want to configure?',
            choices: [
                { title: '🎲 Basic Settings', value: 'basic' },
                { title: '🛡️ Safety Settings', value: 'safety' },
                { title: '🔗 Connection Settings', value: 'connection' },
                { title: '📋 View Current Config', value: 'view' },
                { title: '🔙 Back to Main Menu', value: 'back' }
            ]
        });

        if (choice === 'back' || !choice) return;

        switch (choice) {
            case 'basic':
                const basicResponses = await prompts([
                    { type: 'select', name: 'side', message: 'Preferred side', choices: [{title: 'Heads', value: 'heads'}, {title: 'Tails', value: 'tails'}]},
                    { type: 'number', name: 'initialBet', message: 'Initial bet amount', initial: config.initialBet || 1 },
                    { type: 'number', name: 'maxBet', message: 'Maximum bet amount', initial: config.maxBet || 100 },
                    { type: 'select', name: 'bettingStrategy', message: 'Betting strategy', choices: [{title: 'Conservative', value: 'conservative'}, {title: 'Martingale', value: 'martingale'}, {title: 'Aggressive', value: 'aggressive'}]},
                    { type: 'number', name: 'delayBetween', message: 'Delay between bets (ms)', initial: config.delayBetween || 1500 }
                ]);
                config = { ...config, ...basicResponses };
                break;
            case 'safety':
                const safetyResponses = await prompts([
                    { type: 'number', name: 'maxLossStreak', message: 'Stop after loss streak of', initial: config.maxLossStreak || 10 },
                    { type: 'number', name: 'stopOnWinStreak', message: 'Stop after win streak of (0 to disable)', initial: config.stopOnWinStreak || 0 },
                    { type: 'number', name: 'stopProfit', message: 'Stop at profit amount (0 to disable)', initial: config.stopProfit || 0 },
                    { type: 'number', name: 'stopLoss', message: 'Stop at loss amount (0 to disable)', initial: config.stopLoss || 0 }
                ]);
                config = { ...config, ...safetyResponses };
                break;
            case 'connection':
                const connectionResponses = await prompts([
                    { type: 'text', name: 'cookie', message: 'RugPlay authentication cookie', initial: config.cookie },
                    { type: 'text', name: 'webhook', message: 'Discord webhook URL (optional)', initial: config.webhook }
                ]);
                config = { ...config, ...connectionResponses };
                break;
            case 'view':
                logHeader("Current Configuration");
                console.log(chalk.cyan(JSON.stringify(config, null, 2)));
                await prompts({ type: 'toggle', name: 'c', message: 'Return to menu?', active: 'Yes', inactive: 'No', initial: true });
                continue;
        }
        saveConfig();
        console.log(chalk.green('✔ Configuration saved!'));
        await delay(1000);
    }
}

function viewStatistics() {
    logHeader("Statistics");
    if (!fs.existsSync(HISTORY_PATH)) {
        console.log(chalk.red("❌ No history data found."));
        return;
    }
    const history = fs.readJsonSync(HISTORY_PATH);
    if (history.length === 0) {
        console.log(chalk.red("❌ No trading history available."));
        return;
    }
    const wins = history.filter(h => h.result === 'win').length;
    const losses = history.filter(h => h.result === 'loss').length;
    const totalProfit = history.reduce((acc, h) => acc + (h.payout - h.amount), 0);
    const winRate = wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : 0;

    console.log(`Total Trades: ${chalk.yellow(history.length)}`);
    console.log(`Wins: ${chalk.green(wins)}`);
    console.log(`Losses: ${chalk.red(losses)}`);
    console.log(`Win Rate: ${chalk.magenta(winRate)}%`);
    console.log(`Total Profit: ${totalProfit >= 0 ? chalk.green('+') : chalk.red('')}${chalk.bold(totalProfit.toFixed(2))}`);
}

async function manageHistory() {
    logHeader("History Management");
    const { clear } = await prompts({
        type: 'toggle',
        name: 'clear',
        message: 'Are you sure you want to clear all history?',
        active: 'Yes',
        inactive: 'No',
        initial: false
    });

    if (clear) {
        if (fs.existsSync(HISTORY_PATH)) {
            fs.removeSync(HISTORY_PATH);
            console.log(chalk.green("✔ History cleared successfully!"));
        } else {
            console.log(chalk.yellow("No history file to clear."));
        }
    }
    await delay(1500);
}

function predictNextSide(history, strategy = 'conservative') {
  const recent = history.slice(-10);
  const heads = recent.filter(e => e.side === 'heads' && e.result === 'win').length;
  const tails = recent.filter(e => e.side === 'tails' && e.result === 'win').length;
  switch (strategy) {
    case 'martingale': return Math.random() < 0.5 ? 'heads' : 'tails';
    case 'aggressive': return heads > tails ? 'heads' : 'tails';
    default:
      if (Math.abs(heads - tails) < 2) return Math.random() < 0.5 ? 'heads' : 'tails';
      return heads > tails ? 'tails' : 'heads';
  }
}

function calculateNextBet(currentBet, initialBet, maxBet, winStreak, lossStreak, strategy) {
  let nextBet = currentBet;
  switch (strategy) {
    case 'martingale': nextBet = lossStreak > 0 ? currentBet * 2 : initialBet; break;
    case 'aggressive': nextBet = winStreak > 0 ? currentBet * 1.5 : initialBet * Math.pow(2, lossStreak); break;
    default:
      if (winStreak > 0) nextBet = initialBet * Math.pow(1.2, winStreak);
      else if (lossStreak >= 2) nextBet = initialBet;
      break;
  }
  return Math.max(initialBet, Math.min(nextBet, maxBet));
}

async function sendBet(side, amount, cookie) {
  try {
    const res = await axios.post(API_URL, { side, amount }, { headers: { Cookie: cookie, 'Content-Type': 'application/json' }});
    return res.data;
  } catch (err) {
    console.error(chalk.red("❌ API Request Failed:"), err.response?.data?.message || err.message);
    return null;
  }
}

function makeEmbed(data) {
    const { res, side, bet, stats, balance } = data;
    const profit = balance.current - balance.start;
    const winPercent = stats.wins + stats.losses > 0 ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1) : "0.0";
    return new EmbedBuilder()
        .setTitle("Coinflip Result")
        .setColor(res.won ? 0x57F287 : 0xED4245)
        .addFields(
            { name: "Result", value: `${res.won ? "✅ Win" : "❌ Loss"}`, inline: true },
            { name: "Bet", value: `${bet.toFixed(2)} on ${side}`, inline: true },
            { name: "Payout", value: `${res.payout.toFixed(2)}`, inline: true },
            { name: "Streaks", value: `W: ${stats.winStreak} / L: ${stats.lossStreak}`, inline: true },
            { name: "Win Rate", value: `${winPercent}%`, inline: true },
            { name: "Balance", value: `${balance.current.toFixed(2)}`, inline: true },
            { name: "Net Profit", value: `${profit >= 0 ? '+' : ''}${profit.toFixed(2)}`, inline: true }
        )
        .setFooter({ text: `Strategy: ${config.bettingStrategy}` })
        .setTimestamp();
}

async function runBot() {
    logHeader("Coinflip Bot Running");
    if (!config.cookie || !config.initialBet) {
        console.log(chalk.red("❌ Bot not configured. Please set cookie and bet amounts."));
        await delay(2000);
        return;
    }

    const webhookClient = config.webhook ? new WebhookClient({ url: config.webhook }) : null;
    const { initialBet, maxBet, maxLossStreak, stopProfit, stopLoss, bettingStrategy, delayBetween, stopOnWinStreak } = config;
    
    let currentBet = initialBet;
    let stats = { lossStreak: 0, winStreak: 0, wins: 0, losses: 0, attempts: 0 };
    let balance = { start: null, current: null };
    let history = fs.existsSync(HISTORY_PATH) ? fs.readJsonSync(HISTORY_PATH) : [];
    running = true;

    console.log(chalk.cyanBright("🚀 Starting Coinflip Bot... Press CTRL+C to stop.\n"));

    while (running) {
        if (stats.lossStreak >= maxLossStreak) { console.log(chalk.red("🛑 Maximum loss streak reached!")); break; }
        if (stopOnWinStreak > 0 && stats.winStreak >= stopOnWinStreak) { console.log(chalk.green("🎯 Win streak target reached!")); break; }
        if (balance.current !== null) {
            const currentProfit = balance.current - balance.start;
            if (stopProfit > 0 && currentProfit >= stopProfit) { console.log(chalk.green("🎯 Profit target reached!")); break; }
            if (stopLoss > 0 && (balance.start - balance.current) >= stopLoss) { console.log(chalk.red("🛑 Stop loss triggered!")); break; }
        }

        const side = config.side || predictNextSide(history, bettingStrategy);
        const betAmount = Math.min(currentBet, maxBet);
        console.log(chalk.cyan(`\n🎲 Betting ${chalk.yellow(betAmount.toFixed(2))} on ${chalk.yellow(side.toUpperCase())}`));

        const res = await sendBet(side, betAmount, config.cookie);
        if (!res) { console.log(chalk.red("Stopping bot due to API error.")); break; }

        if (balance.start === null) balance.start = res.newBalance + res.amountWagered;
        balance.current = res.newBalance;
        stats.attempts++;

        if (res.won) {
            stats.wins++;
            stats.lossStreak = 0;
            stats.winStreak++;
            console.log(chalk.green(`✔ WIN! Payout: ${res.payout.toFixed(2)}`));
        } else {
            stats.losses++;
            stats.winStreak = 0;
            stats.lossStreak++;
            console.log(chalk.red(`✘ LOSS!`));
        }

        currentBet = calculateNextBet(currentBet, initialBet, maxBet, stats.winStreak, stats.lossStreak, bettingStrategy);
        const profit = balance.current - balance.start;
        const historyEntry = { timestamp: new Date().toISOString(), side, result: res.won ? 'win' : 'loss', amount: betAmount, payout: res.payout, balance: +balance.current.toFixed(2), profit: +profit.toFixed(2) };
        history.push(historyEntry);
        fs.writeJsonSync(HISTORY_PATH, history, { spaces: 2 });
        
        console.log(`${chalk.gray('─'.repeat(10))} Balance: ${chalk.cyan(balance.current.toFixed(2))} | Profit: ${profit >= 0 ? chalk.green('+') : chalk.red('')}${chalk.bold(profit.toFixed(2))} | Next Bet: ${chalk.yellow(currentBet.toFixed(2))} ${chalk.gray('─'.repeat(10))}`);

        if (webhookClient) {
            const embed = makeEmbed({ res, side, bet: betAmount, stats, balance });
            try { await webhookClient.send({ embeds: [embed] }); } 
            catch (err) { console.warn(chalk.yellow("⚠️ Failed to send Discord webhook")); }
        }

        await delay(delayBetween);
    }
    running = false;
    console.log(chalk.cyanBright("\n⏹️  Bot stopped."));
    await prompts({ type: 'toggle', name: 'c', message: 'Return to menu?', active: 'Yes', inactive: 'No', initial: true });
}

async function mainMenu() {
    config = loadConfig();
    while (true) {
        logHeader("Daimy's Coinflip Bot");
        const { action } = await prompts({
            type: "select",
            name: "action",
            message: "What do you want to do?",
            choices: [
                { title: "🚀 Start Bot", value: "start" },
                { title: "⚙️ Configure", value: "config" },
                { title: "📊 View Statistics", value: "stats" },
                { title: "🗂️ Manage History", value: "history" },
                { title: "❌ Exit", value: "exit" },
            ]
        });

        if (action === "exit" || !action) {
            console.log(chalk.gray("👋 Goodbye!"));
            break;
        }

        switch (action) {
            case "start": await runBot(); break;
            case "config": await configureSettings(); break;
            case "stats": 
                viewStatistics(); 
                await prompts({ type: 'toggle', name: 'c', message: 'Return to menu?', active: 'Yes', inactive: 'No', initial: true });
                break;
            case "history": await manageHistory(); break;
        }
    }
}

process.on('SIGINT', () => {
  if (running) {
    running = false;
    console.log(chalk.yellow('\n🛑 Gracefully shutting down...'));
  } else {
    process.exit(0);
  }
});

mainMenu().catch(err => {
    console.error(chalk.red('💥 Fatal Error:'), err.message);
    process.exit(1);
});
