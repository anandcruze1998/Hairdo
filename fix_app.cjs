const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/import \{ DeveloperViewSwitcher \} from '\.\/components\/DeveloperViewSwitcher';\n/, '');
code = code.replace(/  const \[isDevSwitcherOpen, setIsDevSwitcherOpen\] = useState\(false\);\n/, '');
code = code.replace(/  const \[overrideRole, setOverrideRole\] = useState\<'customer' \| 'owner' \| 'admin' \| null\>\(null\);\n/, '');
code = code.replace(/  const activeRole = overrideRole \|\| userRole;\n/, '  const activeRole = userRole;\n');
code = code.replace(/        isLoggedIn=\{!!user \|\| overrideRole !== null\} \n/, '        isLoggedIn={!!user} \n');

const switcherStart = code.indexOf('{/* <DeveloperViewSwitcher');
const switcherEnd = code.indexOf('/>', switcherStart) + 2;
if (switcherStart !== -1) {
  code = code.substring(0, switcherStart) + code.substring(switcherEnd);
}

const footerStart = code.indexOf('<footer');
const footerEnd = code.indexOf('</footer>', footerStart) + 9;
if (footerStart !== -1) {
  code = code.substring(0, footerStart) + code.substring(footerEnd);
}

fs.writeFileSync('src/App.tsx', code);
