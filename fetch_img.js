const fs = require('fs');
fetch('https://www.bing.com/images/search?q=dry+oyster+mushroom+pictures&id=70F887346224BA32D545FB6C035810CD58DBE097&form=IQFRBA&first=1&disoverlay=1')
  .then(r => r.text())
  .then(d => {
    const m = d.match(/"murl":"([^"]+)"/);
    if(m) {
      console.log('Downloading', m[1]);
      fetch(m[1])
        .then(r => r.arrayBuffer())
        .then(b => {
          fs.writeFileSync('public/dry-oyster.jpg', Buffer.from(b));
          console.log('Done!');
        });
    } else {
      console.log('not found');
    }
  });
