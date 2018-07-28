var templateFile = process.argv[2];
var fs = require('fs');

console.log("Loading Template from " + templateFile);

var buildProps = fs.readFileSync('Directory.Build.props', 'utf8');
var version = (/<FileVersion>([^<]+)<\/FileVersion>/i).exec(buildProps)[1];

var template = fs.readFileSync(templateFile, 'utf8');
template = template.replace("{{year}}", new Date().getFullYear());
template = template.replace("{{version}}", version);

console.log(template);

for(var i = 3; i < process.argv.length; i++)
{
	var fileName = process.argv[i];
	console.log("Adding header to " + fileName);
	var source = fs.readFileSync(fileName, 'utf8');
	source = template.replace("{{source}}", source);
	fs.writeFileSync(fileName, source, 'utf8');	
}