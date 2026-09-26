const fs = require('fs');

let faq = fs.readFileSync('src/components/FAQSection.tsx', 'utf8');

// Remove border from the badge
faq = faq.replace('border border-white/5 bg-white/5', 'bg-white/5');

// Remove border from the chevron icon wrapper
faq = faq.replace('border border-white/5 flex', 'flex');

fs.writeFileSync('src/components/FAQSection.tsx', faq);
