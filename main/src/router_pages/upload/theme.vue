<template>
	<div class="upload">
		<zms-small-header />

		<zms-slide header="Upload theme">
			<div class="inputs">
				<input placeholder="Awesome Theme" v-model="title" :class="{error: title === 'Please fill in title'}">
				<zms-file-input placeholder="ZIP archive" :error="fileError" v-model="file" ref="file" />
				<zms-file-input placeholder="Screenshot" :error="screenshotError" v-model="screenshot" ref="screenshot" />
				<zms-small-button icon="share-square" text="Upload" @click="upload" />
				<span class="error">{{error}}</span>
			</div>
			<div>
				First, make a theme via the instructions in <a @click="$router.navigate('dev/theme')">How to make a theme</a> section. Give your theme a name. Then pack your theme to ZIP archive and upload it.<br>
				<br>
				All themes are verified by moderators: that is <a href="http://127.0.0.1:43110/Me.ZeroNetwork.bit/?Profile/1SunAWK2VUT9GQK32MpwRfFPVgcBSJN9a/1Cy3ntkN2GN9MH6EaW6eHpi4YoRS2nK5Di/gitcenter@zeroid.bit">@gitcenter</a>, <a href="http://127.0.0.1:43110/Me.ZeroNetwork.bit/?Profile/1RedkCkVaXuVXrqCMpoXQS29bwaqsuFdL/1J3rJ8ecnwH2EPYa6MrgZttBNc61ACFiCj/nofish@zeroid.bit">@nofish</a>, <a href="http://127.0.0.1:43110/Me.ZeroNetwork.bit/?Profile/12h51ug6CcntU2aiBjhP8Ns2e5VypbWWtv/12gAes6NzDS9E2q6Q1UXrpUdbPS6nvuBPu/krixano@zeroid.bit">@krixano</a>, <a href="http://127.0.0.1:43110/Me.ZeroNetwork.bit/?Profile/1oranGeS2xsKZ4jVsu9SVttzgkYXu4k9v/14K7EydgyeP84L1NKaAHBZTPQCev8BbqCy/glightstar@zeroid.bit">@glightstar</a> and <a href="http://127.0.0.1:43110/Me.ZeroNetwork.bit/?Profile/1oranGeS2xsKZ4jVsu9SVttzgkYXu4k9v/1AWwhg4EiWAVttfQboJZ4wJfX3WawfJT3h/binchan2@zeroid.bit">@binchan</a>. You (and others) will be able to use the theme if it doesn't pass the validation or if we'll forget about it (sorry!), but it will be marked as NOT YET VERIFIED.<br>
				<br>
				When you add some more features to your theme, upload it once again with the same settings. The old theme will be replaced with the new one and the users will get an offer to update the theme. <i>Notice: the new version of the theme must be verified by the moderators again.</i>
			</div>
		</zms-slide>
	</div>
</template>

<style lang="sass" scoped>
	.inputs
		float: left
		margin-right: 32px

	.error
		color: #CE3232
</style>

<script type="text/javascript">
	import "vue-awesome/icons/share-square";
	import Themes from "../../libs/themes.js";

	export default {
		name: "upload-theme",
		data() {
			return {
				title: "",
				file: null,
				fileError: "",
				screenshot: null,
				screenshotError: "",
				error: ""
			};
		},

		methods: {
			async upload() {
				let error = false;
				if(!this.title || this.title === "Please fill in title") {
					this.title = "Please fill in title";
					error = true;
				}
				if(!this.file) {
					this.fileError = "Please choose ZIP";
					error = true;
				}
				if(this.file && this.file.type !== "application/x-zip-compressed") {
					this.$refs.file.$emit("error", "Please choose ZIP archive, not " + (this.file.type || "plain/text"));
					error = true;
				}
				if(!this.screenshot) {
					this.$refs.screenshot.$emit("error", "Please choose a screenshot");
					error = true;
				}
				if(this.screenshot && !this.screenshot.type.startsWith("image/")) {
					this.$refs.screenshot.$emit("error", "Please choose an image, not " + (this.screenshot.type || "plain/text"));
					error = true;
				}
				if(error) {
					return;
				}

				try {
					const id = await Themes.publish(this.title, this.file, this.screenshot);
					this.$router.navigate(`view/theme/${id}`);
				} catch(e) {
					this.error = e.message;
				}
			}
		}
	};
</script>