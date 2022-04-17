// ==UserScript==
// @name         fw_automation
// @namespace    http://tampermonkey.net/
// @version      8.0.7
// @description  try to take over the world!
// @author       QuadCore (github.com/iQuadCore | quadcore.cc)
// @match        https://play.farmersworld.io
// @icon         https://farmersworld.io/favicon.ico
// @grant        none
// ==/UserScript==
const notificationsWebhook = "https://discord.com/api/webhooks/123/456",
warningsWebhook = "https://discord.com/api/webhooks/789/0ab";

const msg = {
	starting: "Task: **Starting up...**",
	authError: "⚠️ **task failed** @everyone \nTask: **Auth**",
	authShouldBeOk: "\nTask: **Auth**"
};

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function sendMessageToDiscord(webhook, message) {
	const data = {};
	data.content = message;

	fetch(webhook, {
		method: 'POST',
		mode: 'cors',
		cache: 'no-cache',
		credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/json'
		},
		redirect: 'follow',
		referrerPolicy: 'no-referrer',
		body: JSON.stringify(data)
	});
}

// Auth
(async () => {
	let waitToLoad = getRandomIntInclusive(12000, 17000);
	await new Promise((res) => setTimeout(res, waitToLoad));

	let endpointSelector = document.querySelector("#RPC-Endpoint");
	let endpointToChoose = getRandomIntInclusive(1, 3);
	if (endpointSelector) endpointSelector.value = endpointToChoose; // choose random

	let waitAfterSelect = getRandomIntInclusive(3000, 5000);
	await new Promise((res) => setTimeout(res, waitAfterSelect));
	let login = document.querySelector("#root > div > div > div > button");
	login.click();

	let waitBeforeLogin = getRandomIntInclusive(5000, 10000);
	await new Promise((res) => setTimeout(res, waitBeforeLogin));
	let waxCloudWallet = document.querySelector("#root > div > div > div:nth-child(2) > div.login-modal-container > button:nth-child(2)");
	if (!waxCloudWallet) // something went wrong? warn and reload page
	{
		sendMessageToDiscord(warningsWebhook, msg.authError);
		await new Promise((res) => setTimeout(res, 10000));
		location.reload();
	}
	waxCloudWallet.click();

	await new Promise((res) => setTimeout(res, 60000));
	let waxCloudWalletTest = document.querySelector("#root > div > div > div:nth-child(2) > div.login-modal-container > button:nth-child(2)");
	if (waxCloudWalletTest) // something went wrong? login pop up didn't work and button is still present? warn and reload page
	{
		sendMessageToDiscord(warningsWebhook, msg.authError);
		await new Promise((res) => setTimeout(res, 10000));
		location.reload();
	}
	else {
		sendMessageToDiscord(notificationsWebhook, msg.authShouldBeOk);
	}
})();


// randomization
var qualityToRepair = 4,
energyToRestore = 150,
waitBeforeUpdate = 3600000,
delay = {};

(async () => {
	while (1) {
		qualityToRepair = getRandomIntInclusive(40, 80); // repair if 35 - 75% durability left
		energyToRestore = getRandomIntInclusive(150, 370); // restore 100 energy if 150 - 360 left, and there's > than 20 food available on account.

		waitBeforeUpdate = getRandomIntInclusive(3600000, 11281320);
		await new Promise((res) => setTimeout(res, waitBeforeUpdate)); // wait random (see above) hours before updating the random values
	}
})();

(async () => {
	while (1) {
		delay = { // new random delay each execution
			ItemSwitch: getRandomIntInclusive(7000, 20000), // delay before switching items (when there're 2 axes, etc. - switch between them) (7 sec - 20 sec)
			Executions: getRandomIntInclusive(6000, 12000), // delay between executing script, checking for actions needed
			BeforeMine: getRandomIntInclusive(2000, 7000), // delay before mine (2 sec - 7 sec)
			AfterEnergyRestore: getRandomIntInclusive(50000, 80000), // delay after energy restore (50 - 80 sec)
			AfterMine: getRandomIntInclusive(50000, 80000), // delay after mine (50 - 80 sec)
			AfterRepair: getRandomIntInclusive(50000, 80000),
			beforeUpd: getRandomIntInclusive(180000, 600000) // 3 - 10 minutes
		};

		await new Promise((res) => setTimeout(res, delay.beforeUpd)); // wait random (see above) before updating the random values
	}
})();


// functions
var count = {
	EnergyError: 0,
	RepairError: 0,
	MineError: 0
};

function quality() { // returns current quality of item currently selected (in % not in absolute value, eg. 88 (not 0.88) = 220 for fishing rod)
	let q = eval(document.querySelector(".card-number").innerText);
	return (100 * q).toFixed();
}

function resource(ind) { // returns current: 0 = gold, 1 = wood, 2 = food, 3 = energy
	return +document.querySelectorAll(".resource-number div")[ind].innerText;
}

async function repair() {
	const buttonRepair = document.querySelectorAll(".info-section .plain-button")[1];

	if (![...buttonRepair.classList].includes("disabled") && quality() < qualityToRepair) {
		let qualityBeforeRepair = quality();
		buttonRepair.click();
		await new Promise((res) => setTimeout(res, delay.AfterRepair));
		// Check, discord notification about repair
		const currentGold = resource(0);
		let repairInfo = "Task: **Repair**\n🪙 " + currentGold;
		if (qualityBeforeRepair === quality()) {
			count.RepairError++;
			if (count.RepairError == 5) {
				repairInfo = "⚠️ **task failed** @everyone \nAttempting to reload page and restart automation\n" + repairInfo;
				sendMessageToDiscord(warningsWebhook, repairInfo);
				await new Promise((res) => setTimeout(res, 20000));
				location.reload();
				return false;
			}
			else {
				repairInfo = "⚠️ **task failed**\n" + repairInfo;
				sendMessageToDiscord(warningsWebhook, repairInfo);
				return false;
			}
		}
		else {
			count.RepairError = 0; // reset
			sendMessageToDiscord(notificationsWebhook, repairInfo);
			return true;
		}
	}
	else { return "skipped"; }
}

async function restoreEnergy() {
	const currentEnergy = resource(3);
	const currentFish = resource(2);

	if (currentEnergy < energyToRestore && currentFish > 20) {
		document.querySelector(".resource-energy img").click();
		await new Promise((res) => setTimeout(res, 1e3));

		for (let i = 0; i++ < 20;) {
			document.querySelector(".image-button[alt='Plus Icon']").click();
			await new Promise((res) => setTimeout(res, 5e2));
		}

		document.querySelector(".modal-wrapper .plain-button").click();

		await new Promise((res) => setTimeout(res, delay.AfterEnergyRestore));
		// Check, discord notification about energy
		const currentEnergyDiscord = resource(3);
		const currentFoodDiscord = resource(2);
		let energyInfo = "Task: **Restore energy**\n⚡ **" + currentEnergyDiscord + " / 500**\n🥩 " + currentFoodDiscord;
		if (currentEnergy === currentEnergyDiscord) {
			count.EnergyError++;
			if (count.EnergyError == 5) {
				energyInfo = "⚠️ **task failed** @everyone \nAttempting to reload page and restart automation\n" + energyInfo;
				sendMessageToDiscord(warningsWebhook, energyInfo);
				await new Promise((res) => setTimeout(res, 20000));
				location.reload();
				return false;
			}
			else {
				energyInfo = "⚠️ **task failed**\n" + energyInfo;
				sendMessageToDiscord(warningsWebhook, energyInfo);
				return false;
			}
		}
		else {
			count.EnergyError = 0; // reset
			sendMessageToDiscord(notificationsWebhook, energyInfo);
			return true;
		}
	}
	else { return "skipped"; }
}

async function mine() {
	const woodBeforeMine = resource(1),
	foodBeforeMine = resource(2),
	buttonMine = document.querySelector(".info-section .plain-button");

	buttonMine.click();
	await new Promise((res) => setTimeout(res, delay.AfterMine));
	// Check, discord notification about mine
	let currentWood = resource(1),
	currentFood = resource(2);
	let woodMined = currentWood > woodBeforeMine,
	foodMined = currentFood > foodBeforeMine,
	mineInfo = "";
	if (woodMined) {
		mineInfo = "Task: **Mine**\n🪵 **" + currentWood + "**";
	}
	else if (foodMined) {
		mineInfo = "Task: **Mine**\n🥩 **" + currentFood + "**";
	}
	else {
		mineInfo = "Task: **Mine**\n🪵 **" + currentWood + "**\n🥩 **" + currentFood + "**";
	}
	if (woodBeforeMine === currentWood && foodBeforeMine === currentFood) {
		count.MineError++;
		if (count.MineError == 5) {
			mineInfo = "⚠️ **task failed multiple times** @everyone \nAttempting to reload page and restart automation\n" + mineInfo;
			sendMessageToDiscord(warningsWebhook, mineInfo);
			await new Promise((res) => setTimeout(res, 20000));
			location.reload();
			return false;
		}
		else {
			mineInfo = "⚠️ **task failed**\n" + mineInfo;
			sendMessageToDiscord(warningsWebhook, mineInfo);
			return false;
		}
	}
	else {
		count.MineError = 0; // reset
		sendMessageToDiscord(notificationsWebhook, mineInfo);
		return true;
	}
}


// main script
(async () => {
	await new Promise((res) => setTimeout(res, 100000)); // 100 sec delay after login, only once

	while (1) {
		await new Promise((res) => setTimeout(res, delay.Executions));
		// Restore energy if needed
		await restoreEnergy();

		for (const [indexItem, item] of document
			.querySelectorAll(".vertical-carousel-container img")
			.entries()) {
			item.click(); // choose next item to use from list

			await new Promise((res) => setTimeout(res, delay.ItemSwitch));

			const buttonCloseCPUError = document.querySelector(".modal-stake .modal-stake-close img");
			if (buttonCloseCPUError) buttonCloseCPUError.click(); // close wax cpu error

			// Repair if needed
			await repair();

			const buttonMine = document.querySelector(".info-section .plain-button");
			const timeToEnd = document.querySelector(".info-section .info-time").innerText;

			if (![...buttonMine.classList].includes("disabled") && timeToEnd === "00:00:00") {
				await new Promise((res) => setTimeout(res, delay.BeforeMine));
				await mine();
			}
		}
	}
})();

sendMessageToDiscord(notificationsWebhook, msg.starting);