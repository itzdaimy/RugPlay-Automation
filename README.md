# 🎯 RugPlay Smart Coinflip Bot

[![GitHub stars](https://img.shields.io/github/stars/itzdaimy/RugPlay-Automation?style=for-the-badge&logo=github&color=yellow)](https://github.com/itzdaimy/RugPlay-Automation/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/itzdaimy/RugPlay-Automation?style=for-the-badge&logo=github&color=blue)](https://github.com/itzdaimy/RugPlay-Automation/network)
[![GitHub issues](https://img.shields.io/github/issues/itzdaimy/RugPlay-Automation?style=for-the-badge&logo=github&color=red)](https://github.com/itzdaimy/RugPlay-Automation/issues)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Discord](https://img.shields.io/badge/Discord-Integration-7289da?style=for-the-badge&logo=discord)](https://discord.com/)

> 🚀 **Enhanced Smart Coinflip Bot v2.0** - An advanced automated trading bot for RugPlay's coinflip game with intelligent strategies, risk management, and real-time Discord notifications.

---

## 📊 Live Stats

![GitHub Activity](https://img.shields.io/github/commit-activity/m/itzdaimy/RugPlay-Automation?style=flat-square&color=brightgreen)
![GitHub last commit](https://img.shields.io/github/last-commit/itzdaimy/RugPlay-Automation?style=flat-square&color=blue)
![GitHub repo size](https://img.shields.io/github/repo-size/itzdaimy/RugPlay-Automation?style=flat-square&color=orange)
![GitHub watchers](https://img.shields.io/github/watchers/itzdaimy/RugPlay-Automation?style=flat-square&color=purple)

## 🎮 Features

### 🎯 **Smart Trading Engine**
- **Multiple Betting Strategies**: Martingale, Conservative, and Aggressive modes
- **Predictive Analytics**: AI-powered side prediction based on historical data
- **Dynamic Bet Sizing**: Automatic bet adjustment based on win/loss streaks
- **Risk Management**: Stop-loss, take-profit, and emergency stop mechanisms

### 🛡️ **Advanced Safety Features**
- **Loss Streak Protection**: Automatic stop after consecutive losses
- **Win Streak Targeting**: Stop after reaching win streak goals
- **Emergency Balance Protection**: Halt trading at critical balance levels
- **Pause on Loss**: Manual control after each loss for careful management

### 📊 **Real-Time Analytics**
- **Live Statistics**: Win rate, profit/loss tracking, streak monitoring
- **Historical Data**: Persistent storage of all trading sessions
- **Performance Metrics**: Detailed analysis of trading patterns
- **Export Functionality**: Save trading history for external analysis

### 🔗 **Discord Integration**
- **Real-Time Notifications**: Live bet results and statistics
- **Detailed Logging**: Comprehensive trade information
- **Session Summaries**: Final performance reports
- **Custom Webhooks**: Easy Discord server integration

### ⚙️ **User-Friendly Interface**
- **Interactive CLI**: Beautiful colored terminal interface
- **Configuration Management**: Easy setup and modification
- **Menu-Driven Navigation**: Intuitive user experience
- **Graceful Shutdown**: Safe termination with data preservation

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- RugPlay account (have ur cookie ready)
- Discord webhook URL (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/itzdaimy/RugPlay-Automation.git
   cd rugplay-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run the bot**
   ```bash
   node index.js
   ```

---

## 📋 Configuration

### Basic Settings
| Setting | Description | Default |
|---------|-------------|---------|
| `side` | Preferred coinflip side (heads/tails) | `heads` |
| `initialBet` | Starting bet amount | Required |
| `maxBet` | Maximum bet limit | Required |
| `maxAttempts` | Maximum trading attempts (0 = unlimited) | `0` |
| `bettingStrategy` | Trading strategy (martingale/conservative/aggressive) | `conservative` |
| `delayBetween` | Delay between bets (ms) | `1500` |

### Safety Settings
| Setting | Description | Default |
|---------|-------------|---------|
| `maxLossStreak` | Stop after consecutive losses | Required |
| `stopOnWinStreak` | Stop after win streak (0 = disabled) | `0` |
| `stopProfit` | Stop at profit target (0 = disabled) | `0` |
| `stopLoss` | Stop at loss limit (0 = disabled) | `0` |
| `emergencyStop` | Emergency balance threshold | `0` |
| `pauseOnLoss` | Pause after each loss | `false` |

### Connection Settings
| Setting | Description |
|---------|-------------|
| `cookie` | RugPlay authentication cookie |
| `webhook` | Discord webhook URL |
| `sendDetailedLogs` | Enable detailed Discord logging |

---

## 🎯 Trading Strategies

### 🔥 **Martingale Strategy**
- Doubles bet after each loss
- Resets to initial bet after win
- High risk, high reward approach
- Best for: Short-term aggressive trading

### 🛡️ **Conservative Strategy**
- Gradual bet increases on win streaks
- Quick reset after losses
- Balanced risk management
- Best for: Long-term stable growth

### ⚡ **Aggressive Strategy**
- Increases bets on both wins and losses
- Maximum profit potential
- Higher risk tolerance required
- Best for: Experienced traders

---

## 📊 Menu Navigation

```
🎮 Main Menu:
1. 🎯 Start Bot
2. ⚙️ Configure Settings
3. 📊 View Statistics
4. 🗂️ View/Clear History
5. ❌ Exit

⚙️ Configuration Menu:
1. 🎲 Basic Settings
2. 🛡️ Safety Settings
3. 🔗 Connection Settings
4. 📋 View Current Config
5. 🔄 Reset Configuration
6. 🔙 Back to Main Menu
```
---

## 📈 Performance Tracking

### Statistics Monitored
- **Win Rate**: Percentage of successful trades
- **Profit/Loss**: Net financial performance
- **Streak Records**: Maximum win/loss streaks
- **Balance Tracking**: Real-time balance monitoring
- **Trade History**: Complete transaction log

### Data Storage
- Configuration: `./config.json`
- Trading History: `./history.json`
- Maximum 100 recent trades stored
- Automatic data cleanup and rotation

---

## 🎨 Discord Integration

### Webhook Setup
1. Create a Discord webhook in your server
2. Copy the webhook URL
3. Configure in bot settings
4. Enable detailed logging

### Message Format
```
🎯 Smart Investor Running
Result: HEADS — ✅ Win
Bet: 10.00 | Side: HEADS | Balance: 109.80
Win Streak: 3 | Net Profit: +9.80
Strategy: conservative | Win Rate: 75.0%
```

---

## 🛠️ Development

### Project Structure
```
rugplay-bot/
├── index.js           # Main application file
├── config.json        # Bot configuration
├── history.json       # Trading history
├── package.json       # Dependencies
├── .env              # Environment variables
└── README.md         # This file
```

### Dependencies
- `axios` - HTTP client for API requests
- `discord.js` - Discord integration
- `chalk` - Terminal colors
- `readline` - User input handling
- `dotenv` - Environment management

---

## 🚨 Risk Disclaimer

> ⚠️ **Important**: This bot is for educational purposes only. Gambling involves significant financial risk. Always:
> - Trade responsibly within your means
> - Set appropriate stop-losses
> - Monitor your account regularly
> - Understand the risks involved

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Support

If you find this project helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 🔄 Sharing with others

### Contact
- 📧 Email: itzdaimy@gmail.com
- 💬 Discord: daimyh
---

## 🎖️ Acknowledgments

- RugPlay platform
- Discord.js community for excellent documentation
- Node.js ecosystem for robust tooling
- All contributors and users

---

<div align="center">

**Made with ❤️ by [Daimy]**

[![GitHub Profile](https://img.shields.io/badge/GitHub-Profile-blue?style=for-the-badge&logo=github)](https://github.com/itzdaimy)

</div>
