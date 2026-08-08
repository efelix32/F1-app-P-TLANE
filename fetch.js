fetch('https://www.formula1.com/en/drivers').then(r=>r.text()).then(t => { const m = t.match(/media\.formula1\.com[^"']+/gi); console.log(m ? [...new Set(m)] : 'None') })
