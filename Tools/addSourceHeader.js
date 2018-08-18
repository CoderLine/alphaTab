var templateFile = process.argv[2];
var fs = require('fs');
var execSync = require('child_process').execSync;

console.log("Loading Template from " + templateFile);

var buildProps = fs.readFileSync('Directory.Build.props', 'utf8');
var version = (/<FileVersion>([^<]+)<\/FileVersion>/i).exec(buildProps)[1];
var branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

var template = fs.readFileSync(templateFile, 'utf8');
template = template.replace("{{year}}", new Date().getFullYear());
template = template.replace("{{version}}", version);
template = template.replace("{{branch}}", branch);

console.log(template);

for(var i = 3; i < process.argv.length; i++)
{
	var fileName = process.argv[i];
	console.log("Adding header to " + fileName);
	var source = fs.readFileSync(fileName, 'utf8');
	source = template.replace("{{source}}", source);
	fs.writeFileSync(fileName, source, 'utf8');	
}