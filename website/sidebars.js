const sidebars = {
  docs: {
    "alphaTab": [
		'introduction', 
		'contributing'
	],
	"Getting Started": [
		"getting-started/installation",
		"getting-started/configuration"
	],
	"Guides": [
		"guides/styling-player",
		"guides/breaking-changes-095-096"
	],
	"alphaTex": [
		"alphatex/metadata",
		"alphatex/notes",
		"alphatex/bar-metadata",
		"alphatex/tracks-staves",
		"alphatex/beat-effects",
		"alphatex/note-effects",
		"alphatex/exporter"
	],
	"API Reference": [
		"reference/settings",
		"reference/api",
		"reference/events"
	]
  },
  "showcase": {
	"Showcase": [
		'showcase'
	]
  }
};

for(let i = 0; i < 10; i++) {
	sidebars.showcase.Showcase.push({
		type: 'link',
		label: 'Test ' + i,
		href: 'https://alphatab.com'
	});
}

module.exports = sidebars;