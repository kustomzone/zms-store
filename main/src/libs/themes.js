import {readAsArrayBuffer} from "./util.js";

/// #if extern
export default ({zeroAuth, zeroDB, zeroFS, zeroPage}) => {
/// #else
import {zeroAuth, zeroDB, zeroFS, zeroPage} from "../route.js";
/// #endif


class Themes {
	async getSelfThemeList() {
		const auth = await zeroAuth.requestAuth();

		const selfJsonId = await zeroDB.getJsonID(`users/${auth.address}/data.json`, 2);

		let themes = await zeroDB.query(`
			SELECT * FROM theme WHERE json_id = :self_json_id
		`, {
			self_json_id: selfJsonId
		});
		for(let theme of themes) {
			theme.verified = await this.isVerified(auth.address, theme.title, theme.version);
			theme.url = `view/theme/${auth.address}/${escape(theme.title)}`;
		}
		return themes;
	}

	async getAllThemeList() {
		let themes = await zeroDB.query(`
			SELECT * FROM theme
			LEFT JOIN json ON (theme.json_id = json.json_id)
		`);
		for(let theme of themes) {
			theme.verified = await this.isVerified(theme.directory.replace("users/", ""), theme.title, theme.version);
			theme.url = `view/theme/${theme.directory.replace("users/", "")}/${escape(theme.title)}`;
		}
		return themes;
	}

	async publish(title, zip, screenshot) {
		if(encodeURIComponent(title) !== escape(title)) {
			throw new Error("Use only English for the title");
		}


		const auth = await zeroAuth.requestAuth();

		const ownedThemes = await this.getSelfThemeList();

		let theme = ownedThemes.find(theme => theme.title === title);
		if(theme) {
			// OMG, a new version!!! :tada:
			theme.version++;
			delete theme.title;
			delete theme.json_id;
		} else {
			// A new plugin :'(
			theme = {version: 1};
		}

		// Set names
		theme.zip_name = `${escape(title)}.zip`;
		let ext = screenshot.name.split(".").slice(-1)[0];
		theme.screenshot_name = `${escape(title)}.${ext}`;

		// Upload it!
		await zeroDB.changePair(
			`data/users/${auth.address}/data.json`,
			`data/users/${auth.address}/content.json`,
			"theme",
			title, theme
		);

		// Now convert ZIP & screenshot
		const [zipData, screenshotData] = await Promise.all([readAsArrayBuffer(zip), readAsArrayBuffer(screenshot)]);

		// And upload them!
		await Promise.all([
			zeroFS.writeFile(`data/users/${auth.address}/${theme.zip_name}`, zipData, "arraybuffer"),
			zeroFS.writeFile(`data/users/${auth.address}/${theme.screenshot_name}`, screenshotData, "arraybuffer")
		]);

		// Awesome!
		zeroPage.publish(`data/users/${auth.address}/content.json`);

		return `${auth.address}/${escape(title)}`;
	}

	async get(address, title) {
		const themes = await zeroDB.query(`
			SELECT * FROM theme
			LEFT JOIN json ON (theme.json_id = json.json_id)
			WHERE title = :title AND directory = :directory
		`, {
			title,
			directory: `users/${address}`
		});
		const theme = themes[0];

		theme.zip = `data/users/${address}/${theme.zip_name}`;
		theme.screenshot = `data/users/${address}/${theme.screenshot_name}`;

		theme.verified = await this.isVerified(address, theme.title, theme.version);
		theme.url = `view/theme/${address}/${escape(theme.title)}`;

		return theme;
	}

	async isVerified(address, title, version) {
		const id = `theme/${escape(address)}/${escape(title)}/${escape(version)}`;
		const v = await zeroDB.query(`
			SELECT * FROM verified WHERE id = :id
		`, {id});

		if(!v.length) {
			return 0;
		}
		return v[0].verified;
	}

	async verify(address, title, version, value) {
		const id = `theme/${escape(address)}/${escape(title)}/${escape(version)}`;
		await zeroDB.changePair(
			`data/verified/content.json`,
			`data/verified/content.json`,
			"verified",
			id, value
		);
	}


	async install(theme) {
		// First, open ZIP
		const files = await zeroFS.readDirectory(`data/${theme.directory}/${theme.zip_name}`, true);
		console.log("installing", theme, files);
	}
}


/// #if extern
return new Themes();
};
/// #else
export default new Themes();
/// #endif