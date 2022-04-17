# About
[**Farmers World**](https://farmersworld.io) is farming NFT game based on WAX blockchain

This script automates farming wood and food in game, so that you don't have to click the damn button every hour

# Features
- Randomization (of time / threshold between actions)
- Works in browser. Tested with Tampermonkey and Firefox, should also work in Chrome and other browsers *(it may also be possible to use standalone via DevTools, without Tampermonkey)*
- Mines wood and food *(easy to add gold mining, not added since I didn't need it, and it's currently published as is)*
- Repairs tools, restores energy
- Sends logs and warnings to Discord. Warnings use different webhook (can be set to different chat), most important warnings use @everyone mention for monitoring convenience.

![image](https://user-images.githubusercontent.com/33097095/163709159-1dfc874d-7386-4724-a534-854e88c3396c.png)
- Attempts to restart in case of errors, logs in automatically

![image](https://user-images.githubusercontent.com/33097095/163709163-62c742da-e200-4aa4-b1c5-b7cf69307574.png)


# How to use
- **Only works with WAX Cloud Wallet**
Enable automatic transaction signing for Farmers World
- Have Tampermonkey browser extension installed
- Add the JS as new script in Tampermonkey control panel
- Edit the Discord webhooks part `(const notificationsWebhook, warningsWebhook)` with your webhook urls
- Open the game and wait a bit. Script should log in and start working! 
- **Make sure pop-ups aren't blocked by your browser**

# 
*Please note I don't have experience in JavaScript, so code may hurt your eyes if you do. At the moment this was made it was faster for me to figure things out myself than finding someone who knows JS and wasn't too busy* :)
PRs are welcome.

Found this helpful? Donations are welcome: `0x88EE3333EE3399001dddfa892E886fb70c9bb1EE`
(any BSC (BEP20) tokens)
