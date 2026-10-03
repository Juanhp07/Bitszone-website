const fs = require('fs');

let code = fs.readFileSync('src/components/player/Sidebar.tsx', 'utf8');

// The line is: className="text-[#f0abfc] text-lg font-extrabold tracking-wider absolute"
const targetStr = 'className="text-[#f0abfc] text-lg font-extrabold tracking-wider absolute"';
const newStr = 'className="text-[#f0abfc] text-[13px] leading-none mt-[1px] font-extrabold tracking-wider absolute"';

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/components/player/Sidebar.tsx', code);
  console.log('Successfully updated sidebar badge style');
} else {
  console.log('Target string not found');
}
